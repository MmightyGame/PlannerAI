export type Deal = {
  city: string;
  cityHe: string;
  iata: string;
  priceIls: number | null;
  month: string; // YYYY-MM
  live: boolean;
};

export type FlightOption = {
  cityHe: string;
  cityEn: string;
  iata: string;
  price: number;
  departureAt: string;
  returnAt: string;
  airline: string;
  transfers: number;
  nights: number;
  link: string; // דיפ-לינק של aviasales לטיסה המדויקת
};

export type FlightSearchParams = {
  dest: string;
  origin: string;
  dateMode: "exact" | "month" | "range" | "";
  month: string;
  from: string;
  to: string;
  nights: number | null;
  weekends: boolean;
  direct: boolean;
};

const DESTINATIONS: { iata: string; city: string; cityHe: string }[] = [
  { iata: "ATH", city: "Athens", cityHe: "אתונה" },
  { iata: "BUD", city: "Budapest", cityHe: "בודפשט" },
  { iata: "PRG", city: "Prague", cityHe: "פראג" },
  { iata: "BCN", city: "Barcelona", cityHe: "ברצלונה" },
  { iata: "ROM", city: "Rome", cityHe: "רומא" },
  { iata: "VIE", city: "Vienna", cityHe: "וינה" },
  { iata: "SKG", city: "Thessaloniki", cityHe: "סלוניקי" },
  { iata: "TBS", city: "Tbilisi", cityHe: "טביליסי" },
];

// יעדים פופולריים לישראלים: שם בעברית -> קוד עיר + שם באנגלית (למלונות)
const CITY_MAP: Record<string, { iata: string; en: string }> = {
  "אתונה": { iata: "ATH", en: "Athens" }, "סלוניקי": { iata: "SKG", en: "Thessaloniki" },
  "כרתים": { iata: "HER", en: "Heraklion" }, "רודוס": { iata: "RHO", en: "Rhodes" },
  "קורפו": { iata: "CFU", en: "Corfu" }, "סנטוריני": { iata: "JTR", en: "Santorini" },
  "מיקונוס": { iata: "JMK", en: "Mykonos" }, "קוס": { iata: "KGS", en: "Kos" },
  "זקינטוס": { iata: "ZTH", en: "Zakynthos" }, "לרנקה": { iata: "LCA", en: "Larnaca" },
  "פאפוס": { iata: "PFO", en: "Paphos" }, "קפריסין": { iata: "LCA", en: "Larnaca" },
  "בודפשט": { iata: "BUD", en: "Budapest" }, "פראג": { iata: "PRG", en: "Prague" },
  "וינה": { iata: "VIE", en: "Vienna" }, "זלצבורג": { iata: "SZG", en: "Salzburg" },
  "מינכן": { iata: "MUC", en: "Munich" }, "ברלין": { iata: "BER", en: "Berlin" },
  "פרנקפורט": { iata: "FRA", en: "Frankfurt" }, "אמסטרדם": { iata: "AMS", en: "Amsterdam" },
  "בריסל": { iata: "BRU", en: "Brussels" }, "לונדון": { iata: "LON", en: "London" },
  "פריז": { iata: "PAR", en: "Paris" }, "רומא": { iata: "ROM", en: "Rome" },
  "מילאנו": { iata: "MIL", en: "Milan" }, "ונציה": { iata: "VCE", en: "Venice" },
  "נאפולי": { iata: "NAP", en: "Naples" }, "ברצלונה": { iata: "BCN", en: "Barcelona" },
  "מדריד": { iata: "MAD", en: "Madrid" }, "ליסבון": { iata: "LIS", en: "Lisbon" },
  "פורטו": { iata: "OPO", en: "Porto" }, "בוקרשט": { iata: "BUH", en: "Bucharest" },
  "סופיה": { iata: "SOF", en: "Sofia" }, "ורנה": { iata: "VAR", en: "Varna" },
  "בורגס": { iata: "BOJ", en: "Burgas" }, "טירנה": { iata: "TIA", en: "Tirana" },
  "זאגרב": { iata: "ZAG", en: "Zagreb" }, "דוברובניק": { iata: "DBV", en: "Dubrovnik" },
  "ורשה": { iata: "WAW", en: "Warsaw" }, "קרקוב": { iata: "KRK", en: "Krakow" },
  "וילנה": { iata: "VNO", en: "Vilnius" }, "ריגה": { iata: "RIX", en: "Riga" },
  "מלטה": { iata: "MLA", en: "Malta" }, "איסטנבול": { iata: "IST", en: "Istanbul" },
  "אנטליה": { iata: "AYT", en: "Antalya" }, "טביליסי": { iata: "TBS", en: "Tbilisi" },
  "באטומי": { iata: "BUS", en: "Batumi" }, "ירוואן": { iata: "EVN", en: "Yerevan" },
  "באקו": { iata: "GYD", en: "Baku" }, "דובאי": { iata: "DXB", en: "Dubai" },
  "אבו דאבי": { iata: "AUH", en: "Abu Dhabi" }, "בנגקוק": { iata: "BKK", en: "Bangkok" },
  "פוקט": { iata: "HKT", en: "Phuket" }, "טוקיו": { iata: "TYO", en: "Tokyo" },
  "ניו יורק": { iata: "NYC", en: "New York" }, "מיאמי": { iata: "MIA", en: "Miami" },
  "לוס אנג'לס": { iata: "LAX", en: "Los Angeles" }, "ציריך": { iata: "ZRH", en: "Zurich" },
  "ז'נבה": { iata: "GVA", en: "Geneva" }, "קופנהגן": { iata: "CPH", en: "Copenhagen" },
  "שטוקהולם": { iata: "STO", en: "Stockholm" }, "אוסלו": { iata: "OSL", en: "Oslo" },
};

function nextMonth(): string {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

// מחירים לדוגמה כשאין עדיין טוקן של Travelpayouts
const MOCK_PRICES: Record<string, number> = {
  ATH: 420, BUD: 510, PRG: 560, BCN: 690, ROM: 480, VIE: 550, SKG: 390, TBS: 460,
};

async function fetchPrices(
  origin: string,
  destination: string,
  departureAt: string,
  returnAt: string | null,
  limit: number,
  token: string
): Promise<unknown[]> {
  let url =
    `https://api.travelpayouts.com/aviasales/v3/prices_for_dates` +
    `?origin=${origin}&destination=${destination}&departure_at=${departureAt}` +
    `&one_way=false&currency=ils&sorting=price&limit=${limit}`;
  if (returnAt) url += `&return_at=${returnAt}`;
  const res = await fetch(url, {
    headers: { "X-Access-Token": token },
    next: { revalidate: 1800 },
  });
  if (!res.ok) throw new Error(`travelpayouts ${res.status}`);
  const json = await res.json();
  return Array.isArray(json?.data) ? json.data : [];
}

function toNights(departureAt: string, returnAt: string): number {
  const dep = new Date(departureAt.slice(0, 10)).getTime();
  const ret = new Date(returnAt.slice(0, 10)).getTime();
  return Math.round((ret - dep) / 86400000);
}

function isWeekendTrip(departureAt: string, returnAt: string): boolean {
  const depDay = new Date(departureAt).getDay(); // 0=ראשון ... 6=שבת
  const retDay = new Date(returnAt).getDay();
  return (depDay === 4 || depDay === 5) && (retDay === 6 || retDay === 0 || retDay === 1);
}

function resolveDestinations(dest: string): { iata: string; cityHe: string; en: string }[] {
  const clean = dest.trim();
  if (!clean) {
    return DESTINATIONS.map((d) => ({ iata: d.iata, cityHe: d.cityHe, en: d.city }));
  }
  if (CITY_MAP[clean]) return [{ iata: CITY_MAP[clean].iata, cityHe: clean, en: CITY_MAP[clean].en }];
  // אולי הקלידו קוד IATA באנגלית
  if (/^[A-Za-z]{3}$/.test(clean)) {
    const up = clean.toUpperCase();
    return [{ iata: up, cityHe: up, en: up }];
  }
  // יעד חופשי שלא במפה - אין חיפוש טיסות, ה-AI יתכנן בלי מחירי טיסה אמיתיים
  return [];
}

export async function searchFlights(params: FlightSearchParams): Promise<{
  flights: FlightOption[];
  relaxed: boolean;
  live: boolean;
}> {
  const token = process.env.TRAVELPAYOUTS_TOKEN;
  if (!token) return { flights: [], relaxed: false, live: false };

  const targets = resolveDestinations(params.dest);
  if (targets.length === 0) return { flights: [], relaxed: false, live: true };

  const origin = params.origin === "ETM" ? "ETM" : "TLV";
  let departureAt = "";
  let returnAt: string | null = null;

  if (params.dateMode === "exact" && params.from && params.to) {
    departureAt = params.from;
    returnAt = params.to;
  } else if (params.dateMode === "range" && params.from) {
    departureAt = params.from.slice(0, 7);
  } else if (params.month) {
    departureAt = params.month;
  } else {
    departureAt = nextMonth();
  }

  const perDest = targets.length === 1 ? 30 : 10;

  async function fetchFlights(dep: string, ret: string | null): Promise<FlightOption[]> {
    const results = await Promise.allSettled(
      targets.map(async (t) => {
        const raw = await fetchPrices(origin, t.iata, dep, ret, perDest, token!);
        return raw.map((r) => {
          const o = r as Record<string, unknown>;
          return {
            cityHe: t.cityHe,
            cityEn: t.en,
            iata: t.iata,
            price: Number(o.price),
            departureAt: String(o.departure_at ?? ""),
            returnAt: String(o.return_at ?? ""),
            airline: String(o.airline ?? ""),
            transfers: Number(o.transfers ?? 0),
            nights: o.return_at ? toNights(String(o.departure_at), String(o.return_at)) : 0,
            link: String(o.link ?? ""),
          } satisfies FlightOption;
        });
      })
    );
    return results
      .filter((r): r is PromiseFulfilledResult<FlightOption[]> => r.status === "fulfilled")
      .flatMap((r) => r.value)
      .filter((f) => f.price > 0 && f.returnAt);
  }

  let all = await fetchFlights(departureAt, returnAt);

  // תאריכים מדויקים לרוב מחזירים ריק ב-Travelpayouts, אז נופלים לחיפוש לפי החודש
  // ומסננים אחר כך לפי מספר הלילות המבוקש, כדי שתמיד יופיעו דילים בריבועים
  let effectiveNights = params.nights;
  if (all.length === 0 && params.dateMode === "exact" && params.from) {
    all = await fetchFlights(params.from.slice(0, 7), null);
    if (params.to) {
      effectiveNights = Math.round(
        (new Date(params.to).getTime() - new Date(params.from).getTime()) / 86400000
      );
    }
  }

  // סינון לפי טווח תאריכים
  if (params.dateMode === "range" && params.from && params.to) {
    all = all.filter((f) => f.departureAt.slice(0, 10) >= params.from && f.returnAt.slice(0, 10) <= params.to);
  }

  // סינונים רכים: לילות, סופ"ש, וקרבה לתאריך המדויק שנבחר (עד שבוע)
  const soft: ((f: FlightOption) => boolean)[] = [];
  if (effectiveNights) soft.push((f) => Math.abs(f.nights - effectiveNights!) <= 2);
  if (params.weekends) soft.push((f) => isWeekendTrip(f.departureAt, f.returnAt));
  const exactTarget =
    params.dateMode === "exact" && params.from ? new Date(params.from).getTime() : null;
  if (exactTarget !== null) {
    soft.push((f) => Math.abs(new Date(f.departureAt.slice(0, 10)).getTime() - exactTarget) <= 7 * 86400000);
  }

  const filtered = all.filter((f) => soft.every((fn) => fn(f)));
  let pool = filtered.length > 0 ? filtered : all;

  // ברירת מחדל: מעדיפים טיסות ישירות. אם אין ישירות מציגים עם עצירות,
  // אלא אם המשתמש ביקש במפורש רק ישירות - אז רק ישירות
  const directPool = pool.filter((f) => f.transfers === 0);
  if (params.direct || directPool.length > 0) {
    pool = directPool;
  }

  const relaxed = filtered.length === 0 && all.length > 0 && soft.length > 0;

  // מיון: תאריכים מדויקים לפי קרבה לתאריך ואז מחיר, אחרת מחיר (ישירות כבר קודם בעדיפות)
  const sorter =
    exactTarget !== null
      ? (a: FlightOption, b: FlightOption) =>
          Math.abs(new Date(a.departureAt.slice(0, 10)).getTime() - exactTarget) -
            Math.abs(new Date(b.departureAt.slice(0, 10)).getTime() - exactTarget) ||
          a.price - b.price
      : (a: FlightOption, b: FlightOption) => a.price - b.price;

  // מקסימום 6, בלי כפילויות של אותה עיר+תאריך
  const seen = new Set<string>();
  const flights: FlightOption[] = [];
  for (const f of [...pool].sort(sorter)) {
    const key = `${f.iata}-${f.departureAt.slice(0, 10)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    flights.push(f);
    if (flights.length >= 6) break;
  }

  return { flights, relaxed, live: true };
}

export async function getDeals(): Promise<{ deals: Deal[]; live: boolean }> {
  const token = process.env.TRAVELPAYOUTS_TOKEN;
  const month = nextMonth();

  if (!token) {
    return {
      live: false,
      deals: DESTINATIONS.map((d) => ({ ...d, priceIls: MOCK_PRICES[d.iata] ?? 500, month, live: false })),
    };
  }

  const results = await Promise.allSettled(
    DESTINATIONS.map(async (d) => {
      const raw = await fetchPrices("TLV", d.iata, month, null, 1, token);
      const first = raw[0] as Record<string, unknown> | undefined;
      const price = first ? Number(first.price) : null;
      const deal: Deal = { ...d, priceIls: price, month, live: true };
      return deal;
    })
  );

  const deals = results
    .filter((r): r is PromiseFulfilledResult<Deal> => r.status === "fulfilled" && r.value.priceIls !== null)
    .map((r) => r.value)
    .sort((a, b) => (a.priceIls ?? 0) - (b.priceIls ?? 0));

  if (deals.length === 0) {
    return {
      live: false,
      deals: DESTINATIONS.map((d) => ({ ...d, priceIls: MOCK_PRICES[d.iata] ?? 500, month, live: false })),
    };
  }

  return { deals, live: true };
}
