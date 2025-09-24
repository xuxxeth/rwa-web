import { memo } from "react"
import { Button } from "../ui/button"
import { useTranslation } from "@/hooks/useTranslation";
import { useActiveWeb3 } from "@/hooks/useActiveWe3";
import storage from "@/utils/storage";
import { LATEST_WALLET_UUID } from "@/config/constants";

const ConnectButtonText = memo(
  () => {
    const { t } = useTranslation();
    const { wallets, handleConnect} = useActiveWeb3()

    return (
      <Button className="bg-white text-black w-full"
        onClick={async () => {
          const latestWalletUUID = storage.getItem(LATEST_WALLET_UUID)
          let wallet = wallets[0]
          if (latestWalletUUID) {
            const _wallet = wallets.find(wallet => wallet.info.name === latestWalletUUID)
            if (_wallet) {
              wallet = _wallet
            }
          }
          await handleConnect('inject', wallet)
        }}
      >
        { t('Connect Wallet') }
        
      </Button>
    )
  }
)

export { ConnectButtonText }