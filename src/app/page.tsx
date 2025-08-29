"use client";

import React, { useEffect, useRef, useState } from "react";
import ChatClient from "@/components/ChatClient";
import FluidCursor from "@/components/FluidCursor";
import Header from "@/components/chat/Header";

import QuickActions from "@/components/chat/QuickActions";
import ChatArea from "@/components/chat/ChatArea";
import ChatInput from "@/components/chat/ChatInput";

import QuotesScramble from "@/components/QuotesScramble";

export default function Page() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [cursorEnabled, setCursorEnabled] = useState(true);
  const [showFooter, setShowFooter] = useState(true);
  const [showDock, setShowDock] = useState(false);

  const dockRef = useRef<HTMLDivElement | null>(null);
  const [dockPx, setDockPx] = useState(160);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  const toggledOnce = useRef(false);
  const prevMsgLen = useRef(0);

  return (
    <ChatClient>
      {({ state, refs, actions, toolsByMsg }) => {
        const focusInput = () => {
          const el =
            (refs.taRef?.current as
              | HTMLTextAreaElement
              | HTMLInputElement
              | null) ?? null;
          if (!el) return;
          el.focus();
          try {
            const v =
              (el as HTMLInputElement | HTMLTextAreaElement).value ?? "";
            (el as HTMLInputElement | HTMLTextAreaElement).setSelectionRange?.(
              v.length,
              v.length
            );
          } catch {}
        };

        // Flip to sticky dock on first message
        useEffect(() => {
          const len = state.messages?.length ?? 0;
          if (!toggledOnce.current && len > prevMsgLen.current) {
            toggledOnce.current = true;
            setCursorEnabled(false);
            setShowWelcome(false);
            setShowFooter(false);
            setShowDock(true);
          }
          prevMsgLen.current = len;
        }, [state.messages?.length]);

        // Measure dock height whenever it’s visible/resized
        useEffect(() => {
          if (!showDock) return;
          const measure = () => {
            if (dockRef.current) setDockPx(dockRef.current.offsetHeight);
          };
          measure();
          window.addEventListener("resize", measure);
          return () => window.removeEventListener("resize", measure);
        }, [showDock]);

        // Auto-scroll to bottom; keep last item above the dock
        useEffect(() => {
          const id = requestAnimationFrame(() => {
            if (endRef.current) {
              endRef.current.scrollIntoView({
                behavior: "smooth",
                block: "end",
              });
            } else if (scrollRef.current) {
              scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
            }
          });
          return () => cancelAnimationFrame(id);
        }, [state.messages?.length, state.thinking, showDock, dockPx]);

        // Stable focus management
        useEffect(() => {
          if (!showDock) return;
          focusInput();
          requestAnimationFrame(focusInput);
          if (!state.thinking) requestAnimationFrame(focusInput);
        }, [showDock, state.thinking]);

        // Show scrollbar only on hover / active scroll
        useEffect(() => {
          const el = scrollRef.current;
          if (!el) return;
          let hideTimer: number | undefined;
          const showScrolling = () => {
            el.classList.add("scrolling");
            if (hideTimer) window.clearTimeout(hideTimer);
            hideTimer = window.setTimeout(
              () => el.classList.remove("scrolling"),
              700
            );
          };
          const onEnter = () => el.classList.add("hovered");
          const onLeave = () => el.classList.remove("hovered");

          el.addEventListener("scroll", showScrolling, { passive: true });
          el.addEventListener("wheel", showScrolling, { passive: true });
          el.addEventListener("touchmove", showScrolling, { passive: true });
          el.addEventListener("mouseenter", onEnter);
          el.addEventListener("mouseleave", onLeave);
          return () => {
            el.removeEventListener("scroll", showScrolling);
            el.removeEventListener("wheel", showScrolling as any);
            el.removeEventListener("touchmove", showScrolling as any);
            el.removeEventListener("mouseenter", onEnter);
            el.removeEventListener("mouseleave", onLeave);
            if (hideTimer) window.clearTimeout(hideTimer);
          };
        }, [showDock]);

        const flipToDock = () => {
          if (!toggledOnce.current) {
            toggledOnce.current = true;
            setCursorEnabled(false);
            setShowWelcome(false);
            setShowFooter(false);
            setShowDock(true);
          }
          requestAnimationFrame(focusInput);
        };

        const handleSubmit = () => {
          actions.sendMessage();
          flipToDock();
        };

        return (
          <div
            id="container"
            className="relative isolate z-10 h-screen overflow-hidden"
          >
            {/* Fluid cursor behind everything */}
            {cursorEnabled && (
              <div className="pointer-events-none fixed inset-0 -z-10">
                <FluidCursor />
              </div>
            )}

            {/* Header */}
            <div className="h-[10vh] w-[100vw] relative z-40">
              <Header />
            </div>

            {/* ===== LANDING (centered controls, footer visible) ===== */}
            {!showDock && (
              <main
                className="
      [--footer-h:0px] sm:[--footer-h:18vh] md:[--footer-h:285px]
      h-[calc(100vh-10vh-var(--footer-h))]
      grid place-items-center
      mx-auto w-[92vw] sm:w-[86vw] md:w-[80vw] lg:w-[70vw]"
              >
                {showWelcome && (
                  <div
                    className="
          grid place-items-center text-center mx-auto gap-1 m-0 p-0 [&_*]:m-0 [&_*]:p-0
          /* ⬇️ make hero tall enough to center the ECHO line */
          min-h-[clamp(260px,40vh,520px)] sm:min-h-[clamp(320px,48vh,640px)] md:min-h-[clamp(380px,56vh,760px)]

          flex flex-col
        "
                  >
                    <div className="flex items-baseline gap-2">
                      <span className="font-mobo text-[clamp(1rem,4vw,2rem)] bg-gradient-to-r from-fuchsia-500 to-cyan-500 bg-clip-text text-transparent">
                        Hello
                      </span>
                      <span className="text-[clamp(1.75rem,8vw,2.75rem)] text-white">
                        👋
                      </span>
                      <span className="font-mono text-[clamp(1rem,4vw,2rem)] text-white">
                        ,
                      </span>
                      <span className="font-mono text-[clamp(1rem,4vw,2rem)] bg-gradient-to-r from-fuchsia-500 to-cyan-500 bg-clip-text text-transparent">
                        World!
                      </span>
                    </div>

                    <p className="text-[clamp(0.95rem,3.8vw,1.5rem)] font-mono mt-[clamp(6px,2.2vw,18px)]">
                      I am a digital symbiote tasked to be
                    </p>

                    <p className="text-[clamp(1rem,4vw,1.6rem)] font-mono leading-tight bg-gradient-to-r from-fuchsia-500 to-cyan-500 bg-clip-text text-transparent mt-[clamp(10px,3vw,28px)]">
                      <span className="ehco text-[clamp(1.3rem,6vw,2.1rem)]">
                        EH
                      </span>
                      <span className="text-[clamp(1rem,4vw,1.6rem)] font-mono bg-gradient-to-r from-fuchsia-500 to-cyan-500 bg-clip-text text-transparent">
                        san&apos;s
                      </span>{" "}
                      <span className="ehco text-[clamp(1.3rem,6vw,2.1rem)]">
                        C
                      </span>
                      <span className="text-[clamp(1rem,4vw,1.6rem)] font-mono bg-gradient-to-r from-fuchsia-500 to-cyan-500 bg-clip-text text-transparent">
                        ognitive
                      </span>{" "}
                      <span className="ehco text-[clamp(1.3rem,6vw,2.1rem)]">
                        O
                      </span>
                      <span className="text-[clamp(1rem,4vw,1.6rem)] font-mono bg-gradient-to-r from-fuchsia-500 to-cyan-500 bg-clip-text text-transparent">
                        perator
                      </span>
                    </p>

                    <div className="flex-1" aria-hidden />

                    <div className="inline-flex items-center gap-2 whitespace-nowrap">
                      <span className=" text-[clamp(0.9rem,3.5vw,1.25rem)] font-mono text-white">
                        I AM
                      </span>
                      <span className="ehco text-[clamp(2.5rem,16vw,7rem)] font-logo leading-[0.9] text-white">
                        EHCO
                      </span>
                    </div>

                    <div className="flex-1" aria-hidden />
                  </div>
                )}

                <div className="flex flex-col gap-3 items-stretch max-w-3xl mx-auto">
                  {showWelcome && (
                    <>
                      <div className="flex flex-wrap justify-center gap-2 text-[10px] sm:text-xs ">
                        <span className="font-mono rounded-full border border-gray-400 backdrop-blur bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-500 to-cyan-500 px-3 py-1">
                          CS ’25 • Maryland
                        </span>
                        <span className="font-mono rounded-full border border-gray-400 backdrop-blur bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-500 to-cyan-500 px-3 py-1">
                          AI + Full-stack
                        </span>
                        <span className="font-mono rounded-full border border-gray-400 backdrop-blur bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-500 to-cyan-500 px-3 py-1">
                          Open to internships
                        </span>
                      </div>
                      <p className="mt-2 mb-1 font-mono text-center text-xs text-white/70">
                        Ping the twin: my human will get the credit anyway
                      </p>
                    </>
                  )}
                  <ChatInput
                    ref={refs.taRef}
                    value={state.q}
                    onChange={actions.setQ}
                    onSubmit={handleSubmit}
                    disabled={state.thinking}
                    showHint
                    onKeyDown={actions.onKeyDown}
                  />

                  <QuickActions onOpenTool={actions.openTool} />
                </div>
              </main>
            )}

            {/* ===== CONVERSATION (cropped scroll + sticky dock; footer hidden) ===== */}
            {showDock && (
              <>
                <QuotesScramble />
                <main className="relative z-30 mx-auto w-[92vw] sm:w-[86vw] md:w-[80vw] lg:w-[70vw] pt-4">
                  <div className="mx-auto w-full max-w-3xl">
                    {/* Only this box scrolls; cropped above the dock */}
                    <div
                      ref={scrollRef}
                      className="scrollbox overflow-y-auto pr-1"
                      style={{
                        height: `calc(100vh - 10vh - ${dockPx}px)`,
                        scrollPaddingBottom: dockPx,
                      }}
                    >
                      {/* no activeTab anymore; always render ChatArea */}
                      <div ref={refs.listRef} className="min-h-20 w-full">
                        <ChatArea
                          messages={state.messages}
                          thinking={state.thinking}
                          reserveBottomPx={dockPx}
                          hideQuestionOnAnswer
                          toolsByMsg={toolsByMsg}
                        />
                        <div
                          ref={endRef}
                          style={{ scrollMarginBottom: dockPx }}
                        />
                      </div>
                    </div>
                  </div>
                </main>

                {/* Sticky bottom dock */}
                <div
                  ref={dockRef}
                  className="fixed bottom-0 inset-x-0 z-50 bg-gradient-to-t from-[#2c3539] to-[#121212]"
                >
                  <div className="mx-auto w-[92vw] sm:w-[86vw] md:w-[80vw] lg:w-[70vw] max-w-5xl py-3">
                    <div className="flex flex-col items-stretch gap-3 mx-auto w-full max-w-3xl">
                      {/* Optional: show QuickActions in the dock as well */}
                      <QuickActions onOpenTool={actions.openTool} />

                      <ChatInput
                        ref={refs.taRef}
                        value={state.q}
                        onChange={actions.setQ}
                        onSubmit={handleSubmit}
                        disabled={state.thinking}
                        showHint
                        onKeyDown={actions.onKeyDown}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Footer (only on landing) */}
            {showFooter && (
              <footer
                className={`fixed bottom-0 inset-x-0
      hidden sm:flex                    // ⬅️ hide on small screens
      h-[16vh] sm:h-[18vh] md:h-[285px]
      items-center justify-center
      pointer-events-none z-20 overflow-hidden
      pb-[env(safe-area-inset-bottom)]`}
              >
                <h3
                  className={`relative translate-y-4 sm:translate-y-6
        leading-none whitespace-nowrap font-logo
        bg-gradient-to-t from-black to-white text-transparent bg-clip-text opacity-10
        text-[clamp(4rem,18vw,10rem)]`}
                >
                  ALI
                </h3>
              </footer>
            )}

            {/* Raw <style> (not styled-jsx) to avoid parse/transform issues */}
            <style>{`
              .scrollbox { scrollbar-width: none; }
              .scrollbox::-webkit-scrollbar { width: 0; height: 0; }

              .scrollbox.hovered, .scrollbox.scrolling { scrollbar-width: thin; }
              .scrollbox.hovered::-webkit-scrollbar,
              .scrollbox.scrolling::-webkit-scrollbar { width: 8px; height: 8px; }

              .scrollbox::-webkit-scrollbar-track { background: transparent; }
              .scrollbox::-webkit-scrollbar-thumb {
                background: rgba(0, 0, 0, 0.3);
                border-radius: 9999px;
              }
              .scrollbox.scrolling::-webkit-scrollbar-thumb,
              .scrollbox.hovered::-webkit-scrollbar-thumb {
                background: rgba(0, 0, 0, 0.45);
              }
            `}</style>

            {cursorEnabled && (
              <div className="pointer-events-none fixed inset-0 -z-10">
                <FluidCursor />
              </div>
            )}
          </div>
        );
      }}
    </ChatClient>
  );
}
