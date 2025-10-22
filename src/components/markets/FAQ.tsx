import { LazyImage } from "@/components/image/LazyImage"
import { useTranslation } from "@/hooks/useTranslation"
import { cn } from "@/lib/utils"
import { memo, useEffect, useMemo, useState } from "react"
import faqEn from '@/locales/faq/en.json'
import faqZh from '@/locales/faq/zh.json'

const FAQItem = memo(
  ({ aq }: {aq: {a: string, q: string}}) => {
    const [expand, setExpand] = useState(false)

    return (
      <div className="bg-[rgba(255,255,255,0.08)] rounded-[8px]">
        <div className="h-[56px] p-4 text-white font-medium text-[16px] flex items-center justify-between cursor-pointer"
          onClick={() => {
            setExpand(!expand)
          }}
        >
          {aq.q}
          <button className={cn(
            "transition-transform duration-300 transform cursor-pointer",
            expand ? ' rotate-180' : ' rotate-0'
          )}>
            <LazyImage src="/images/icons/caret-down.png" 
              className={cn(
                "w-5 h-5 ",
                
              )} />
          </button>
          
        </div>
        {
          expand &&
            <div className=" text-[14px] font-normal text-[rgba(255,255,255,0.6)]  px-4 pb-4">
              {aq.a}
            </div>
        }
      </div>
    )
  }
)

const FAQ = memo(
  () => {
    const { t, i18n } = useTranslation()
    const faqList = useMemo(() => {
      return i18n.language === 'en' ? faqEn : faqZh
    }, [i18n.language])

    return (
      <div className="mt-[60px]">
        <div className="text-[18px] font-semibold mb-8 ">{t('FAQ')}</div>
        <div className="flex flex-col gap-y-4">

          {
            faqList.map(faq => <FAQItem key={faq.q} aq={faq} />)
          }
          
        </div>
        
      </div>
    )
  }
)

export { FAQ }
export default FAQ