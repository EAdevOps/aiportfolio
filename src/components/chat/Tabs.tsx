// components/chat/Tabs.tsx
import type { TabKey } from "@/lib/types";
import Image from "next/image";

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
    me: "/icons/me.png",
    projects: "/icons/projects.png",
    skills: "/icons/skills.png",
    contact: "/icons/contact.png",
  };

  const wrap = [
    "flex flex-row gap-2 w-full", // row layout
    variant === "bottom" ? "" : "",
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
            flex flex-col items-center justify-center
            py-3
          "
          onClick={() => onSelect(t)}
        >
          {/* Icon */}
          <div className="flex items-center justify-center mb-1">
            <Image
              src={icons[t]}
              alt={`${t} icon`}
              width={40}
              height={40}
              className="
                w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14
                drop-shadow-lg
              "
            />
          </div>

          {/* Label */}
          <span
            className="
              text-[0.65rem] sm:text-sm 
              
              font-mono
              text-center
            "
          >
            {t[0].toUpperCase() + t.slice(1)}
          </span>
        </button>
      ))}
    </div>
  );
}
