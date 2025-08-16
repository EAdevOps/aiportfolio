import type { TabKey } from "@/lib/types";

type Props = {
  onSelect: (tab: TabKey) => void;
  variant?: "top" | "bottom";
  /** When true, center on mobile and left-align from sm+ */
  centerOnMobile?: boolean;
};

export default function Tabs({
  onSelect,
  variant = "top",
  centerOnMobile = false,
}: Props) {
  const tabs: TabKey[] = ["about", "projects", "skills", "contact"];

  const wrap = [
    "flex flex-wrap gap-1",
    centerOnMobile ? "justify-center sm:justify-start" : "",
    // you can style top/bottom differently if you want:
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
// components/chat/Tabs.tsx
