import { useTranslation } from "@/hooks/useTranslation";
import { cn } from "@/lib/utils";

// 单个功能卡片
interface FeatureCardProps {
  title: string;
  description: string;
  imageSrc: string;
  imagePosition: 'right' | 'left';
  glowColor: string;
}

function FeatureCard({ title, description, imageSrc, imagePosition, glowColor }: FeatureCardProps) {
  return (
    <div className={cn(
      "relative rounded-[16px] w-full border border-[#383A40] overflow-hidden",
    )}>
      <div className="flex gap-[20px] pl-8">
        {/* 文字内容 */}
        <div className="flex-1 flex flex-col gap-[12px] mt-8">
          <h3 className="font-semibold text-[20px] text-white leading-[120%] capitalize">{title}</h3>
          <p className="font-normal text-[14px] text-[#9da3af] leading-[24px]">
            {description}
          </p>
        </div>

        {/* 图片 */}
        {imagePosition === 'right' && (
          <div className="relative h-[188px] w-[188px] flex-shrink-0">
            <img
              src={imageSrc}
              alt={title}
              className=" w-full"
            />
          </div>
        )}
      </div>

      {/* 底部发光效果 */}
      <div
        className="absolute bottom-[-5px] left-[2px] h-[6px] w-[588px] blur-[20px]"
        style={{ backgroundColor: glowColor }}
      />
    </div>
  );
}
function FeatureCard2({ title, description, imageSrc, imagePosition, glowColor }: FeatureCardProps) {
  return (
    <div className={cn(
      "relative rounded-[16px] w-full border border-[#383A40] overflow-hidden",
    )}>
      <div className="flex gap-[20px] pl-8">
        {/* 文字内容 */}
        <div className="flex-1 flex flex-col gap-[12px] mt-8">
          <h3 className="font-semibold text-[20px] text-white leading-[120%]">{title}</h3>
          <p className="font-normal text-[14px] text-[#9da3af] leading-[24px]">
            {description}
          </p>
        </div>

        {/* 图片 */}
        {imagePosition === 'right' && (
          <div className="relative h-[188px] w-[188px] flex-shrink-0">
            <img
              src={imageSrc}
              alt={title}
              className=" w-full"
            />
          </div>
        )}
      </div>

      {/* 底部发光效果 */}
      <div
        className="absolute bottom-[-5px] left-[2px] h-[6px] w-[588px] blur-[20px]"
        style={{ backgroundColor: glowColor }}
      />
    </div>
  );
}

// 大卡片（链上结算）
function TransparencyCard() {
  const { t } = useTranslation()
  return (
    <div className="flex-1 relative rounded-[16px] border border-[#383a40] h-full overflow-hidden ">
      <div className="flex flex-col gap-[20px] p-[32px] h-full">
        {/* 文字内容 */}
        <div className="flex flex-col gap-[12px]">
          <h3 className="font-semibold text-[20px] text-white leading-[120%]">{t("ref.t7")}</h3>
          <p className="font-normal text-[14px] text-[#9da3af] leading-[24px]">
            {t("ref.t71")}
          </p>
        </div>

        {/* 图片 */}
        <div className="flex-1 relative">
          <img
            src={'/images/referral/feature3.webp'}
            alt="链上结算"
            className="absolute h-[272px] w-[588px] left-[-35px] top-[10px] object-bottom mix-blend-lighten"
          />
        </div>

        {/* 底部渐变发光 */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[720px] h-[206px] bg-gradient-to-b from-[rgba(156,255,58,0)] to-[#9cff3a] opacity-20 blur-[40px]" />
      </div>
    </div>
  );
}

export default function WhyJoinSection() {
  const { t } = useTranslation()
  return (
    <section className="w-full py-[80px]">
      <div className="">
        <div className="flex flex-col gap-[80px]">
          {/* 标题 */}
          <h2 className="text-center font-medium text-[28px] text-white">
            {t("ref.t4")}
          </h2>

          {/* 功能卡片网格 */}
          <div className="flex gap-[24px] items-stretch">
            {/* 左侧两个小卡片 */}
            <div className="flex-1 flex flex-col gap-[24px]">
              <FeatureCard
                title={t("ref.t5")}
                description={t("ref.t51")}
                imageSrc={'/images/referral/feature12.png'}
                imagePosition="right"
                glowColor="#2ee4a7"
              />
              <FeatureCard2
                title={t("ref.t6")}
                description={t("ref.t61")}
                imageSrc={'/images/referral/feature23.png'}
                imagePosition="right"
                glowColor="#F0B90B"
              />
            </div>

            {/* 右侧大卡片 */}
            <div className="flex-1">
              <TransparencyCard />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
