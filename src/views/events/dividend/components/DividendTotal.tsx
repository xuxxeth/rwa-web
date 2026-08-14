import IconWithTooltip from "@/components/icon-tooltip"
import { useTranslation } from "@/hooks/useTranslation"

function TotalItem({ children }: {children: React.ReactNode}) {
  return (
    <div className="min-h-[110px] rounded-[10px] bg-[#1A1B1E] p-6">
      {children}
    </div>
  )
}


function DividendTotal() {
  const { t } = useTranslation()

  return (
    <div className=" grid gap-x-3 grid-cols-3 mt-8 text-white">
      <TotalItem >
        <div className="h-full ">
          <div className=" flex items-center justify-between text-[14px] font-normal">
            <div className="text-[#737A87] ">{t('events.t67')}</div>
            <div className="text-[#9cff3a] cursor-pointer">{t('events.t70')} &gt;</div>
          </div>
          <div className=" flex items-center mt-[6px] gap-x-2">
            <div className="text-[24px] font-bold">{'10000.00'}</div>
            <IconWithTooltip tooltip={t('events.t78')}>
              <div className='px-2 bg-[rgba(255,178,25,0.1)] border-[rgba(255,178,25,0.2)] h-5 flex items-center justify-center rounded-full text-[#FFB219] text-[12px]'>
                {t('events.t77')}
                <img src="/images/v2/icons/warn2.svg" className="w-[10px] h-[10px] ml-[2px]" alt="" />
              </div>
            </IconWithTooltip>
          </div>
        </div>
      </TotalItem>
      <TotalItem >
        <div className="h-full ">
          <div className=" flex items-center justify-between text-[14px] font-normal">
            <div className="text-[#737A87] ">{t('events.t68')}</div>
          </div>
          <div className="text-[24px] font-bold mt-[6px]">{'1,104.45'}</div>
        </div>
      </TotalItem>
      <TotalItem >
        <div className="h-full ">
          <div className=" flex items-center justify-between text-[14px] font-normal">
            <div className="text-[#737A87] ">{t('events.t69')}</div>
          </div>
          <div className="text-[24px] font-bold mt-[6px]">{'2,305'}</div>
        </div>
      </TotalItem>

    </div>
  )
}

export { DividendTotal }