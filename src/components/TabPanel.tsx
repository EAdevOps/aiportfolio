import { TAB_CONTENT } from "@/lib/tabContent";
import type { TabKey } from "@/lib/types";

export default function TabPanel({ tab }: { tab: TabKey }) {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="rounded-2xl px-4 py-3 whitespace-pre-wrap leading-relaxed shadow bg-white/80 backdrop-blur border">
        {TAB_CONTENT[tab]}
      </div>
    </div>
  );
}
