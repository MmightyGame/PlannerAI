"use client";

import { useState } from "react";

const HEBREW_MONTHS = [
  "ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני",
  "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר",
];

const DAY_LETTERS = ["א'", "ב'", "ג'", "ד'", "ה'", "ו'", "ש'"];

function ymd(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function MonthGrid({
  year,
  month,
  from,
  to,
  today,
  onPick,
}: {
  year: number;
  month: number; // 0-11
  from: string;
  to: string;
  today: string;
  onPick: (date: string) => void;
}) {
  const firstDay = new Date(year, month, 1).getDay(); // 0=ראשון
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (string | null)[] = [
    ...Array.from({ length: firstDay }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => ymd(new Date(year, month, i + 1))),
  ];

  return (
    <div className="w-full">
      <div className="mb-2 text-center font-black">
        {HEBREW_MONTHS[month]} {year}
      </div>
      <div className="grid grid-cols-7 gap-y-1 text-center">
        {DAY_LETTERS.map((d) => (
          <div key={d} className="pb-1 text-xs font-bold text-[var(--muted)]">
            {d}
          </div>
        ))}
        {cells.map((date, i) => {
          if (!date) return <div key={`e${i}`} />;
          const past = date < today;
          const isFrom = date === from;
          const isTo = date === to;
          const inRange = from && to && date > from && date < to;
          return (
            <div key={date} className={`flex justify-center ${inRange || isFrom || isTo ? "bg-[#0c5138]/10" : ""} ${isFrom ? "rounded-r-full" : ""} ${isTo ? "rounded-l-full" : ""}`}>
              <button
                type="button"
                disabled={past}
                onClick={() => onPick(date)}
                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition ${
                  isFrom || isTo
                    ? "bg-[var(--green)] text-white"
                    : past
                      ? "text-[var(--ink)]/25"
                      : "hover:bg-[var(--sand)]"
                }`}
              >
                {Number(date.slice(8))}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Calendar({
  from,
  to,
  onChange,
}: {
  from: string;
  to: string;
  onChange: (from: string, to: string) => void;
}) {
  const now = new Date();
  const today = ymd(now);
  const [view, setView] = useState({ year: now.getFullYear(), month: now.getMonth() });

  function shift(delta: number) {
    setView((v) => {
      const d = new Date(v.year, v.month + delta, 1);
      // לא אחורה מהחודש הנוכחי
      if (d < new Date(now.getFullYear(), now.getMonth(), 1)) return v;
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  }

  function pick(date: string) {
    if (!from || (from && to)) {
      onChange(date, "");
    } else if (date <= from) {
      onChange(date, "");
    } else {
      onChange(from, date);
    }
  }

  const second = new Date(view.year, view.month + 1, 1);

  return (
    <div className="rounded-xl border border-[var(--line)] bg-white p-4">
      <div className="mb-2 flex items-center justify-between">
        <button
          type="button"
          onClick={() => shift(-1)}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--line)] font-bold hover:bg-[var(--sand)]"
          aria-label="חודש קודם"
        >
          ›
        </button>
        <div className="text-xs text-[var(--muted)]">
          {!from ? "בחרו תאריך יציאה" : !to ? "עכשיו תאריך חזרה" : "אפשר לבחור מחדש"}
        </div>
        <button
          type="button"
          onClick={() => shift(1)}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--line)] font-bold hover:bg-[var(--sand)]"
          aria-label="חודש הבא"
        >
          ‹
        </button>
      </div>
      <div className="flex flex-col gap-6 md:flex-row">
        <MonthGrid year={view.year} month={view.month} from={from} to={to} today={today} onPick={pick} />
        <MonthGrid
          year={second.getFullYear()}
          month={second.getMonth()}
          from={from}
          to={to}
          today={today}
          onPick={pick}
        />
      </div>
    </div>
  );
}
