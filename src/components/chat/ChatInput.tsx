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
      <div className="relative w-[70%] mx-auto">
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
            w-full backdrop-blur resize-none overflow-hidden
    rounded-full border border-gray-400 px-4 py-3 pr-12
    text-base leading-6 placeholder-white
    outline-none focus:ring-2 focus:ring-indigo-500
    max-h-80 text-white
          "
        />
        <button
          type="button"
          aria-label="Send"
          onClick={onSubmit}
          disabled={!canSend}
          className={`
            absolute right-2 top-1/2 -translate-y-1/2
            h-9 w-9 rounded-full flex items-center justify-center
            transition 
            ${
              canSend
                ? "bg-white text-black hover:opacity-80"
                : "opacity-40 pointer-events-none"
            }
          `}
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="purple">
            <path d="M2.01 21 23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>
      </div>
    );
  }
);

ChatInput.displayName = "ChatInput";
export default ChatInput;
