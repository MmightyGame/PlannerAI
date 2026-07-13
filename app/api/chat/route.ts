import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenAI } from "@google/genai";
import { PLANNER_SYSTEM } from "@/lib/prompts";
import { DEMO_PLAN } from "@/lib/demo";

export const runtime = "nodejs";
export const maxDuration = 120;

type ChatMessage = { role: "user" | "assistant"; content: string };

function dateContext(): string {
  const now = new Date();
  const he = new Intl.DateTimeFormat("he-IL", { dateStyle: "full", timeZone: "Asia/Jerusalem" }).format(now);
  return `\n\n# הקשר\nהתאריך היום: ${he} (${now.toISOString().slice(0, 10)}). כל התאריכים בתכנון חייבים להיות עתידיים ביחס להיום. אל תניח שנה אחרת.`;
}

function textStream(run: (emit: (t: string) => void) => Promise<void>): Response {
  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        await run((t) => controller.enqueue(encoder.encode(t)));
      } catch (err) {
        console.error("chat stream error:", err);
        try {
          controller.enqueue(encoder.encode("\n\nמשהו נפל בדרך, שלח שוב את ההודעה."));
        } catch {}
      } finally {
        try {
          controller.close();
        } catch {}
      }
    },
  });
  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  });
}

async function anthropicReply(messages: ChatMessage[], emit: (t: string) => void) {
  const client = new Anthropic();
  const stream = client.messages.stream({
    model: process.env.ANTHROPIC_MODEL || "claude-sonnet-5",
    max_tokens: 12000,
    system: [
      { type: "text", text: PLANNER_SYSTEM, cache_control: { type: "ephemeral" } },
      { type: "text", text: dateContext() },
    ],
    messages,
  });
  stream.on("text", emit);
  await stream.finalMessage();
}

// כשמודל אחד בעומס (503/429) מנסים שוב ואז מודל גיבוי, כדי שהמשתמש לא יראה שגיאה
const GEMINI_MODELS = [
  process.env.GEMINI_MODEL || "gemini-flash-latest",
  "gemini-2.0-flash",
  "gemini-flash-lite-latest",
];

function isTransient(err: unknown): boolean {
  const s = (err as { status?: number })?.status;
  return s === 503 || s === 429 || s === 500 || s === 502;
}

async function geminiReply(messages: ChatMessage[], emit: (t: string) => void) {
  const key = process.env.GEMINI_API_KEY!;
  const ai = new GoogleGenAI({ apiKey: key });
  const contents = messages.map((m) => ({
    role: m.role === "assistant" ? ("model" as const) : ("user" as const),
    parts: [{ text: m.content }],
  }));

  let emitted = false;
  let lastErr: unknown;
  for (let attempt = 0; attempt < 5; attempt++) {
    const model = GEMINI_MODELS[Math.min(attempt, GEMINI_MODELS.length - 1)];
    try {
      const stream = await ai.models.generateContentStream({
        model,
        contents,
        config: {
          systemInstruction: PLANNER_SYSTEM + dateContext(),
          maxOutputTokens: 12000,
        },
      });
      for await (const chunk of stream) {
        if (chunk.text) {
          emit(chunk.text);
          emitted = true;
        }
      }
      return;
    } catch (err) {
      lastErr = err;
      // אם כבר התחלנו לשדר או שזו לא שגיאת עומס - אין טעם לנסות שוב
      if (emitted || !isTransient(err)) throw err;
      await new Promise((r) => setTimeout(r, 700 * (attempt + 1)));
    }
  }
  throw lastErr;
}

async function demoReply(emit: (t: string) => void) {
  // מדמה הקלדה כדי שהחוויה תרגיש אמיתית גם בלי מפתח
  const words = DEMO_PLAN.split(/(?<=\s)/);
  for (let i = 0; i < words.length; i += 3) {
    emit(words.slice(i, i + 3).join(""));
    await new Promise((r) => setTimeout(r, 24));
  }
}

export async function POST(req: Request) {
  let messages: ChatMessage[];
  try {
    const body = await req.json();
    messages = body.messages;
    if (!Array.isArray(messages) || messages.length === 0) throw new Error("empty");
  } catch {
    return new Response("בקשה לא תקינה", { status: 400 });
  }

  // היסטוריה מוגבלת כדי לא לשרוף טוקנים
  const trimmed: ChatMessage[] = messages.slice(-30).map((m) => ({
    role: m.role === "assistant" ? "assistant" : "user",
    content: String(m.content ?? "").slice(0, 8000),
  }));

  if (process.env.ANTHROPIC_API_KEY) {
    return textStream((emit) => anthropicReply(trimmed, emit));
  }
  if (process.env.GEMINI_API_KEY) {
    return textStream((emit) => geminiReply(trimmed, emit));
  }
  return textStream((emit) => demoReply(emit));
}
