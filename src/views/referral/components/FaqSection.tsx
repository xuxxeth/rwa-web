import { useMemo, useState } from 'react';
import faqEn from '@/locales/faq/ref/en.json'
import faqZh from '@/locales/faq/ref/zh.json'
import { useTranslation } from '@/hooks/useTranslation';
import { REFERRAL_FAQ } from '@/config/constants';

// FAQ项
interface FaqItemProps {
  question: string;
  answer?: string;
  isExpanded: boolean;
  onToggle: () => void;
}

function FaqItem({ question, answer, isExpanded, onToggle }: FaqItemProps) {
  return (
    <div className="w-full border-b border-[#292b33] py-[32px]">
      <div className="flex items-center justify-between cursor-pointer" onClick={onToggle}>
        {isExpanded && answer ? (
          <div className="flex-1 flex flex-col gap-[24px]">
            <p className=" font-medium text-[20px] text-white">{question}</p>
            <p className="font-normal text-[16px] text-[#848e9c] leading-[1.5]">
              {answer}
            </p>
          </div>
        ) : (
          <p className="font-medium text-[20px] text-white">{question}</p>
        )}

        {/* 展开/收起图标 */}
        <div className="size-[24px] flex items-center justify-center flex-shrink-0 ml-[24px]">
          <img className='w-4' src={isExpanded ? '/images/referral/minus.png' : '/images/referral/plus.png'} alt="" />
          
        </div>
      </div>
    </div>
  );
}

// FAQ区域
function FaqSection() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const { t, i18n } = useTranslation()
  const faqs = useMemo(() => {
    return i18n.language === 'en' ? faqEn : faqZh
  }, [i18n.language])

  return (
    <div className="flex flex-col">
      {/* 标题 */}
      <h2 className=" font-medium text-[28px] text-white mb-[56px] text-center">{t('FAQ')}</h2>

      {/* FAQ列表 */}
      <div className="flex flex-col">
        {faqs.map((faq, index) => (
          <FaqItem
            key={index}
            question={faq.q}
            answer={faq.a}
            isExpanded={expandedIndex === index}
            onToggle={() => setExpandedIndex(expandedIndex === index ? null : index)}
          />
        ))}

        {/* 更多按钮 */}
        <div className="w-full py-[32px] flex items-center justify-end">
          <a href={REFERRAL_FAQ} target="_blank" rel="noopener noreferrer">
            <div className="flex items-center gap-[0px] cursor-pointer hover:opacity-80">
              <p className="font-normal text-[20px] text-[#9cff3a]">{t("ref.t34")}</p>
              <div className="size-[20px] -rotate-90">
                <svg className="size-full" fill="none" viewBox="0 0 20 20">
                  <path d="M18 6L10 14L2 6" stroke="#9CFF3A" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}

// 主组件
export default function FaqSectionWrap() {
  return (
    <section className="w-full mt-[120px] mb-[120px] ">
      <div className="">
        {/* FAQ */}
        <div className="rounded-[32px] gradient-border">
          <div className='px-[56px] py-[80px]'>
            <FaqSection />
          </div>
        </div>
      </div>
    </section>
  );
}
