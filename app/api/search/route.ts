import { searchFlights, type FlightOption } from "@/lib/deals";
import { estimateHotelPerNight } from "@/lib/hotels";

export const runtime = "nodejs";

export type PackageOption = {
  flight: FlightOption;
  hotelPerNight: number | null;
  hotelPerPerson: number | null;
  totalPerPerson: number;
  flightUrl: string | null;
  hotelUrl: string;
};

export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const adults = Math.max(1, Number(sp.get("adults")) || 2);
  const rooms = Math.max(1, Number(sp.get("rooms")) || 1);
  const dateMode = sp.get("dateMode");

  const result = await searchFlights({
    dest: sp.get("dest") ?? "",
    origin: sp.get("origin") ?? "TLV",
    dateMode: dateMode === "exact" || dateMode === "month" || dateMode === "range" ? dateMode : "",
    month: sp.get("month") ?? "",
    from: sp.get("from") ?? "",
    to: sp.get("to") ?? "",
    nights: Number(sp.get("nights")) || null,
    weekends: sp.get("weekends") === "1",
    direct: sp.get("direct") === "1",
    anystops: sp.get("anystops") === "1",
  });

  const marker = process.env.NEXT_PUBLIC_TP_MARKER || "";

  // חבילות טיסה+מלון לשלוש האופציות הכי שוות
  const packages: PackageOption[] = await Promise.all(
    result.flights.slice(0, 3).map(async (f: FlightOption) => {
      const checkIn = f.departureAt.slice(0, 10);
      const checkOut = f.returnAt.slice(0, 10);
      const perNight = await estimateHotelPerNight(f.cityEn, checkIn, checkOut);
      const hotelPerPerson = perNight ? Math.round((perNight * f.nights * rooms) / adults) : null;
      const flightUrl = f.link
        ? `https://www.aviasales.com${f.link}${f.link.includes("?") ? "&" : "?"}marker=${marker}`
        : null;
      const hotelUrl =
        `https://search.hotellook.com/hotels?destination=${encodeURIComponent(f.cityEn)}` +
        `&checkIn=${checkIn}&checkOut=${checkOut}&adults=${adults}&rooms=${rooms}` +
        (marker ? `&marker=${marker}` : "");
      return {
        flight: f,
        hotelPerNight: perNight,
        hotelPerPerson,
        totalPerPerson: f.price + (hotelPerPerson ?? 0),
        flightUrl,
        hotelUrl,
      };
    })
  );

  return Response.json({ ...result, packages });
}
