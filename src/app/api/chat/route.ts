import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { SYSTEM_PROMPT } from "./prompt";
import { getMe } from "./tools/getMe";
import { getProjects } from "./tools/getProjects";
import { getSkills } from "./tools/getSkills";
import { getContact } from "./tools/getContact";
import type { ToolInvocation } from "@/lib/tooling";

export const runtime = "nodejs";
export const maxDuration = 30;

// ---------- helpers ----------
function abortAfter(ms: number) {
  const ac = new AbortController();
  setTimeout(() => ac.abort("timeout"), ms);
  return ac.signal;
}

function sanitizeMessages(raw: any[]) {
  return raw
    .map((m) => ({
      role: m?.role,
      content:
        typeof m?.content === "string" ? m.content : String(m?.content ?? ""),
    }))
    .filter((m) => m.role && typeof m.content === "string");
}

function normalizeToolResults(
  toolResults: any[] | undefined
): ToolInvocation[] {
  return ((toolResults as any[]) ?? []).map((r: any, i: number) => ({
    toolCallId: r.toolCallId ?? r.id ?? `tool-${i}`,
    toolName: r.toolName ?? r.name ?? "unknown",
    args: r.args ?? r.input ?? {},
    result: r.result ?? r.output ?? { ok: true },
  }));
}

function isRateLimitError(e: any) {
  const msg = (e?.message || "").toString().toLowerCase();
  return e?.status === 429 || msg.includes("rate limit");
}

// light routing just for **fallback** (not forcing in normal flow)
const FALLBACK_ME = [
  "introduce",
  "who are you",
  "about you",
  "about yourself",
  "bio",
  "background",
];
const FALLBACK_PROJ = [
  "project",
  "projects",
  "portfolio",
  "repo",
  "github",
  "what are you working on",
];
const FALLBACK_SKILL = [
  "skills",
  "skillset",
  "tech stack",
  "stack",
  "tools",
  "languages",
  "frameworks",
];
const FALLBACK_CONTACT = [
  "contact",
  "reach",
  "email",
  "github",
  "linkedin",
  "get in touch",
];

function pickFallbackTool(
  q: string
): "getMe" | "getProjects" | "getSkills" | "getContact" | null {
  const k = q.toLowerCase();
  const hit = (arr: string[]) => arr.some((kw) => k.includes(kw));
  if (hit(FALLBACK_ME)) return "getMe";
  if (hit(FALLBACK_PROJ)) return "getProjects";
  if (hit(FALLBACK_SKILL)) return "getSkills";
  if (hit(FALLBACK_CONTACT)) return "getContact";
  return null;
}

function uid() {
  return typeof crypto?.randomUUID === "function"
    ? crypto.randomUUID()
    : String(Date.now()) + Math.random().toString(16).slice(2);
}

function toolOnlyResponse(
  name: "getMe" | "getProjects" | "getSkills" | "getContact"
) {
  return Response.json({
    reply: " ", // keep UI clean; the component is the answer
    toolInvocations: [
      { toolCallId: uid(), toolName: name, args: {}, result: {} },
    ],
  });
}

// tiny text fallback if nothing else works
const SYSTEM_PROMPT_LITE = {
  role: "system" as const,
  content:
    "You are Ehsan. Reply briefly, first person, casual. If they asked about me/projects/skills/contact but tools aren't available, summarize concisely.",
};

// ---------- main handler ----------
export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return new Response("Missing OPENAI_API_KEY", { status: 500 });
    }

    const body = await req.json().catch(() => ({}));
    const incomingRaw = Array.isArray(body?.messages) ? body.messages : [];
    const incoming = sanitizeMessages(incomingRaw);
    if (incoming.length === 0)
      return new Response("Empty messages", { status: 400 });

    const lastUser = incoming[incoming.length - 1]?.content ?? "";

    // Try models in order; skip to the next if rate-limited.
    const MODELS = [
      process.env.OPENAI_PRIMARY_MODEL || "gpt-4o-mini",
      process.env.OPENAI_FALLBACK_MODEL || "gpt-4o",
    ];

    for (const modelId of MODELS) {
      try {
        const { text, toolResults } = await generateText({
          model: openai(modelId),
          messages: [SYSTEM_PROMPT, ...incoming],
          tools: { getMe, getProjects, getSkills, getContact },
          abortSignal: abortAfter(12_000), // short cap
          maxOutputTokens: 500,
          maxRetries: 0, // ⬅️ no internal retries; we handle fallback ourselves
        });

        return Response.json({
          reply: String(text ?? ""),
          toolInvocations: normalizeToolResults(toolResults),
        });
      } catch (e: any) {
        if (isRateLimitError(e)) {
          // try next model
          continue;
        }
        // non-rate-limit error → bubble up
        throw e;
      }
    }

    // If we’re here, all models were rate-limited.
    const fbTool = pickFallbackTool(lastUser);
    if (fbTool) {
      // Show the relevant page so the UI still feels instant.
      return toolOnlyResponse(fbTool);
    }

    // Otherwise short text fallback (no tools).
    const { text: fbText } = await generateText({
      model: openai("gpt-4o-mini"),
      messages: [SYSTEM_PROMPT_LITE, { role: "user", content: lastUser }],
      abortSignal: abortAfter(4000),
      maxOutputTokens: 140,
      maxRetries: 0,
    });

    return Response.json({
      reply: String(fbText ?? "I'm rate-limited right now. Try again soon."),
      toolInvocations: [],
    });
  } catch (e: any) {
    console.error("[/api/chat] error:", e);
    const msg =
      process.env.NODE_ENV === "production"
        ? "Server error"
        : e?.message || String(e);
    return new Response(msg, { status: 500 });
  }
}
