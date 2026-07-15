"use client";

import { useState } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";

const HEBREW_MONTHS = [
  "ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני",
  "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר",
];

const DAY_LETTERS = ["א'", "ב'", "ג'", "ד'", "ה'", "ו'", "ש'"];

function ymd(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function nightsBetween(a: string, b: string): number {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000);
}

function MonthGrid({
  year, month, from, to, hover, selecting, today, onPick, onHover,
}: {
  year: number;
  month: number; // 0-11
  from: string;
  to: string;
  hover: string;
  selecting: boolean;
  today: string;
  onPick: (date: string) => void;
  onHover: (date: string) => void;
}) {
  const firstDay = new Date(year, month, 1).getDay(); // 0=ראשון
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (string | null)[] = [
    ...Array.from({ length: firstDay }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => ymd(new Date(year, month, i + 1))),
  ];

  return (
    <div className="w-full">
      <div className="mb-2 text-center font-bold">
        {HEBREW_MONTHS[month]} {year}
      </div>
      <div className="grid grid-cols-7 gap-y-1 text-center">
        {DAY_LETTERS.map((d) => (
          <div key={d} className="pb-1 text-xs font-medium text-[var(--muted)]">
            {d}
          </div>
        ))}
        {cells.map((date, i) => {
          if (!date) return <div key={`e${i}`} />;
          const past = date < today;
          const isFrom = date === from;
          const isTo = date === to;
          const inRange = !!(from && to && date > from && date < to);
          // תצוגה מקדימה בזמן ריחוף: אחרי בחירת תאריך ראשון, עד היעד שהעכבר עליו
          const previewEnd = selecting && !!hover && hover > from && date === hover;
          const inPreview = selecting && !!hover && hover > from && date > from && date < hover;
          const isEnd = isTo || previewEnd;
          const highlighted = inRange || inPreview || isFrom || isEnd;
          return (
            <div
              key={date}
              className={`flex justify-center ${highlighted ? "bg-[#0c5138]/10" : ""} ${isFrom ? "rounded-r-full" : ""} ${isEnd ? "rounded-l-full" : ""}`}
            >
              <button
                type="button"
                disabled={past}
                onClick={() => onPick(date)}
                onMouseEnter={() => { if (!past) onHover(date); }}
                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium transition ${
                  isFrom || isEnd
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
  // פתיחה על החודש של התאריך שכבר נבחר (אם יש), אחרת החודש הנוכחי
  const start = from ? new Date(from) : now;
  const [view, setView] = useState({ year: start.getFullYear(), month: start.getMonth() });
  const [hover, setHover] = useState("");

  function shift(delta: number) {
    setView((v) => {
      const d = new Date(v.year, v.month + delta, 1);
      if (d < new Date(now.getFullYear(), now.getMonth(), 1)) return v; // לא אחורה מהחודש הנוכחי
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

  const selecting = !!from && !to;
  const nights =
    from && to ? nightsBetween(from, to)
      : selecting && hover && hover > from ? nightsBetween(from, hover)
        : null;

  const second = new Date(view.year, view.month + 1, 1);

  return (
    <div className="rounded-xl border border-[var(--line)] bg-white p-4" onMouseLeave={() => setHover("")}>
      <div className="mb-2 flex items-center justify-between">
        <button
          type="button"
          onClick={() => shift(-1)}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--line)] hover:bg-[var(--sand)]"
          aria-label="חודש קודם"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
        {nights !== null ? (
          <span className="rounded-full bg-[var(--green)] px-3 py-1 text-xs font-bold text-white">
            {nights} לילות
          </span>
        ) : (
          <div className="text-xs text-[var(--muted)]">
            {!from ? "בחרו תאריך יציאה" : !to ? "עכשיו תאריך חזרה" : "אפשר לבחור מחדש"}
          </div>
        )}
        <button
          type="button"
          onClick={() => shift(1)}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--line)] hover:bg-[var(--sand)]"
          aria-label="חודש הבא"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>
      <div className="flex flex-col gap-6 md:flex-row">
        <MonthGrid year={view.year} month={view.month} from={from} to={to} hover={hover} selecting={selecting} today={today} onPick={pick} onHover={setHover} />
        <MonthGrid
          year={second.getFullYear()}
          month={second.getMonth()}
          from={from}
          to={to}
          hover={hover}
          selecting={selecting}
          today={today}
          onPick={pick}
          onHover={setHover}
        />
      </div>
    </div>
  );
}
