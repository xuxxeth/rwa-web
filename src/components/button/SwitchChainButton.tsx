import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useEffect, useId, useMemo, useState } from "react";
import { cn } from "@/utils";
import storage from "@/utils/storage";
import { getChainIconById } from "@/utils/chains";
import { useBaseStore } from "@/stores/baseStore";
import { useTranslation } from "@/hooks/useTranslation";

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
      "flex items-center justify-between py-3 cursor-pointer font-semibold",
      selected ? "text-[#FFFFFF] " : "text-[#6C86AD]"
    )}>
      <div className="flex items-center">
        <img src={icon} className="w-6 mr-2" alt="" />
        <span className={cn(
          "text-[14px]",
          disabled ? "text-[#6C86AD]" : ""
        )}>{title}</span>
      </div>
      
      {
        selected && <img src="/images/icons/selected.png" className="w-3" alt="" />
      }
      {
        disabled && <div className="text-[10px] text-[#26C0E2] h-[19px] px-[8px] flex items-center rounded-[4px] bg-[rgba(38,192,226,0.1)]">{t('Coming Soon')}</div>
      }
    </div>
  )
}


export function SwitchButton() {
  const baseStore = useBaseStore()
  const chains = useMemo(() => baseStore.chainList, [baseStore.chainList])
  const [open, setOpen] = useState(false)

  const [selected, setSelected] = useState<typeof chains[0] | null>(null)

  useEffect(() => {
    if (chains[0]) {
      const _chainId = storage.getItem('CA_CHAIN_ID') || chains[0].id
      setSelected(chains.find(chain => chain.id === _chainId) || chains[0])
    }
    
  }, [chains])

  return (
    <DropdownMenu
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen)
      }}
    >
      <DropdownMenuTrigger asChild
      >
        {
          selected ? 
          <div className="h-[40px] flex items-center p-2 bg-[rgba(255,255,255,0.04)] text-sm font-semibold rounded-[8px] cursor-pointer text-white"
            
          >
            <img src={getChainIconById(String(selected.id))} className="w-6 mr-2 rounded-full" alt="" />
            <span >{selected.name}</span>
            <img src="/images/icons/down.png" className={cn(
              "w-3 ml-4 mr-2 transition-all",
              open ? ' rotate-180' : ''
            )} alt="" />
          </div> : null
        }
        
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" 
          className="bg-[rgba(0,0,0,0)] w-[230px] border-none pt-2"
       >
        <div 
          className="bg-[#131823] rounded-[8px] py-4 text-white"
          style={{boxShadow: '0px 5px 15px 0px rgba(0,0,0,0.25)'}}
        >
          <div className=" px-4">
            {
              chains.map((chain) => {
                return (
                  <ChainItem 
                    key={chain.id} 
                    title={chain.name} 
                    icon={chain.icon}
                    disabled={chain.state === 0}
                    selected={selected?.id === chain.id} 
                    onClick={() => {
                      setOpen(false)
                      setSelected(chain)
                    }}
                  />
                )
              })
            }
          </div>
          
        </div>
        
      </DropdownMenuContent>
      
    </DropdownMenu>
  )
}