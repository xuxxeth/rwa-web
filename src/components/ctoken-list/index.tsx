import { memo, useId, useMemo, useState, useTransition } from "react"
import { useTranslation } from "@/hooks/useTranslation";
import { CheckBox } from "../check-box"
import { LazyImage } from "../image/LazyImage"
import { useRwas } from "@/hooks/useRwaBalances";
import type { IRwa } from "@/service/base/types";
import { formatTokenAmountWithCommas } from "@/utils/format";
import { multiply, sortByBalanceAndPrice, symbolToLower } from "@/utils";
import { useBaseStore } from "@/stores/baseStore";
import { useRwaPrice, useTokenBalance } from "@/hooks/useTokenBalances";
import { SortButton } from "../sort-button-svg";
import { useTableSort } from "@/hooks/useTableHelper";
import { cn } from "@/lib/utils";
import { ScrollBox } from "../scroll-box";
import { NoData } from "../markets/NoData";
import { Input } from "../ui/input";
import { useActiveWeb3 } from "@/hooks/useActiveWe3";
import { WalletNotConnectedSmallVersion } from "../wallet-not-connected";

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
  const up = useMemo(() => Number(tokenPrice?.up), [tokenPrice?.up])
  return (
    <div className="text-[12px]">
      <span className=" font-medium">${tokenPrice?.price ?? '--'}</span>
      <div className=" font-normal flex items-center gap-x-[4px]">
        {/* {
          up !== 0 &&
            <img
              src={up > 0 ? "/images/convert/price_up.png" : "/images/convert/price_down.png"}
              className="w-[6px]"
            />
        } */}
        
        <span
          className={
            up === 0 ? 'text-[#A1A1A1]' : up > 0
              ? "text-[#50E3C2] text-[12px]"
              : "text-[rgba(227,80,122,1)] text-[12px]"
          }
        >
          {up !== 0 && (up > 0 ? '+' : '-')}
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
    <div className="text-right text-[12px]">
      <div className=" font-medium leading-[24px]">
        {formatTokenAmountWithCommas(tokenBalance)}
      </div>
      <div className=" font-normal text-[#9DA3AF]">
        ≈ ${formatTokenAmountWithCommas(total, pricePrecision)}
      </div>
    </div>
  );
});

const CTokenItem = memo(

  ({ token, onClick, account }: {token: IRwa, onClick?: (token: IRwa) => void, account?: string}) => {
    const { t } = useTranslation()
    const marketInfo = useMemo(() => {
      const state = token.state
      let _icon = ''
      let _info = ''
      if (state === 0) {
        _icon = '/images/icons/market/market_open.png'
        _info = t("Open")
      }
      // if (state === 1) {
      //   _icon = '/images/icons/market/market_pre.png'
      //   _info = t("Pre-Market")
      // }
      // if (state === 2) {
      //   _icon = '/images/icons/market/market_after.png'
      //   _info = t("After Hours")
      // }
      // if (state === 3) {
      //   _icon = '/images/icons/market/market_close.png'
      //   _info = t("Market Closed")
      // }
      if (state === 1) {
        _icon = '/images/icons/market/market_lock.png'
        _info = t("Trading Halt")
      }
      return {
        icon: _icon,
        info: _info
      }
    }, [token])
    
    return (
      <div className="h-[48px] flex items-center justify-between mt-2 cursor-pointer hover:bg-[#232427] px-4 pr-2 relative group"
        onClick={() => {
          onClick && onClick(token)
        }}
      >
        <div className="flex items-center gap-x-2 w-4/8 shrink-0">
          <div>
            <LazyImage src="/images/v2/icons/collect.png" className="w-4 h-4 rounded-full" />
          </div>
          <div className="w-8 h-8 shrink-0">
            <LazyImage src={token.icon} className="w-8 h-8 rounded-full" />
          </div>
          <div>
            <div className=" text-[12px] font-medium ">{token.symbol}</div>
            <div className=" text-[12px] font-normal text-[#9DA3AF]">{token.name}</div>
          </div>
          {
            token.state === 1 && 
              <LazyImage src="/images/v2/icons/trade_halt.svg" className="w-[24px]" />
          }
        </div>
        <div className={cn(
          "w-4/8 flex items-center justify-end",
          account ? "w-2/8 justify-start" : ""
        )}>
          <CTokenPrice symbol={token.symbol} />
        </div>
        {
          account && <div className="w-2/8 text-right">
            <CTokenBalance symbol={token.symbol} pricePrecision={token.precision} />
          </div>
        }
        
      </div>
    )
  }
)

type SortableField = 'name' | 'token' | 'price' | 'change' | 'marketCap' | 'dailyHigh'

type TabItemProps = {
  id: string;
  label: string;
  key: string;
}

const FilterTabItem = memo(({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => {
  return (
    <div  className={cn(
      "px-[10px] h-[23px] flex items-center rounded-[2px] text-[12px] font-normal text-[#9DA3AF] cursor-pointer",
      active ? "bg-[#383A40] text-[#FFFFFF]" : ""
    )}
      onClick={onClick}
    >
      {label}
    </div>
  )
})

const FilterTabs = memo(({ onTabChange }: { onTabChange?: (tab: TabItemProps) => void }) => {  

  const { t } = useTranslation()
  const filteredTabs = useMemo(() => {
    return [
      {id: '1', label: t('v2.tx.t37'), key: 'all'},
      {id: '2', label: t('v2.tx.t38'), key: 'stared'},
    ]
  }, [t])
  const [currentTab, setCurrentTab] = useState<string>(filteredTabs[0].key)

  return (
    <div className="flex items-center gap-x-2 px-4 my-2">
      {
        filteredTabs.map((tab, index) => (
          <FilterTabItem 
            key={index}
            label={tab.label}
            active={currentTab === tab.key}
            onClick={() => {
              setCurrentTab(tab.key)
              onTabChange && onTabChange(tab)
            }}
          />
        ))
      }
    </div>
  )
})

const CTokenList = memo(
  ({ from, onClick }: { from?: string, onClick?: (token: IRwa) => void}) => {
    const { t } = useTranslation()
    const { account } = useActiveWeb3()
    const { sort, onSortChange } = useTableSort<SortableField>()
    
    const tokenWithBalance = useBaseStore(state => state.tokenWithBalance)
    const tokenWithPrice = useBaseStore(state => state.tokenWithPrice)

    const _id = useId()
    const rwaList = useRwas()
    const rwaListWithBalance = useMemo(() => {
      return rwaList.filter(rwa => rwa.state < 2).map(rwa => {
        return {
          ...rwa,
          ...tokenWithBalance[symbolToLower(rwa.symbol)],
          ...tokenWithPrice[symbolToLower(rwa.symbol)]
        }
      })
    }, [rwaList, tokenWithBalance, tokenWithPrice])

    const [searchTerm, setSearchTerm] = useState("")
    
    const [filterHolding, setFilterHolding] = useState(false)
    const [selectTab, setSelectTab] = useState('all')
    const [startedList, setStaredList] = useState([])
    
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setSearchTerm(value)
    }

    const filterTokens = useMemo(() => {
      let tokens = selectTab === 'stared' 
        ? startedList
        : rwaListWithBalance
      if (selectTab === 'stared' && !account) return []
      // 添加搜索过滤
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase().trim()
        tokens = tokens.filter(token => 
          token.name.toLowerCase().includes(term) ||
          token.symbol.toLowerCase().includes(term)
        )
      }
      
      return tokens
    }, [rwaListWithBalance, searchTerm, startedList, selectTab, account])

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
      <div className="min-w-[443px] border-t border-[#232427] relative">
        <div className=" absolute w-2 top-0 -right-1 h-[1px] bg-[#232427]"></div>
        {/* <div className=" flex items-center">
          <CheckBox onChange={setFilterHolding} checked={filterHolding} />
          <span onClick={() => {
            setFilterHolding(!filterHolding)
          }} className=" text-[12px] font-normal ml-1 cursor-pointer">{t("Holdings Only")}</span>
        </div> */}
        <div className=" px-4 mt-4">
          <div className="bg-[#1A1B1E] rounded-[4px] overflow-hidden flex items-center px-2 h-[31px]">
            <LazyImage src="/images/v2/icons/search.png" className="w-[12px] h-[12px]" />
            <Input className="pl-1 h-[18px] placeholder:text-[#737A87] text-[12px] font-normal " placeholder={t('v2.tx.t36')}
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
        </div>
        <div className="mt-2">
          <div className=" flex items-center justify-between text-[12px] font-normal px-4 pr-2">
            <div className="w-4/8">{t("Name")}</div>
            <div className={cn(
              "flex items-center w-4/8 justify-end cursor-pointer",
              account ? "w-2/8 justify-start" : ""
            )}
              onClick={() => {
                onSortChange('price')
              }}
              >{t("Change")}
              <div className="text-[rgba(255,255,255,0.6)]"><SortButton order={sort?.order} /></div>
            </div>
            {
              account && <div className="w-2/8 text-right">{t("Holdings")}</div>
            }
            
          </div>
          <FilterTabs 
            onTabChange={tab => {
              setSelectTab(tab.key)
            }}
          />
          <div className={cn(
            "scroll-box h-[65vh] overflow-y-auto mt-2 pr-0",
            from === "StockSelect" ? "h-[50vh]" : ""
          )}>
            {
              sortTokens.map((token, index) => <CTokenItem account={account} key={`${_id}-${index}`} token={token} onClick={onClick} />)
            }
            {
              sortTokens.length <= 0 && (selectTab === 'all' || (selectTab === 'stared' && account)) && <div className="py-[100px]"><NoData /></div>
            }
            {
              selectTab === 'stared' && !account && <WalletNotConnectedSmallVersion />
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