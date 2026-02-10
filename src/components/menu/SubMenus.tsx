import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useTranslation } from "@/hooks/useTranslation";
import { languages } from "@/i18n";
import { cn } from "@/utils";
import storage from "@/utils/storage";
import { lazy, useMemo, useState } from "react";
import { IconArrowDown } from "../icons/ArrowDown";
import { useRouter } from "@/hooks/useRouter";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "../ui/hover-card";

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
      "flex items-center justify-between py-3 cursor-pointer font-medium hover:bg-[#191B1E] px-5",
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
  
  const isPro = useMemo(() => router.location.pathname === "/trade", [router])
  const isLite = useMemo(() => router.location.pathname === "/lite-trade", [router])

  return (
    <HoverCard
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen)
      }}
    >
      <HoverCardTrigger asChild>
        <div className={cn(
          "text-[14px] font-medium text-[#9DA3AF] cursor-pointer h-[36px] flex items-center leading-[36px] ",
          isPro || isLite ? "" : ""
        )}
          onClick={e => {
            e.stopPropagation()
            e.preventDefault()
            console.log(open)
          }}
        >
          { title }
          <IconArrowDown open={open} />
        </div>
      </HoverCardTrigger>
       <HoverCardContent align="end" 
          className="bg-[rgba(0,0,0,0)] w-[190px] border-none pt-0 -mr-[16px]"
       >
        <div 
          className="bg-[#131416] border border-[#232427] rounded-[8px] text-white py-2 relative"
          style={{boxShadow: '0px 5px 15px 0px rgba(0,0,0,0.25)'}}
        >
          <div className="h-[50px] w-[60px] absolute right-0 -top-[50px] bg-[rgba(0,0,0,0)]"></div>
          <div className="">
            <SubMenuItem title={t('proTrade')}
              onClick={() => {
                router.push('/trade')
                setOpen(false)
              }}
              selected={isPro}
            />
            <SubMenuItem title={t('Lite Trade')}
              onClick={() => {
                router.push('/lite-trade')
                setOpen(false)
              }}
              selected={isLite}
            />
            
          </div>
          
        </div>
        
      </HoverCardContent>
      
    </HoverCard>
  )
}