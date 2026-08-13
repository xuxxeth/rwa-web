import { Footer } from '../../home/v2/Footer'
import { useTranslation } from "@/hooks/useTranslation";
import RecordsSection from './components/RecordsSection';

export function Splits() {
  const { t } = useTranslation();


  return (
      <div className="bg-[#131416] min-h-screen flex flex-col items-center justify-between w-full">
        <main className="w-full max-w-[1200px] px-0 flex flex-col py-8">
          {/* Page header */}
          <div className="flex flex-col gap-3">
            <h1 className="text-white text-[48px] font-bold leading-tight">{t("events.t51")}</h1>
            <p className="text-[14px] text-[#9DA3AF]">
              {t("events.t52")}
              <span className="text-[#9cff3a] cursor-pointer ml-1">{t("v3.t9")}</span>
            </p>
          </div>
          <RecordsSection />

          <div className='mt-20'></div>
          <Footer from="no-account"  />

        </main>
        
      </div>

  )
}

export default Splits