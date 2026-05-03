# Error Messages

Every error message should answer three questions:

1. **What happened?**
2. **Why?**
3. **How to fix it?**

> "Email address isn't valid. Please include an @ symbol." beats "Invalid input."

## Templates by situation

| Situation | Template |
|---|---|
| **Format error** | "[Field] needs to be [format]. Example: [example]" |
| **Missing required** | "Please enter [what's missing]" |
| **Permission denied** | "You don't have access to [thing]. [What to do instead]" |
| **Network error** | "We couldn't reach [thing]. Check your connection and [action]." |
| **Server error** | "Something went wrong on our end. We're looking into it. [Alternative action]" |
| **Conflict** | "[Thing] already exists. [Choose a different name / view existing]" |
| **Rate limit** | "Too many requests. Try again in [time]." |
| **Auth expired** | "Your session expired. [Sign in again]" |

## Don't blame the user

Reframe accusatory copy as instructions:

| Blame | Instruction |
|---|---|
| "You entered an invalid date" | "Please enter a date in MM/DD/YYYY format" |
| "Wrong password" | "Password didn't match. Try again or [reset it]" |
| "You forgot to fill in name" | "Name is required" |
| "Invalid email" | "Email needs an @ — example: name@example.com" |

## Specificity > brevity

Vague short errors are worse than specific long errors. Saving 3 words isn't worth a confused user.

| Vague | Specific |
|---|---|
| "Failed" | "Couldn't save. Check your connection." |
| "Error 500" | "Server error. We're notified. Try again in a minute." |
| "Invalid" | "Email needs an @ symbol." |

## Inline > modal

Field errors near the field. Page errors at the top. Modal errors only for blocking conditions.

## Recovery action

Whenever possible, the error includes the action that fixes it:
- "Couldn't connect. **[Try again]**"
- "Email already in use. **[Sign in instead]**"
- "Card declined. **[Use another card]**"
