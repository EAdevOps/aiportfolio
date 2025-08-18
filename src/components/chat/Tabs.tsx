// components/chat/Tabs.tsx
import type { TabKey } from "@/lib/types";
import Image from "next/image"; // if using Next.js

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
  const tabs: TabKey[] = ["about", "projects", "skills", "contact"];

  // Map tab keys to their PNG icon file paths (put PNGs in /public/icons/)
  const icons: Record<TabKey, string> = {
    about: "/icons/me.png",
    projects: "/icons/projects.png",
    skills: "/icons/skills.png",
    contact: "/icons/contact.png",
  };

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
          className="btn backdrop-blur rounded text-[0.9rem] flex flex-col items-center"
          onClick={() => onSelect(t)}
        >
          {/* Use Next.js Image (optimized) or <img> */}
          <Image
            src={icons[t]}
            alt={`${t} icon`}
            width={50}
            height={50}
            className="mb-1 inline"
          />
          <span>{t[0].toUpperCase() + t.slice(1)}</span>
        </button>
      ))}
    </div>
  );
}
