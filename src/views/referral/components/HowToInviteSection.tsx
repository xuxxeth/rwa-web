import { useTranslation } from "@/hooks/useTranslation";

// 步骤图标
interface StepIconProps {
  stepNumber: string;
  icon: string;
}

function StepIcon({ stepNumber, icon }: StepIconProps) {
  return (
    <div className="relative grid grid-cols-[max-content] grid-rows-[max-content] place-items-start">
      {/* 背景卡片 */}
      <div className="size-[96px] flex items-center justify-center relative">
        <img
          src={icon}
          alt={`Step ${stepNumber}`}
          className="w-full h-full object-cover"
        />
        {/* 步骤编号徽章 */}
        <div className="bg-[#9cff3a] rounded-full size-[32px] flex items-center justify-center absolute -top-4 -right-4">
          <p className="font-medium text-[16px] text-[#131416]">{stepNumber}</p>
        </div>
      </div>

      
    </div>
  );
}

// 连接线
function ConnectorLine() {
  return (
    <div className="w-[230px] pt-[46px]">
      <svg className="w-full h-[7px]" fill="none" viewBox="0 0 230 7">
        <g>
          <line stroke="url(#paint0_linear_14_1032)" strokeDasharray="2 2" x1="0" x2="230" y1="3.5" y2="3.5" />
          <circle cx="115.5" cy="3.5" r="3.5" fill="#9CFF3A" />
        </g>
        <defs>
          <linearGradient id="paint0_linear_14_1032" x1="0" x2="230" y1="4.5" y2="4.5" gradientUnits="userSpaceOnUse">
            <stop stopColor="#1D3604" />
            <stop offset="0.514423" stopColor="#9CFF3A" />
            <stop offset="1" stopColor="#1D3604" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

// 单个步骤
interface StepProps {
  stepNumber: string;
  title: string;
  description: string;
  icon: string;
}

function Step({ stepNumber, title, description, icon }: StepProps) {
  return (
    <div className="flex flex-col gap-[20px] items-center">
      <StepIcon stepNumber={stepNumber} icon={icon} />
      <div className="flex flex-col gap-[8px] items-center text-center">
        <h3 className="font-medium text-[24px] text-white">{title}</h3>
        <p className="font-normal text-[16px] text-[#9da3af] w-[260px] leading-[22px]">
          {description}
        </p>
      </div>
    </div>
  );
}

export default function HowToInviteSection() {
  const { t } = useTranslation()
  return (
    <section className="w-full mt-10">
      <div className="">
        <div className="rounded-[32px] gradient-border">
          <div className=" px-[40px] py-[80px]">
            <div className="flex flex-col gap-[80px] items-center">
              {/* 标题 */}
              <h2 className="font-normal text-[40px] text-white">{t("ref.t8")}</h2>

              {/* 步骤流程 */}
              <div className="flex items-start justify-between w-full">
                <Step
                  stepNumber="01"
                  title={t("ref.t9")}
                  description={t("ref.t91")}
                  icon="/images/referral/step1.png"
                />

                <ConnectorLine />

                <Step
                  stepNumber="02"
                  title={t("ref.t10")}
                  description={t("ref.t101")}
                  icon="/images/referral/step2.png"
                />

                <ConnectorLine />

                <Step
                  stepNumber="03"
                  title={t("ref.t11")}
                  description={t("ref.t111")}
                  icon="/images/referral/step3.png"
                />
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
