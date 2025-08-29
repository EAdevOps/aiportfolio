// components/ChatClient.tsx
"use client";

import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import type { ChatMessage } from "@/lib/types";
import type { ToolInvocation, ToolName } from "@/lib/tooling";
import { makeToolInvocation } from "@/lib/tooling";

type NullableRef<T> = RefObject<T | null>;

type Controller = {
  state: {
    messages: ChatMessage[];
    q: string;
    thinking: boolean;
    year: number;
  };
  refs: {
    listRef: NullableRef<HTMLDivElement>;
    taRef: NullableRef<HTMLTextAreaElement>;
  };
  actions: {
    setQ: (v: string) => void;
    sendMessage: (raw?: string) => Promise<void>;
    onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;

    openTool: (tool: ToolName) => void;
  };
  toolsByMsg: Record<string, ToolInvocation[]>;
};

export default function ChatClient({
  children,
}: {
  children: (ctrl: Controller) => React.ReactNode;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [q, setQ] = useState("");
  const [thinking, setThinking] = useState(false);
  const [toolsByMsg, setToolsByMsg] = useState<
    Record<string, ToolInvocation[]>
  >({});
  const year = useMemo(() => new Date().getFullYear(), []);

  const listRef = useRef<HTMLDivElement | null>(null);
  const taRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages, thinking]);

  useEffect(() => {
    const isDesktop =
      typeof window !== "undefined" &&
      window.matchMedia("(pointer:fine)").matches;
    if (isDesktop) taRef.current?.focus();
  }, []);

  const uid = () =>
    typeof crypto?.randomUUID === "function"
      ? crypto.randomUUID()
      : String(Date.now()) + Math.random().toString(16).slice(2);

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  async function typewriter(
    text: string,
    update: (partial: string) => void,
    opts?: { base?: number; jitter?: number }
  ) {
    const base = opts?.base ?? 16;
    const jitter = opts?.jitter ?? 12;

    let acc = "";
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      acc += ch;
      update(acc);

      let delay = base + Math.random() * jitter;
      if (".,!?:;".includes(ch)) delay += 60;
      if (ch === "\n") delay += 80;
      if (text.length > 1200) delay *= 0.8;

      await sleep(delay);
    }
  }

  function openTool(tool: ToolName) {
    setThinking(false);
    setQ("");

    // clean screen, create a fresh assistant message shell
    const msgId = uid();
    setMessages([{ role: "assistant", content: "", id: msgId }]);

    // attach a synthetic tool invocation so ToolRenderer mounts the page
    setToolsByMsg({ [msgId]: [makeToolInvocation(tool)] });

    // scroll to bottom
    requestAnimationFrame(() => {
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
    });
  }

  async function sendMessage(raw?: string) {
    const text = (raw ?? q).trim();
    if (!text || thinking) return;

    const userMsg: ChatMessage = { role: "user", content: text };
    const outgoing = [userMsg];

    setMessages([userMsg]);
    setToolsByMsg({});
    setQ("");
    setThinking(true);

    try {
      const ac = new AbortController();
      const t = setTimeout(() => ac.abort(), 20_000);

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: outgoing }),
        signal: ac.signal,
      });

      clearTimeout(t);

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        const msg =
          text ||
          (res.status === 429
            ? "I’m getting a lot of requests—try again in a few seconds."
            : `Server error (${res.status}). Please try again.`);
        setMessages((prev) => [...prev, { role: "assistant", content: msg }]);
        setThinking(false);
        return;
      }

      const data = await res.json();
      const fullReply = String(data?.reply ?? "");
      const msgId = uid();

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "", id: msgId },
      ]);
      setThinking(false);

      await typewriter(fullReply || "", (partial) => {
        setMessages((prev) =>
          prev.map((m) => (m.id === msgId ? { ...m, content: partial } : m))
        );
        listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
      });

      if (Array.isArray(data.toolInvocations) && data.toolInvocations.length) {
        setToolsByMsg({ [msgId]: data.toolInvocations });
      }
    } catch (err: any) {
      const aborted = err?.name === "AbortError";
      const msg = aborted
        ? "The model took too long to respond. Try again."
        : "Oops — AI backend is unavailable.";
      setMessages((prev) => [...prev, { role: "assistant", content: msg }]);
      setThinking(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <>
      {children({
        state: { messages, q, thinking, year },
        refs: { listRef, taRef },
        actions: { setQ, sendMessage, onKeyDown, openTool }, // 👈 expose it
        toolsByMsg,
      })}
    </>
  );
}
