import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Divide } from "../divide";
import { useTranslation } from "@/hooks/useTranslation";
import { shortenAddress } from "@/utils";
import { useWeb3Active } from "@/hooks/useWeb3Active";


export function ConnectButton() {
  const { t } = useTranslation();
  const { wallets, account, handleConnect, handleDisConnect } = useWeb3Active()

  // 默认执行一次连接钱包操作
  

  return (
    <>
      {
        !account ? 
          <div className="h-[38px] flex items-center px-6 bg-[#9CFF3A] text-sm font-semibold rounded-[100px] cursor-pointer"
            onClick={() => {
              handleConnect('inject', wallets[0])
            }}
          >
            {account || t('Connect Wallet')}
          </div> : 
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="h-[48px] flex items-center px-2 py-1 bg-[rgba(255,255,255,0.1)] text-sm font-semibold rounded-[8px] cursor-pointer text-white"
                onClick={() => {
                }}
              >
                {wallets[0].info.icon && <img src={wallets[0].info.icon} className="w-6 mr-2" alt="" />}
                <div className="w-full h-full bg-[rgba(255,255,255,0.1)] rounded-[6px] px-2 flex items-center justify-center">
                  {shortenAddress(account)}
                </div>
                
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" 
                className="bg-[rgba(0,0,0,0)] w-[230px] border-none pt-2"
            >
              <div 
                className="bg-[#131823] rounded-[8px] pt-4 text-white"
                style={{boxShadow: '0px 5px 15px 0px rgba(0,0,0,0.25)'}}
              >
                <div className=" px-4">
                  <div className="flex items-center justify-between py-3">
                    <div className=" text-sm font-semibold">{shortenAddress(account)}</div>
                    <button className=" cursor-pointer">
                      <img src="./images/icons/copy.png" className="w-[14px] h-[14px]" alt="" />
                    </button>
                  </div>
                  <div className="py-3">
                    <div className="flex items-center">
                      <img src="./images/tokens/usdt.png" className="w-5 h-5" alt="" />
                      <span className="text-[18px] font-semibold ml-2">100.00</span>
                    </div>
                    <div className="text-[#6C86AD] text-sm leading-6">{t('Total USDT Balance')}</div>
                  </div>
                  <div className="flex items-center py-3 cursor-pointer">
                    <img src="./images/icons/assets.png" className="w-[14px] h-[14px]" alt="" />
                    <span className="text-[14px] font-semibold ml-2">{t('My Assets')}</span>
                  </div>
                  <div className="flex items-center py-3 cursor-pointer">
                    <img src="./images/icons/user-check.png" className="w-[14px] h-[14px]" alt="" />
                    <span className="text-[14px] font-semibold ml-2">{t('ID Verification')}</span>
                  </div>
                </div>
                <Divide className="mt-[14px]" />
                <div className=" flex items-center justify-center py-3 cursor-pointer"
                  onClick={() => {
                    handleDisConnect()
                  }}
                >
                  <img src="./images/icons/disconnect.png" className="w-[14px] h-[14px]" alt="" />
                  <div className="ml-2 text-sm font-semibold">{t('Disconnect')}</div>
                </div>
              </div>
              
            </DropdownMenuContent>
            
          </DropdownMenu>
      }
      
      
    </>
  )
}