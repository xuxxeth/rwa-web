import Order from '@/views/assets/v2/Order'
import { useAccount, useChainId } from 'ca-common-web'

export function OrderInTrade() {
  const account = useAccount()
  const chainId = useChainId()

  return (
    <div className='pt-2 flex flex-col max-h-full'>
      <Order
        chainId={chainId}
        account={account}
        showFilter={false}
        tabClassName='mb-2'
        dataMode='scroll'
        allowUserFilter={false}
      />
    </div>
  )
}

export default OrderInTrade
