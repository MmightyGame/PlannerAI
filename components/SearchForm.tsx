"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Calendar from "@/components/Calendar";

const NIGHTS = [2, 3, 4, 5, 6, 7, 8, 9, 10];

const VIBES = [
  "חופשה משתלמת",
  "הכל כלול",
  "חופשת בטן גב",
  "חופשה אירופאית",
  "חופשה עירונית",
  "מולטי סיטי - כמה ערים",
  "חופשה משפחתית",
  "חופשה משפחתית באירופה",
  "בטן גב עם ילדים",
  "פארק מים",
  "חופשה רומנטית",
  "ירח דבש",
  "בטן גב רומנטית",
  "חופשות עד 500$ לאדם",
  "שופינג",
  "תרבות ומוזיאונים",
  "טבע והרפתקאות",
  "בטן גב אקזוטי",
  "יעדים רחוקים",
  "חיי לילה",
  "מסיבת רווקים/ות",
  "מבוגרים בלבד",
  "קזינו",
];

const QUICK_VIBES = ["הכל כלול", "חופשת בטן גב", "חופשה משפחתית", "חופשה רומנטית", "מולטי סיטי - כמה ערים"];

type DateMode = "exact" | "month" | "range";
type Panel = null | "dates" | "who" | "vibes";

function Counter({
  label,
  hint,
  value,
  setValue,
  min,
}: {
  label: string;
  hint?: string;
  value: number;
  setValue: (n: number) => void;
  min: number;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <div className="text-sm font-bold">{label}</div>
        {hint && <div className="text-xs text-[var(--muted)]">{hint}</div>}
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setValue(Math.max(min, value - 1))}
          disabled={value <= min}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--sand)] text-lg disabled:opacity-30"
          aria-label={`פחות ${label}`}
        >
          −
        </button>
        <span className="w-5 text-center font-bold">{value}</span>
        <button
          type="button"
          onClick={() => setValue(value + 1)}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--sand)] text-lg"
          aria-label={`עוד ${label}`}
        >
          +
        </button>
      </div>
    </div>
  );
}

function fmtShort(d: string): string {
  if (!d) return "";
  const [, m, day] = d.split("-");
  return `${day}.${m}`;
}

export default function SearchForm({ months }: { months: { value: string; label: string }[] }) {
  const router = useRouter();
  const [dest, setDest] = useState("");
  const [budget, setBudget] = useState("");
  const [origin, setOrigin] = useState("TLV");
  const [dateMode, setDateMode] = useState<DateMode>("month");
  const [month, setMonth] = useState(months[0]?.value ?? "");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [nights, setNights] = useState<number | null>(null);
  const [weekends, setWeekends] = useState(false);
  const [direct, setDirect] = useState(false);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [rooms, setRooms] = useState(1);
  const [vibe, setVibe] = useState("");
  const [panel, setPanel] = useState<Panel>("dates");

  function submit() {
    const q = new URLSearchParams();
    if (dest.trim()) q.set("dest", dest.trim());
    if (budget) q.set("budget", budget);
    q.set("origin", origin);
    q.set("dateMode", dateMode);
    if (dateMode === "month") {
      if (month) q.set("month", month);
    } else {
      if (from) q.set("from", from);
      if (to) q.set("to", to);
    }
    if (dateMode !== "exact" && nights) q.set("nights", String(nights));
    if (dateMode !== "exact" && weekends) q.set("weekends", "1");
    if (direct) q.set("direct", "1");
    q.set("adults", String(adults));
    if (children) q.set("children", String(children));
    if (infants) q.set("infants", String(infants));
    q.set("rooms", String(rooms));
    if (vibe) q.set("vibe", vibe);
    router.push(`/plan?${q.toString()}`);
  }

  const travelers = adults + children + infants;

  function datesSummary(): string {
    if (dateMode === "exact") {
      return from && to ? `${fmtShort(from)} - ${fmtShort(to)}` : "בחרו תאריכים";
    }
    if (dateMode === "range") {
      const base = from && to ? `${fmtShort(from)} - ${fmtShort(to)}` : "בחרו טווח";
      return nights ? `${base} · ${nights} לילות` : base;
    }
    const label = months.find((m) => m.value === month)?.label ?? "כל התאריכים";
    return nights ? `${label} · ${nights} לילות` : label;
  }

  const segClass = (active: boolean) =>
    `rounded-xl px-4 py-2 text-right transition ${active ? "bg-[var(--sand)]" : "hover:bg-[var(--sand)]"}`;

  const tabClass = (active: boolean) =>
    `rounded-full px-4 py-1.5 text-sm font-bold transition ${
      active ? "bg-[var(--green)] text-white" : "bg-[var(--sand)] text-[var(--ink)]/70 hover:text-[var(--ink)]"
    }`;

  const chipClass = (active: boolean) =>
    `rounded-full border px-3.5 py-1.5 text-sm transition ${
      active
        ? "border-[var(--green)] bg-[#0c5138]/5 font-bold text-[var(--green)]"
        : "border-[var(--line)] bg-white text-[var(--ink)]/75 hover:border-[var(--green)]/50"
    }`;

  return (
    <div className="mt-8 flex flex-col gap-3">
      {/* שורת החיפוש */}
      <div className="flex flex-col gap-2 rounded-2xl border border-[var(--line)] bg-white p-2 shadow-sm md:flex-row md:items-stretch">
        <button
          type="button"
          onClick={submit}
          className="order-last rounded-xl bg-[var(--green)] px-7 py-3 text-lg font-black text-white transition hover:bg-[var(--green-dark)] md:order-first"
        >
          חפש
        </button>
        <button type="button" onClick={() => setPanel(panel === "who" ? null : "who")} className={segClass(panel === "who")}>
          <div className="text-xs text-[var(--muted)]">נוסעים</div>
          <div className="font-bold">
            {travelers} נוסעים · {rooms} חדרים
          </div>
        </button>
        <button
          type="button"
          onClick={() => setPanel(panel === "dates" ? null : "dates")}
          className={segClass(panel === "dates")}
        >
          <div className="text-xs text-[var(--muted)]">תאריכים</div>
          <div className="font-bold">{datesSummary()}</div>
        </button>
        <div className="hidden w-px bg-[var(--line)] md:block" />
        <label className="flex flex-1 cursor-text flex-col justify-center rounded-xl px-4 py-2 hover:bg-[var(--sand)]">
          <span className="text-xs text-[var(--muted)]">יעד</span>
          <input
            value={dest}
            onChange={(e) => setDest(e.target.value)}
            placeholder="כל מקום"
            className="bg-transparent font-bold outline-none placeholder:font-normal placeholder:text-[var(--ink)]/40"
          />
        </label>
        <div className="hidden w-px bg-[var(--line)] md:block" />
        <label className="flex flex-col justify-center rounded-xl px-4 py-2 hover:bg-[var(--sand)]">
          <span className="text-xs text-[var(--muted)]">תקציב לאדם (₪)</span>
          <input
            value={budget}
            onChange={(e) => setBudget(e.target.value.replace(/\D/g, ""))}
            inputMode="numeric"
            placeholder="ללא הגבלה"
            className="w-28 bg-transparent font-bold outline-none placeholder:font-normal placeholder:text-[var(--ink)]/40"
          />
        </label>
        <div className="flex flex-col justify-center rounded-xl px-4 py-2">
          <span className="mb-1 text-xs text-[var(--muted)]">מאיפה?</span>
          <div className="flex gap-1">
            {[
              { v: "TLV", l: "תל אביב" },
              { v: "ETM", l: "אילת" },
            ].map((o) => (
              <button
                key={o.v}
                type="button"
                onClick={() => setOrigin(o.v)}
                className={`rounded-full px-3 py-0.5 text-sm font-bold transition ${
                  origin === o.v ? "bg-[var(--green)] text-white" : "bg-[var(--sand)] text-[var(--ink)]/60 hover:text-[var(--ink)]"
                }`}
              >
                {o.l}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* שורת סינונים מהירים */}
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className={chipClass(direct)} onClick={() => setDirect(!direct)}>
          ✈️ רק טיסות ישירות
        </button>
        {QUICK_VIBES.map((v) => (
          <button key={v} type="button" className={chipClass(vibe === v)} onClick={() => setVibe(vibe === v ? "" : v)}>
            {v}
          </button>
        ))}
        <button type="button" className={chipClass(panel === "vibes")} onClick={() => setPanel(panel === "vibes" ? null : "vibes")}>
          ⚙️ עוד סינונים
        </button>
      </div>

      {/* פאנל תאריכים */}
      {panel === "dates" && (
        <div className="rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm">
          <div className="mb-1 text-sm font-black">מתי?</div>
          <div className="mb-4 mt-3 flex flex-wrap gap-2">
            <button type="button" className={tabClass(dateMode === "exact")} onClick={() => setDateMode("exact")}>
              תאריכים מדויקים
            </button>
            <button type="button" className={tabClass(dateMode === "month")} onClick={() => setDateMode("month")}>
              חודש מסוים
            </button>
            <button type="button" className={tabClass(dateMode === "range")} onClick={() => setDateMode("range")}>
              טווח תאריכים
            </button>
          </div>

          {dateMode === "exact" && (
            <Calendar from={from} to={to} onChange={(f, t) => { setFrom(f); setTo(t); }} />
          )}

          {dateMode === "month" && (
            <div className="flex flex-col gap-3">
              <div className="text-xs text-[var(--muted)]">חיפוש גמיש למציאת המחירים הטובים ביותר</div>
              <div className="flex flex-wrap gap-2">
                {months.map((m) => (
                  <button key={m.value} type="button" className={chipClass(month === m.value)} onClick={() => setMonth(m.value)}>
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {dateMode === "range" && (
            <div className="flex flex-col gap-3">
              <div className="text-xs text-[var(--muted)]">בחרו טווח ונציג את המחירים הטובים ביותר בתוכו</div>
              <Calendar from={from} to={to} onChange={(f, t) => { setFrom(f); setTo(t); }} />
            </div>
          )}

          {dateMode !== "exact" && (
            <div className="mt-4 flex flex-col gap-3">
              <div className="text-sm font-black">מספר לילות</div>
              <div className="flex flex-wrap gap-2">
                {NIGHTS.map((n) => (
                  <button key={n} type="button" className={chipClass(nights === n)} onClick={() => setNights(nights === n ? null : n)}>
                    {n}
                  </button>
                ))}
              </div>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-[var(--ink)]/75">
                <input
                  type="checkbox"
                  checked={weekends}
                  onChange={(e) => setWeekends(e.target.checked)}
                  className="h-4 w-4 accent-[var(--green)]"
                />
                רק סופ"שים
              </label>
            </div>
          )}
        </div>
      )}

      {/* פאנל נוסעים */}
      {panel === "who" && (
        <div className="rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm">
          <div className="mb-3 text-sm font-black">מי?</div>
          <div className="grid gap-4 md:grid-cols-2">
            <Counter label="מבוגרים" hint="18 ומעלה" value={adults} setValue={setAdults} min={1} />
            <Counter label="ילדים" hint="2-17" value={children} setValue={setChildren} min={0} />
            <Counter label="תינוקות" hint="מתחת לגיל שנתיים" value={infants} setValue={setInfants} min={0} />
            <Counter label="חדרים" value={rooms} setValue={setRooms} min={1} />
          </div>
        </div>
      )}

      {/* פאנל השראה */}
      {panel === "vibes" && (
        <div className="rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm">
          <div className="mb-3 text-sm font-black">
            איזה סוג חופשה? <span className="font-normal text-[var(--muted)]">קח השראה</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {VIBES.map((v) => (
              <button key={v} type="button" className={chipClass(vibe === v)} onClick={() => setVibe(vibe === v ? "" : v)}>
                {v}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
