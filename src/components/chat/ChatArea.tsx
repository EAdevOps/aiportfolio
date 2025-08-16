import type { ChatMessage } from "@/lib/types";

type Props = {
  messages: ChatMessage[];
  thinking: boolean;
};

export default function ChatArea({ messages, thinking }: Props) {
  // Hide any system turns from the UI
  const visible = messages.filter((m) => m.role !== "system");

  if (visible.length === 0 && !thinking) {
    return (
      <p className="text-center text-sm text-gray-600">
        Pick a tab or ask a question to get started.
      </p>
    );
  }

  return (
    <ul className="space-y-3 max-w-3xl mx-auto py-2">
      {visible.map((m, i) => {
        const isUser = m.role === "user";
        return (
          <li
            key={i}
            className={`flex ${isUser ? "justify-end" : "justify-start"}`}
          >
            <div
              className={[
                "rounded-2xl px-4 py-3 whitespace-pre-wrap leading-relaxed shadow",
                isUser
                  ? "bg-black text-white"
                  : "bg-white/80 backdrop-blur border",
              ].join(" ")}
              style={{ maxWidth: "85%" }}
            >
              {m.content}
            </div>
          </li>
        );
      })}

      {thinking && (
        <li className="flex justify-start">
          <div className="rounded-2xl px-4 py-3 bg-white/80 backdrop-blur border">
            Thinking…
          </div>
        </li>
      )}
    </ul>
  );
}
