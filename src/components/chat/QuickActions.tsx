"use client";

import React, { useEffect, useRef, useState } from "react";
import type { ToolName } from "@/lib/tooling";

type Action = {
  label: string;
  prompt: string;
  tool: ToolName;
  icon?: string; // mask icon path
};

type Props = {
  /** Open a page locally (no API call) */
  onOpenTool?: (tool: ToolName) => void;
  /** Send a prompt to /api/chat */
  onAsk?: (prompt: string) => void;
  /** Prefill the input without sending */
  onPrefill?: (prompt: string) => void;

  /**
   * "openTool" | "send" | "prefill"
   * Defaults to "openTool" if onOpenTool is provided, else "send".
   */
  behavior?: "openTool" | "send" | "prefill";

  /** Center actions on mobile */
  centerOnMobile?: boolean;

  className?: string;
};

export default function QuickActions({
  onOpenTool,
  onAsk,
  onPrefill,
  behavior,
  centerOnMobile = false,
  className = "",
}: Props) {
  // Decide default behavior safely
  const chosenBehavior: "openTool" | "send" | "prefill" =
    behavior ?? (onOpenTool ? "openTool" : "send");

  // Primary, full-size buttons
  const primary: Action[] = [
    {
      label: "Me",
      icon: "/icons/me2.svg",
      prompt: "Tell me about yourself.",
      tool: "getMe",
    },
    {
      label: "Projects",
      icon: "/icons/project.svg",
      prompt: "Show me your projects.",
      tool: "getProjects",
    },
    {
      label: "Skills",
      icon: "/icons/skill.svg",
      prompt: "What are your skills and tech stack?",
      tool: "getSkills",
    },
    {
      label: "Contact",
      icon: "/icons/contact1.svg",
      prompt: "How can I contact you? Email and GitHub please.",
      tool: "getContact",
    },
  ];

  // FAQ content for the popup (clicking now toggles a sliding answer)
  const FAQ_SECTIONS: { title: string; items: string[] }[] = [
    {
      title: "Me",
      items: [
        "Who are you?",
        "What are your passions?",
        "How did you get started in tech?",
        "Where do you see yourself in 5 years?",
      ],
    },
    {
      title: "Projects",
      items: [
        "What projects are you most proud of?",
        "Show me something recent.",
      ],
    },
    {
      title: "Skills",
      items: [
        "What are your skills?",
        "What’s your tech stack?",
        "What tools do you use daily?",
      ],
    },
    {
      title: "Contact & Next",
      items: [
        "How can I reach you?",
        "Where are you located?",
        "What kind of project would make you say yes immediately?",
      ],
    },
  ];

  // Short answers shown inside the sliding panel (edit as you like)
  const FAQ_ANSWERS: Record<string, string> = {
    "Who are you?":
      "I’m Ehsan — a CS student in Maryland (grad 2025). I build AI + full-stack projects and I’m hunting for roles where I can ship fast and learn faster.",
    "What are your passions?":
      "Building useful AI features, polishing UX, and turning messy ideas into clean products. Also gaming, Marvel, and staying active.",
    "How did you get started in tech?":
      "Started tinkering with code in school, doubled down with Java/C++/Python, and moved into Next.js + AI projects to ship real stuff.",
    "Where do you see yourself in 5 years?":
      "Leading or founding a product team, shipping AI-driven apps, and learning every day.",
    "What projects are you most proud of?":
      "AI Resume Ranker (team capstone), AI Digit Recognizer, a web hosting frontend, and an in-progress MicStreaming Rooms prototype.",
    "Show me something recent.":
      "Recently polishing my portfolio components and hooking up tool-based page rendering for Me/Projects/Skills/Contact.",
    "What are your skills?":
      "Python, Java, C++, JS/TS; Next.js, Tailwind; TensorFlow/Scikit-learn; Git, Linux, Docker basics.",
    "What’s your tech stack?":
      "Next.js, React, Tailwind on the front; Python/Flask and Node for backends; AI via OpenAI + common Python libs.",
    "What tools do you use daily?":
      "VS Code, GitHub, Figma, and a rotating cast of CLI tools. On the AI side: notebooks + model APIs.",
    "How can I reach you?":
      "Email: Ehsanaliwalleem@gmail.com — GitHub: github.com/EAdevOps",
    "Where are you located?": "Maryland, USA.",
    "What kind of project would make you say yes immediately?":
      "Something where I learn a new piece of the stack and ship a real feature users touch. Bonus if it blends AI + UX.",
  };

  const wrap = [
    "font-mono flex w-full flex-wrap items-center gap-2",
    centerOnMobile ? "justify-center sm:justify-start" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  function handlePrimaryClick(item: Action) {
    if (chosenBehavior === "openTool" && onOpenTool) {
      onOpenTool(item.tool);
      return;
    }
    if (chosenBehavior === "prefill" && onPrefill) {
      onPrefill(item.prompt);
      return;
    }
    if (onAsk) {
      onAsk(item.prompt);
      return;
    }
  }

  function handleIdeaSend(prompt: string) {
    if (chosenBehavior === "prefill" && onPrefill) {
      onPrefill(prompt);
      closeModal();
      return;
    }
    if (onAsk) {
      onAsk(prompt);
      closeModal();
    }
  }

  // --- Lightweight popup (no libs) ---
  const [open, setOpen] = useState(false);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);

  function openModal() {
    setOpen(true);
  }
  function closeModal() {
    setOpen(false);
    setOpenKey(null);
  }

  // Close on ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Click outside to close
  function onOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === overlayRef.current) {
      closeModal();
    }
  }

  // --- NEW: slide-down answers for FAQ items ---
  // we track which question is expanded via a stable key: `${section}:${question}`
  const [openKey, setOpenKey] = useState<string | null>(null);
  const toggleQuestion = (key: string) => {
    setOpenKey((prev) => (prev === key ? null : key));
  };

  const fullButtonClass =
    " flex-1 min-w-[100px] rounded-xl border border-white/30  backdrop-blur px-4 py-3 text-gray-400 hover:bg-black/5 active:scale-95 transition shadow-sm flex items-center justify-center gap-2 font-mono";
  const smallMoreBtnClass =
    "h-9 px-3 rounded-lg border border-white/30 bg-white/10 text-gray-400 hover:bg-white/15 active:scale-95 text-xs inline-flex items-center gap-1 font-mono ";

  return (
    <>
      <div className={wrap}>
        {/* Primary full-size buttons */}
        {primary.map((a) => (
          <button
            key={a.label}
            type="button"
            onClick={() => handlePrimaryClick(a)}
            className={fullButtonClass}
            title={
              chosenBehavior === "prefill"
                ? "Prefill message"
                : chosenBehavior === "openTool"
                ? "Open page"
                : "Send message"
            }
          >
            {a.icon ? (
              <span
                aria-hidden
                className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 bg-gradient-to-r from-fuchsia-500 to-cyan-500 inline-block"
                style={{
                  maskImage: `url(${a.icon})`,
                  WebkitMaskImage: `url(${a.icon})`,
                  maskRepeat: "no-repeat",
                  WebkitMaskRepeat: "no-repeat",
                  maskPosition: "center",
                  WebkitMaskPosition: "center",
                  maskSize: "contain",
                  WebkitMaskSize: "contain",
                }}
              />
            ) : null}
            <span className="text-xs sm:text-sm md:text-base font-mono">
              {a.label}
            </span>
          </button>
        ))}

        {/* SMALL "More" button → opens popup */}
        <button
          type="button"
          onClick={openModal}
          className={smallMoreBtnClass}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls="qa-faq-modal"
          title="Quick FAQ"
        >
          {/* three dots icon */}
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="-mt-0.5"
          >
            <circle cx="5" cy="12" r="2" />
            <circle cx="12" cy="12" r="2" />
            <circle cx="19" cy="12" r="2" />
          </svg>
          More
        </button>
      </div>

      {/* Popup */}
      {open && (
        <div
          ref={overlayRef}
          onClick={onOverlayClick}
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-3 "
        >
          <div
            ref={dialogRef}
            id="qa-faq-modal"
            role="dialog"
            aria-modal="true"
            className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#121212] text-white shadow-2xl"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <h3 className="text-base font-mono">Quick FAQ</h3>
              <button
                onClick={closeModal}
                className="h-8 w-8 grid place-items-center rounded-md hover:bg-white/10"
                aria-label="Close"
                autoFocus
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    d="M18 6L6 18M6 6l12 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto px-4 py-3">
              {FAQ_SECTIONS.map((sec) => (
                <div key={sec.title} className="mb-5">
                  <h4 className="text-sm font-medium text-white/80 mb-2">
                    {sec.title}
                  </h4>
                  <ul className="space-y-2">
                    {sec.items.map((q) => {
                      const key = `${sec.title}:${q}`;
                      const isOpen = key === openKey;
                      const answer = FAQ_ANSWERS[q];

                      return (
                        <li key={q}>
                          {/* Question row */}
                          <button
                            type="button"
                            onClick={() => toggleQuestion(key)}
                            className="w-full text-left rounded-lg px-3 py-2 bg-white/5 hover:bg-white/10 flex items-center justify-between"
                            aria-expanded={isOpen}
                            aria-controls={`faq-panel-${key}`}
                          >
                            <span className="text-sm">{q}</span>
                            <svg
                              className={`ml-3 transition-transform duration-300 ${
                                isOpen ? "rotate-180" : ""
                              }`}
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              aria-hidden="true"
                            >
                              <path
                                d="M6 9l6 6 6-6"
                                stroke="currentColor"
                                strokeWidth="2"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </button>

                          {/* Sliding answer panel (grid-rows trick) */}
                          <div
                            id={`faq-panel-${key}`}
                            className={`grid transition-all duration-300 ${
                              isOpen
                                ? "grid-rows-[1fr] opacity-100"
                                : "grid-rows-[0fr] opacity-0"
                            }`}
                          >
                            <div className="overflow-hidden">
                              <div className="px-3 pt-2 pb-3 text-sm text-white/90">
                                <p className="mb-3">
                                  {answer ??
                                    "Here’s a quick note on that topic."}
                                </p>

                                <div className="flex flex-wrap gap-2">
                                  {/* Ask → send prompt */}
                                  {onAsk && (
                                    <button
                                      onClick={() => handleIdeaSend(q)}
                                      className="h-8 px-3 rounded-md border border-white/20 bg-white/10 hover:bg-white/15 text-xs"
                                    >
                                      Ask this
                                    </button>
                                  )}

                                  {/* Prefill → fill input only */}
                                  {onPrefill && (
                                    <button
                                      onClick={() => {
                                        onPrefill(q);
                                        closeModal();
                                      }}
                                      className="h-8 px-3 rounded-md border border-white/20 bg-white/10 hover:bg-white/15 text-xs"
                                    >
                                      Prefill
                                    </button>
                                  )}

                                  {/* Open page if it maps clearly */}
                                  {onOpenTool && sec.title && (
                                    <>
                                      {sec.title === "Me" && (
                                        <button
                                          onClick={() => {
                                            onOpenTool("getMe");
                                            closeModal();
                                          }}
                                          className="h-8 px-3 rounded-md border border-white/20 bg-white/10 hover:bg-white/15 text-xs"
                                        >
                                          Open “Me”
                                        </button>
                                      )}
                                      {sec.title === "Projects" && (
                                        <button
                                          onClick={() => {
                                            onOpenTool("getProjects");
                                            closeModal();
                                          }}
                                          className="h-8 px-3 rounded-md border border-white/20 bg-white/10 hover:bg-white/15 text-xs"
                                        >
                                          Open “Projects”
                                        </button>
                                      )}
                                      {sec.title === "Skills" && (
                                        <button
                                          onClick={() => {
                                            onOpenTool("getSkills");
                                            closeModal();
                                          }}
                                          className="h-8 px-3 rounded-md border border-white/20 bg-white/10 hover:bg-white/15 text-xs"
                                        >
                                          Open “Skills”
                                        </button>
                                      )}
                                      {sec.title === "Contact & Next" && (
                                        <button
                                          onClick={() => {
                                            onOpenTool("getContact");
                                            closeModal();
                                          }}
                                          className="h-8 px-3 rounded-md border border-white/20 bg-white/10 hover:bg-white/15 text-xs"
                                        >
                                          Open “Contact”
                                        </button>
                                      )}
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>

            <div className="px-4 py-3 border-t border-white/10 text-right">
              <button
                onClick={closeModal}
                className="h-9 px-3 rounded-lg border border-white/20 bg-white/10 hover:bg-white/15 text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
