import { cn } from "@/utils/tw";
import { LazyImage } from "../image/LazyImage";
import { useTranslation } from "@/hooks/useTranslation";

const InfoItem = ({ title, className }: { title: string, className?: string }) => {
  return (
    <div className={cn(
      "flex items-center text-[16px] font-medium gap-x-1",
      className
    )}>
      <LazyImage src="/images/v2/icons/checked2.png" className="w-4 h-4" />
      <div className=" text-[#9DA3AF]">{title}</div>
    </div>
  );
};

const LiteTradeInfo = () => {
  const { t, i18n } = useTranslation()
  const infoList = [
    {id: '1', title: t('v2.hd.h7') },
    {id: '2', title: t('v2.hd.h71') },
    {id: '3', title: t('v2.hd.h72') },
    {id: '4', title: t('v2.hd.h73') },
  ];

  const rwaList = [
    {id: '1', icon: '/images/tokens/GOOGL.png'},
    {id: '2', icon: '/images/tokens/AAPL.png'},
    {id: '3', icon: '/images/tokens/AMZN.png'},
    {id: '4', icon: '/images/tokens/NVDA.png'},
    {id: '5', icon: '/images/tokens/NFLX.png'},
    {id: '6', icon: '/images/tokens/META.png'},
    {id: '7', icon: '/images/tokens/COIN.png'},

  ]

  return (
    <div className="w-[600px] flex flex-col pt-[90px] text-white font-normal">
      <div className="text-[48px] leading-[110%]">{t('v2.hd.h5')}</div>
      <div className="flex">
        <div className="my-5 ">
          <div className=" text-[18px] font-normal glass h-[39px] px-4 flex items-center">
            {t('v2.hd.h6')}
          </div>
        </div>
        
      </div>
      <div className="mb-5 flex gap-x-5">
        {infoList.map(info => (
          <InfoItem key={info.id} title={info.title} className="mb-3" />
        ))}
      </div>
      <InfoItem className="mb-2 font-normal" title={t('v2.hd.h8')} />
      <div className="flex items-center pl-[10px]">
        {
          rwaList.map(rwa => (
            <LazyImage key={rwa.id} src={rwa.icon} className="w-10 h-10 rounded-full -ml-[10px]" />
          ))
        }
      </div>
      <div className="mt-5 flex items-center text-[16px] font-normal">
        {
          i18n.language === 'zn' ? 
            <>
              <div className="flex items-center  gap-x-1">
                <LazyImage src="/images/v2/icons/checked3.png" className="w-[18px] h-[18px]" />
                <div className=" text-[#9DA3AF]">{t('v2.hd.h9')}</div>
              </div>
              <div className="ml-[4px]">SlowMist</div>
            </> :
            <>
              <div className="flex items-center  gap-x-1">
                <LazyImage src="/images/v2/icons/checked3.png" className="w-[18px] h-[18px]" />
                <div className=" text-[#9DA3AF]">{t('v2.hd.h9')}</div>
              </div>
              <div className="mx-[4px]">SlowMist</div>
              <div className=" text-[#9DA3AF]">{t('v2.hd.h10')}</div>
            </>
        }
        
      </div>
    </div>
  );
};

export { LiteTradeInfo };