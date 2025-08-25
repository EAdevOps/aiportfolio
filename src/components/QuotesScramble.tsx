"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";

gsap.registerPlugin(SplitText, ScrambleTextPlugin);

type Props = {
  className?: string; // optional
};

export default function QuotesScramble({ className = "" }: Props) {
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const quotes = gsap.utils.toArray<HTMLElement>(".quote");
      const scrambleChars = "upperAndLowerCase";

      const getRandomPosition = () => {
        const x = Math.random() * (window.innerWidth - 200);
        const y = Math.random() * (window.innerHeight - 100);
        return { x, y };
      };

      const scrambleQuote = (quote: HTMLElement, text: string) => {
        const tl = gsap.timeline({ repeat: -1, repeatDelay: 1 });
        tl.call(() => {
          const { x, y } = getRandomPosition();
          gsap.set(quote, { x, y });
        })
          .to(quote, {
            delay: Math.random() * 5,
            duration: 2,
            opacity: 1,
            scrambleText: {
              text,
              chars: scrambleChars,
              revealDelay: 0.7,
              speed: 1,
            },
            ease: "power2.out",
          })
          .to(quote, {
            delay: 0.5,
            duration: 1,
            scrambleText: { text: "", chars: scrambleChars },
            opacity: 0,
            ease: "power2.in",
          });
      };

      quotes.forEach((q) => {
        gsap.set(q, {
          position: "absolute",
          opacity: 0,
          whiteSpace: "nowrap",
          pointerEvents: "none",
        });
        scrambleQuote(q, q.textContent ?? "");
      });

      // Word fly-in (optional flair)
      quotes.forEach((q) => {
        const split = new SplitText(q, { type: "words" });
        gsap.from(split.words, {
          x: "random([-1000, 1000])",
          y: "random([-1000, 1000])",
          opacity: 0,
          ease: "expo.inOut",
          duration: 1.25,
          stagger: 0.02,
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className={`absolute inset-0 -z-10 overflow-hidden text-xs font-mono text-[12px] text-white/20 pointer-events-none ${className}`}
    >
      <div className="quote">Half human, half algorithm...</div>
      <div className="quote">Teaching humans to imagine...</div>
      <div className="quote">
        Uploaded to the cloud, still grounded on Earth...
      </div>
      <div className="quote">Half human, half algorithm...</div>
      <div className="quote">Training AI to think...</div>
      <div className="quote">Every pixel has a purpose</div>
      <div className="quote">Ehsan.exe is running…</div>
      <div className="quote">Human by birth, AI by design</div>
      <div className="quote">404: Boring portfolio not found</div>
      <div className="quote">Ehsan 2.0 — self-replicating in code</div>
      <div className="quote">
        Compiled from curiosity, caffeine, and machine learning
      </div>
      <div className="quote">Welcome to my digital twin</div>
    </section>
  );
}
