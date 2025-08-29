import Me from "@/content/pages/Me";
import Projects from "@/content/pages/Projects";
import Skills from "@/content/pages/Skills";
import Contact from "@/content/pages/Contact";

interface ToolRendererProps {
  toolInvocations: Array<{
    toolCallId: string;
    toolName: string;
    args?: unknown;
    result?: unknown;
  }>;
  messageId: string;
}

export default function ToolRenderer({
  toolInvocations,
  messageId,
}: ToolRendererProps) {
  return (
    <div className="w-full transition-all duration-300">
      {toolInvocations.map((tool) => {
        const { toolCallId, toolName } = tool;

        switch (toolName) {
          case "getMe":
            return (
              <div
                key={`${messageId}-${toolCallId}`}
                className="w-full overflow-hidden rounded-lg"
              >
                <Me />
              </div>
            );
          case "getProjects":
            return (
              <div
                key={`${messageId}-${toolCallId}`}
                className="w-full overflow-hidden rounded-lg"
              >
                <Projects />
              </div>
            );
          case "getSkills":
            return (
              <div
                key={`${messageId}-${toolCallId}`}
                className="w-full overflow-hidden rounded-lg"
              >
                <Skills />
              </div>
            );
          case "getContact":
            return (
              <div
                key={`${messageId}-${toolCallId}`}
                className="w-full overflow-hidden rounded-lg"
              >
                <Contact />
              </div>
            );
          default:
            return (
              <div
                key={`${messageId}-${toolCallId}`}
                className="bg-secondary/10 w-full rounded-lg p-4"
              >
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-lg font-medium">{toolName}</h3>
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800 dark:bg-green-900 dark:text-green-100">
                    Tool Result
                  </span>
                </div>
                <div className="mt-2">
                  {typeof tool.result === "object" ? (
                    <pre className="bg-secondary/20 overflow-x-auto rounded p-3 text-sm">
                      {JSON.stringify(tool.result, null, 2)}
                    </pre>
                  ) : (
                    <p>{String(tool.result ?? "")}</p>
                  )}
                </div>
              </div>
            );
        }
      })}
    </div>
  );
}
