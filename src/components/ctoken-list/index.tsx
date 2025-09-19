import { memo, useId, useMemo, useState } from "react"
import { useTranslation } from "@/hooks/useTranslation";
import { CheckBox } from "../check-box"
import { LazyImage } from "../image/LazyImage"
import { SortButton } from "../sort-button"
import { cn } from "@/lib/utils"

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

  ({ token, onClick }: {token: CTokenProps, onClick?: (token: CTokenProps) => void}) => {
    const { t } = useTranslation()
    const marketInfo = useMemo(() => {
      const state = token.state
      let _icon = ''
      let _info = ''
      if (state === 'open') {
        _icon = '/images/icons/market/market_open.png'
        _info = t('Open')
      }
      if (state === 'pre') {
        _icon = '/images/icons/market/market_pre.png'
        _info = t('Pre-Market')
      }
      if (state === 'after') {
        _icon = '/images/icons/market/market_after.png'
        _info = t('After Hours')
      }
      if (state === 'close') {
        _icon = '/images/icons/market/market_close.png'
        _info = t('Market Closed')
      }
      if (state === 'lock') {
        _icon = '/images/icons/market/market_lock.png'
        _info = t('Trading Halt')
      }
      return {
        icon: _icon,
        info: _info
      }
    }, [token])

    const marketIcon = useMemo(() => {
      let _icon = ''
      if (token.state === 'pre') {
        _icon = '/images/icons/market/market_pre.png'
      }
      if (token.state === 'after') {
        _icon = '/images/icons/market/market_pre.png'
      }
    }, [token])


    return (
      <div className="h-[64px] flex items-center justify-between mt-2 cursor-pointer hover:bg-[rgba(16,20,28,1)] rounded-[8px] px-2"
        onClick={() => {
          onClick && onClick(token)
        }}
      >
        <div className="flex items-center gap-x-2 w-1/3">
          <LazyImage src={token.icon} className="w-10 h-10" />
          <div>
            <div className=" text-[16px] font-semibold leading-[24px]">{token.rwa}</div>
            <div className=" text-[12px] font-normal leading-[24px] text-[rgba(255,255,255,0.6)]">{token.stock}</div>
          </div>
        </div>
        <div className="w-1/3">
          <div className="flex items-center gap-x-2">
            <span className=" text-[16px] font-medium">${token.price}</span>
            <div className="flex items-center gap-x-[4px]">
              <LazyImage src={Number(token.up) > 0 ? "/images/convert/price_up.png" : "/images/convert/price_down.png"} className="w-[6px]" />
              <span className={cn(
                " font-normal text-[12px]",
                Number(token.up) > 0 ? 'text-[#50E3C2]' : 'text-[rgba(227,80,122,1)]'
              )}>2.98%</span>
            </div>
          </div>
          <div className="h-[15px] bg-[rgba(255,255,255,0.1)] rounded-[3px] inline-flex items-center px-[3px] gap-x-[3px] mt-1">
            <LazyImage src={marketInfo.icon} className="w-[12px]" />
            <span className="text-[9px] font-medium">{marketInfo.info}</span>
          </div>
        </div>
        <div className="w-1/3 text-right">
          <div className=" text-[16px] font-medium leading-[24px]">{token.balance}</div>
          <div className=" text-[12px] font-normal leading-[24px] text-[rgba(255,255,255,0.6)]">{'≈ $'}{token.balance}</div>
        </div>
      </div>
    )
  }
)

export const tokenList: CTokenProps[] = [
    {stock: 'Apple', rwa: 'AAPLc', icon: '/images/tokens/aaplc.png', price: '203.22', up: '2.98', balance: '100.3', state: 'pre'},
    {stock: 'Tesla', rwa: 'TSLAc', icon: '/images/tokens/tslac.png', price: '203.22', up: '2.98', balance: '100.3', state: 'after'},
    {stock: 'NVIDIA', rwa: 'NVIDIAc', icon: '/images/tokens/nvdac.png', price: '203.22', up: '-2.98', lock: 1, balance: '100.3', state: 'open'},
    {stock: 'Amazon', rwa: 'AMZNc', icon: '/images/tokens/amznc.png', price: '203.22', up: '-2.98', lock: 1, balance: '100.3', state: 'lock'},
    {stock: 'Apple', rwa: 'AAPLc', icon: '/images/tokens/aaplc.png', price: '203.22', up: '2.98', balance: '100.3', state: 'pre'},
    {stock: 'Tesla', rwa: 'TSLAc', icon: '/images/tokens/tslac.png', price: '203.22', up: '2.98', balance: '100.3', state: 'after'},
    {stock: 'NVIDIA', rwa: 'NVIDIAc', icon: '/images/tokens/nvdac.png', price: '203.22', up: '-2.98', lock: 1, balance: '100.3', state: 'open'},
    {stock: 'Amazon', rwa: 'AMZNc', icon: '/images/tokens/amznc.png', price: '203.22', up: '-2.98', lock: 1, balance: '100.3', state: 'lock'},
    {stock: 'Apple', rwa: 'AAPLc', icon: '/images/tokens/aaplc.png', price: '203.22', up: '2.98', balance: '100.3', state: 'pre'},
    {stock: 'Tesla', rwa: 'TSLAc', icon: '/images/tokens/tslac.png', price: '203.22', up: '2.98', balance: '100.3', state: 'after'},
    {stock: 'NVIDIA', rwa: 'NVIDIAc', icon: '/images/tokens/nvdac.png', price: '203.22', up: '-2.98', lock: 1, balance: '100.3', state: 'open'},
    {stock: 'Amazon', rwa: 'AMZNc', icon: '/images/tokens/amznc.png', price: '203.22', up: '-2.98', lock: 1, balance: '100.3', state: 'lock'},
  ]

const CTokenList = memo(
  ({ onClick }: { onClick?: (token: CTokenProps) => void}) => {

    const _id = useId()

    const [filterHolding, setFilterHolding] = useState(false)
    const filterTokens = useMemo(() => {
      return filterHolding ? tokenList.filter(token => Number(token.balance) > 0) : tokenList
    }, [tokenList, filterHolding])
    return (
      <div className="min-w-[443px]">
        <div className=" flex items-center">
          <CheckBox onChange={setFilterHolding} />
          <span className=" text-[12px] font-normal ml-1">Holdings Only</span>
        </div>
        <div className="mt-2">
          <div className=" flex items-center justify-between text-[12px] font-normal">
            <div className="w-1/3">Name</div>
            <div className="flex items-center gap-x-[6px] w-1/3">Change <SortButton /></div>
            <div className="w-1/3 text-right">Holdings</div>
          </div>
          {
            filterTokens.slice(0, 6).map((token, index) => <CTokenItem key={`${_id}-${index}`} token={token} onClick={onClick} />)
          }
        </div>
      </div>
    )
  }
)

export { CTokenList }