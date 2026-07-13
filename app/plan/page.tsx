"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { buildBookingLinks } from "@/lib/affiliates";

type Msg = { role: "user" | "assistant"; content: string };

type FlightOption = {
  cityHe: string;
  cityEn: string;
  iata: string;
  price: number;
  departureAt: string;
  returnAt: string;
  airline: string;
  transfers: number;
  nights: number;
  link: string;
};

type PackageOption = {
  flight: FlightOption;
  hotelPerNight: number | null;
  hotelPerPerson: number | null;
  totalPerPerson: number;
  flightUrl: string | null;
  hotelUrl: string;
};

const AIRLINES: Record<string, string> = {
  LY: "אל על", IZ: "ארקיע", "6H": "ישראייר", A3: "Aegean", W6: "Wizz Air",
  W4: "Wizz Air Malta", W9: "Wizz Air UK", FR: "Ryanair", U2: "easyJet",
  TK: "Turkish", PC: "Pegasus", BA: "British Airways", LH: "Lufthansa",
  OS: "Austrian", LX: "Swiss", AF: "Air France", KL: "KLM", AZ: "ITA",
  EK: "Emirates", FZ: "flydubai", EY: "Etihad", G9: "Air Arabia",
};

function airlineName(code: string): string {
  return AIRLINES[code] ?? code;
}

function fmtDT(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  const date = `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}`;
  const time = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  return `${date} · ${time}`;
}

function extractQuestions(content: string): string[] {
  const out: string[] = [];
  for (const m of content.matchAll(/^\s*\[Q\]\s*(.+)$/gm)) out.push(m[1].trim());
  return out;
}

function stripQuestions(content: string): string {
  return content.replace(/^\s*\[Q\].*$/gm, "").trim();
}

function baseSeed(sp: URLSearchParams): string | null {
  const dest = sp.get("dest");
  const budget = sp.get("budget");
  const month = sp.get("month");
  const days = sp.get("days");
  const vibe = sp.get("vibe") || sp.get("style");
  const flightPrice = sp.get("flightPrice");
  const dateMode = sp.get("dateMode");
  const from = sp.get("from");
  const to = sp.get("to");
  const nights = sp.get("nights");

  if (!dest && !budget && !month && !vibe && !dateMode && !from) return null;

  const parts: string[] = [];
  parts.push(dest ? `אני רוצה חופשה ב${dest}` : "אני רוצה חופשה ואין לי עדיין יעד, תציע לי משהו שווה");
  if (sp.get("origin") === "ETM") parts.push("טסים מאילת (רמון)");
  if (dateMode === "exact" && from && to) parts.push(`תאריכים מדויקים: ${from} עד ${to}`);
  else if (dateMode === "range" && from && to) parts.push(`גמישים בטווח ${from} עד ${to}`);
  else if (month) parts.push(`בחודש ${month}`);
  if (nights) parts.push(`${nights} לילות בערך`);
  else if (days) parts.push(`${days} ימים`);
  if (sp.get("weekends") === "1") parts.push('יציאה בסופ"ש');
  if (sp.get("direct") === "1") parts.push("רק טיסות ישירות");

  const group: string[] = [];
  const adults = sp.get("adults");
  const children = sp.get("children");
  const infants = sp.get("infants");
  const rooms = sp.get("rooms");
  if (adults) group.push(adults === "1" ? "מבוגר אחד" : `${adults} מבוגרים`);
  if (children && children !== "0") group.push(children === "1" ? "ילד אחד" : `${children} ילדים`);
  if (infants && infants !== "0") group.push(infants === "1" ? "תינוק אחד" : `${infants} תינוקות`);
  if (group.length > 0) parts.push(group.join(", ") + (rooms ? ` (${rooms} חדרים)` : ""));

  if (budget) parts.push(`תקציב עד ${budget} ₪ לאדם כולל הכל`);
  if (vibe) parts.push(`סוג חופשה: ${vibe}`);
  if (flightPrice) parts.push(`יש דיל טיסה הלוך-חזור ב-${flightPrice} ₪`);
  return parts.join(", ") + ".";
}

function PackageCard({ pkg, onChoose }: { pkg: PackageOption; onChoose: () => void }) {
  const f = pkg.flight;
  return (
    <div className="flex flex-col rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm transition hover:border-[var(--green)]/50 hover:shadow-md">
      <div className="flex items-center justify-between">
        <div className="text-lg font-black">{f.cityHe}</div>
        <span className="rounded-full bg-[var(--sand)] px-2.5 py-0.5 text-xs font-bold text-[var(--ink)]/70">
          {airlineName(f.airline)}
        </span>
      </div>

      <div className="mt-3 space-y-1 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-[var(--muted)]">יציאה:</span>
          <span className="font-bold">{fmtDT(f.departureAt)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[var(--muted)]">חזרה:</span>
          <span className="font-bold">{fmtDT(f.returnAt)}</span>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5 text-xs">
        <span className="rounded-full border border-[var(--line)] px-2 py-0.5">{f.nights} לילות</span>
        <span className={`rounded-full px-2 py-0.5 ${f.transfers === 0 ? "bg-[#0c5138]/10 font-bold text-[var(--green)]" : "border border-[var(--line)]"}`}>
          {f.transfers === 0 ? "טיסה ישירה" : `${f.transfers} עצירות`}
        </span>
      </div>

      <div className="mt-4 border-t border-dashed border-[var(--line)] pt-3 text-sm">
        <div className="flex justify-between">
          <span className="text-[var(--muted)]">✈️ טיסה הלוך-חזור</span>
          <span className="font-bold">{f.price.toLocaleString()} ₪</span>
        </div>
        <div className="mt-1 flex justify-between">
          <span className="text-[var(--muted)]">🏨 מלון ({f.nights} לילות, הערכה)</span>
          <span className="font-bold">
            {pkg.hotelPerPerson ? `${pkg.hotelPerPerson.toLocaleString()} ₪` : "אין דאטה"}
          </span>
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="font-black">סה"כ לאדם</span>
          <span className="text-2xl font-black text-[var(--green)]">
            ~{pkg.totalPerPerson.toLocaleString()} ₪
          </span>
        </div>
      </div>

      <button
        onClick={onChoose}
        className="mt-4 rounded-xl bg-[var(--green)] py-2.5 font-black text-white transition hover:bg-[var(--green-dark)]"
      >
        תכנן עם הדיל הזה ✨
      </button>
      <div className="mt-2 flex justify-center gap-4 text-xs">
        {pkg.flightUrl && (
          <a href={pkg.flightUrl} target="_blank" rel="noopener noreferrer" className="text-[var(--green)] underline-offset-2 hover:underline">
            לטיסה המדויקת ↗
          </a>
        )}
        <a href={pkg.hotelUrl} target="_blank" rel="noopener noreferrer" className="text-[var(--green)] underline-offset-2 hover:underline">
          מלונות בתאריכים ↗
        </a>
      </div>
    </div>
  );
}

function QuestionsWizard({ questions, onDone }: { questions: string[]; onDone: (answers: string[]) => void }) {
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [val, setVal] = useState("");

  function next(skip = false) {
    const answer = skip ? "לא משנה לי, תחליט אתה" : val.trim() || "לא משנה לי, תחליט אתה";
    const all = [...answers, answer];
    setVal("");
    if (idx + 1 < questions.length) {
      setAnswers(all);
      setIdx(idx + 1);
    } else {
      onDone(all);
    }
  }

  return (
    <div className="mt-4 rounded-2xl border-2 border-[var(--green)]/30 bg-white p-5 shadow-sm">
      <div className="mb-2 text-xs font-bold text-[var(--green)]">
        שאלה {idx + 1} מתוך {questions.length}
      </div>
      <div className="mb-3 text-lg font-black">{questions[idx]}</div>
      <div className="flex gap-2">
        <input
          autoFocus
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              next();
            }
          }}
          placeholder="כתוב תשובה ולחץ Enter"
          className="flex-1 rounded-xl border border-[var(--line)] bg-[var(--bg)] px-4 py-2.5 outline-none placeholder:text-[var(--ink)]/35 focus:border-[var(--green)]"
        />
        <button
          onClick={() => next()}
          className="rounded-xl bg-[var(--green)] px-5 font-black text-white transition hover:bg-[var(--green-dark)]"
        >
          {idx + 1 < questions.length ? "הבא" : "תתכנן ✨"}
        </button>
      </div>
      <button onClick={() => next(true)} className="mt-2 text-xs text-[var(--muted)] hover:text-[var(--ink)]">
        דלג, לא משנה לי
      </button>
    </div>
  );
}

// אינדיקטור "חושב" לפני שה-AI מתחיל לענות
function Thinking({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="thinking-shimmer text-[15px]">{label}</span>
      <span className="thinking-dot" style={{ animationDelay: "0ms" }} />
      <span className="thinking-dot" style={{ animationDelay: "200ms" }} />
      <span className="thinking-dot" style={{ animationDelay: "400ms" }} />
    </div>
  );
}

// חשיפת הטקסט מילה אחרי מילה בזמן שהוא משתדר. כל מילה חדשה נכנסת עם fade + הזזה.
// המפתח לפי אינדקס יציב, אז רק מילים חדשות מקבלות אנימציה ולא כל הבלוק מהבהב.
function StreamingWords({ text }: { text: string }) {
  const tokens = useMemo(() => text.split(/(\s+)/), [text]);
  return (
    <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-[var(--ink)]">
      {tokens.map((tok, i) =>
        /^\s+$/.test(tok) ? (
          <span key={i}>{tok}</span>
        ) : (
          <span key={i} className="word-in">
            {tok}
          </span>
        )
      )}
    </p>
  );
}

function Chat() {
  const sp = useSearchParams();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [searching, setSearching] = useState(false);
  const [packages, setPackages] = useState<PackageOption[] | null>(null);
  const seededRef = useRef(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const bookingLinks = buildBookingLinks(sp.get("dest") ?? "");
  const hasPlan = messages.some((m) => m.role === "assistant" && m.content.length > 600);

  const lastMsg = messages[messages.length - 1];
  const pendingQuestions =
    !busy && lastMsg?.role === "assistant" ? extractQuestions(lastMsg.content) : [];

  async function send(text: string, history: Msg[]) {
    const userMsg: Msg = { role: "user", content: text };
    const nextHistory = [...history, userMsg];
    setMessages([...nextHistory, { role: "assistant", content: "" }]);
    setBusy(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextHistory }),
      });
      if (!res.ok || !res.body) {
        const errText = await res.text().catch(() => "משהו נפל, נסה שוב.");
        setMessages([...nextHistory, { role: "assistant", content: errText }]);
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        const current = acc;
        setMessages([...nextHistory, { role: "assistant", content: current }]);
      }
    } catch {
      setMessages([...nextHistory, { role: "assistant", content: "החיבור נפל באמצע. שלח שוב ונמשיך מאיפה שהיינו." }]);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (seededRef.current) return;
    seededRef.current = true;
    (async () => {
      const seed = baseSeed(sp);
      if (!seed) return;
      if (!sp.get("dateMode")) {
        send(seed, []);
        return;
      }
      setSearching(true);
      try {
        const res = await fetch(`/api/search?${sp.toString()}`);
        const data = res.ok ? await res.json() : null;
        setSearching(false);
        if (data?.packages?.length > 0) {
          setPackages(data.packages);
        } else {
          send(seed, []);
        }
      } catch {
        setSearching(false);
        send(seed, []);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, packages]);

  function choosePackage(pkg: PackageOption) {
    const f = pkg.flight;
    const seed =
      `${baseSeed(sp) ?? ""}\n\nבחרתי את הדיל הזה:\n` +
      `טיסה ל${f.cityHe} של ${airlineName(f.airline)}: יציאה ${fmtDT(f.departureAt)}, חזרה ${fmtDT(f.returnAt)}, ` +
      `${f.nights} לילות, ${f.transfers === 0 ? "ישירה" : `${f.transfers} עצירות`}, ${f.price.toLocaleString()} ₪ לאדם.\n` +
      (pkg.hotelPerNight
        ? `מלון (הערכת שוק): בערך ${pkg.hotelPerNight.toLocaleString()} ₪ ללילה, סה"כ ~${pkg.hotelPerPerson?.toLocaleString()} ₪ לאדם.\n`
        : "") +
      `סה"כ חבילה: ~${pkg.totalPerPerson.toLocaleString()} ₪ לאדם.\n\n` +
      `תבנה את התכנון המלא סביב הדיל הזה. התאריכים סגורים, אל תשאל עליהם.`;
    setPackages(null);
    send(seed, []);
  }

  function skipPackages() {
    setPackages(null);
    const seed = baseSeed(sp);
    if (seed) send(seed, []);
  }

  function handleSubmit() {
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    send(text, messages);
  }

  function answerQuestions(answers: string[]) {
    const text = pendingQuestions.map((q, i) => `${q}\n${answers[i]}`).join("\n\n");
    send(text, messages);
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-[var(--line)] bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Link href="/" className="text-sm text-[var(--muted)] hover:text-[var(--ink)]">
            → חזרה לדילים
          </Link>
          <div className="flex items-center gap-2 font-black text-[var(--green)]">
            <span>✈️</span>
            <span>טריפניק</span>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
        {messages.length === 0 && !searching && !packages && (
          <div className="rounded-2xl border border-[var(--line)] bg-white p-5 leading-relaxed text-[var(--ink)]/85 shadow-sm">
            היי 👋 אני המתכנן של טריפניק. ספר לי לאן בא לך לטוס, מתי, לכמה ימים ובאיזה
            תקציב, ואני בונה לך תכנון מלא יום אחרי יום. אפשר גם בלי יעד, אני אציע.
          </div>
        )}

        {searching && (
          <div className="rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm">
            <Thinking label="מחפש טיסות ומלונות אמיתיים בתאריכים שלך" />
          </div>
        )}

        {/* בחירת דיל לפני התכנון */}
        {packages && (
          <div>
            <div className="mb-4 rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm">
              <div className="text-lg font-black">מצאתי לך {packages.length} דילים אמיתיים 🎯</div>
              <p className="mt-1 text-sm text-[var(--muted)]">
                טיסות במחיר אמת + הערכת מלון לתאריכים. בחר דיל וה-AI יבנה סביבו את כל החופשה.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {packages.map((p, i) => (
                <PackageCard key={i} pkg={p} onChoose={() => choosePackage(p)} />
              ))}
            </div>
            <button
              onClick={skipPackages}
              className="mt-4 w-full rounded-xl border border-[var(--line)] bg-white py-2.5 text-sm font-bold text-[var(--muted)] transition hover:text-[var(--ink)]"
            >
              בלי דיל, פשוט תתכנן לי ותציע בעצמך
            </button>
          </div>
        )}

        <div className="flex flex-col gap-4">
          {messages.map((m, i) =>
            m.role === "user" ? (
              <div
                key={i}
                className="self-start whitespace-pre-wrap rounded-2xl rounded-tr-sm border border-[#0c5138]/20 bg-[#0c5138]/5 px-4 py-3 leading-relaxed"
              >
                {m.content}
              </div>
            ) : (
              <div key={i} className="rounded-2xl border border-[var(--line)] bg-white px-5 py-4 shadow-sm">
                {(() => {
                  const clean = stripQuestions(m.content);
                  const isLast = i === messages.length - 1;
                  const streaming = isLast && busy;
                  if (!m.content) return <Thinking label="חושב על החופשה שלך" />;
                  if (streaming) return <StreamingWords text={clean || "רגע..."} />;
                  return (
                    <div className="plan-md text-[15px]">
                      <ReactMarkdown>{clean || "רגע..."}</ReactMarkdown>
                    </div>
                  );
                })()}
              </div>
            )
          )}
        </div>

        {/* אשף שאלות - אחת אחת */}
        {pendingQuestions.length > 0 && (
          <QuestionsWizard key={messages.length} questions={pendingQuestions} onDone={answerQuestions} />
        )}

        {/* Booking links */}
        {hasPlan && (
          <div className="mt-6 rounded-2xl border border-[var(--line)] bg-[var(--sand)] p-4">
            <div className="mb-3 text-sm font-bold text-[var(--ink)]/75">
              סוגרים את החופשה - הזמנות דרך כאן:
            </div>
            <div className="flex flex-wrap gap-2">
              {bookingLinks.map((l) => (
                <a
                  key={l.label}
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-[var(--line)] bg-white px-4 py-2 text-sm transition hover:border-[var(--green)] hover:text-[var(--green)]"
                >
                  {l.emoji} {l.label}
                </a>
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="sticky bottom-0 border-t border-[var(--line)] bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-end gap-2 px-4 py-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            rows={1}
            placeholder={busy ? "רגע, מתכנן..." : "לאן טסים? או תשאל אותי כל דבר על הטיול"}
            disabled={busy}
            className="max-h-32 flex-1 resize-none rounded-xl border border-[var(--line)] bg-[var(--bg)] px-4 py-3 outline-none placeholder:text-[var(--ink)]/35 focus:border-[var(--green)] disabled:opacity-50"
          />
          <button
            onClick={handleSubmit}
            disabled={busy || !input.trim()}
            className="rounded-xl bg-[var(--green)] px-5 py-3 font-black text-white transition hover:bg-[var(--green-dark)] disabled:opacity-40"
          >
            שלח
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PlanPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-[var(--muted)]">
          טוען...
        </div>
      }
    >
      <Chat />
    </Suspense>
  );
}
