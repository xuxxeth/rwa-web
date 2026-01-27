import { memo } from "react"
import { Button } from "../ui/button"
import { useTranslation } from "@/hooks/useTranslation";
import { useActiveWeb3 } from "@/hooks/useActiveWe3";
import storage from "@/utils/storage";
import { LATEST_WALLET_UUID } from "@/config/constants";
import { useBaseStore } from "@/stores/baseStore";
import { cn } from "@/lib/utils";

const ConnectButtonText = memo(
  ({ className }: {className?: string}) => {
    const { t } = useTranslation();
    const setShowConnect = useBaseStore(state => state.setShowConnect)
    return (
      <Button className={cn(
        "bg-[#9CFF3A] text-black w-full h-[40px] text-[14px]",
        className
      )}
        onClick={async () => {
          setShowConnect(true)
          // const latestWalletUUID = storage.getItem(LATEST_WALLET_UUID)
          // let wallet = wallets[0]
          // if (latestWalletUUID) {
          //   const _wallet = wallets.find(wallet => wallet.info.name === latestWalletUUID)
          //   if (_wallet) {
          //     wallet = _wallet
          //   }
          // }
          // // @ts-ignore
          // await handleConnect(ConnectorType.Injected, wallet)
        }}
      >
        { t('Connect Wallet') }
        
      </Button>
    )
  }
)

export { ConnectButtonText }