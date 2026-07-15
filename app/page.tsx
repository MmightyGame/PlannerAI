"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import {
  MapPin, CalendarDays, Users, SlidersHorizontal, Heart, Plane,
  Check, Coffee, Wifi, Star, ChevronDown, Sparkles, Globe, Luggage, Plus, Minus, X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Calendar from "@/components/Calendar";
import { ParticleButton } from "@/components/ui/particle-button";
import { DestinationCard } from "@/components/ui/card-21";
import { searchPlaces, type Place } from "@/lib/places";

/* ---------- דאטה placeholder (עד שנחבר Booking) ---------- */
const HISTOGRAM = [8, 12, 18, 26, 34, 44, 55, 68, 80, 92, 86, 74, 63, 52, 43, 36, 30, 25, 21, 17, 14, 11, 9, 7];

type Hotel = {
  name: string; stars: number; city: string; rating: number; label: string; reviews: string;
  badge?: string; img: string; flight: { date: string; route: string }; price: number;
};

const HOTELS: Hotel[] = [
  {
    name: "K+K Hotel Opera", stars: 5, city: "בודפשט, הונגריה", rating: 8.8, label: "מצוין", reviews: "4,974",
    badge: "מומלץ", img: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=700&q=80",
    flight: { date: "18 ביולי", route: "BUD 08:15 - TLV 05:45" }, price: 429,
  },
  {
    name: "Vasia Boulevard Adults Only", stars: 5, city: "כרתים, יוון", rating: 9.6, label: "מצוין", reviews: "3,661",
    badge: "בחירת העורכים", img: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=700&q=80",
    flight: { date: "18 ביולי · 3 לילות", route: "HER 10:20 - TLV 08:30" }, price: 639,
  },
  {
    name: "Canvas by Mitsis Petit Palais", stars: 5, city: "רודוס, יוון", rating: 9.6, label: "מצוין", reviews: "3,320",
    img: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=700&q=80",
    flight: { date: "14 בספטמבר · 3 לילות", route: "RHO 14:15 - TLV 12:35" }, price: 601,
  },
];

const DEST_CARDS = [
  { location: "אתונה", cc: "gr", stats: "1,240 מלונות • 32 חבילות", theme: "205 55% 24%", img: "https://images.unsplash.com/photo-1555993539-1732b0258235?auto=format&fit=crop&w=800&q=70" },
  { location: "ברצלונה", cc: "es", stats: "2,180 מלונות • 47 חבילות", theme: "8 55% 30%", img: "https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=800&q=70" },
  { location: "רומא", cc: "it", stats: "3,050 מלונות • 61 חבילות", theme: "158 50% 20%", img: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=70" },
  { location: "דובאי", cc: "ae", stats: "1,890 מלונות • 54 חבילות", theme: "38 55% 28%", img: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=70" },
  { location: "בודפשט", cc: "hu", stats: "980 מלונות • 28 חבילות", theme: "265 38% 30%", img: "https://images.unsplash.com/photo-1541849546-216549ae216d?auto=format&fit=crop&w=800&q=70" },
  { location: "פריז", cc: "fr", stats: "4,120 מלונות • 73 חבילות", theme: "220 30% 28%", img: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=70" },
];

const HE_MONTHS = ["ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני", "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"];
function fmtShort(d: string): string {
  if (!d) return "";
  const [, m, day] = d.split("-").map(Number);
  return `${day} ${HE_MONTHS[m - 1]}`;
}

/* ---------- רכיבים קטנים ---------- */
function Chip({ children }: { children: React.ReactNode }) {
  return (
    <button className="flex items-center gap-1.5 whitespace-nowrap rounded-full border border-[var(--line)] bg-white px-3.5 py-2 text-sm text-[var(--ink)]/80 shadow-sm transition hover:border-[var(--green)]/60 hover:text-[var(--ink)] hover:shadow">
      {children}
    </button>
  );
}

function FilterSection({ title }: { title: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-t border-[var(--line)] py-3">
      <button onClick={() => setOpen((v) => !v)} className="flex w-full items-center justify-between text-sm font-medium">
        <span>{title}</span>
        <ChevronDown className={`h-4 w-4 text-[var(--muted)] transition ${open ? "rotate-180" : ""}`} />
      </button>
    </div>
  );
}

function Counter({ label, hint, value, setValue, min }: { label: string; hint?: string; value: number; setValue: (n: number) => void; min: number }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <div>
        <div className="text-sm font-medium">{label}</div>
        {hint && <div className="text-xs text-[var(--muted)]">{hint}</div>}
      </div>
      <div className="flex items-center gap-3">
        <button onClick={() => setValue(Math.max(min, value - 1))} disabled={value <= min}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--sand)] disabled:opacity-30"><Minus className="h-4 w-4" /></button>
        <span className="w-5 text-center font-medium">{value}</span>
        <button onClick={() => setValue(value + 1)} className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--sand)]"><Plus className="h-4 w-4" /></button>
      </div>
    </div>
  );
}

/* ---------- בורר גיל ילד: dropdown שנפתח ל-scroll picker (4 נראים, קצוות מטושטשים) ---------- */
const AGE_ITEM_H = 30;
function AgeScroller({ value, onSelect }: { value: number; onSelect: (n: number) => void }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = Math.max(0, (value - 1) * AGE_ITEM_H);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const feather = "linear-gradient(to bottom, transparent 0%, #000 30%, #000 70%, transparent 100%)";
  return (
    <div style={{ maskImage: feather, WebkitMaskImage: feather }}>
      <div ref={scrollRef} className="no-scrollbar snap-y snap-mandatory overflow-y-auto" style={{ height: AGE_ITEM_H * 4 }}>
        {Array.from({ length: 18 }).map((_, a) => (
          <button
            key={a}
            onClick={() => onSelect(a)}
            style={{ height: AGE_ITEM_H }}
            className={`flex w-full snap-center items-center justify-center rounded-md text-sm transition ${
              a === value ? "bg-[var(--green)]/10 font-bold text-[var(--green)]" : "text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
          >
            {a}
          </button>
        ))}
      </div>
    </div>
  );
}

function AgePicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, []);
  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-center gap-1 rounded-lg border border-[var(--line)] py-1.5 text-sm font-medium transition hover:border-[var(--green)]/50"
      >
        {value}
        <ChevronDown className={`h-3.5 w-3.5 text-[var(--muted)] transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute inset-x-0 top-full z-50 mt-1 rounded-xl border border-[var(--line)] bg-white p-1 shadow-lg">
          <AgeScroller value={value} onSelect={(n) => { onChange(n); setOpen(false); }} />
        </div>
      )}
    </div>
  );
}

/* ---------- סליידר תקציב עם היסטוגרמה ---------- */
const LO = 100, HI = 900;
function BudgetSlider() {
  const [min, setMin] = useState(LO);
  const [max, setMax] = useState(HI);
  const trackRef = useRef<HTMLDivElement>(null);
  const drag = useRef<null | "min" | "max">(null);
  const minRef = useRef(min); minRef.current = min;
  const maxRef = useRef(max); maxRef.current = max;

  useEffect(() => {
    function valueFromX(clientX: number) {
      const r = trackRef.current?.getBoundingClientRect();
      if (!r) return LO;
      const pct = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
      return Math.round((LO + pct * (HI - LO)) / 10) * 10;
    }
    function move(e: PointerEvent) {
      if (!drag.current) return;
      const v = valueFromX(e.clientX);
      if (drag.current === "min") setMin(Math.min(v, maxRef.current - 20));
      else setMax(Math.max(v, minRef.current + 20));
    }
    function up() { drag.current = null; }
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); };
  }, []);

  const pct = (v: number) => ((v - LO) / (HI - LO)) * 100;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium">תקציב ללילה</span>
        <span className="text-xs font-medium text-[var(--green)]">${min} - ${max}{max === HI ? "+" : ""}</span>
      </div>
      <div dir="ltr">
        {/* היסטוגרמה - ירוק בטווח, אפור מחוץ */}
        <div className="flex h-16 items-end gap-[3px]">
          {HISTOGRAM.map((h, i) => {
            const center = LO + ((i + 0.5) / HISTOGRAM.length) * (HI - LO);
            const inRange = center >= min && center <= max;
            return <div key={i} className={`flex-1 rounded-t-sm transition-colors ${inRange ? "bg-[var(--green)]" : "bg-[var(--line)]"}`} style={{ height: `${h}%` }} />;
          })}
        </div>
        {/* פס הסליידר */}
        <div ref={trackRef} className="relative mt-3 h-1.5 rounded-full bg-[var(--line)]">
          <div className="absolute h-full rounded-full bg-[var(--green)]" style={{ left: `${pct(min)}%`, width: `${pct(max) - pct(min)}%` }} />
          {(["min", "max"] as const).map((which) => (
            <button
              key={which}
              onPointerDown={(e) => { drag.current = which; (e.target as HTMLElement).setPointerCapture?.(e.pointerId); }}
              className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 cursor-grab touch-none rounded-full border-2 border-[var(--green)] bg-white shadow active:cursor-grabbing"
              style={{ left: `${pct(which === "min" ? min : max)}%` }}
              aria-label={which === "min" ? "מחיר מינימום" : "מחיר מקסימום"}
            />
          ))}
        </div>
        <div className="mt-1.5 flex justify-between text-xs text-[var(--muted)]">
          <span>$100</span><span>$900+</span>
        </div>
      </div>
    </div>
  );
}

/* ---------- רשימת יעדים: feather בקצוות + כניסת פריטים קולנועית ---------- */
function DestResults({ results, onAll, onPick }: { results: Place[]; onAll: () => void; onPick: (p: Place) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [fadeTop, setFadeTop] = useState(false);
  const [fadeBottom, setFadeBottom] = useState(false);
  const update = () => {
    const el = ref.current;
    if (!el) return;
    setFadeTop(el.scrollTop > 2);
    setFadeBottom(Math.ceil(el.scrollTop + el.clientHeight) < el.scrollHeight - 1);
  };
  useEffect(() => { update(); }, [results]);
  return (
    <div className="relative">
      <div className={`pointer-events-none absolute inset-x-0 top-0 z-10 h-7 bg-gradient-to-b from-white to-transparent transition-opacity duration-300 ${fadeTop ? "opacity-100" : "opacity-0"}`} />
      <div ref={ref} onScroll={update} className="no-scrollbar max-h-72 overflow-y-auto p-2">
        <button onClick={onAll} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-right transition hover:bg-[var(--green)]/[0.07]">
          <Globe className="h-4 w-4 shrink-0 text-[var(--green)]" />
          <span className="min-w-0">
            <span className="block text-sm font-medium">כל מקום</span>
            <span className="block text-xs text-[var(--muted)]">כל היעדים</span>
          </span>
        </button>
        {results.map((p, i) => (
          <motion.button
            key={`${p.kind}-${p.en}`}
            initial={{ opacity: 0, y: 8, scale: 0.98, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.35, delay: Math.min(i * 0.04, 0.28), ease: [0.1, 0.8, 0.2, 1] }}
            onClick={() => onPick(p)}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-right transition-colors hover:bg-[var(--green)]/[0.07]"
          >
            {p.kind === "country" ? <Globe className="h-4 w-4 shrink-0 text-[var(--muted)]" /> : <MapPin className="h-4 w-4 shrink-0 text-[var(--green)]" />}
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium">{p.he}</span>
              <span className="block text-xs text-[var(--muted)]">{p.kind === "country" ? "מדינה" : p.sub}</span>
            </span>
          </motion.button>
        ))}
        {results.length === 0 && <div className="px-3 py-4 text-center text-sm text-[var(--muted)]">לא נמצא. נסה שם אחר</div>}
      </div>
      <div className={`pointer-events-none absolute inset-x-0 bottom-0 z-10 h-7 bg-gradient-to-t from-white to-transparent transition-opacity duration-300 ${fadeBottom ? "opacity-100" : "opacity-0"}`} />
    </div>
  );
}

/* ---------- הדף ---------- */
export default function Home() {
  const [rating, setRating] = useState("all");
  const [openField, setOpenField] = useState<null | "dest" | "dates" | "who">(null);
  const [dest, setDest] = useState("");
  const [destQuery, setDestQuery] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [childAges, setChildAges] = useState<number[]>([]);
  const [rooms, setRooms] = useState(1);
  const barRef = useRef<HTMLDivElement>(null);
  const destInputRef = useRef<HTMLInputElement>(null);

  // שומר על מערך הגילאים באורך של מספר הילדים
  useEffect(() => {
    setChildAges((prev) => {
      const next = [...prev];
      while (next.length < children) next.push(8);
      next.length = children;
      return next;
    });
  }, [children]);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (barRef.current && !barRef.current.contains(e.target as Node)) setOpenField(null);
    }
    function onEsc(e: KeyboardEvent) { if (e.key === "Escape") setOpenField(null); }
    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onEsc);
    return () => { window.removeEventListener("mousedown", onDown); window.removeEventListener("keydown", onEsc); };
  }, []);

  const datesValue = from && to ? `${fmtShort(from)} - ${fmtShort(to)}` : from ? `${fmtShort(from)} ...` : "בחרו תאריכים";
  const whoValue = `${adults + children} נוסעים${rooms > 1 ? ` · ${rooms} חדרים` : ""}`;
  const results = searchPlaces(destQuery);

  return (
    <main className="min-h-screen">
      {/* Nav */}
      <nav className="sticky top-0 z-30 border-b border-[var(--line)] bg-[var(--bg)]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2 text-xl font-bold text-[var(--green)]">
            <Plane className="h-5 w-5" />
            <span>טריפניק</span>
            <span className="text-sm font-normal text-[var(--muted)]">Tripnik</span>
          </div>
          <div className="flex items-center gap-5 text-sm text-[var(--ink)]/70">
            <Link href="/" className="hover:text-[var(--ink)]">דילים</Link>
            <Link href="/plan" className="flex items-center gap-1 rounded-full bg-[var(--green)] px-4 py-1.5 font-medium text-white transition hover:bg-[var(--green-dark)]">
              תכנון AI <Sparkles className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero + aurora */}
      <section className="relative">
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 right-1/4 h-72 w-72 rounded-full bg-emerald-400/25 blur-3xl" />
          <div className="absolute -top-10 left-1/4 h-64 w-64 rounded-full bg-amber-300/30 blur-3xl" />
          <div className="absolute top-20 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-teal-300/20 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 pt-12 text-center md:pt-16">
          <h1 className="text-3xl font-bold leading-tight tracking-tight md:text-5xl">
            <span className="text-[var(--green)]">30M+</span> הצעות בזמן אמת – התאמה מושלמת
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-[var(--muted)] md:text-lg">
            למיליוני חופשות, טיסות ומלונות בהתאמה אישית, בעזרת בינה מלאכותית.
          </p>

          {/* Search bar */}
          <div ref={barRef} className="mx-auto mt-8 max-w-4xl text-right">
            <div className="flex flex-col gap-2 rounded-[1.75rem] border border-[var(--line)] bg-white p-2 shadow-[0_18px_50px_-20px_rgba(12,81,56,0.35)] sm:flex-row sm:items-center">
              {/* יעד - אינפוט ישיר עם placeholder "כל מקום" */}
              <div className="relative flex-1">
                <div
                  onClick={() => { destInputRef.current?.focus(); setOpenField("dest"); }}
                  className={`flex cursor-text items-center gap-2.5 rounded-2xl px-4 py-2.5 text-right transition ${openField === "dest" ? "bg-[var(--bg)] ring-2 ring-[var(--green)]/30" : "hover:bg-[var(--bg)]"}`}
                >
                  <MapPin className="h-5 w-5 shrink-0 text-[var(--green)]" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[11px] text-[var(--muted)]">יעד</span>
                    <input
                      ref={destInputRef}
                      value={destQuery}
                      onFocus={() => setOpenField("dest")}
                      onChange={(e) => { setDestQuery(e.target.value); setDest(""); setOpenField("dest"); }}
                      placeholder="כל מקום"
                      className="w-full bg-transparent text-sm font-medium outline-none placeholder:font-medium placeholder:text-[var(--ink)]"
                    />
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (destQuery) { setDestQuery(""); setDest(""); destInputRef.current?.focus(); setOpenField("dest"); }
                      else setOpenField(openField === "dest" ? null : "dest");
                    }}
                    className="shrink-0 rounded-full p-1 text-[var(--muted)] transition hover:text-[var(--ink)]"
                    aria-label={destQuery ? "נקה" : "פתח"}
                  >
                    {destQuery ? <X className="h-4 w-4" /> : <ChevronDown className={`h-4 w-4 transition-transform ${openField === "dest" ? "rotate-180" : ""}`} />}
                  </button>
                </div>
                <AnimatePresence>
                  {openField === "dest" && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.98 }}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      className="absolute right-0 top-full z-40 mt-2 w-[19rem] max-w-[92vw] overflow-hidden rounded-2xl border border-[var(--line)] bg-white shadow-xl"
                    >
                      <DestResults
                        results={results}
                        onAll={() => { setDest(""); setDestQuery(""); setOpenField(null); }}
                        onPick={(p) => { setDest(p.he); setDestQuery(p.he); setOpenField(null); }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="hidden h-10 w-px bg-[var(--line)] sm:block" />

              {/* תאריכים */}
              <FieldShell open={openField === "dates"} width="w-[min(92vw,640px)]"
                trigger={<FieldButton icon={<CalendarDays className="h-5 w-5" />} label="התאריכים" value={datesValue} active={openField === "dates"} onClick={() => setOpenField(openField === "dates" ? null : "dates")} />}>
                <div className="p-3">
                  <Calendar from={from} to={to} onChange={(f, t) => { setFrom(f); setTo(t); }} />
                </div>
              </FieldShell>

              <div className="hidden h-10 w-px bg-[var(--line)] sm:block" />

              {/* נוסעים */}
              <FieldShell open={openField === "who"} width="w-72"
                trigger={<FieldButton icon={<Users className="h-5 w-5" />} label="נוסעים" value={whoValue} active={openField === "who"} onClick={() => setOpenField(openField === "who" ? null : "who")} />}>
                <div className="p-4">
                  <Counter label="מבוגרים" hint="18 ומעלה" value={adults} setValue={setAdults} min={1} />
                  <Counter label="ילדים" hint="2-17" value={children} setValue={setChildren} min={0} />
                  {children > 0 && (
                    <div className="mt-2 border-t border-[var(--line)] pt-2.5">
                      <div className="mb-2 text-xs font-medium text-[var(--muted)]">גיל הילדים בזמן הנסיעה</div>
                      <div className="grid grid-cols-2 gap-2">
                        {childAges.map((age, i) => (
                          <div key={i} className="rounded-xl border border-[var(--line)] p-1.5">
                            <div className="mb-0.5 text-center text-xs text-[var(--muted)]">ילד {i + 1}</div>
                            <AgePicker value={age} onChange={(n) => setChildAges((prev) => prev.map((a, j) => (j === i ? n : a)))} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="mt-2"><Counter label="חדרים" value={rooms} setValue={setRooms} min={1} /></div>
                  <button onClick={() => setOpenField(null)} className="mt-3 w-full rounded-xl bg-[var(--green)] py-2 text-sm font-bold text-white transition hover:bg-[var(--green-dark)]">אישור</button>
                </div>
              </FieldShell>

              <ParticleButton className="h-auto rounded-[1.4rem] bg-[var(--green)] px-8 py-4 text-base font-bold text-white shadow-lg shadow-[var(--green)]/20 hover:bg-[var(--green-dark)]">
                חפש
              </ParticleButton>
            </div>

            {/* Filter chips */}
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Chip><SlidersHorizontal className="h-4 w-4" /> עוד סינונים</Chip>
              <Chip><Star className="h-4 w-4 text-amber-400" /> מלונות מומלצים</Chip>
              <Chip><Check className="h-4 w-4 text-[var(--green)]" /> ביטול חינם</Chip>
              <Chip><Plane className="h-4 w-4" /> טיסות ישירות</Chip>
              <Chip><Coffee className="h-4 w-4" /> ארוחת בוקר כלולה</Chip>
            </div>
          </div>
        </div>
      </section>

      {/* Results heading */}
      <section className="mx-auto max-w-7xl px-4 pt-10">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold">תוצאות מומלצות עבורך</h2>
              <Sparkles className="h-5 w-5 text-amber-400" />
            </div>
            <p className="mt-1 text-sm text-[var(--muted)]">נבחרו במיוחד לפי ההעדפות שלך</p>
          </div>
          <button className="flex items-center gap-2 rounded-xl border border-[var(--line)] bg-white px-4 py-2 text-sm font-medium shadow-sm">
            מיין לפי: המומלצים <ChevronDown className="h-4 w-4 text-[var(--muted)]" />
          </button>
        </div>
      </section>

      {/* Body: filters (right) | results | promo (left) */}
      <section className="mx-auto mt-5 max-w-7xl px-4 pb-12">
        <div className="grid gap-5 lg:grid-cols-[15rem_1fr_14rem]">
          <aside className="h-fit rounded-2xl border border-[var(--line)] bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="text-base font-bold">סינון תוצאות</div>
              <button className="text-xs text-[var(--green)] hover:underline">איפוס</button>
            </div>

            <div className="mt-4"><BudgetSlider /></div>

            <div className="mt-3 border-t border-[var(--line)] py-3">
              <div className="mb-2 text-sm font-medium">דירוג אורחים</div>
              <div className="flex flex-wrap gap-1.5">
                {[{ id: "9", label: "9+" }, { id: "8", label: "8+" }, { id: "7", label: "7+" }, { id: "all", label: "כל הדירוגים" }].map((r) => (
                  <button key={r.id} onClick={() => setRating(r.id)}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition ${rating === r.id ? "border-[var(--green)] bg-[var(--green)] text-white" : "border-[var(--line)] text-[var(--ink)]/70 hover:border-[var(--green)]/50"}`}>
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <FilterSection title="סוג אירוח" />
            <FilterSection title="שירותים במלון" />
            <FilterSection title="אפשרויות טיסה" />
            <FilterSection title="מדיניות ביטול" />

            <button className="mt-4 w-full rounded-xl bg-[var(--green)] py-2.5 text-sm font-bold text-white transition hover:bg-[var(--green-dark)]">
              הצג 2,842 תוצאות
            </button>
          </aside>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {HOTELS.map((h) => <HotelCard key={h.name} h={h} />)}
          </div>

          <aside className="h-fit overflow-hidden rounded-2xl border border-[var(--line)] bg-white text-center shadow-sm">
            <div className="bg-gradient-to-b from-[var(--sand)] to-white p-5">
              <div className="mx-auto mb-2 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-sm"><Luggage className="h-9 w-9 text-[var(--green)]" /></div>
              <div className="text-base font-bold">נשמח להכיר אתכם</div>
              <p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">כמה פרטים קטנים ונבנה לכם הצעות חופשה מותאמות אישית ומושלמות.</p>
            </div>
            <div className="p-4 pt-0">
              <Link href="/plan" className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-[var(--green)] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[var(--green-dark)]">
                <Sparkles className="h-4 w-4" /> התאמת העדפות
              </Link>
              <button className="mt-2 text-xs text-[var(--muted)] hover:text-[var(--ink)]">אולי מאוחר יותר</button>
            </div>
          </aside>
        </div>
      </section>

      {/* Popular destinations */}
      <section className="mx-auto max-w-7xl px-4 pb-14">
        <div className="mb-5">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold">יעדים שאוהבים</h2>
            <Sparkles className="h-5 w-5 text-amber-400" />
          </div>
          <p className="mt-1 text-sm text-[var(--muted)]">היעדים הכי מבוקשים מישראל — לחצו וה-AI יתכנן את החופשה</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {DEST_CARDS.map((d) => (
            <div key={d.location} className="h-[360px]">
              <DestinationCard
                imageUrl={d.img}
                location={d.location}
                countryCode={d.cc}
                stats={d.stats}
                themeColor={d.theme}
                href={`/plan?dest=${encodeURIComponent(d.location)}`}
              />
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-[var(--line)] py-6 text-center text-xs text-[var(--muted)]">
        טריפניק · תצוגה מקדימה של העיצוב · הנתונים כאן הם placeholder עד לחיבור Booking
      </footer>
    </main>
  );
}

/* ---------- שדה חיפוש: מעטפת + כפתור + פופאפ ---------- */
function FieldShell({ open, width, trigger, children }: { open: boolean; width: string; trigger: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="relative flex-1">
      {trigger}
      {open && (
        <div className={`absolute right-0 top-full z-40 mt-2 ${width} max-w-[92vw] rounded-2xl border border-[var(--line)] bg-white shadow-xl`}>
          {children}
        </div>
      )}
    </div>
  );
}

function FieldButton({ icon, label, value, active, onClick }: { icon: React.ReactNode; label: string; value: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`flex w-full items-center gap-2.5 rounded-2xl px-4 py-2.5 text-right transition ${active ? "bg-[var(--bg)]" : "hover:bg-[var(--bg)]"}`}>
      <span className="text-[var(--green)]">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-[11px] text-[var(--muted)]">{label}</span>
        <span className="block truncate text-sm font-medium">{value}</span>
      </span>
    </button>
  );
}

/* ---------- כרטיס מלון ---------- */
function HotelCard({ h }: { h: Hotel }) {
  const [liked, setLiked] = useState(false);
  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-[var(--line)] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative h-40 overflow-hidden bg-gradient-to-br from-stone-200 to-stone-300">
        <img src={h.img} alt={h.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" />
        {h.badge && <span className="absolute right-3 top-3 rounded-full bg-[var(--green)] px-2.5 py-1 text-xs font-bold text-white shadow">{h.badge}</span>}
        <button onClick={() => setLiked((v) => !v)} aria-label="שמור למועדפים"
          className={`absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow backdrop-blur transition ${liked ? "text-rose-500" : "text-[var(--ink)]/50 hover:text-rose-400"}`}>
          <Heart className="h-5 w-5" fill={liked ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center gap-0.5 text-amber-400">
          {Array.from({ length: h.stars }).map((_, i) => <Star key={i} className="h-3.5 w-3.5" fill="currentColor" />)}
        </div>
        <div className="mt-1 text-base font-bold leading-tight">{h.name}</div>
        <div className="mt-1 flex items-center gap-1 text-xs text-[var(--muted)]">
          <MapPin className="h-3.5 w-3.5" /> {h.city}
        </div>

        <div className="mt-2 flex items-center gap-2">
          <span className="rounded-lg bg-[var(--green)] px-2 py-0.5 text-sm font-bold text-white">{h.rating}</span>
          <span className="text-xs font-medium">{h.label}</span>
          <span className="text-xs text-[var(--muted)]">({h.reviews} ביקורות)</span>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {[{ i: Check, t: "ביטול חינם" }, { i: Coffee, t: "ארוחת בוקר" }, { i: Wifi, t: "Wi-Fi" }].map((a) => (
            <span key={a.t} className="flex items-center gap-1 rounded-full border border-[var(--line)] px-2 py-0.5 text-[11px] text-[var(--ink)]/70">
              <a.i className="h-3.5 w-3.5" /> {a.t}
            </span>
          ))}
        </div>

        <div className="mt-3 rounded-xl bg-[var(--bg)] px-3 py-2 text-xs">
          <div className="flex items-center gap-1.5 font-medium"><Plane className="h-4 w-4 text-[var(--green)]" /> {h.flight.date}</div>
          <div dir="ltr" className="mt-0.5 text-right font-mono text-[var(--muted)]">{h.flight.route}</div>
        </div>

        <div className="mt-4 flex items-end justify-between border-t border-dashed border-[var(--line)] pt-3">
          <div>
            <div className="text-2xl font-bold text-[var(--green)]">${h.price}</div>
            <div className="text-[11px] text-[var(--muted)]">לאדם</div>
          </div>
          <button className="rounded-xl border border-[var(--green)] px-4 py-2 text-sm font-bold text-[var(--green)] transition hover:bg-[var(--green)] hover:text-white">
            צפה בהצעה
          </button>
        </div>
      </div>
    </div>
  );
}
