import { LazyImage } from "@/components/image/LazyImage"
import { useRouter } from "@/hooks/useRouter"
import { useTranslation } from "@/hooks/useTranslation"
import { cn } from "@/lib/utils"
import { divide } from "@/utils"
import { memo } from "react"

type IdentityLayoutProps = {
  children: React.ReactNode
}

type TipLineProps = {
  active?: boolean
}
const TipLine = memo(
  ({ active }: TipLineProps) => {
    return (
      <div className={cn(
        "w-[182px] h-[4px] bg-[rgba(255,255,255,0.3)] rounded-[4px]",
        active ? "bg-[#1A85FF]" : ""
      )}>

      </div>
    )
  }
)

const IdentityLayout = memo(
  ({ children }: IdentityLayoutProps) => {
    const { t } = useTranslation()
    const router = useRouter()
    return (
      <div className="flex justify-center ">
        <div className=" px-5 min-h-[600px] text-white w-[926px]">
          {/* <div className=" text-[24px] font-medium mt-8">{t('identity.Identity_verification')}</div> */}
          {/* <div className="mt-5 flex items-center gap-x-[4px]">
            <TipLine active />
            <TipLine />
            <TipLine />
            <TipLine />
            <TipLine />
          </div> */}
          <div className="relative pt-5">
            {/* <div className=" absolute -left-[120px] top-0 flex items-center cursor-pointer"
              onClick={() => {
                router.back()
              }}
            >
              <LazyImage src="/images/icons/identity/back.png" className="w-6 h-6 mr-1" />
              {t('Back')}
            </div> */}
            {children}
          </div>
        </div>
      </div>
      
    )
  }
)

export { IdentityLayout }