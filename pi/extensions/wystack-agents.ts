import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { Type } from "typebox";
import { execFile } from "node:child_process";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

interface WystackAgent {
	key: string;
	name: string;
	plugin: string;
	path: string;
	description: string;
	body: string;
}

function parseFrontmatter(markdown: string): Record<string, string> {
	const match = markdown.match(/^---\n([\s\S]*?)\n---\n?/);
	if (!match) return {};
	const data: Record<string, string> = {};
	for (const line of match[1].split("\n")) {
		const field = line.match(/^([a-zA-Z0-9_-]+):\s*(.*)$/);
		if (!field) continue;
		data[field[1]] = field[2].trim().replace(/^['"]|['"]$/g, "");
	}
	return data;
}

function stripFrontmatter(markdown: string): string {
	return markdown.replace(/^---\n[\s\S]*?\n---\n?/, "").trim();
}

function loadAgents(root: string): WystackAgent[] {
	const plugins = ["engineering", "marketing", "design"];
	const agents: WystackAgent[] = [];
	for (const plugin of plugins) {
		const agentsDir = join(root, plugin, "agents");
		if (!existsSync(agentsDir)) continue;
		for (const file of readdirSync(agentsDir).filter((entry) => entry.endsWith(".md")).sort()) {
			const path = join(agentsDir, file);
			const text = readFileSync(path, "utf8");
			const fm = parseFrontmatter(text);
			const name = fm.name ?? file.replace(/\.md$/, "");
			agents.push({
				key: `${plugin}:${name}`,
				name,
				plugin,
				path,
				description: fm.description ?? `${plugin} ${name} role`,
				body: stripFrontmatter(text),
			});
		}
	}
	return agents;
}

function buildPrompt(agent: WystackAgent, task: string): string {
	return `You are running as the WyStack \`${agent.key}\` role. Follow this role brief exactly.\n\n${agent.body}\n\n---\n\nUser task:\n${task.trim() || "No task was provided. Ask the user what they want this role to do."}`;
}

function runPiSubagent(cwd: string, systemPrompt: string, task: string, signal?: AbortSignal): Promise<string> {
	return new Promise((resolvePromise, reject) => {
		const child = execFile(
			"pi",
			[
				"--no-session",
				"--tools",
				"read,grep,find,ls",
				"--system-prompt",
				systemPrompt,
				"-p",
				task,
			],
			{
				cwd,
				timeout: 10 * 60 * 1000,
				maxBuffer: 1024 * 1024 * 4,
			},
			(error, stdout, stderr) => {
				if (error) {
					reject(new Error(`${error.message}${stderr ? `\n\n${stderr}` : ""}`));
					return;
				}
				resolvePromise(stdout.trim() || stderr.trim());
			},
		);

		if (signal) {
			signal.addEventListener("abort", () => child.kill("SIGTERM"), { once: true });
		}
	});
}

export default function (pi: ExtensionAPI) {
	const root = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
	const agents = loadAgents(root);
	const byKey = new Map(agents.map((agent) => [agent.key, agent]));
	const keys = agents.map((agent) => agent.key).join(", ");

	pi.registerCommand("wystack-agents", {
		description: "List WyStack agent roles loaded from this package",
		handler: async (_args, ctx) => {
			ctx.ui.notify(agents.map((agent) => `${agent.key} — ${agent.description}`).join("\n"), "info");
		},
	});

	for (const agent of agents) {
		pi.registerCommand(`${agent.plugin}-${agent.name}`, {
			description: agent.description,
			handler: async (args, ctx) => {
				if (!ctx.isIdle()) {
					ctx.ui.notify("Agent is busy; wait for idle before starting a WyStack role command.", "warning");
					return;
				}
				pi.sendUserMessage(buildPrompt(agent, args));
			},
		});
	}

	pi.registerTool({
		name: "wystack_agent",
		label: "WyStack Agent",
		description: `Run a WyStack role brief as a read-only subagent in a separate pi process. Available agents: ${keys}`,
		promptSnippet: "Run a WyStack role as an independent read-only subagent for analysis or review",
		promptGuidelines: [
			"Use wystack_agent when a workflow asks for a named WyStack/engineering/marketing/design subagent or reviewer perspective.",
			"wystack_agent is read-only; use its findings as input, then perform any edits yourself with normal tools.",
		],
		parameters: Type.Object({
			agent: Type.String({ description: `Agent key, e.g. ${agents[0]?.key ?? "engineering:principal"}. Available: ${keys}` }),
			task: Type.String({ description: "The complete task/context for the subagent." }),
		}),
		async execute(_toolCallId, params, signal, onUpdate, ctx) {
			const agent = byKey.get(params.agent);
			if (!agent) {
				return {
					isError: true,
					content: [{ type: "text", text: `Unknown WyStack agent: ${params.agent}\nAvailable: ${keys}` }],
				};
			}

			onUpdate?.({ content: [{ type: "text", text: `Running ${agent.key} read-only subagent...` }] });
			const output = await runPiSubagent(ctx.cwd, agent.body, params.task, signal);
			return {
				content: [{ type: "text", text: output }],
				details: { agent: agent.key, path: agent.path },
			};
		},
	});
}
