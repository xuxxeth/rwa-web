import { memo } from "react"
import { Button } from "../ui/button"
import { useTranslation } from "@/hooks/useTranslation";
import { useActiveWeb3 } from "@/hooks/useActiveWe3";

const ConnectButtonText = memo(
  () => {
    const { t } = useTranslation();
    const { wallets, handleConnect} = useActiveWeb3()
    return (
      <Button className="bg-white text-black w-full"
        onClick={() => {
          handleConnect('inject', wallets[0])
        }}
      >
        { t('Connect Wallet') }
        
      </Button>
    )
  }
)

export { ConnectButtonText }