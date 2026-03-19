import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useTranslation } from "@/hooks/useTranslation";
import { languages } from "@/i18n";
import { cn } from "@/utils";
import storage from "@/utils/storage";
import { lazy, useState } from "react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "../ui/hover-card";
import { CA_LANGUAGE } from "@/config/constants";

export function LanguageItem({
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
      "flex items-center justify-between py-3 cursor-pointer font-medium text-white",
    )}>
      <span className="text-[14px]">{title}</span>
      {
        selected && <img src="/images/icons/selected.png" className="w-3" alt="" />
      }
    </div>
  )
}

export function LngSubMenus({
  from
}: {from?: string}) {
  const { t, i18n } = useTranslation();
  const changeLanguage = (lng: string) => {
    storage.setItem(CA_LANGUAGE, lng)
    i18n.changeLanguage(lng);
  };
  const [currentSub, setCurrentSub] = useState(1)
  const [open, setOpen] = useState(false)
  
  return (
    <HoverCard
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen)
      }}
    >
      <HoverCardTrigger asChild>
        <div className=" flex items-center shrink-0">
          <button className={cn(
            "cursor-pointer bg-[#191B1E] rounded-[8px] p-[6px] w-[36px] h-[36px] flex justify-center",
            open ? "bg-[#383A40]" : ""
          )}>
            <img src="/images/v2/icons/language.png" className={cn(
              "w-[24px] h-[24px] lg:w-6 lg:h-6",
              from === 'home' ? ' rounded-full' : ''
            )} alt="" />
          </button>
        </div>
      </HoverCardTrigger>
       <HoverCardContent align="end" 
          className="bg-[rgba(0,0,0,0)] w-[240px] border-none pt-2 -mr-[16px]"
       >
        <div 
          className="bg-[#131416] border border-[#232427] rounded-[8px] text-white relative"
          style={{boxShadow: '0px 5px 15px 0px rgba(0,0,0,0.25)'}}
        >
          <div className="h-[50px] w-[50px] absolute right-0 -top-[50px] bg-[rgba(0,0,0,0)]"></div>
          {
            currentSub === 0 && 
            <div className=" px-5">
              <div className="flex items-center justify-between py-4 cursor-pointer"
                onClick={() => setCurrentSub(1)}
              >
                <span className="text-[14px] font-semibold">{t('Language')}</span>
                <span className="text-[14px] text-[#6C86AD]">{languages[i18n.language]} &gt;</span>
              </div>
            </div>
          }
          
          {/* 语文切换 */}
          {
            currentSub === 1 &&
              <div>
                {/* <div className=" px-4 flex items-center cursor-pointer py-2"
                  onClick={() => setCurrentSub(0)}
                >
                  <img src="/images/icons/back.png" className="w-6" alt="" />
                  <span className="text-sm font-medium ml-2">{t('Back')}</span>
                </div> */}
                <div className=" px-5 py-2">
                  <LanguageItem title="English"  
                    onClick={() => {
                      changeLanguage('en')
                      setOpen(false)
                    }}
                    selected={i18n.language === 'en'}
                  />
                  <LanguageItem title="繁体中文" 
                    onClick={() => {
                      changeLanguage('zh')
                      setOpen(false)
                    }}
                    selected={i18n.language === 'zh'}
                  />
                  
                </div>
              </div>
          }
          
          
        </div>
        
      </HoverCardContent>
      
    </HoverCard>
  )
}