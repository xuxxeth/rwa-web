import { Footer } from '../../home/v2/Footer'
import { useEffect, useState } from "react";
import { TabNav, type TabKey } from "./components/TabNav";
import { EventCard, type EventData } from "./components/EventCard";
import { useTranslation } from "@/hooks/useTranslation";
import { DialogController, useShowDialog } from '@/components/dialog/DialogController';
import { ExchangeStock } from './components/Exchange';
import { KycTip } from './components/KycTip';
import RecordsSection from './components/RecordsSection';

export function Splits() {
  const { t } = useTranslation();

  const exchangeDialog = useShowDialog()
  const kycTipDialog = useShowDialog()

  useEffect(() => {
    setTimeout(() => {
      exchangeDialog.setOpen(true)
    }, 1000)
  }, []);

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
          <RecordsSection />

          
          <div className='mt-20'></div>
          <Footer from="no-account"  />

        </main>
        <DialogController
          className="p-0 "
          headerClassName="px-4 pt-4 border-b border-[#232427] pb-4"
          overlayClassName='z-[49]'
          title={
            <div className="flex items-center gap-1">
              <span className="text-white text-[16px] font-semibold">AMZNt</span>
              <span className="text-[#737a87] text-[16px] font-semibold ml-1">Amazon</span>
            </div>
          }
          open={exchangeDialog.open}
          openChange={exchangeDialog.setOpen}
        >
        <ExchangeStock />
        </DialogController>
        <DialogController
          className="p-0 "
          headerClassName="px-4 pt-4 pb-4"
          overlayClassName='z-[49]'
          title={''}
          open={kycTipDialog.open}
          openChange={kycTipDialog.setOpen}
        >
          <KycTip />
        </DialogController>
      </div>

  )
}

export default Splits