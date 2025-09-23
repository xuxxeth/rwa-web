import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Divide } from "../divide";
import { useTranslation } from "@/hooks/useTranslation";
import { shortenAddress } from "@/utils";
import { useActiveWeb3 } from "@/hooks/useActiveWe3";
import { useEffect, useMemo, useRef, useState } from "react";
import storage from "@/utils/storage";
import { CONNECTOR_TYPE, WALLET_UUID } from "@/config/constants";
import { cn } from "@/lib/utils";
import { bscTestnet, useChainId, useChains, xLayerTestnet } from "@/hooks/useCaCommon";
import { useToast } from "@/hooks/useToast";
import { useShowDialog, DialogController } from '@/components/dialog/DialogController'

export function WalletItem({
  wallet,
  selected,
  onClick
}: {
  wallet: any;
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
      <div className="flex items-center">
        {wallet.info.icon && <img src={wallet.info.icon} className="w-6 mr-2" alt="" />}
        <span className="text-[14px]">{wallet.info.name}</span>
      </div>
      
      {
        selected && <img src="./images/icons/selected.png" className="w-3" alt="" />
      }
    </div>
  )
}



export function ConnectButton() {
  const { t } = useTranslation();
  const { toastSuccess, toastError } = useToast()
  const { wallets, account, handleConnect, handleDisConnect } = useActiveWeb3()
  const chains = [bscTestnet, xLayerTestnet]
  const walletDialog = useShowDialog()
  // const chains = useChains()
  const chainId = useChainId()
  const [open, setOpen] = useState(false)
  const [currentWallet, setCurrentWallet] = useState<any>({})
  const hasConnected = useRef<boolean>(false)
  // 默认执行一次连接钱包操作
  useEffect(() => {
    if (wallets.length > 0 && !account && !hasConnected.current) {
      const walletUUID = storage.getItem(WALLET_UUID)
      const connectorType = storage.getItem(CONNECTOR_TYPE)
      if (walletUUID && connectorType) {
        const wallet = wallets.find(wallet => wallet.info.name === walletUUID)
        if (wallet) {
          hasConnected.current = true
          setCurrentWallet(wallet)
          handleConnect(connectorType, wallet)
        }
      }
    }
  }, [wallets, chains, account, handleConnect])

  return (
    <>
      {
        !account ? 
          <div className="h-[40px] flex items-center px-6 bg-[#9CFF3A] text-sm font-semibold rounded-[8px] cursor-pointer"
            onClick={() => {
              walletDialog.show()
            }}
          >
            {account || t('Connect Wallet')}
          </div>
           : 
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="h-[40px] flex items-center px-2 py-1 bg-[rgba(255,255,255,0.1)] text-sm font-semibold rounded-[8px] cursor-pointer text-white"
                onClick={() => {
                }}
              >
                {currentWallet?.info?.icon && <img src={currentWallet?.info?.icon} className="w-6 mr-2" alt="" />}
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
      
      <DialogController
          topFixed
          title="Select a wallet"
          open={walletDialog.open}
          openChange={walletDialog.setOpen}
        > 
          <div 
            className="rounded-[8px] pt-4 text-white"
          >
            <div className=" px-4">
              {
                wallets.map((wallet) => {
                  return (
                    <WalletItem 
                      key={wallet.info.uuid} 
                      wallet={wallet}
                      onClick={async () => {
                        setOpen(false)
                        // @ts-ignore
                        const chainId = parseInt(wallet.provider.chainId, 16)
                        const chain = chains.find(chain => Number(chain.id) === chainId)
                        if (chain) {
                          await handleConnect('inject', wallet)
                          setCurrentWallet(wallet)
                          walletDialog.hide()
                        } else {
                          toastError({title: 'Please switch your wallet to the bsc smart test chain'})
                        }
                        
                        // 

                      }}
                    />
                  )
                })
              }
            </div>
            
          </div>
      </DialogController>
    </>
  )
}