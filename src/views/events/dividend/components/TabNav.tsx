import { useTranslation } from "@/hooks/useTranslation";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

export type TabKey = "held" | "all" | "history";

interface TabNavProps {
  active: TabKey;
  onChange: (key: TabKey) => void;
}

export function TabNav({ active, onChange }: TabNavProps) {
  const { t } = useTranslation();
  const tabs: { key: TabKey; label: string }[] = [
      { key: "held", label: t("events.t53") },
      { key: "all", label: t("events.t54") },
      { key: "history", label: t("events.t55") },
    ];
  return (
    <div className="flex flex-col gap-5 pb-5 border-b border-[#282a2f] w-full mt-10">
      <div className="flex gap-8 items-end">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={cn(
              "text-[20px] transition-colors cursor-pointer",
              active === tab.key
                ? "text-white font-bold"
                : "text-[#737a87] font-medium hover:text-white"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}