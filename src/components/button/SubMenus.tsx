import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useTranslation } from "@/hooks/useTranslation";
import { languages } from "@/i18n";
import { cn } from "@/utils";
import storage from "@/utils/storage";
import { lazy, useState } from "react";

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
      "flex items-center justify-between py-4 cursor-pointer font-semibold",
      selected ? "text-[#FFFFFF] " : "text-[#6C86AD]"
    )}>
      <span className="text-[14px]">{title}</span>
      {
        selected && <img src="/images/icons/selected.png" className="w-3" alt="" />
      }
    </div>
  )
}

export function SubMenus() {
  const { t, i18n } = useTranslation();
  const changeLanguage = (lng: string) => {
    storage.setItem('CA_LANGUAGE', lng)
    i18n.changeLanguage(lng);
  };
  const [currentSub, setCurrentSub] = useState(0)
  
  return (
    <DropdownMenu
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          setTimeout(() => {
            setCurrentSub(0)
          }, 300)
        }
      }}
    >
      <DropdownMenuTrigger asChild>
        <div className=" flex items-center">
          <button className="cursor-pointer">
            <img src="/images/icons/menu.png" className="w-10 h-10" alt="" />
          </button>
        </div>
      </DropdownMenuTrigger>
       <DropdownMenuContent align="end" 
          className="bg-[rgba(0,0,0,0)] w-[220px] border-none pt-2"
       >
        <div 
          className="bg-[#131823] rounded-[8px] text-white"
          style={{boxShadow: '0px 5px 15px 0px rgba(0,0,0,0.25)'}}
        >
          {
            currentSub === 0 && 
            <div className=" px-4">
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
                <div className=" px-4 flex items-center cursor-pointer py-2"
                  onClick={() => setCurrentSub(0)}
                >
                  <img src="./images/icons/back.png" className="w-6" alt="" />
                  <span className="text-sm font-medium ml-2">{t('Back')}</span>
                </div>
                <div className=" px-4">
                  <LanguageItem title="Englist"  
                    onClick={() => changeLanguage('en')}
                    selected={i18n.language === 'en'}
                  />
                  <LanguageItem title="繁体中文" 
                    onClick={() => changeLanguage('zh')}
                    selected={i18n.language === 'zh'}
                  />
                  
                </div>
              </div>
          }
          
          
        </div>
        
      </DropdownMenuContent>
      
    </DropdownMenu>
  )
}