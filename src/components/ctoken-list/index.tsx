import { memo, useId, useMemo, useState } from "react"
import { useTranslation } from "@/hooks/useTranslation";
import { CheckBox } from "../check-box"
import { LazyImage } from "../image/LazyImage"
import { SortButton } from "../sort-button"
import { cn } from "@/lib/utils"
import { useRwas } from "@/hooks/useRwaBalances";
import type { IRwa } from "@/service/base/types";
import Pagination from "../pagination";
import { formatTokenAmountWithCommas } from "@/utils/format";
import { multiply } from "@/utils";
import { useBaseStore } from "@/stores/baseStore";

export type CTokenProps = {
  stock: string,
  rwa: string,
  icon: string,
  balance: string,
  price: string,
  up: string,
  lock?: number
  state?: string
}

const CTokenItem = memo(

  ({ token, onClick }: {token: IRwa, onClick?: (token: IRwa) => void}) => {
    const { t } = useTranslation()
    const marketInfo = useMemo(() => {
      const state = token.state
      let _icon = ''
      let _info = ''
      if (state === 0) {
        _icon = '/images/icons/market/market_open.png'
        _info = t("Open")
      }
      if (state === 1) {
        _icon = '/images/icons/market/market_pre.png'
        _info = t("Pre-Market")
      }
      if (state === 2) {
        _icon = '/images/icons/market/market_after.png'
        _info = t("After Hours")
      }
      if (state === 3) {
        _icon = '/images/icons/market/market_close.png'
        _info = t("Market Closed")
      }
      if (state === 4) {
        _icon = '/images/icons/market/market_lock.png'
        _info = t("Trading Halt")
      }
      return {
        icon: _icon,
        info: _info
      }
    }, [token])
    
    const balanceValue = useMemo(() => {
      if (!token.balance || !token.price) return  '0'
      return formatTokenAmountWithCommas(multiply(token.balance, token.price), token.precision)
    }, [token.balance, token.price])
    return (
      <div className="h-[64px] flex items-center justify-between mt-2 cursor-pointer hover:bg-[rgba(16,20,28,1)] rounded-[8px] px-2"
        onClick={() => {
          onClick && onClick(token)
        }}
      >
        <div className="flex items-center gap-x-2 w-1/3">
          <div className="w-10 h-10">
            <LazyImage src={token.icon} className="w-10 h-10" />
          </div>
          <div>
            <div className=" text-[16px] font-semibold leading-[24px]">{token.symbol}</div>
            <div className=" text-[12px] font-normal leading-[24px] text-[rgba(255,255,255,0.6)]">{token.name}</div>
          </div>
        </div>
        <div className="w-1/3 flex items-center gap-x-2">
          <div className="">
            <div className="flex items-center gap-x-2">
              <span className=" text-[16px] font-medium">${token.price}</span>
            </div>
            <div className="flex items-center gap-x-[4px]">
              <LazyImage src={Number(token.up) > 0 ? "/images/convert/price_up.png" : "/images/convert/price_down.png"} className="w-[6px]" />
              <span className={cn(
                " font-normal text-[12px]",
                Number(token.up) > 0 ? 'text-[#50E3C2]' : 'text-[rgba(227,80,122,1)]'
              )}>{Math.abs(Number(token.up))}%</span>
            </div>
          </div>
          {
            token.state === 4 && 
              <div className="h-[15px] bg-[rgba(255,255,255,0.1)] rounded-[3px] inline-flex items-center px-[3px] gap-x-[3px] mt-1">
                <LazyImage src={marketInfo.icon} className="w-[12px]" />
                <span className="text-[9px] font-medium">{marketInfo.info}</span>
              </div>
          }

        </div>
        <div className="w-1/3 text-right">
          <div className=" text-[16px] font-medium leading-[24px]">{formatTokenAmountWithCommas(token.balance || '0')}</div>
          <div className=" text-[12px] font-normal leading-[24px] text-[rgba(255,255,255,0.6)]">{'≈ $'}{balanceValue}</div>
        </div>
      </div>
    )
  }
)

const CTokenList = memo(
  ({ onClick }: { onClick?: (token: IRwa) => void}) => {
    const { t } = useTranslation()
    const tokenWithBalance = useBaseStore(state => state.tokenWithBalance)
    const [currentPage, setCurrentPage] = useState(1)

    const _id = useId()
    const rwaList = useRwas()
    const rwaListWithBalance = useMemo(() => {
      return rwaList.map(rwa => {
        return {
          ...rwa,
          ...tokenWithBalance[rwa.address]
        }
      })
    }, [rwaList, tokenWithBalance])

    const [filterHolding, setFilterHolding] = useState(false)
    const filterTokens = useMemo(() => {
      return filterHolding ? rwaListWithBalance.filter(token => Number(token.balance) > 0) : rwaListWithBalance
    }, [rwaListWithBalance, filterHolding])

    const totalPage = useMemo(() => Math.ceil(filterTokens.length / 7), [filterTokens])

    return (
      <div className="min-w-[443px]">
        <div className=" flex items-center">
          <CheckBox onChange={setFilterHolding} checked={filterHolding} />
          <span onClick={() => {
            setFilterHolding(!filterHolding)
          }} className=" text-[12px] font-normal ml-1 cursor-pointer">{t("Holdings Only")}</span>
        </div>
        <div className="mt-2">
          <div className=" flex items-center justify-between text-[12px] font-normal">
            <div className="w-1/3">{t("Name")}</div>
            <div className="flex items-center gap-x-[6px] w-1/3">{t("Change")} <SortButton /></div>
            <div className="w-1/3 text-right">{t("Holdings")}</div>
          </div>
          {
            filterTokens.slice((currentPage - 1) * 7, currentPage * 7).map((token, index) => <CTokenItem key={`${_id}-${index}`} token={token} onClick={onClick} />)
          }
        </div>
        <Pagination currentPage={currentPage} totalPage={totalPage} 
          onPrevClick={() => { 
            if (currentPage > 0) {
              setCurrentPage(currentPage - 1)
            }
          }} 
          onNextClick={() => setCurrentPage(currentPage + 1)} 
        />
      </div>
    )
  }
)

export { CTokenList }