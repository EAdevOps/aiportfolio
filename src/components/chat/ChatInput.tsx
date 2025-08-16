"use client";

import { forwardRef, useEffect, useRef } from "react";

type Props = {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  disabled?: boolean; // busy/thinking disables input + button
  showHint?: boolean;
};

const ChatInput = forwardRef<HTMLTextAreaElement, Props>(
  (
    { value, onChange, onSubmit, onKeyDown, disabled = false, showHint },
    ref
  ) => {
    const innerRef = useRef<HTMLTextAreaElement | null>(null);

    // Merge the forwarded ref with our local ref
    function setRefs(el: HTMLTextAreaElement | null) {
      innerRef.current = el;
      if (typeof ref === "function") ref(el);
      else if (ref && "current" in (ref as any)) (ref as any).current = el;
    }

    // autosize
    useEffect(() => {
      const ta = innerRef.current;
      if (!ta) return;
      ta.style.height = "0px";
      ta.style.height = Math.min(ta.scrollHeight, 320) + "px";
    }, [value]);

    const canSend = value.trim().length > 0 && !disabled;

    return (
      <div className="relative">
        <textarea
          ref={setRefs}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          rows={1}
          placeholder="Ask anything…"
          aria-label="Ask anything"
          disabled={disabled}
          className="
            w-full resize-none overflow-hidden
            rounded-2xl border px-4 py-3 pr-12
            text-base leading-6
            outline-none focus:ring-2 focus:ring-indigo-500
            max-h-80 bg-white
          "
        />
        <button
          type="button"
          aria-label="Send"
          onClick={onSubmit}
          disabled={!canSend}
          className={`absolute right-2 bottom-6 rounded-full p-2  ${
            canSend
              ? "bg-black text-white hover:opacity-90"
              : "opacity-40 pointer-events-none"
          }`}
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
            <path d="M2.01 21 23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>
        {showHint && (
          <p className="mt-2 text-xs text-gray-500">Shift+Enter for newline</p>
        )}
      </div>
    );
  }
);

ChatInput.displayName = "ChatInput";
export default ChatInput;
