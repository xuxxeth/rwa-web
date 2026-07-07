import { Footer } from '../../home/v2/Footer'
import { useState } from "react";
import { TabNav, type TabKey } from "./components/TabNav";
import { EventCard, type EventData } from "./components/EventCard";
import { useTranslation } from "@/hooks/useTranslation";


export function Splits() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabKey>("held");
  const [page, setPage] = useState(1);

  const EVENTS: EventData[] = [
    // Row 1 — active (进行中)
    { symbol: "APPLt", company: "Apple Inc", isHeld: true,  eventType: "合股", ratio: "10:1", startTime: "2026/06/12 10:00", endTime: "2026/06/15 10:00", status: "active" },
    { symbol: "APPLt", company: "Apple Inc", isHeld: false, eventType: "合股", ratio: "10:1", startTime: "2026/06/12 10:00", endTime: "2026/06/15 10:00", status: "active" },
    { symbol: "APPLt", company: "Apple Inc", isHeld: false, eventType: "合股", ratio: "10:1", startTime: "2026/06/12 10:00", endTime: "2026/06/15 10:00", status: "active" },
    // Row 2 — ended (已结束)
    { symbol: "APPLt", company: "Apple Inc", isHeld: true,  eventType: "合股", ratio: "10:1", startTime: "2026/06/12 10:00", endTime: "2026/06/15 10:00", status: "ended" },
    { symbol: "APPLt", company: "Apple Inc", isHeld: false, eventType: "合股", ratio: "10:1", startTime: "2026/06/12 10:00", endTime: "2026/06/15 10:00", status: "ended" },
    { symbol: "APPLt", company: "Apple Inc", isHeld: false, eventType: "合股", ratio: "10:1", startTime: "2026/06/12 10:00", endTime: "2026/06/15 10:00", status: "ended" },
    // Row 3 — suspended (暂停中)
    { symbol: "APPLt", company: "Apple Inc", isHeld: true,  eventType: "合股", ratio: "10:1", startTime: "2026/06/12 10:00", endTime: "2026/06/15 10:00", status: "suspended" },
    { symbol: "APPLt", company: "Apple Inc", isHeld: false, eventType: "合股", ratio: "10:1", startTime: "2026/06/12 10:00", endTime: "2026/06/15 10:00", status: "suspended" },
    { symbol: "APPLt", company: "Apple Inc", isHeld: false, eventType: "合股", ratio: "10:1", startTime: "2026/06/12 10:00", endTime: "2026/06/15 10:00", status: "suspended" },
    // Row 4 — pending (未开始)
    { symbol: "APPLt", company: "Apple Inc", isHeld: true,  eventType: "合股", ratio: "10:1", startTime: "2026/06/12 10:00", endTime: "2026/06/15 10:00", status: "pending" },
    { symbol: "APPLt", company: "Apple Inc", isHeld: false, eventType: "合股", ratio: "10:1", startTime: "2026/06/12 10:00", endTime: "2026/06/15 10:00", status: "pending" },
    { symbol: "APPLt", company: "Apple Inc", isHeld: false, eventType: "合股", ratio: "10:1", startTime: "2026/06/12 10:00", endTime: "2026/06/15 10:00", status: "pending" },
  ];

  const visibleEvents = activeTab === "held"
    ? EVENTS.filter((e) => e.isHeld)
    : EVENTS;
  return (
      <div className="bg-[#131416] min-h-screen flex flex-col items-center justify-between w-full">
        <main className="w-full max-w-[1200px] px-0 flex flex-col py-8">
          {/* Page header */}
          <div className="flex flex-col gap-3">
            <h1 className="text-white text-[48px] font-bold leading-tight">{t("events.t4")}</h1>
            <p className="text-[14px] text-[#9DA3AF]">
              {t("events.t5")}
              <span className="text-[#9cff3a] cursor-pointer ml-1">{t("v3.t9")}</span>
            </p>
          </div>

          {/* Tabs */}
          <TabNav active={activeTab} onChange={(t) => { setActiveTab(t); setPage(1); }} />

          {/* Card grid */}
          <div className="grid grid-cols-3 gap-5 mt-6">
            {visibleEvents.map((event, i) => (
              <EventCard key={i} data={event} />
            ))}
          </div>

          {/* Note */}
          <p className="text-[#737a87] text-[14px] flex items-start gap-2 mt-5">
            <span className="text-[#ffb219] mt-px">⚠</span>
            {t("events.t24")}
          </p>
          <div className='mt-20'></div>
          <Footer from="no-account"  />

        </main>

      </div>

  )
}

export default Splits