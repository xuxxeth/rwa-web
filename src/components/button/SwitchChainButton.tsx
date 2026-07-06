import { useEffect, useId, useMemo, useState } from "react";
import { cn } from "@/utils";
import storage from "@/utils/storage";
import { getChainIconById } from "@/utils/chains";
import { useBaseStore } from "@/stores/baseStore";
import { useTranslation } from "@/hooks/useTranslation";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "../ui/hover-card";
import { useActiveWeb3 } from "@/hooks/useActiveWe3";
import { useAppStore } from "@/stores/appStore";
import { LAST_CONNECTED_CHAIN_ID } from "@/config/storage";

export function ChainItem({
  title,
  icon,
  selected,
  disabled,
  onClick
}: {
  title?: string;
  icon?: string;
  disabled?: boolean;
  selected?: boolean;
  onClick?: () => void
}) {
  const { t } = useTranslation()
  return (
    <div 
      onClick={() => onClick && onClick()}
      className={cn(
      "flex items-center justify-between py-3 cursor-pointer font-medium ",
      selected ? "text-[#FFFFFF] " : "text-[#6C86AD]"
    )}>
      <div className="flex items-center">
        <div className="w-6 h-6 mr-2">
          <img src={icon} className="w-6 h-6 rounded-full" alt="" />
        </div>

        <span className={cn(
          "text-[14px]",
          disabled ? "text-[#909090]" : ""
        )}>{title}</span>
      </div>
      
      {
        selected && <img src="/images/icons/selected.png" className="w-3" alt="" />
      }
      {
        disabled && <div className="text-[10px] text-[#4779FF] h-[16px] px-[8px] flex items-center rounded-[4px] bg-[rgba(71,121,255,0.1)]">{t('Coming Soon')}</div>
      }
    </div>
  )
}


export function SwitchButton() {
  const { handleSwitchChain, isChainSupported, chainId } = useActiveWeb3()
  const chains = useBaseStore(state => state.chainList)
  const [open, setOpen] = useState(false)

  const setCurrentChain = useBaseStore(state => state.setCurrentChain)
  const setCurrentChainId = useAppStore(state => state.setCurrentChainId)
  const currentChainId = useAppStore(state => state.currentChainId)

  const currentChain = useMemo(() => {
    return chains.filter(chain => chain.state === 1).find(chain => chain.id === currentChainId)
  }, [chains, currentChainId])

  useEffect(() => {
    if (chains[0]) {
      const _chainId = Number(storage.getItem(LAST_CONNECTED_CHAIN_ID) || chains[0].id)
      const chain = chains.filter(chain => chain.state === 1).find(chain => chain.id === _chainId)
      if (chain && chain.state === 1) {
        handleSwitchChain(chain.id)
      } else {
        handleSwitchChain(chains[0].id)
      }
    }
  }, [chains])

  // 如果真实钱包chain切换，则更新当前链
  useEffect(() => {
    if (chainId && isChainSupported && chains[0]) {
      const chain = (chains.filter(chain => chain.state === 1).find(chain => chain.id === chainId)) || chains[0]
      if (chain) {
        storage.setItem(LAST_CONNECTED_CHAIN_ID, String(chain.id))
        setCurrentChainId(chainId)
        setCurrentChain(chain)
      }
    }
  }, [chains, chainId, isChainSupported])

  return (
    <HoverCard
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen)
      }}
    >
      <HoverCardTrigger asChild
      >
        {
          currentChain ? 
          <div className={cn(
            "h-[36px] flex items-center p-2 bg-[#191B1E] text-sm font-medium rounded-[8px] cursor-pointer text-white",
            open ? "bg-[#383A40]" : ""
          )}
            
          >
            <img src={currentChain.icon} className="w-6 mr-1 rounded-full" alt="" />
            <span >{currentChain.displayName}</span>
            <img src="/images/icons/down.png" className={cn(
              "w-3 ml-4 mr-2 transition-all",
              open ? ' rotate-180' : ''
            )} alt="" />
          </div> : null
        }
        
      </HoverCardTrigger>
      <HoverCardContent align="end" 
          className="bg-[rgba(0,0,0,0)] min-w-[340px] border-none pt-2 -mr-[16px]"
       >
        <div 
          className="bg-[#131416] border border-[#232427] rounded-[8px] py-4 text-white relative"
        >
          <div className="h-[50px] absolute left-0 right-0 -top-[50px] bg-[rgba(0,0,0,0)]"></div>
          <div className=" px-4">
            {
              chains.map((chain) => {
                return (
                  <ChainItem 
                    key={chain.id} 
                    title={chain.displayName} 
                    icon={chain.icon}
                    disabled={chain.state === 0}
                    selected={currentChain?.id === chain.id} 
                    onClick={() => {
                      if (chain.state !== 0) {
                        setOpen(false)
                        handleSwitchChain(chain.id)
                          .then((res) => {
                            if (!res) {
                              storage.setItem(LAST_CONNECTED_CHAIN_ID, String(chain.id))
                              setCurrentChain(chain)
                              setCurrentChainId(chain.id)
                            }
                            
                          })
                        
                      }
                      
                    }}
                  />
                )
              })
            }
          </div>
          
        </div>
        
      </HoverCardContent>
      
    </HoverCard>
  )
}