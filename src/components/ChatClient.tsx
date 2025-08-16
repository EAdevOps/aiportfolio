"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ChatMessage, TabKey } from "@/lib/types";
import { TAB_CONTENT } from "@/lib/tabContent";
import { routeQuestion } from "@/lib/routeQuestion";

type Controller = {
  state: {
    messages: ChatMessage[];
    q: string;
    thinking: boolean;
    compact: boolean;
    activeTab: TabKey | null;
    year: number;
  };
  refs: {
    listRef: React.MutableRefObject<HTMLDivElement | null>;
    taRef: React.MutableRefObject<HTMLTextAreaElement | null>;
  };
  actions: {
    setQ: (v: string) => void;
    enterCompact: () => void;
    onTabSelect: (tab: TabKey) => void;
    sendMessage: (raw?: string) => Promise<void>;
    onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  };
};

export default function ChatClient({
  children,
}: {
  children: (ctrl: Controller) => React.ReactNode;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [q, setQ] = useState("");
  const [thinking, setThinking] = useState(false);
  const [compact, setCompact] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey | null>(null);
  const year = useMemo(() => new Date().getFullYear(), []);

  const listRef = useRef<HTMLDivElement | null>(null);
  const taRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages, thinking]);

  useEffect(() => {
    if (compact) taRef.current?.focus();
  }, [compact, activeTab]);

  function enterCompact() {
    if (!compact) setCompact(true);
  }

  function onTabSelect(tab: TabKey) {
    enterCompact();
    setThinking(false);
    setMessages([]); // clear chat per your rule
    setActiveTab(tab); // TabPanel handles the content
  }

  async function sendMessage(raw?: string) {
    const text = (raw ?? q).trim();
    if (!text || thinking) return;

    // typing switches back to chat mode
    setActiveTab(null);
    enterCompact();

    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setQ("");
    setThinking(true);

    // local route to portfolio content
    const routed = routeQuestion(text);
    if (routed) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: TAB_CONTENT[routed] },
      ]);
      setThinking(false);
      return;
    }

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const raw = await res.text();

      if (!res.ok) {
        const msg =
          res.status === 429
            ? "I’m getting a lot of requests—try again in a few seconds."
            : `Server error (${res.status}). Please try again.`;
        setMessages((prev) => [...prev, { role: "assistant", content: msg }]);
        return;
      }

      const data = JSON.parse(raw);
      const reply = String(data?.reply ?? "…");
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Oops — AI backend is unavailable right now.",
        },
      ]);
    } finally {
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
        state: { messages, q, thinking, compact, activeTab, year },
        refs: { listRef, taRef },
        actions: { setQ, enterCompact, onTabSelect, sendMessage, onKeyDown },
      })}
    </>
  );
}
