import { useActiveWeb3 } from '@/hooks/useActiveWe3'

import { NoAccountPage } from './NoAccountPage'
import AccountPage from './AccountPage'
import { AutoBindDialog } from './components/AutoBindDialog'
import { useAppStore } from '@/stores/appStore'

export const Referral = () => {
  const isWalletConnecting = useAppStore(state => state.isWalletConnecting)
  const { account } = useActiveWeb3()

  if (isWalletConnecting) {
    return null
  }

  return (
    <>
      {!account ? <NoAccountPage /> : <AccountPage />}
      <AutoBindDialog />
    </>
  )
}

export default Referral
