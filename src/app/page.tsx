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

  // Ensure we only disable once per mount
  const disabledOnce = useRef(false);
  const prevMsgLen = useRef(0);

  return (
    <ChatClient>
      {({ state, refs, actions }) => {
        // Disable cursor/footer once a message actually appears (covers any submit path)
        useEffect(() => {
          const len = state.messages?.length ?? 0;
          if (!disabledOnce.current && len > prevMsgLen.current) {
            disabledOnce.current = true;
            setCursorEnabled(false);
            setShowWelcome(false);
            setShowFooter(false);
          }
          prevMsgLen.current = len;
        }, [state.messages?.length]);

        const handleSubmit = () => {
          actions.sendMessage();
          if (!disabledOnce.current) {
            disabledOnce.current = true;
            setCursorEnabled(false);
            setShowWelcome(false);
            setShowFooter(false);
          }
        };

        const handleTabSelect = (tab: unknown) => {
          actions.onTabSelect(tab as any);
          if (!disabledOnce.current) {
            disabledOnce.current = true;
            setCursorEnabled(false);
          }
          setShowWelcome(false);
          setShowFooter(false);
        };

        return (
          <>
            <div
              id="container"
              className="relative z-10 min-h-screen overflow-hidden"
            >
              {/* Header (full width) */}
              <div className="h-[10vh] w-[100vw]">
                <Header />
              </div>

              {/* Main (centered, responsive width). Add bottom padding so fixed footer won't overlap. */}
              <main
                className="
                  relative z-20
                  flex flex-col mx-auto
                  w-[92vw] sm:w-[86vw] md:w-[80vw] lg:w-[70vw]
                  min-h-[70vh]
                  pt-4 pb-[20vh] md:pb-[285px] /* space for footer when visible */
                  overscroll-contain
                "
              >
                {/* Inner layout: center block, chat block, bottom controls */}
                <div className="relative z-20 mx-auto max-w-5xl w-full flex flex-col h-full">
                  {/* Centered heading area */}
                  <div className="flex-1 flex flex-col items-center justify-center text-center px-2">
                    {showWelcome && (
                      <>
                        <h1
                          className="font-logo text-[#00bfff] leading-none
                          text-[clamp(3rem,18vw,12rem)]
                        "
                        >
                          EA
                        </h1>
                        <h2
                          className="font-mono mt-2 leading-tight
                          text-[clamp(1.125rem,4.5vw,3rem)]
                        "
                        >
                          Welcome to New Gen AI Powered Portfolio
                        </h2>
                      </>
                    )}
                  </div>

                  {/* Chat / Tab content fills available space above controls */}
                  <div className="flex-1 min-h-20 w-full">
                    {state.activeTab ? (
                      <TabPanel tab={state.activeTab} />
                    ) : (
                      <div
                        ref={refs.listRef}
                        className="h-full overflow-y-auto pr-1"
                      >
                        <ChatArea
                          messages={state.messages}
                          thinking={state.thinking}
                        />
                      </div>
                    )}
                  </div>

                  {/* Controls pinned to bottom (non-compact) */}
                  {!state.compact && (
                    <div className="mt-auto mb-4 flex flex-col items-center gap-3 w-full">
                      <div className="w-full">
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
                      <div id="controls" className="w-full">
                        <Tabs onSelect={handleTabSelect} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom dock (compact) */}
                {state.compact && (
                  <div className="fixed bottom-12 inset-x-0 z-30">
                    <div className="mx-auto max-w-4xl px-4 sm:px-6">
                      <div className="mb-3">
                        <Tabs onSelect={handleTabSelect} centerOnMobile />
                      </div>
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
                )}
              </main>

              {/* Footer (full width, responsive height & text). Hidden after submit/tab. */}
              {showFooter && (
                <footer
                  className="
                    fixed bottom-0 inset-x-0
                    h-[16vh] sm:h-[18vh] md:h-[285px]
                    flex items-center justify-center
                    pointer-events-none z-10 overflow-hidden
                    pb-[env(safe-area-inset-bottom)]
                  "
                >
                  <h3
                    className="
                      relative translate-y-4 sm:translate-y-6
                      leading-none whitespace-nowrap font-logo
                      bg-gradient-to-t from-black to-white text-transparent bg-clip-text opacity-10
                      text-[clamp(4rem,18vw,20rem)]
                    "
                  >
                    EHSAN
                  </h3>
                </footer>
              )}

              {cursorEnabled && <FluidCursor />}
            </div>
          </>
        );
      }}
    </ChatClient>
  );
}
