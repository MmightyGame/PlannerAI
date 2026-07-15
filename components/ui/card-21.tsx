import * as React from "react";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";

interface DestinationCardProps extends React.HTMLAttributes<HTMLDivElement> {
  imageUrl: string;
  location: string;
  countryCode: string; // קוד מדינה ISO דו-אותי, למשל "it" (דגל אמיתי מ-flagcdn)
  stats: string;
  href: string;
  themeColor: string; // גוון HSL, למשל "158 74% 19%" לירוק עמוק
}

const DestinationCard = React.forwardRef<HTMLDivElement, DestinationCardProps>(
  ({ className, imageUrl, location, countryCode, stats, href, themeColor, ...props }, ref) => {
    return (
      <div
        ref={ref}
        style={{ ["--theme-color" as string]: themeColor } as React.CSSProperties}
        className={cn("group h-full w-full", className)}
        {...props}
      >
        <a
          href={href}
          className="relative block h-full w-full overflow-hidden rounded-2xl shadow-lg transition-all duration-500 ease-in-out group-hover:scale-[1.03] group-hover:shadow-[0_0_60px_-15px_hsl(var(--theme-color)/0.6)]"
          aria-label={`גלה עוד על ${location}`}
          style={{ boxShadow: `0 0 40px -15px hsl(var(--theme-color) / 0.5)` }}
        >
          {/* תמונת רקע עם זום פרלקסה בריחוף */}
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-500 ease-in-out group-hover:scale-110"
            style={{ backgroundImage: `url(${imageUrl})` }}
          />

          {/* שכבת גרדיאנט בגוון היעד */}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to top, hsl(var(--theme-color) / 0.92), hsl(var(--theme-color) / 0.55) 32%, transparent 62%)`,
            }}
          />

          {/* דגל בפינה ימנית-עליונה */}
          <img
            src={`https://flagcdn.com/${countryCode}.svg`}
            alt=""
            loading="lazy"
            className="absolute right-4 top-4 z-10 h-6 w-auto rounded-[4px] shadow-md ring-1 ring-white/40"
          />

          {/* תוכן */}
          <div className="relative flex h-full flex-col justify-end p-6 text-white">
            <h3 className="text-3xl font-bold tracking-tight">
              {location}
            </h3>
            <p className="mt-1 text-sm font-medium text-white/85">{stats}</p>

            <div className="mt-6 flex items-center justify-between rounded-lg border border-[hsl(var(--theme-color)/0.35)] bg-[hsl(var(--theme-color)/0.25)] px-4 py-3 backdrop-blur-md transition-all duration-300 group-hover:border-[hsl(var(--theme-color)/0.55)] group-hover:bg-[hsl(var(--theme-color)/0.45)]">
              <span className="text-sm font-medium tracking-wide">גלה עכשיו</span>
              <ArrowLeft className="h-4 w-4 transform transition-transform duration-300 group-hover:-translate-x-1" />
            </div>
          </div>
        </a>
      </div>
    );
  },
);
DestinationCard.displayName = "DestinationCard";

export { DestinationCard };
