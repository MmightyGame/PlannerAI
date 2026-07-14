// מסד יעדים לחיפוש: כל המדינות בעולם + ערי היעד הפופולריות, בעברית ובאנגלית.
// ה-en משמש בהמשך לחיפוש טיסות/מלונות. sub = המדינה (לערים).
// זו רשימה מכובדת אך לא ממצה של "כל עיר בעולם" (יש מיליונים) - כשנחבר Booking,
// ה-Locations API שלהם יספק השלמה מלאה. עד אז זה מכסה מדינות + יעדי התיירות המרכזיים.

export type Place = { he: string; en: string; sub?: string; kind: "country" | "city" };

const COUNTRIES: [string, string][] = [
  ["ישראל", "Israel"], ["יוון", "Greece"], ["איטליה", "Italy"], ["ספרד", "Spain"], ["צרפת", "France"],
  ["גרמניה", "Germany"], ["בריטניה", "United Kingdom"], ["הולנד", "Netherlands"], ["בלגיה", "Belgium"],
  ["פורטוגל", "Portugal"], ["אוסטריה", "Austria"], ["שווייץ", "Switzerland"], ["הונגריה", "Hungary"],
  ["צ'כיה", "Czechia"], ["פולין", "Poland"], ["רומניה", "Romania"], ["בולגריה", "Bulgaria"],
  ["קרואטיה", "Croatia"], ["סלובניה", "Slovenia"], ["סלובקיה", "Slovakia"], ["סרביה", "Serbia"],
  ["מונטנגרו", "Montenegro"], ["אלבניה", "Albania"], ["מקדוניה הצפונית", "North Macedonia"],
  ["בוסניה", "Bosnia and Herzegovina"], ["קפריסין", "Cyprus"], ["מלטה", "Malta"], ["טורקיה", "Turkey"],
  ["ג'ורג'יה", "Georgia"], ["ארמניה", "Armenia"], ["אזרבייג'ן", "Azerbaijan"], ["רוסיה", "Russia"],
  ["אוקראינה", "Ukraine"], ["ליטא", "Lithuania"], ["לטביה", "Latvia"], ["אסטוניה", "Estonia"],
  ["פינלנד", "Finland"], ["שוודיה", "Sweden"], ["נורווגיה", "Norway"], ["דנמרק", "Denmark"],
  ["איסלנד", "Iceland"], ["אירלנד", "Ireland"], ["לוקסמבורג", "Luxembourg"], ["מונקו", "Monaco"],
  ["ארצות הברית", "United States"], ["קנדה", "Canada"], ["מקסיקו", "Mexico"], ["ברזיל", "Brazil"],
  ["ארגנטינה", "Argentina"], ["צ'ילה", "Chile"], ["פרו", "Peru"], ["קולומביה", "Colombia"],
  ["אורוגוואי", "Uruguay"], ["קובה", "Cuba"], ["הרפובליקה הדומיניקנית", "Dominican Republic"],
  ["קוסטה ריקה", "Costa Rica"], ["פנמה", "Panama"], ["איחוד האמירויות", "United Arab Emirates"],
  ["קטאר", "Qatar"], ["ירדן", "Jordan"], ["מצרים", "Egypt"], ["מרוקו", "Morocco"], ["תוניסיה", "Tunisia"],
  ["ערב הסעודית", "Saudi Arabia"], ["עומאן", "Oman"], ["בחריין", "Bahrain"], ["הודו", "India"],
  ["סרי לנקה", "Sri Lanka"], ["תאילנד", "Thailand"], ["וייטנאם", "Vietnam"], ["קמבודיה", "Cambodia"],
  ["לאוס", "Laos"], ["מלזיה", "Malaysia"], ["סינגפור", "Singapore"], ["אינדונזיה", "Indonesia"],
  ["פיליפינים", "Philippines"], ["סין", "China"], ["הונג קונג", "Hong Kong"], ["יפן", "Japan"],
  ["דרום קוריאה", "South Korea"], ["טייוואן", "Taiwan"], ["נפאל", "Nepal"], ["מלדיביים", "Maldives"],
  ["אוסטרליה", "Australia"], ["ניו זילנד", "New Zealand"], ["דרום אפריקה", "South Africa"],
  ["קניה", "Kenya"], ["טנזניה", "Tanzania"], ["אתיופיה", "Ethiopia"], ["סיישל", "Seychelles"],
  ["מאוריציוס", "Mauritius"], ["זנזיבר", "Zanzibar"], [" נמיביה", "Namibia"], ["בוצואנה", "Botswana"],
];

// [עברית, אנגלית, מדינה]
const CITIES: [string, string, string][] = [
  // יוון
  ["אתונה", "Athens", "יוון"], ["סלוניקי", "Thessaloniki", "יוון"], ["סנטוריני", "Santorini", "יוון"],
  ["מיקונוס", "Mykonos", "יוון"], ["רודוס", "Rhodes", "יוון"], ["כרתים", "Crete", "יוון"],
  ["קורפו", "Corfu", "יוון"], ["זקינטוס", "Zakynthos", "יוון"], ["קוס", "Kos", "יוון"], ["חרקליון", "Heraklion", "יוון"],
  // איטליה
  ["רומא", "Rome", "איטליה"], ["מילאנו", "Milan", "איטליה"], ["ונציה", "Venice", "איטליה"],
  ["פירנצה", "Florence", "איטליה"], ["נאפולי", "Naples", "איטליה"], ["בולוניה", "Bologna", "איטליה"],
  ["טורינו", "Turin", "איטליה"], ["ורונה", "Verona", "איטליה"], ["פיזה", "Pisa", "איטליה"], ["סיציליה", "Sicily", "איטליה"],
  // ספרד
  ["ברצלונה", "Barcelona", "ספרד"], ["מדריד", "Madrid", "ספרד"], ["ולנסיה", "Valencia", "ספרד"],
  ["מלגה", "Malaga", "ספרד"], ["סביליה", "Seville", "ספרד"], ["איביזה", "Ibiza", "ספרד"],
  ["פלמה דה מיורקה", "Palma de Mallorca", "ספרד"], ["בילבאו", "Bilbao", "ספרד"], ["אליקנטה", "Alicante", "ספרד"],
  // צרפת
  ["פריז", "Paris", "צרפת"], ["ניס", "Nice", "צרפת"], ["מרסיי", "Marseille", "צרפת"],
  ["ליון", "Lyon", "צרפת"], ["בורדו", "Bordeaux", "צרפת"], ["קאן", "Cannes", "צרפת"],
  // גרמניה
  ["ברלין", "Berlin", "גרמניה"], ["מינכן", "Munich", "גרמניה"], ["פרנקפורט", "Frankfurt", "גרמניה"],
  ["המבורג", "Hamburg", "גרמניה"], ["קלן", "Cologne", "גרמניה"], ["דיסלדורף", "Dusseldorf", "גרמניה"],
  // בריטניה
  ["לונדון", "London", "בריטניה"], ["מנצ'סטר", "Manchester", "בריטניה"], ["אדינבורו", "Edinburgh", "בריטניה"],
  ["ליברפול", "Liverpool", "בריטניה"], ["גלזגו", "Glasgow", "בריטניה"],
  // מרכז/מזרח אירופה
  ["בודפשט", "Budapest", "הונגריה"], ["פראג", "Prague", "צ'כיה"], ["וינה", "Vienna", "אוסטריה"],
  ["זלצבורג", "Salzburg", "אוסטריה"], ["ורשה", "Warsaw", "פולין"], ["קרקוב", "Krakow", "פולין"],
  ["בוקרשט", "Bucharest", "רומניה"], ["סופיה", "Sofia", "בולגריה"], ["ורנה", "Varna", "בולגריה"],
  ["בורגס", "Burgas", "בולגריה"], ["זאגרב", "Zagreb", "קרואטיה"], ["דוברובניק", "Dubrovnik", "קרואטיה"],
  ["ספליט", "Split", "קרואטיה"], ["בלגרד", "Belgrade", "סרביה"], ["טירנה", "Tirana", "אלבניה"],
  ["ברטיסלבה", "Bratislava", "סלובקיה"], ["ליובליאנה", "Ljubljana", "סלובניה"],
  // הולנד/בלגיה/פורטוגל
  ["אמסטרדם", "Amsterdam", "הולנד"], ["רוטרדם", "Rotterdam", "הולנד"], ["בריסל", "Brussels", "בלגיה"],
  ["אנטוורפן", "Antwerp", "בלגיה"], ["ליסבון", "Lisbon", "פורטוגל"], ["פורטו", "Porto", "פורטוגל"],
  ["פארו", "Faro", "פורטוגל"], ["מדיירה", "Madeira", "פורטוגל"],
  // שווייץ/סקנדינביה
  ["ציריך", "Zurich", "שווייץ"], ["ז'נבה", "Geneva", "שווייץ"], ["קופנהגן", "Copenhagen", "דנמרק"],
  ["שטוקהולם", "Stockholm", "שוודיה"], ["אוסלו", "Oslo", "נורווגיה"], ["הלסינקי", "Helsinki", "פינלנד"],
  ["רייקיאוויק", "Reykjavik", "איסלנד"], ["דבלין", "Dublin", "אירלנד"],
  // בלטיות
  ["וילנה", "Vilnius", "ליטא"], ["ריגה", "Riga", "לטביה"], ["טאלין", "Tallinn", "אסטוניה"],
  // מלטה/קפריסין/טורקיה/קווקז
  ["ולטה", "Valletta", "מלטה"], ["לרנקה", "Larnaca", "קפריסין"], ["פאפוס", "Paphos", "קפריסין"],
  ["איסטנבול", "Istanbul", "טורקיה"], ["אנטליה", "Antalya", "טורקיה"], ["טביליסי", "Tbilisi", "ג'ורג'יה"],
  ["באטומי", "Batumi", "ג'ורג'יה"], ["ירוואן", "Yerevan", "ארמניה"], ["באקו", "Baku", "אזרבייג'ן"],
  // מזרח תיכון / אפריקה
  ["דובאי", "Dubai", "איחוד האמירויות"], ["אבו דאבי", "Abu Dhabi", "איחוד האמירויות"],
  ["עמאן", "Amman", "ירדן"], ["קהיר", "Cairo", "מצרים"], ["שארם א-שייח", "Sharm El Sheikh", "מצרים"],
  ["מרקש", "Marrakesh", "מרוקו"], ["קזבלנקה", "Casablanca", "מרוקו"], ["דוחא", "Doha", "קטאר"],
  ["ניירובי", "Nairobi", "קניה"], ["קייפטאון", "Cape Town", "דרום אפריקה"],
  // אמריקה
  ["ניו יורק", "New York", "ארצות הברית"], ["לוס אנג'לס", "Los Angeles", "ארצות הברית"],
  ["מיאמי", "Miami", "ארצות הברית"], ["לאס וגאס", "Las Vegas", "ארצות הברית"],
  ["סן פרנסיסקו", "San Francisco", "ארצות הברית"], ["שיקגו", "Chicago", "ארצות הברית"],
  ["בוסטון", "Boston", "ארצות הברית"], ["אורלנדו", "Orlando", "ארצות הברית"],
  ["טורונטו", "Toronto", "קנדה"], ["מונטריאול", "Montreal", "קנדה"], ["ונקובר", "Vancouver", "קנדה"],
  ["מקסיקו סיטי", "Mexico City", "מקסיקו"], ["קנקון", "Cancun", "מקסיקו"],
  ["ריו דה ז'ניירו", "Rio de Janeiro", "ברזיל"], ["סאו פאולו", "Sao Paulo", "ברזיל"],
  ["בואנוס איירס", "Buenos Aires", "ארגנטינה"], ["סנטיאגו", "Santiago", "צ'ילה"],
  // אסיה
  ["בנגקוק", "Bangkok", "תאילנד"], ["פוקט", "Phuket", "תאילנד"], ["קופנגן", "Koh Samui", "תאילנד"],
  ["האנוי", "Hanoi", "וייטנאם"], ["הו צ'י מין", "Ho Chi Minh City", "וייטנאם"],
  ["קואלה לומפור", "Kuala Lumpur", "מלזיה"], ["סינגפור", "Singapore", "סינגפור"],
  ["באלי", "Bali", "אינדונזיה"], ["ג'קרטה", "Jakarta", "אינדונזיה"], ["מנילה", "Manila", "פיליפינים"],
  ["טוקיו", "Tokyo", "יפן"], ["קיוטו", "Kyoto", "יפן"], ["אוסקה", "Osaka", "יפן"],
  ["סיאול", "Seoul", "דרום קוריאה"], ["בייג'ינג", "Beijing", "סין"], ["שנחאי", "Shanghai", "סין"],
  ["הונג קונג", "Hong Kong", "הונג קונג"], ["דלהי", "Delhi", "הודו"], ["מומבאי", "Mumbai", "הודו"],
  ["גואה", "Goa", "הודו"], ["קטמנדו", "Kathmandu", "נפאל"], ["מלה", "Male", "מלדיביים"],
  ["קולומבו", "Colombo", "סרי לנקה"],
  // אוקיאניה
  ["סידני", "Sydney", "אוסטרליה"], ["מלבורן", "Melbourne", "אוסטרליה"], ["אוקלנד", "Auckland", "ניו זילנד"],
  // ישראל
  ["תל אביב", "Tel Aviv", "ישראל"], ["אילת", "Eilat", "ישראל"], ["ירושלים", "Jerusalem", "ישראל"],
];

export const PLACES: Place[] = [
  ...COUNTRIES.map(([he, en]) => ({ he: he.trim(), en, kind: "country" as const })),
  ...CITIES.map(([he, en, sub]) => ({ he, en, sub, kind: "city" as const })),
];

export function searchPlaces(q: string, limit = 40): Place[] {
  const query = q.trim();
  if (!query) {
    // ברירת מחדל: יעדים פופולריים
    return PLACES.filter((p) => p.kind === "city").slice(0, 12);
  }
  const ql = query.toLowerCase();
  const scored: { p: Place; score: number }[] = [];
  for (const p of PLACES) {
    const he = p.he;
    const en = p.en.toLowerCase();
    let score = -1;
    if (he.startsWith(query) || en.startsWith(ql)) score = 0;
    else if (he.includes(query) || en.includes(ql)) score = 1;
    else if (p.sub && p.sub.includes(query)) score = 2;
    if (score >= 0) {
      // ערים לפני מדינות בציון זהה
      scored.push({ p, score: score * 2 + (p.kind === "country" ? 1 : 0) });
    }
  }
  scored.sort((a, b) => a.score - b.score);
  return scored.slice(0, limit).map((s) => s.p);
}
