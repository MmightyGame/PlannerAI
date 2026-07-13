# טריפניק Tripnik

מוצאים דיל, וה-AI מתכנן את כל החופשה: מסלול יום-יום, לינות, אטרקציות, נסיעות בין ערים, וכפתורי הזמנה שמכניסים עמלה.

## הרצה

```bash
npm install
npm run dev
```

ואז לפתוח http://localhost:3000

## מפתחות (.env)

- `GEMINI_API_KEY` או `ANTHROPIC_API_KEY` - מנוע התכנון. אם שניהם קיימים, Claude מנצח. בלי אף אחד מהם הצ'אט רץ במצב דמו.
- `TRAVELPAYOUTS_TOKEN` - מחירי טיסות אמיתיים מ-TLV בדף הבית. בלעדיו מוצגים מחירים לדוגמה.
- `NEXT_PUBLIC_AFF_*` - קישורי אפילייט מהדשבורד של Travelpayouts (כפתור Generate links בכל תוכנית).

## מבנה

- `app/page.tsx` - דף הבית: חיפוש + דילים
- `app/plan/page.tsx` - צ'אט התכנון
- `app/api/chat/route.ts` - המנוע: Claude / Gemini / דמו
- `lib/deals.ts` - מחירי טיסות (Travelpayouts)
- `lib/affiliates.ts` - קישורי ההזמנה
- `lib/prompts.ts` - הפרומפט של המתכנן
