"use client";

import React, { useEffect, useRef, useState } from "react";
import ChatClient from "@/components/ChatClient";
import FluidCursor from "@/components/FluidCursor";
import Header from "@/components/chat/Header";
import Tabs from "@/components/chat/Tabs";
import ChatArea from "@/components/chat/ChatArea";
import ChatInput from "@/components/chat/ChatInput";
import TabPanel from "@/components/TabPanel";

export default function Page() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [cursorEnabled, setCursorEnabled] = useState(true);
  const [showFooter, setShowFooter] = useState(true);
  const [showDock, setShowDock] = useState(false); // landing: centered; after interaction: sticky dock

  const dockRef = useRef<HTMLDivElement | null>(null);
  const [dockPx, setDockPx] = useState(160); // updated when dock mounts

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  const toggledOnce = useRef(false);
  const prevMsgLen = useRef(0);

  return (
    <ChatClient>
      {({ state, refs, actions }) => {
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

        // Keep input focused (mount, after dock shows, after response arrives)
        useEffect(() => {
          focusInput();
          // eslint-disable-next-line react-hooks/exhaustive-deps
        }, []);
        useEffect(() => {
          if (showDock) requestAnimationFrame(focusInput);
        }, [showDock]);
        useEffect(() => {
          if (!state.thinking) requestAnimationFrame(focusInput);
        }, [state.thinking]);

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

        const handleTabSelect = (tab: unknown) => {
          actions.onTabSelect(tab as any);
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
                [--footer-h:16vh] sm:[--footer-h:18vh] md:[--footer-h:285px]
                h-[calc(100vh-10vh-var(--footer-h))]
                grid place-items-center
                mx-auto w-[92vw] sm:w-[86vw] md:w-[80vw] lg:w-[70vw]"
              >
                <div className="w-full max-w-5xl text-center px-2">
                  {showWelcome && (
                    <>
                      <h1 className="font-logo text-[#00bfff] leading-none text-[clamp(3rem,18vw,12rem)]">
                        EA
                      </h1>
                      <h2 className="font-mono mt-2 leading-tight text-[clamp(1.125rem,4.5vw,3rem)]">
                        Welcome to New Gen AI Powered Portfolio
                      </h2>
                    </>
                  )}
                  <div className="mt-6 flex flex-col gap-3 items-stretch max-w-3xl mx-auto">
                    <Tabs onSelect={handleTabSelect} centerOnMobile />
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
              </main>
            )}

            {/* ===== CONVERSATION (cropped scroll + sticky dock; footer hidden) ===== */}
            {showDock && (
              <>
                <main className="relative z-30 mx-auto w-[92vw] sm:w-[86vw] md:w-[80vw] lg:w-[70vw] pt-4">
                  <div className="mx-auto max-w-5xl w-full">
                    {/* Only this box scrolls; cropped above the dock */}
                    <div
                      ref={scrollRef}
                      className="scrollbox overflow-y-auto pr-1"
                      style={{
                        height: `calc(100vh - 10vh - ${dockPx}px)`,
                        scrollPaddingBottom: dockPx,
                      }}
                    >
                      {state.activeTab ? (
                        <TabPanel tab={state.activeTab} />
                      ) : (
                        <div ref={refs.listRef} className="min-h-20 w-full">
                          <ChatArea
                            messages={state.messages}
                            thinking={state.thinking}
                            reserveBottomPx={dockPx}
                          />
                          <div
                            ref={endRef}
                            style={{ scrollMarginBottom: dockPx }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </main>

                {/* Sticky bottom dock (Tabs above Input) */}
                <div
                  ref={dockRef}
                  className="fixed bottom-0 inset-x-0 z-50 border-t bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/50"
                >
                  <div className="mx-auto w-[92vw] sm:w-[86vw] md:w-[80vw] lg:w-[70vw] max-w-5xl px-4 sm:px-6 py-3">
                    <div className="flex flex-col items-stretch gap-3">
                      <Tabs onSelect={handleTabSelect} centerOnMobile />
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
                  h-[16vh] sm:h-[18vh] md:h-[285px]
                  flex items-center justify-center
                  pointer-events-none z-20 overflow-hidden
                  pb-[env(safe-area-inset-bottom)]`}
              >
                <h3
                  className={`relative translate-y-4 sm:translate-y-6
                    leading-none whitespace-nowrap font-logo
                    bg-gradient-to-t from-black to-white text-transparent bg-clip-text opacity-10
                    text-[clamp(4rem,18vw,20rem)]`}
                >
                  EHSAN
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

            {/* Fluid cursor stays behind due to -z-10 wrapper */}
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
