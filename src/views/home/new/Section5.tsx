import { HomeButton } from "@/components/button/HomeButton";
import { LazyImage } from "@/components/image/LazyImage";
import { TitlePrimary } from "@/components/title-primary"
import { useRouter } from "@/hooks/useRouter";
import { useTranslation } from "@/hooks/useTranslation";
import { cn } from "@/utils/tw";
import { memo } from "react"

export const ItemBox = memo(
  ({ children, className }: { children: React.ReactNode, className?: string }) => {
    return (
      <div
        className={cn(
          "bg-no-repeat w-[508px] h-[511px] relative overflow-hidden p-[1px]",
          className
        )}
        style={{ backgroundImage: `url('/images/home/new/sec5_bg_border.png')`, backgroundSize: '100% 100%' }}
      >
        <div className={cn(
          "px-[30px] py-[34px] ",
          
        )}>
          {children}
        </div>
      </div>
    );
  }
);

export const ItemImage = memo(
  ({
    src,
    className
  }: {src: string, className?: string}) => {
    return (
      <LazyImage src={src} className={cn(
        "w-[188px] h-[188px]",
        className
      )} />
    )
  }
)

const Section5 = memo(
  () => {
    const { t } = useTranslation()
    const router = useRouter()
    const className1 = `text-[28px] font-medium leading-[36px] mt-6 mb-5`
    const className2 = `text-[16px] font-normal leading-[20px] text-[rgba(255,255,255,0.6)] `
    return (
      <div className="min-h-[810px] px-[170px] text-white relative overflow-hidden pt-[68px]">
        <div className="flex justify-center flex-col items-center">
          <TitlePrimary className=" font-medium text-[36px] w-[628px] text-center leading-[100%]">
            {t('newHome.t19')}
          </TitlePrimary>
          

        <div className="mt-[67px] grid grid-cols-2 gap-x-[100px] gap-y-[110px]">
          <div>
            <ItemBox>
              <ItemImage src="/images/home/new/sec5_1.png" />
              <div className="pl-4 pr-[44px]">
                <div className={className1}>{t('newHome.t20')}</div>
                <div className={className2}>{t('newHome.t21')}</div>
              </div>
            </ItemBox>
            <ItemBox className=" mt-[110px]">
              <ItemImage src="/images/home/new/sec5_2.png" />
              <div className="pl-4 pr-[44px]">
                <div className={className1}>{t('newHome.t22')}</div>
                <div className={className2}>{t('newHome.t23')}</div>
              </div>
            </ItemBox>
          </div>
          <div className="pt-[128px]">
            <ItemBox>
              <ItemImage src="/images/home/new/sec5_3.png" />
              <div className="pl-4 pr-[44px]">
                <div className={className1}>{t('newHome.t24')}</div>
                <div className={className2}>{t('newHome.t25')}</div>
              </div>
            </ItemBox>
            <ItemBox className=" mt-[110px]">
              <ItemImage src="/images/home/new/sec5_4.png" />
              <div className="pl-4 pr-[44px] mt-6">
                <div className={className2}>{t('newHome.t26')}</div>
                <div className="flex">
                  <div>
                    <HomeButton onClick={() => router.push('/lite-trade')} type="start" className="mt-8 h-[51px] min-w-[236px]" >
                      <div className="flex items-center justify-between w-full text-[18px] font-semibold gap-x-1">
                        {t('newHome.btn3')}
                        <div className="w-[35px] h-[35px] flex items-center justify-center bg-white rounded-full">
                          <img src="/images/home/new/arrow-right.png" className="w-[12px] h-[12px]" alt="" />
                        </div>
                      </div>
                    </HomeButton>
                  </div>
                </div>
                
              </div>
            </ItemBox>
          </div>
          
        </div>
        </div>
        
      </div>
    )
  }
)

export default Section5