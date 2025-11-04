import { memo, useMemo } from "react";
import { BoxCard } from "../BoxCard";
import { useTranslation } from "@/hooks/useTranslation";
import { cn } from "@/lib/utils";
import { useRouter } from "@/hooks/useRouter";

type MarketTradingProps = {
  align?: string
}

const VerifyIdentity = memo(
  ({  align = 'center' }: MarketTradingProps) => {
    const { t } = useTranslation()
    const router = useRouter()
    return (
      <BoxCard className={cn(
        "rounded-[4px] h-[48px] py-0 flex items-center pl-4 bg-[rgba(255,106,0,0.1)]",
        align === 'left' ? 'justify-start' : 'justify-center'
      )}>
        <div className="flex items-center gap-x-2">
          <div className=" font-medium text-[14px]">{'Please complete identity verification to start trading.'}</div>
        </div>
        <button className="cursor-pointer px-4 py-2 text-sm/4 font-semibold rounded-lg text-black bg-[rgba(156,255,58,1)] ml-4"
          onClick={() => {
            router.push('/assets')
          }}
          >
            {t("identity.verifyID")}
        </button>
      </BoxCard>
    )
  }
)

export { VerifyIdentity }