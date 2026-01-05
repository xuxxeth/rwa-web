import { memo, useId, useMemo, useState } from "react"
import { CheckBox } from "../check-box"
import { LazyImage } from "../image/LazyImage"
import { useTokens } from "@/hooks/useTokens"
import type { IToken } from "@/service/base/types"
import { formatTokenAmountWithCommas, symbolToLower } from "@/utils"
import { useTranslation } from "@/hooks/useTranslation"
import { useBaseStore } from "@/stores/baseStore"
import { NoData } from "../markets/NoData"

export type TokenProps = {
  name: string,
  symbol: string,
  icon: string,
  balance: string
}

const TokenItem = memo(
  ({ token, onClick }: {token: IToken, onClick?: (token: IToken) => void}) => {
    return (
      <div className="h-[64px] flex items-center justify-between mt-2 cursor-pointer hover:bg-[rgba(16,20,28,1)] rounded-[8px] px-2"
        onClick={() => {
          onClick && onClick(token)
        }}
      >
        <div className="flex items-center gap-x-2 shrink-0">
          <LazyImage src={token.icon} className="w-10 h-10 rounded-full shrink-0" />
          <div>
            <div className=" text-[16px] font-semibold leading-[24px]">{token.symbol}</div>
            <div className=" text-[12px] font-normal leading-[24px] text-[rgba(255,255,255,0.6)]">{token.name}</div>
          </div>
        </div>
        <div className=" text-right">
          <div className=" text-[16px] font-medium leading-[24px]">{formatTokenAmountWithCommas(token.balance || '0')}</div>
          <div className=" text-[12px] font-normal leading-[24px] text-[rgba(255,255,255,0.6)]">{'≈ $'}{token.balance}</div>
        </div>
      </div>
    )
  }
)

const TokenList = memo(
  ({
    onClick
  }: { onClick?: (token: IToken) => void}) => {
    const { t } = useTranslation()
    const tokenWithBalance = useBaseStore(state => state.tokenWithBalance)
    const tokenList = useTokens()

    const _id = useId()
    const tokenListWithBalance = useMemo(() => {
      return tokenList.map(rwa => {
        return {
          ...rwa,
          ...tokenWithBalance[symbolToLower(rwa.symbol)]
        }
      })
    }, [tokenList, tokenWithBalance])

    const [filterHolding, setFilterHolding] = useState(false)
    const filterTokens = useMemo(() => {
      return filterHolding ? tokenListWithBalance.filter(token => Number(token.balance) > 0) : tokenListWithBalance
    }, [tokenListWithBalance, filterHolding])

    return (
      <div className="w-[300px] min-h-[400px]">
        <div className=" flex items-center">
          <CheckBox onChange={setFilterHolding} checked={filterHolding} />
          <span onClick={() => {
            setFilterHolding(!filterHolding)
          }} className=" text-[12px] font-normal ml-1 cursor-pointer">{t("Holdings Only")}</span>
        </div>
        <div className="mt-2">
          <div className=" flex items-center justify-between text-[12px] font-normal">
            <div>{t("Name")}</div>
            <div>{t("balance")}</div>
          </div>
          {
            filterTokens.map((token, index) => <TokenItem key={`${_id}-${index}`} token={token} onClick={onClick}  />)
          }
          {
            filterTokens.length <= 0 && <div className="py-[100px]"><NoData /></div>
          }
        </div>
      </div>
    )
  }
)

export { TokenList }