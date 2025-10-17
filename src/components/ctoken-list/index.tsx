import { memo, useId, useMemo, useState } from "react"
import { useTranslation } from "@/hooks/useTranslation";
import { CheckBox } from "../check-box"
import { LazyImage } from "../image/LazyImage"
import { useRwas } from "@/hooks/useRwaBalances";
import type { IRwa } from "@/service/base/types";
import { formatTokenAmountWithCommas } from "@/utils/format";
import { multiply, symbolToLower } from "@/utils";
import { useBaseStore } from "@/stores/baseStore";
import { useRwaPrice, useTokenBalance } from "@/hooks/useTokenBalances";
import { SortButton } from "../sort-button-svg";
import { useTableSort } from "@/hooks/useTableHelper";

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

export const CTokenPrice = memo(({ symbol }: { symbol: string;}) => {
  const tokenPrice = useRwaPrice(symbol);
  return (
    <div className="flex items-center gap-x-2">
      <span className="text-[16px] font-medium">${tokenPrice?.price ?? '--'}</span>
      <div className="flex items-center gap-x-[4px]">
        <img
          src={Number(tokenPrice?.up) > 0 ? "/images/convert/price_up.png" : "/images/convert/price_down.png"}
          className="w-[6px]"
        />
        <span
          className={
            Number(tokenPrice?.up) > 0
              ? "text-[#50E3C2] text-[12px]"
              : "text-[rgba(227,80,122,1)] text-[12px]"
          }
        >
          {Math.abs(Number(tokenPrice?.up || "0"))}%
        </span>
      </div>
    </div>
  );
});
export const CTokenBalance = memo(({ symbol, pricePrecision }: { symbol: string; pricePrecision: number }) => {
  const tokenBalance = useTokenBalance(symbol)?.balance ?? "0";
  const tokenPrice = useRwaPrice(symbol)?.price ?? "0";

  const total = multiply(tokenBalance, tokenPrice);

  return (
    <div className="text-right">
      <div className="text-[16px] font-medium leading-[24px]">
        {formatTokenAmountWithCommas(tokenBalance)}
      </div>
      <div className="text-[12px] text-[rgba(255,255,255,0.6)]">
        ≈ ${formatTokenAmountWithCommas(total, pricePrecision)}
      </div>
    </div>
  );
});

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
    
    return (
      <div className="h-[64px] flex items-center justify-between mt-2 cursor-pointer hover:bg-[rgba(16,20,28,1)] rounded-[8px] px-2"
        onClick={() => {
          onClick && onClick(token)
        }}
      >
        <div className="flex items-center gap-x-2 w-1/3 shrink-0">
          <div className="w-10 h-10 shrink-0">
            <LazyImage src={token.icon} className="w-10 h-10 rounded-full" />
          </div>
          <div>
            <div className=" text-[16px] font-semibold leading-[24px]">{token.symbol}</div>
            <div className=" text-[12px] font-normal leading-[24px] text-[rgba(255,255,255,0.6)]">{token.name}</div>
          </div>
        </div>
        <div className="w-1/3 flex items-center gap-x-2">
          <CTokenPrice symbol={token.symbol} />
          {
            token.state === 4 && 
              <div className="h-[15px] bg-[rgba(255,255,255,0.1)] rounded-[3px] inline-flex items-center px-[3px] gap-x-[3px] mt-1">
                <LazyImage src={marketInfo.icon} className="w-[12px]" />
                <span className="text-[9px] font-medium">{marketInfo.info}</span>
              </div>
          }

        </div>
        <div className="w-1/3 text-right">
          <CTokenBalance symbol={token.symbol} pricePrecision={token.precision} />
        </div>
      </div>
    )
  }
)

type SortableField = 'name' | 'token' | 'price' | 'change' | 'marketCap' | 'dailyHigh'

const CTokenList = memo(
  ({ onClick }: { onClick?: (token: IRwa) => void}) => {
    const { t } = useTranslation()
    const { sort, onSortChange } = useTableSort<SortableField>()
    
    const tokenWithBalance = useBaseStore(state => state.tokenWithBalance)
    const tokenWithPrice = useBaseStore(state => state.tokenWithPrice)

    const _id = useId()
    const rwaList = useRwas()
    const rwaListWithBalance = useMemo(() => {
      return rwaList.map(rwa => {
        return {
          ...rwa,
          ...tokenWithBalance[symbolToLower(rwa.symbol)],
          ...tokenWithPrice[symbolToLower(rwa.symbol)]
        }
      })
    }, [rwaList, tokenWithBalance, tokenWithPrice])

    const [filterHolding, setFilterHolding] = useState(false)
    const filterTokens = useMemo(() => {
      return filterHolding ? rwaListWithBalance.filter(token => Number(token.balance) > 0) : rwaListWithBalance
    }, [rwaListWithBalance, filterHolding])

    const sortTokens = useMemo(() => {
      if (sort?.order) {
        return filterTokens.sort((token1, token2) => {
          const up1 = Math.abs(Number(token1.up))
          const up2 = Math.abs(Number(token2.up))
          return sort.order === 'asc' ? up1 - up2 : up2 - up1
        })
      }
      return filterTokens
    }, [sort, filterTokens])


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
            <div className="flex items-center w-1/3 cursor-pointer"
              onClick={() => {
                onSortChange('price')
              }}
              >{t("Change")}
              <div className="text-[rgba(255,255,255,0.6)]"><SortButton order={sort?.order} /></div>
            </div>
            <div className="w-1/3 text-right">{t("Holdings")}</div>
          </div>
          <div className="scroll-box h-[65vh] overflow-y-auto mt-2">
            {
              sortTokens.map((token, index) => <CTokenItem key={`${_id}-${index}`} token={token} onClick={onClick} />)
            }
          </div>
          
        </div>
        {/* <Pagination currentPage={currentPage} totalPage={totalPage} 
          onPrevClick={() => { 
            if (currentPage > 0) {
              setCurrentPage(currentPage - 1)
            }
          }} 
          onNextClick={() => setCurrentPage(currentPage + 1)} 
        /> */}
      </div>
    )
  }
)

export { CTokenList }