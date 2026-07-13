// הערכת מחיר מלון דרך Hotellook (Travelpayouts) - מחירים מהקאש שלהם.
// מחזיר מחיר חציוני ללילה בשקלים, או null אם אין דאטה.

export async function estimateHotelPerNight(
  cityEn: string,
  checkIn: string,
  checkOut: string
): Promise<number | null> {
  const token = process.env.TRAVELPAYOUTS_TOKEN;
  if (!token || !cityEn || !checkIn || !checkOut) return null;
  try {
    const url =
      `https://engine.hotellook.com/api/v2/cache.json` +
      `?location=${encodeURIComponent(cityEn)}&checkIn=${checkIn}&checkOut=${checkOut}` +
      `&currency=ils&limit=25&token=${token}`;
    const res = await fetch(url, { next: { revalidate: 1800 } });
    if (!res.ok) return null;
    const data = await res.json();
    const nights = Math.max(
      1,
      Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000)
    );
    const prices = (Array.isArray(data) ? data : [])
      .map((h: Record<string, unknown>) => Number(h.priceAvg || h.priceFrom))
      .filter((p: number) => p > 0)
      .sort((a: number, b: number) => a - b);
    if (prices.length === 0) return null;
    const median = prices[Math.floor(prices.length / 2)];
    return Math.round(median / nights);
  } catch {
    return null;
  }
}
