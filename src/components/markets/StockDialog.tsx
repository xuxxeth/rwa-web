import { cn, shortenAddress } from "@/utils";
import { memo, useState } from "react";
import { IconArrowDown } from "../icons/ArrowDown";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "../ui/hover-card";
import { useTradeStore } from "@/stores/tradeStore";
import { LazyImage } from "../image/LazyImage";
import type { IRwa, IToken } from "@/service/base/types";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { DialogController, useShowDialog } from "../dialog/DialogController";
import { CTokenList } from "../ctoken-list";
import { useTranslation } from "@/hooks/useTranslation";
import useFavorites from "@/hooks/useFavorites";
import IconWithTooltip from "../icon-tooltip";
import { useRouter } from "@/hooks/useRouter";


export const StockInfo = memo(
  ({inputToken}: {inputToken?: IRwa}) => {
    return (
      <div className="flex items-center">
        <div className="w-[40px] h-[40px]">
          {
            inputToken?.icon && <LazyImage src={inputToken?.icon} className="w-[40px] h-[40px] rounded-full" />
          }
        </div>
        <div className="ml-2 mr-1 ">
          <div className="flex items-baseline gap-x-1">
            <div className="text-[18px] font-medium text-white">{inputToken?.symbol || '--'}</div>
          </div>
          <IconWithTooltip triggerClassName=" justify-start" tooltip={inputToken?.name ?? ' '}>
            <div className=" text-[12px] font-normal text-[#9DA3AF] max-w-[60px] truncate">{inputToken?.name || '--'}</div>
          </IconWithTooltip>
          

          {/* <div className="text-[12px] font-normal text-[#9DA3AF] flex items-center gap-x-1">
            {shortenAddress(inputToken?.address || '')}
            <CopyButton copyText={inputToken?.address || ''} />
          </div> */}
        </div>
      </div>
    )
  }
)

type StockSelectProps = {
  from?: string
}

export function StockDialog({
  from
}: StockSelectProps) {
  const router = useRouter()
  const { t } = useTranslation()
  const inputToken = useTradeStore(state => state.inputToken)
  const [open, setOpen] = useState(false)
  const tokenDialog = useShowDialog()

  useBodyScrollLock(open)

  const { isFavorite, toggleFavorite, toggleEnable } = useFavorites()

  if (from !== 'pro-trading') return <StockInfo inputToken={inputToken || undefined} />

  return (
    <>
      <div className={cn(
        "flex items-center cursor-pointer py-[9px] shrink-0",
      )}
        
      >
        <LazyImage onClick={() => {if(inputToken && toggleEnable) { toggleFavorite(inputToken.stockId) }}} src={inputToken && isFavorite(inputToken.stockId) ? "/images/v2/icons/collected.png" : "/images/v2/icons/collect.png"} className={cn("w-4 h-4 mr-2",  !toggleEnable ? "cursor-not-allowed": '' )} />
        <div className="flex items-center"
          onClick={() => {
            tokenDialog.show()
          }}
        >
          <StockInfo inputToken={inputToken || undefined} />
          <IconArrowDown open={open} />
          {
            inputToken?.state === 1 && 
              <IconWithTooltip
                triggerClassName='ml-2'
                icon='/images/v2/icons/trade_halt.svg'
                tooltip='portfolio.tH'
              />
          }
        </div>
        
      </div>
      <DialogController
        className="pr-1 pl-0"
        headerClassName="px-4"
        topFixed
        title={t("Select a token")}
        open={tokenDialog.open}
        openChange={tokenDialog.setOpen}
      > 
        <div>
          
          <CTokenList 
            onClick={(token) => {
              tokenDialog.hide()
              // updateInputToken(token)
              router.push('/trade/' + token.symbol)
            }}
          />
        </div>
      </DialogController>
    </>
  )
}