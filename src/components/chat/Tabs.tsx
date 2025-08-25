// components/chat/Tabs.tsx
import type { TabKey } from "@/lib/types";

type Props = {
  onSelect: (tab: TabKey) => void;
  variant?: "top" | "bottom";
  centerOnMobile?: boolean;
};

export default function Tabs({
  onSelect,
  variant = "top",
  centerOnMobile = false,
}: Props) {
  const tabs: TabKey[] = ["me", "projects", "skills", "contact"];

  const icons: Record<TabKey, string> = {
    me: "/icons/me2.svg",
    projects: "/icons/project.svg",
    skills: "/icons/skill.svg",
    contact: "/icons/contact1.svg",
  };

  const wrap = [
    "flex flex-row gap-2 w-full",
    variant === "bottom" ? "" : "",
    centerOnMobile ? "justify-center sm:justify-start" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={wrap}>
      {tabs.map((t) => (
        <button
          key={t}
          className="
            flex-1
            btn backdrop-blur rounded
            flex items-center justify-center
            gap-2 px-3 py-2
          "
          onClick={() => onSelect(t)}
        >
          {/* Icon wrapper ensures perfect centering */}
          <div className="flex items-center justify-center">
            <div
              aria-hidden
              className="
                w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7
                drop-shadow-lg
                bg-gradient-to-r from-fuchsia-500 to-cyan-500
              "
              style={{
                maskImage: `url(${icons[t]})`,
                WebkitMaskImage: `url(${icons[t]})`,
                maskRepeat: "no-repeat",
                WebkitMaskRepeat: "no-repeat",
                maskPosition: "center",
                WebkitMaskPosition: "center",
                maskSize: "contain",
                WebkitMaskSize: "contain",
              }}
            />
          </div>
          {/* Label */}
          <span
            className="
              text-xs sm:text-sm md:text-base
              font-mono
            "
          >
            {t[0].toUpperCase() + t.slice(1)}
          </span>
        </button>
      ))}
    </div>
  );
}
