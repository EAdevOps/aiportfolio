// components/chat/Tabs.tsx
import type { TabKey } from "@/lib/types";

type Props = {
  onSelect: (tab: TabKey) => void;
  variant?: "top" | "bottom";
  /** Kept for compatibility (not needed for evenly spaced) */
  centerOnMobile?: boolean;
};

export default function Tabs({
  onSelect,
  variant = "top",
  centerOnMobile = false, // kept, unused for now
}: Props) {
  const tabs: TabKey[] = ["about", "projects", "skills", "contact"];

  // Even spacing across the row in ALL contexts (landing + sticky)
  const wrap = [
    "w-full flex flex-wrap gap-1 justify-evenly",
    variant === "bottom" ? "" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={wrap}>
      {tabs.map((t) => (
        <button
          key={t}
          className="btn backdrop-blur rounded text-[10px]"
          onClick={() => onSelect(t)}
        >
          {t[0].toUpperCase() + t.slice(1)}
        </button>
      ))}
    </div>
  );
}
