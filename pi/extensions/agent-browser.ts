import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { Type } from "typebox";
import { execFile } from "node:child_process";

function shellSplit(input: string): string[] {
	const args: string[] = [];
	let current = "";
	let quote: '"' | "'" | null = null;
	let escaping = false;

	for (const char of input) {
		if (escaping) {
			current += char;
			escaping = false;
			continue;
		}
		if (char === "\\" && quote !== "'") {
			escaping = true;
			continue;
		}
		if ((char === '"' || char === "'") && !quote) {
			quote = char;
			continue;
		}
		if (quote === char) {
			quote = null;
			continue;
		}
		if (/\s/.test(char) && !quote) {
			if (current) args.push(current);
			current = "";
			continue;
		}
		current += char;
	}
	if (escaping) current += "\\";
	if (current) args.push(current);
	return args;
}

function runAgentBrowser(args: string[], signal?: AbortSignal): Promise<{ stdout: string; stderr: string }> {
	return new Promise((resolve, reject) => {
		const child = execFile(
			"agent-browser",
			args,
			{ timeout: 120_000, maxBuffer: 1024 * 1024 * 8 },
			(error, stdout, stderr) => {
				if (error) {
					reject(new Error(`${error.message}${stderr ? `\n\n${stderr}` : ""}`));
					return;
				}
				resolve({ stdout, stderr });
			},
		);
		signal?.addEventListener("abort", () => child.kill("SIGTERM"), { once: true });
	});
}

export default function (pi: ExtensionAPI) {
	pi.registerCommand("browser", {
		description: "Run agent-browser CLI commands, e.g. /browser open https://example.com or /browser snapshot -i",
		handler: async (args, ctx) => {
			const parts = shellSplit(args);
			if (parts.length === 0) {
				ctx.ui.notify("Usage: /browser <agent-browser args>\nExample: /browser open https://example.com", "warning");
				return;
			}
			try {
				const result = await runAgentBrowser(parts, ctx.signal);
				const text = [result.stdout.trim(), result.stderr.trim()].filter(Boolean).join("\n\n");
				ctx.ui.notify(text || "agent-browser completed", "info");
			} catch (error) {
				ctx.ui.notify(error instanceof Error ? error.message : String(error), "error");
			}
		},
	});

	pi.registerTool({
		name: "agent_browser",
		label: "Agent Browser",
		description: "Run the agent-browser CLI for browser automation: navigate pages, snapshot interactive elements, click/fill refs, screenshots, cookies/storage, network, tabs, and JS eval.",
		promptSnippet: "Automate a browser via agent-browser CLI",
		promptGuidelines: [
			"Use agent_browser for browser interactions, web app testing, form filling, screenshots, and rendered-page extraction.",
			"For agent_browser workflows: open a URL, run snapshot -i, interact with @refs, then re-snapshot after navigation or DOM changes.",
			"Prefer agent_browser over raw web fetch when login state, JavaScript rendering, screenshots, or UI verification matters.",
		],
		parameters: Type.Object({
			args: Type.Array(Type.String(), {
				description: "Arguments passed to agent-browser, e.g. [\"open\", \"https://example.com\"] or [\"snapshot\", \"-i\"]. Do not include the agent-browser executable name.",
			}),
		}),
		async execute(_toolCallId, params, signal) {
			const result = await runAgentBrowser(params.args, signal);
			const text = [result.stdout.trim(), result.stderr.trim()].filter(Boolean).join("\n\n");
			return {
				content: [{ type: "text", text: text || "agent-browser completed" }],
				details: { args: params.args, stdout: result.stdout, stderr: result.stderr },
			};
		},
	});
}
