import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useTranslation } from "@/hooks/useTranslation";
import { languages } from "@/i18n";
import { cn } from "@/utils";
import storage from "@/utils/storage";
import { lazy, useMemo, useState } from "react";
import { IconArrowDown } from "../icons/ArrowDown";
import { useRouter } from "@/hooks/useRouter";

export function SubMenuItem({
  title,
  selected,
  onClick
}: {
  title?: string;
  selected?: boolean;
  onClick?: () => void
}) {
  return (
    <div 
      onClick={() => onClick && onClick()}
      className={cn(
      "flex items-center justify-between py-3 cursor-pointer font-medium",
      selected ? "text-[#FFFFFF] " : "text-[#6C86AD]"
    )}>
      <span className="text-[14px]">{title}</span>
      {
        selected && <img src="/images/icons/selected.png" className="w-3" alt="" />
      }
    </div>
  )
}

type SubMenusProps = {
  title: string;
  active?: boolean
  children?: React.ReactNode
}

export function SubMenus({
  title,
  active,
  children
}: SubMenusProps) {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false)

  const router = useRouter();
  
  const isPro = useMemo(() => router.location.pathname === "/markets/trading", [router])
  const isLite = useMemo(() => router.location.pathname === "/lite-trade", [router])

  return (
    <DropdownMenu
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen)
      }}
    >
      <DropdownMenuTrigger asChild>
        <div className={cn(
          "text-base font-normal text-[rgba(255,255,255,0.6)] cursor-pointer h-10 flex items-center leading-[40px]",
          isPro || isLite ? " font-semibold text-white" : ""
        )}>
          { title }
          <IconArrowDown open={open} />
        </div>
      </DropdownMenuTrigger>
       <DropdownMenuContent align="end" 
          className="bg-[rgba(0,0,0,0)] w-[190px] border-none pt-0"
       >
        <div 
          className="bg-[#131823] rounded-[8px] text-white py-2"
          style={{boxShadow: '0px 5px 15px 0px rgba(0,0,0,0.25)'}}
        >
          <div className=" px-4">
            <SubMenuItem title={t('proTrade')}
              onClick={() => {
                router.push('/markets/trading')
                setOpen(false)
              }}
              selected={isPro}
            />
            <SubMenuItem title={t('instantTrade')}
              onClick={() => {
                router.push('/lite-trade')
                setOpen(false)
              }}
              selected={isLite}
            />
            
          </div>
          
        </div>
        
      </DropdownMenuContent>
      
    </DropdownMenu>
  )
}