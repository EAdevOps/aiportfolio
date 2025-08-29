// components/chat/ChatArea.tsx
import { useEffect, useMemo, useState } from "react";
import type { ChatMessage } from "@/lib/types";
import type { ToolInvocation } from "@/lib/tooling";
import ToolRenderer from "@/components/chat/Tool-Renderer";

type Props = {
  messages: ChatMessage[];
  thinking: boolean;
  /** Extra space at the bottom so text never sits under the dock */
  reserveBottomPx?: number;
  /** Fade/slide the user question away once an assistant reply appears */
  hideQuestionOnAnswer?: boolean;
  /** Map: assistant message id -> tool invocations (Me/Projects/Skills/Contact) */
  toolsByMsg?: Record<string, ToolInvocation[]>;
};

export default function ChatArea({
  messages,
  thinking,
  reserveBottomPx = 0,
  hideQuestionOnAnswer = true,
  toolsByMsg = {},
}: Props) {
  const visible = messages.filter((m) => m.role !== "system");
  const hasAssistant = useMemo(
    () => visible.some((m) => m.role === "assistant"),
    [visible]
  );

  // After we animate the user question out, prune it from the DOM
  const [pruneUser, setPruneUser] = useState(false);
  useEffect(() => {
    if (hideQuestionOnAnswer && hasAssistant) {
      setPruneUser(false);
      const t = setTimeout(() => setPruneUser(true), 550); // match transition duration
      return () => clearTimeout(t);
    } else {
      setPruneUser(false);
    }
  }, [hideQuestionOnAnswer, hasAssistant]);

  if (visible.length === 0 && !thinking) {
    return (
      <p className="text-center text-sm text-white/60">
        Pick a quick action or ask a question to get started.
      </p>
    );
  }

  return (
    <ul
      className="space-y-3 max-w-3xl mx-auto pt-2"
      style={{ paddingBottom: reserveBottomPx }}
    >
      {visible.map((m, i) => {
        const isUser = m.role === "user";
        const msgId = (m as any).id as string | undefined;

        if (hideQuestionOnAnswer && hasAssistant && pruneUser && isUser) {
          return null;
        }

        const hideNow = hideQuestionOnAnswer && hasAssistant && isUser;

        return (
          <li
            key={msgId ?? i}
            className={`flex ${isUser ? "justify-end" : "justify-start"}`}
          >
            {isUser ? (
              <div
                className={[
                  "rounded-2xl px-4 py-3 whitespace-pre-wrap leading-relaxed shadow transition-all duration-500 ease-out overflow-hidden",
                  "bg-black text-white",
                  "max-w-[85%]",
                  hideNow
                    ? "opacity-0 -translate-y-1 scale-[0.98] max-h-0 py-0 my-0"
                    : "opacity-100 translate-y-0 scale-100 max-h-[999px] my-0.5",
                ].join(" ")}
              >
                {m.content}
              </div>
            ) : (
              <div className="w-full">
                <div className="whitespace-pre-wrap leading-relaxed text-white">
                  {m.content}
                </div>

                {msgId && toolsByMsg[msgId]?.length ? (
                  <div className="w-full mt-3 text-white">
                    <ToolRenderer
                      toolInvocations={toolsByMsg[msgId]!}
                      messageId={msgId}
                    />
                  </div>
                ) : null}
              </div>
            )}
          </li>
        );
      })}

      {thinking && (
        <li className="flex justify-start">
          <div className="text-white/70 italic">Thinking…</div>
        </li>
      )}
    </ul>
  );
}
