
import { cn } from "@/lib/utils";
import { CurrencyInput } from "./CurrencyInput";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { useShowDialog, DialogController } from '@/components/dialog/DialogController'
import { CTokenList } from "../../ctoken-list";
import { useTokens } from "@/hooks/useTokens";
import { useRwas } from "@/hooks/useRwaBalances";
import { useTranslation } from "@/hooks/useTranslation";
import { useTradeStore } from "@/stores/tradeStore";
import { useRouter } from "@/hooks/useRouter";
import { TradeType, useChainId } from "ca-common-web";
import { useAppStore } from "@/stores/appStore";

type CurrencyInputPanelProps = {
  mode?: string; // in | out
  from?: string
  label?: string
  placeholder?: string
  value?: string
  regex?: string | RegExp
  isInsufficient?: boolean
  type?: string; // price | size
  tradeType?: TradeType
  onCurrencyClick?: () => void
  onUserInput?: (value: string) => void
}

const CurrencyInputPanel = memo(
  ({ mode = 'in', type, label, placeholder, value, from, regex, isInsufficient, tradeType, onUserInput }: CurrencyInputPanelProps) => {
    const router = useRouter()
    const currentChainId = useAppStore(state => state.currentChainId)
    const inputToken = useTradeStore(state => state.inputToken)
    const outputToken = useTradeStore(state => state.outputToken)
    const updateInputToken = useTradeStore(state => state.updateInputToken)
    const updateOutputToken = useTradeStore(state => state.updateOutputToken)

    const tokenDialog = useShowDialog()
    const tokenList = useTokens()
    const rwaList = useRwas()

    const { t } = useTranslation()
    const [inputFocus, setInputFocus] = useState(false)

    const handleCurrencyClick = useCallback(async () => {
      if (mode === 'in') {
        tokenDialog.setOpen(true)
      }
      
    }, [mode])

    useEffect(() => {
      // 当前链和rwaList里的数据chainId一致，才进行更新操作
      if (!rwaList[0] || !currentChainId) return
      if (rwaList[0] && currentChainId) {
        if (rwaList[0].chainId !== currentChainId) return
      }
      if (!router.params.symbol) {
        rwaList[0] && updateInputToken(rwaList[0])
      } else {
        // 通过symbol查找对应的token
        const _rwa = rwaList.find(rwa => rwa.symbol.toLowerCase() === router.params.symbol?.toLowerCase())
        // 切换链的时候，找到了正常更新，未找到，则返回到市场页
        if (_rwa) {
          updateInputToken(_rwa)
        } else {
          router.push('/markets')
        }
        
      }
    }, [rwaList.length, router.params, currentChainId])

    useEffect(() => {
      if (tokenList[0] && currentChainId) {
        if (tokenList[0].chainId !== currentChainId) return
      }
      if (tokenList[0]) {
        updateOutputToken(tokenList[0])
      }
    }, [tokenList.length, currentChainId])

    return (
      <div className={cn(
        "bg-[#1A1B1E] h-[38px] pl-3 pr-2 border border-[#1A1B1E] flex items-center justify-between",
        mode === "out" ? "border-[#232427] bg-[#131416] rounded-[4px] " : "",
        type === "size" ? "rounded-[4px]" : "rounded-t-[4px]",
        inputFocus ? " border-[rgba(156,255,58,0.8)]" : "",
        tradeType === TradeType.MARKET && mode === "price" ? "bg-[#131416] border-[#232427]" : ""
      )}>
        <div className={cn(
          "text-[#9DA3AF] font-normal shrink-0",
          from === 'markets' ? 'text-[14px]' : 'text-[14px]'
        )}>{label || ''}</div>
        {
          tradeType === TradeType.MARKET && mode === 'price' ? (
            <div className="text-[#9DA3AF] text-[14px] pr-1">{t('v3.t1')}</div>
          ) : (
            <CurrencyInput 
              isInsufficient={isInsufficient}
              value={value}
              placeholder={placeholder}
              disabled={mode === 'out'}
              from={from}
              mode={mode}
              regex={regex}
              onUserInput={onUserInput}
              onCurrencyClick={handleCurrencyClick}
              selectedToken={mode === 'in' ? inputToken : outputToken}
              onFocus={focus => {
                setInputFocus(focus)
              }}
            />
          )
        }
        
        
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
        
      </div>
    )
  }
)

export { CurrencyInputPanel }