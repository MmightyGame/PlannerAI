// קישורי הזמנה מתחת לצ'אט.
// לכל תוכנית שאושרה ב-Travelpayouts: לוחצים Generate links בדשבורד,
// מדביקים את הקישור שנוצר ב-.env, ומאותו רגע כל הזמנה נרשמת על ה-marker שלנו.
// תוכנית שעוד לא אושרה מקבלת קישור ישיר רגיל בינתיים (בלי עמלה, אבל האתר שלם).

export type BookingLink = {
  label: string;
  emoji: string;
  url: string;
};

export function buildBookingLinks(dest: string): BookingLink[] {
  const q = encodeURIComponent(dest || "");
  return [
    {
      label: "מלונות",
      emoji: "🏨",
      url:
        process.env.NEXT_PUBLIC_AFF_HOTELS ||
        `https://www.booking.com/searchresults.html?ss=${q}`,
    },
    {
      label: "אטרקציות",
      emoji: "🎟️",
      url: `https://www.getyourguide.com/s/?q=${q}`,
    },
    {
      label: "השכרת רכב",
      emoji: "🚗",
      url: process.env.NEXT_PUBLIC_AFF_CARS || "https://localrent.com/",
    },
    {
      label: "העברות משדה התעופה",
      emoji: "🚖",
      url: process.env.NEXT_PUBLIC_AFF_TRANSFER || "https://gettransfer.com/",
    },
    {
      label: "eSIM לאינטרנט",
      emoji: "📶",
      url: process.env.NEXT_PUBLIC_AFF_ESIM || "https://saily.com/",
    },
  ];
}
