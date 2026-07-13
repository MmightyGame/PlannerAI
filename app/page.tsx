import Link from "next/link";
import Image from "next/image";
import { getDeals } from "@/lib/deals";
import { CITY_IMAGES } from "@/lib/cityImages";
import SearchForm from "@/components/SearchForm";

const HEBREW_MONTHS = [
  "ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני",
  "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר",
];

function monthLabel(ym: string): string {
  const [y, m] = ym.split("-").map(Number);
  return `${HEBREW_MONTHS[m - 1]} ${y}`;
}

function nextMonths(count: number): string[] {
  const out: string[] = [];
  const d = new Date();
  for (let i = 1; i <= count; i++) {
    const n = new Date(d.getFullYear(), d.getMonth() + i, 1);
    out.push(`${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}`);
  }
  return out;
}

// עד שיהיו תמונות אמיתיות לערים - גרדיאנט + אימוג'י לכל עיר
const CITY_STYLE: Record<string, { emoji: string; bg: string }> = {
  ATH: { emoji: "🏛️", bg: "from-sky-300 to-blue-500" },
  BUD: { emoji: "🌉", bg: "from-amber-300 to-orange-500" },
  PRG: { emoji: "🏰", bg: "from-rose-300 to-red-500" },
  BCN: { emoji: "⛱️", bg: "from-orange-300 to-pink-500" },
  ROM: { emoji: "🏟️", bg: "from-emerald-300 to-teal-600" },
  VIE: { emoji: "🎻", bg: "from-stone-300 to-zinc-500" },
  SKG: { emoji: "🌊", bg: "from-cyan-300 to-sky-500" },
  TBS: { emoji: "⛰️", bg: "from-lime-300 to-green-600" },
};

export const revalidate = 3600;

export default async function Home() {
  const { deals, live } = await getDeals();
  const months = nextMonths(9).map((m) => ({ value: m, label: monthLabel(m) }));

  return (
    <main className="min-h-screen">
      {/* Nav */}
      <nav className="sticky top-0 z-20 border-b border-[var(--line)] bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2 text-xl font-black text-[var(--green)]">
            <span>✈️</span>
            <span>טריפניק</span>
            <span className="text-sm font-normal text-[var(--muted)]">Tripnik</span>
          </div>
          <div className="flex items-center gap-5 text-sm text-[var(--ink)]/70">
            <a href="#deals" className="hover:text-[var(--ink)]">דילים</a>
            <a href="#how" className="hover:text-[var(--ink)]">איך זה עובד</a>
            <Link
              href="/plan"
              className="rounded-full bg-[var(--green)] px-4 py-1.5 font-bold text-white transition hover:bg-[var(--green-dark)]"
            >
              תכנון AI ✨
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero + Search */}
      <section className="mx-auto max-w-6xl px-4 pb-6 pt-12 md:pt-16">
        <div className="text-center">
          <h1 className="text-3xl font-black leading-tight md:text-5xl">
            הצעות בזמן אמת - <span className="text-[var(--green)]">התאמה מושלמת</span>
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-[var(--muted)] md:text-lg">
            טיסות במחירי אמת ותכנון חופשה מלא, יום אחרי יום, בהתאמה אישית בעזרת בינה מלאכותית.
          </p>
        </div>
        <SearchForm months={months} />
      </section>

      {/* AI planner promo */}
      <section className="mx-auto max-w-6xl px-4 py-4">
        <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm md:flex-row md:items-center">
          <div>
            <div className="mb-1 inline-block rounded-full bg-[#0c5138]/10 px-3 py-0.5 text-xs font-bold text-[var(--green)]">
              AI trip planner ✨
            </div>
            <div className="text-lg font-black">מתכננים חופשה?</div>
            <p className="text-sm text-[var(--muted)]">
              ספרו לנו מה אתם מחפשים וה-AI יבנה עבורכם את התכנון המדויק ביותר, כולל מסלול יום-יומי מלא.
            </p>
          </div>
          <Link
            href="/plan"
            className="shrink-0 rounded-xl bg-[var(--green)] px-6 py-3 font-black text-white transition hover:bg-[var(--green-dark)]"
          >
            בואו נתחיל ✨
          </Link>
        </div>
      </section>

      {/* Deals */}
      <section id="deals" className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-black md:text-3xl">✨ תוצאות מומלצות עבורך</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              {live
                ? "מחירי טיסות הלוך-חזור מתל אביב, מתעדכן כל שעה"
                : "מחירים לדוגמה — יתעדכנו למחירים חיים אחרי חיבור Travelpayouts"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {deals.map((deal) => {
            const style = CITY_STYLE[deal.iata] ?? { emoji: "✈️", bg: "from-slate-300 to-slate-500" };
            const img = CITY_IMAGES[deal.iata];
            return (
              <Link
                key={deal.iata}
                href={{
                  pathname: "/plan",
                  query: { dest: deal.cityHe, month: deal.month, flightPrice: deal.priceIls ?? "" },
                }}
                className="group overflow-hidden rounded-2xl border border-[var(--line)] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className={`relative flex h-32 items-center justify-center overflow-hidden bg-gradient-to-br text-5xl ${style.bg}`}>
                  {img ? (
                    <Image
                      src={img}
                      alt={deal.cityHe}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    style.emoji
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-baseline justify-between">
                    <div className="text-lg font-black">{deal.cityHe}</div>
                    <div className="text-xs text-[var(--muted)]">{monthLabel(deal.month)}</div>
                  </div>
                  <div className="mt-2 text-xs text-[var(--muted)]">טיסה הלוך-חזור · החל מ-</div>
                  <div className="text-2xl font-black text-[var(--green)]">
                    {deal.priceIls?.toLocaleString()} ₪
                    <span className="mr-1 text-xs font-normal text-[var(--muted)]">לאדם</span>
                  </div>
                  <div className="mt-3 rounded-lg border border-[var(--green)] py-1.5 text-center text-sm font-bold text-[var(--green)] transition group-hover:bg-[var(--green)] group-hover:text-white">
                    צפה ותכנן
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-y border-[var(--line)] bg-[var(--sand)]">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 text-center md:grid-cols-3">
          <div>
            <div className="text-2xl">💚</div>
            <div className="mt-1 font-black">מחירים בזמן אמת</div>
            <div className="text-sm text-[var(--muted)]">מתעדכן כל שעה ישירות מחברות התעופה</div>
          </div>
          <div>
            <div className="text-2xl">🤖</div>
            <div className="mt-1 font-black">AI שמתכנן אישית</div>
            <div className="text-sm text-[var(--muted)]">מסלול יום-יומי לפי הקצב, התקציב והסגנון שלכם</div>
          </div>
          <div>
            <div className="text-2xl">🔒</div>
            <div className="mt-1 font-black">מזמינים בבטחה</div>
            <div className="text-sm text-[var(--muted)]">ההזמנות מתבצעות ישירות אצל הספקים המוכרים</div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="mb-8 text-2xl font-black md:text-3xl">איך זה עובד</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              n: "1",
              title: "בוחרים דיל או מגדירים תקציב",
              text: "מצאנו לך טיסה שווה? מעולה. יש לך רק תקציב וחודש? גם מעולה.",
            },
            {
              n: "2",
              title: "ה-AI בונה תכנון אמיתי",
              text: "כמה שאלות קצרות, ואתה מקבל מסלול יום אחרי יום: לינות, אטרקציות, אוכל, ואיך עוברים בין ערים.",
            },
            {
              n: "3",
              title: "מזמינים הכל ממקום אחד",
              text: "מלונות, אטרקציות, רכבות וגם eSIM לאינטרנט. כפתור ליד כל דבר בתכנון.",
            },
          ].map((s) => (
            <div key={s.n} className="rounded-2xl border border-[var(--line)] bg-white p-6 shadow-sm">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--green)] text-lg font-black text-white">
                {s.n}
              </div>
              <h3 className="mb-2 text-lg font-bold">{s.title}</h3>
              <p className="text-sm leading-relaxed text-[var(--muted)]">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-[var(--line)] py-8 text-center text-xs text-[var(--muted)]">
        טריפניק · המחירים באתר הם הערכה בלבד · ההזמנות מתבצעות אצל הספקים · תמונות: Wikimedia Commons
      </footer>
    </main>
  );
}
