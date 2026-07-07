import { useTranslation } from "@/hooks/useTranslation";
import { cn } from "@/utils";
import { lazy, useMemo, useState } from "react";
import { IconArrowDown } from "../icons/ArrowDown";
import { useRouter } from "@/hooks/useRouter";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "../ui/hover-card";
import { SubMenuItem } from "./SubMenus";


type SubMenusProps = {
  title: string;
  active?: boolean
  children?: React.ReactNode
}

export function EventsSubMenus({
  title,
  active,
  children
}: SubMenusProps) {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false)

  const router = useRouter();
  
  const isSplits = useMemo(() => router.location.pathname === "/splits", [router.location.pathname])

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
          active ? "text-white" : ""
        )}
          onClick={e => {
            e.stopPropagation()
            e.preventDefault()
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
            <SubMenuItem title={t('events.t2')}
              onClick={() => {
                router.push('/splits')
                setOpen(false)
              }}
              selected={isSplits}
            />
            {/* <SubMenuItem title={t('Lite Trade')}
              onClick={() => {
                router.push('/lite-trade')
                setOpen(false)
              }}
              selected={isLite}
            /> */}
            
          </div>
          
        </div>
        
      </HoverCardContent>
      
    </HoverCard>
  )
}