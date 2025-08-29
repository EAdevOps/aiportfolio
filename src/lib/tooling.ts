// lib/tooling.ts
export type ToolInvocation = {
  toolCallId: string;
  toolName: string;
  args?: unknown;
  result?: unknown;
};

export type ToolName = "getMe" | "getProjects" | "getSkills" | "getContact";

export function makeToolInvocation(toolName: ToolName): ToolInvocation {
  const id =
    typeof crypto?.randomUUID === "function"
      ? crypto.randomUUID()
      : String(Date.now()) + Math.random().toString(16).slice(2);
  return { toolCallId: id, toolName, args: {}, result: {} };
}
