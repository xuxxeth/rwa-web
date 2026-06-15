import { Trans } from "@/components/trans";
import { REFERRAL_INFO } from "@/config/constants";
import { useTranslation } from "@/hooks/useTranslation";

// 标题区域组件
export default function ReferralHeader() {
  const { t } = useTranslation()
  return (
    <div className="flex h-[86px] items-end justify-between w-full">
      {/* 左侧标题 */}
      <div className="flex flex-col gap-[16px]">
        <div className="flex flex-col">
          <p className=" font-normal text-[40px] text-white flex h-[50px] items-center">
             <Trans 
              i18nKey="ref.t2" 
              values={{ r1: '40%' }} 
              components={{
                r1: <span className="font-semibold text-[#9cff3a] px-1" />
              }}
            />
          </p>
         
        </div>
        <div className="flex gap-[4px] items-start text-[16px] font-normal leading-normal text-white">
          {t("ref.t3")}
          <a href={REFERRAL_INFO} target="_blank" rel="noopener noreferrer">
            <span className="font-medium text-[#9cff3a] cursor-pointer hover:underline whitespace-nowrap inline-block">
              {t("ref.t31")}
            </span>
          </a>
        </div>
      </div>

      
    </div>
  );
}