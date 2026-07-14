import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tripnik — מוצאים דיל, מתכננים חופשה",
  description: "מנוע דילים + AI שמתכנן לך את כל החופשה, יום אחרי יום. טיסות, לינות, אטרקציות ונסיעות בין ערים.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <head>
        {/* Adobe Fonts (Typekit) - Futura 100 Hebrew, כולל עברית (All Characters) */}
        <link rel="preconnect" href="https://use.typekit.net" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://use.typekit.net/jpx1dtb.css" />
        {/* Heebo כ-fallback בזמן טעינה / אם הקיט לא זמין */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ fontFamily: '"futura-100-hebrew", "Heebo", "Segoe UI", Arial, sans-serif' }}>
        {children}
      </body>
    </html>
  );
}
