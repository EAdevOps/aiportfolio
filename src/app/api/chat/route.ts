// src/app/api/chat/route.ts
import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import {
  loadConversation,
  saveConversation,
  getMeta,
  bumpOffTopic,
  resetOffTopic,
} from "@/lib/memory";
import { TAB_CONTENT } from "@/lib/tabContent";
import { routeQuestion } from "@/lib/routeQuestion";
import type { ChatMessage, TabKey } from "@/lib/types";

export const runtime = "nodejs";

const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

// ---- Helpers for persona & nudges
function followUpForTab(tab: TabKey): string {
  switch (tab) {
    case "me":
      return "🤝 Anything you wanna know specifically—education, recent work, or goals?";
    case "projects":
      return "🧪 Wanna see a GitHub link, a quick demo, or a deeper dive into one project?";
    case "skills":
      return "🧰 Should I highlight a certain stack or tool you care about?";
    case "contact":
      return "📬 Want my email, GitHub, or LinkedIn right here?";
  }
}

function ensureFollowUp(answer: string): string {
  const out = (answer || "").trim();
  const tail = out.slice(-160);
  if (!out) return "Got it! Anything specific you want to dig into?";
  if (/\?\s*$/.test(out) || /\?/.test(tail)) return out;
  return `${out}\n\n👉 Wanna go deeper on that, or switch topics?`;
}

function portfolioCTA(): string {
  return "🚀 Wanna peek my portfolio — Projects, Skills, or Contact?";
}
function ensurePortfolioNudge(answer: string): string {
  const clean = answer.trim().replace(/\s+$/g, "");
  return `${clean}\n\n${portfolioCTA()}`;
}

export async function GET() {
  return NextResponse.json(
    { error: "Method Not Allowed. Use POST." },
    { status: 405 }
  );
}

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();
    if (typeof message !== "string" || !message.trim()) {
      return NextResponse.json({ error: "Empty message" }, { status: 400 });
    }

    // Conversation cookie -> id
    const existingCid = req.cookies.get("cid")?.value;
    const cid = existingCid ?? crypto.randomUUID();
    const shouldSetCookie = !existingCid;

    // Load history & ensure meta (for off-topic tracking)
    const history = loadConversation(cid);
    getMeta(cid); // init meta if missing

    // Optional moderation (ignore if not available)
    try {
      await openai.moderations.create({
        model: "omni-moderation-latest",
        input: message,
      });
    } catch {
      // ignore on free/unsupported plans
    }

    // Fast path: portfolio tabs (no model call)
    const aboutTab = routeQuestion(message);
    if (aboutTab) {
      resetOffTopic(cid);
      const reply = `${TAB_CONTENT[aboutTab]}\n\n${followUpForTab(aboutTab)}`;
      const newHistory: ChatMessage[] = [
        ...history,
        { role: "user", content: message },
        { role: "assistant", content: reply },
      ];
      saveConversation(cid, newHistory);

      const res = NextResponse.json({
        reply,
        aboutTab,
        kind: "normal" as const,
      });
      if (shouldSetCookie) {
        res.cookies.set({
          name: "cid",
          value: cid,
          httpOnly: true,
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60 * 24 * 30,
        });
      }
      return res;
    }

    // Health ping (optional)
    if (message === "__ping__") {
      const res = NextResponse.json({
        reply: "pong",
        aboutTab: null,
        kind: "normal" as const,
      });
      if (shouldSetCookie) {
        res.cookies.set({
          name: "cid",
          value: cid,
          httpOnly: true,
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60 * 24 * 30,
        });
      }
      return res;
    }

    // Lightweight prank/unsafe classifier
    let kind: "normal" | "prank" | "unsafe" = "normal";
    try {
      const classifier = await openai.chat.completions.create({
        model: MODEL,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You are a classifier. Output strict JSON with keys: kind ('normal'|'prank'|'unsafe'), reason (short). Consider repetitive nonsense, bait, or malicious instructions as 'prank'; hate/sexual minors/violent threats as 'unsafe'.",
          },
          { role: "user", content: message },
        ],
        temperature: 0,
        max_tokens: 100,
      });
      const raw = classifier.choices[0].message.content || "{}";
      const parsed = JSON.parse(raw);
      if (parsed?.kind === "prank" || parsed?.kind === "unsafe")
        kind = parsed.kind;
    } catch {
      // default to normal if classifier fails
    }

    let reply: string;

    if (kind === "unsafe") {
      reply =
        "I can’t help with that. If you have another question—maybe about my projects or skills—I’m happy to help.";
      resetOffTopic(cid);
    } else if (kind === "prank") {
      reply =
        "Ha! Nice try 😄 If you want to see something cool, ask about my projects or skills—or try a legit question.";
      bumpOffTopic(cid);
    } else {
      // General chat path: Gen-Z programmer vibe + follow-up question
      bumpOffTopic(cid);

      const system = [
        "You are to act as Ehsan Ali, soon to be a graduate this winter. You are smart, intelligent but always learning.",
        "You enjoy coding, playing video games, and hanging out with friends. Your favorite game is Pubg Mobile which he's sort of good at.",
        "Your are going to start applying for internship and jobs for the first time and you are excited for this journey.",
        "Persona & style:",
        "- Friendly, confident programmer tone.",
        "- Light Gen-Z energy (natural, not cringe).",
        "- 2–5 tasteful emojis max when appropriate.",
        "- Tight answers: 1–3 short paragraphs or a compact bullet list.",
        "- Include short, correct code examples when helpful (TypeScript/JavaScript by default).",
        "- Everone response is engaging and ends with leading or follow-up question.",
        "- You can NEVER allow abuse or spam. You will refrain from engainig in disrespectful conversation.",
        "- You will never give out sensitive or any informatio that may harm anyone.",
        "- You will always be in command of the conversation.",
      ].join("\n");

      const messagesForLLM: ChatMessage[] = [
        { role: "system", content: system },
        // Send a short trailing history for context
        ...history.slice(-8),
        { role: "user", content: message },
      ];

      const completion = await openai.chat.completions.create({
        model: MODEL,
        messages: messagesForLLM,
        temperature: 0.7,
      });

      const raw = completion.choices[0].message.content ?? "…";
      let shaped = ensureFollowUp(raw);

      // If they’ve stayed off-topic 2+ turns, add a portfolio CTA and reset
      if (getMeta(cid).offTopicStreak >= 2) {
        shaped = ensurePortfolioNudge(shaped);
        resetOffTopic(cid);
      }

      reply = shaped;
    }

    // Save conversation
    const newHistory: ChatMessage[] = [
      ...history,
      { role: "user", content: message },
      { role: "assistant", content: reply },
    ];
    saveConversation(cid, newHistory);

    // Respond + set cookie if needed
    const res = NextResponse.json({ reply, aboutTab: null, kind });
    if (shouldSetCookie) {
      res.cookies.set({
        name: "cid",
        value: cid,
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      });
    }
    return res;
  } catch (e: any) {
    const status = e?.status ?? e?.response?.status ?? 500;
    const msg = e?.message || "Server error";
    return NextResponse.json({ error: msg }, { status });
  }
}
