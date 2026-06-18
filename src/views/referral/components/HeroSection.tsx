import { ConnectButton } from "@/components/button/ConnectButton";
import { Trans } from "@/components/trans";
import { REFERRAL_INFO } from "@/config/constants";
import { useTranslation } from "@/hooks/useTranslation";

export default function HeroSection() {
  const { t } = useTranslation()
  return (
    <section className="w-full pt-[40px] font-normal">
      <div className="">
        <div className="flex items-center justify-between">
          {/* 左侧文案 */}
          <div className="flex flex-col gap-[48px] w-[472px]">
            {/* 标题和说明 */}
            <div className="flex flex-col gap-[12px]">
              <div className="text-white">
                <p className="font-normal text-[48px] leading-[120%]">
                  <Trans 
                    i18nKey="ref.t2" 
                    values={{ r1: '40%' }} 
                    components={{
                      r1: <span className="font-semibold text-[#9cff3a]" />
                    }}
                  />
                  
                </p>
              </div>
              <div className="flex items-center text-[14px] leading-[30px]">
                <p className="font-normal text-white">
                  {t("ref.t3")}
                  <a href={REFERRAL_INFO} target="_blank" rel="noopener noreferrer">
                    <span className="font-medium text-[#9cff3a] cursor-pointer hover:underline pl-2 whitespace-nowrap inline-block">
                      {t("ref.t31")}
                    </span>
                  </a>
                </p>
                
              </div>
            </div>

            {/* CTA按钮 */}
            <div className="flex">
              <ConnectButton connectBtnClassName="w-[240px] justify-center h-[48px] text-[16px] font-semibold" />
            </div>
            
          </div>

          {/* 右侧3D视觉效果 */}
          <div className="relative w-[480px] min-h-[360px]">
            <div className="absolute inset-0">
              <img
                src={'/images/referral/referral.webp'}
                alt="Tiko 3D"
                className="absolute w-full top-[0px] left-0 object-cover mix-blend-lighten"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
