import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Divide } from '../divide'
import { useTranslation } from '@/hooks/useTranslation'
import { formatTokenAmountWithCommas, shortenAddress } from '@/utils'
import { useActiveWeb3 } from '@/hooks/useActiveWe3'
import { useEffect, useMemo, useRef, useState } from 'react'
import storage from '@/utils/storage'
import { CONNECT_ACCOUNT, CONNECTOR_TYPE, WALLET_UUID } from '@/config/constants'
import { cn } from '@/lib/utils'
import {
  ConnectorType,
  useQrCodeData,
  type WalletConfig,
} from '@/hooks/useCaCommon'
import { useToast } from '@/hooks/useToast'
import { DialogController } from '@/components/dialog/DialogController'
import { LazyImage } from '../image/LazyImage'
import { useUSDT } from '@/hooks/useTokens'
import CopyButton from './copyButton'
import { useTokenBalance } from '@/hooks/useTokenBalances'
import { useBaseStore } from '@/stores/baseStore'
import { useRouter } from '@/hooks/useRouter'

export function WalletItem({
  wallet,
  selected,
  onClick,
}: {
  wallet: any
  selected?: boolean
  onClick?: () => void
}) {
  const { t } = useTranslation()

  return (
    <div
      onClick={() => onClick && onClick()}
      className={cn(
        'flex items-center justify-between py-4 cursor-pointer font-semibold text-[#FFFFFF] hover:bg-[#10141C] rounded-[8px] p-4'
      )}
    >
      <div className='flex items-center'>
        {wallet.info.icon && (
          <img src={wallet.info.icon} className='w-[40px] h-[40px] mr-4' alt='' />
        )}
        <span className='text-[16px] font-semibold'>{wallet.info.name}</span>
      </div>

      {wallet.detected && (
        <div className=' flex items-center gap-x-2'>
          <span className=' font-normal text-[#6C86AD] text-[14px]'>{t('Detected')}</span>
          <LazyImage src='/images/icons/arrow-right.png' className='w-[7px]' />
        </div>
      )}
    </div>
  )
}

export function ConnectButton(props: { connectBtnClassName?: string }) {
  const { t } = useTranslation()
  const router = useRouter()
  const { toastError } = useToast()
  const { wallets, chainId, account, handleConnect, handleDisConnect } = useActiveWeb3()
  const chains = useBaseStore(state => state.chainList)
  const showConnect = useBaseStore(state => state.showConnect)
  const setShowConnect = useBaseStore(state => state.setShowConnect)

  const currentWallet = useBaseStore(state => state.currentWallet)
  const setCurrentWallet = useBaseStore(state => state.setCurrentWallet)
  const hasConnected = useRef<boolean>(false)
  const [connectorType, setConnectorType] = useState<ConnectorType | undefined>()

  const usdtToken = useUSDT()
  const usdtBalance = useTokenBalance(usdtToken?.symbol ?? '')

  const network = useMemo(() => chains.map(chain => chain.displayName).join(' / '), [chains]) 
  const connectInit = useRef<boolean>(false)
  // 默认执行一次连接钱包操作
  useEffect(() => {
    if (wallets.length > 0 && !account && !hasConnected.current) {
      const walletUUID = storage.getItem(WALLET_UUID)
      const connectorType = storage.getItem(CONNECTOR_TYPE)
      if (walletUUID && connectorType) {
        const wallet = wallets.find(wallet => wallet.info.name === walletUUID)

        if(!wallet) return
        if(connectorType === ConnectorType.Injected && !wallet.detected) return

        hasConnected.current = true
        setCurrentWallet(wallet)
        // @ts-ignore
        handleConnect(connectorType, wallet)
      }
    }
    if (account) {
      storage.setItem(CONNECT_ACCOUNT, account)
      setTimeout(() => {
        connectInit.current = true
      }, 1000)
    }
  }, [wallets, chainId, account, handleConnect])

  useEffect(() => {
    if (account && connectInit.current) {
      // 判断chainId是不是支持的链
      const chain = chains.find(chain => chain.id === chainId)
      if (!chain) {
        handleDisConnect()
        // 请切换到支持的链
        toastError({
          title: t('switchNetwork', { network: network }),
        })
      }
    }
  }, [account, chainId, chains, handleDisConnect])

  useEffect(() => {
    if (account && showConnect) {
      setShowConnect(false)
    }
    if (account && connectorType) {
      setConnectorType(undefined)
    }
  }, [account])

  useEffect(() => {
    if (!showConnect) {
      setConnectorType(undefined)
    }
  }, [showConnect])

  const isShwoingQrCode = connectorType === ConnectorType.WalletConnect
  const dialogTitle =
    isShwoingQrCode && currentWallet ? (
      <div className='flex items-center justify-center relative'>
        <LazyImage
          onClick={() => setConnectorType(undefined)}
          className='w-6 h-6 absolute left-0 top-0 cursor-pointer'
          src='/images/icons/back.png'
        />
        <span className='text-base/6 font-semibold'>{currentWallet.info.name}</span>
      </div>
    ) : (
      <span className='text-base/6 font-semibold'>{t('Connect Wallet')}</span>
    )

  const goTo = (action: string) => {
    if (action === 'assets') {
      router.push('/assets')
    }
  }

  return (
    <>
      {!account ? (
        <div
          className={cn(
            'h-[40px] flex items-center px-6 bg-[#9CFF3A] text-sm font-semibold rounded-[8px] cursor-pointer',
            props.connectBtnClassName
          )}
          onClick={() => {
            setShowConnect(true)
          }}
        >
          {account || t('Connect Wallet')}
        </div>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div
              className='h-[40px] flex items-center px-2 py-1 bg-[rgba(255,255,255,0.1)] text-sm font-semibold rounded-[8px] cursor-pointer text-white'
              onClick={() => {}}
            >
              {currentWallet?.info?.icon && (
                <img src={currentWallet?.info?.icon} className='w-6 mr-2' alt='' />
              )}
              <div className='w-full h-full bg-[rgba(255,255,255,0.1)] rounded-[6px] px-2 flex items-center justify-center'>
                {shortenAddress(account)}
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align='end'
            className='bg-[rgba(0,0,0,0)] w-[230px] border-none pt-2'
          >
            <div
              className='bg-[#131823] rounded-[8px] pt-4 text-white'
              style={{ boxShadow: '0px 5px 15px 0px rgba(0,0,0,0.25)' }}
            >
              <div className=' px-4'>
                <div className='flex items-center justify-between py-3'>
                  <div className=' text-sm font-semibold'>{shortenAddress(account)}</div>
                  <CopyButton copyText={account} />
                </div>
                <div className='py-3'>
                  <div className='flex items-center'>
                    <img src='/images/tokens/usdt.png' className='w-5 h-5' alt='' />
                    <span className='text-[18px] font-semibold ml-2'>
                      {formatTokenAmountWithCommas(
                        usdtBalance?.balance ?? '0',
                        usdtToken?.precision
                      )}
                    </span>
                  </div>
                  <div className='text-[#6C86AD] text-sm leading-6'>{t('Total USDT Balance')}</div>
                </div>
                <div
                  className='flex items-center py-3 cursor-pointer'
                  onClick={() => goTo('assets')}
                >
                  <img src='/images/icons/assets.png' className='w-[14px] h-[14px]' alt='' />
                  <span className='text-[14px] font-semibold ml-2'>{t('My Assets')}</span>
                </div>
                <div className='flex items-center py-3 cursor-pointer'>
                  <img src='/images/icons/user-check.png' className='w-[14px] h-[14px]' alt='' />
                  <span className='text-[14px] font-semibold ml-2'>{t('ID Verification')}</span>
                </div>
              </div>
              <Divide className='mt-[14px]' />
              <div
                className=' flex items-center justify-center py-3 cursor-pointer'
                onClick={async () => {
                  await handleDisConnect()
                }}
              >
                <img src='/images/icons/disconnect.png' className='w-[14px] h-[14px]' alt='' />
                <div className='ml-2 text-sm font-semibold'>{t('Disconnect')}</div>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      <DialogController topFixed title={dialogTitle} open={showConnect} openChange={setShowConnect}>
        <div className='rounded-[8px] pt-4 text-white w-[402px]'>
          {connectorType === ConnectorType.WalletConnect ? (
            <QrCodeView currentWallet={currentWallet} />
          ) : (
            <div className='px-4'>
              {wallets.map(wallet => {
                return (
                  <WalletItem
                    key={wallet.info.name}
                    wallet={wallet}
                    onClick={async () => {
                      setCurrentWallet(wallet)

                      // 已检测到钱包，使用插件钱包直接连接
                      if (wallet.detected) {
                        // @ts-ignore
                        const chainId = parseInt(wallet.provider.chainId, 16)
                        const chain = chains.find(chain => Number(chain.id) === chainId)
                        if (chain) {
                          // @ts-ignore
                          setConnectorType(ConnectorType.Injected)
                          await handleConnect(ConnectorType.Injected, wallet)
                          hasConnected.current = true
                          setCurrentWallet(wallet)
                        } else {
                          toastError({
                            title: t('switchNetwork', { network: network }),
                          })
                        }
                      }

                      // 未检测到钱包，使用 WalletConnect 连接
                      if (!wallet.detected) {
                        setConnectorType(ConnectorType.WalletConnect)
                        await handleConnect(ConnectorType.WalletConnect, wallet)
                        hasConnected.current = true
                      }
                    }}
                  />
                )
              })}
            </div>
          )}
        </div>
      </DialogController>
    </>
  )
}

function QrCodeView(props: { currentWallet: WalletConfig }) {
  const { t } = useTranslation()
  const qrCodeData = useQrCodeData()

  return (
    <>
      <div className='px-4'>
        <div className='text-white items-center justify-center'>
          <div className='relative m-auto w-[256px] h-[256px] border border-white/10 rounded-xl overflow-hidden'>
            {qrCodeData.dataUrl ? (
              <img src={qrCodeData.dataUrl} className='w-full h-full' alt='' />
            ) : (
              <div className='ami-shimmer w-full h-full bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.6)_50%,transparent_100%)]'></div>
            )}
          </div>
          <div className='mt-4 text-base/6 text-center font-normal mt-4'>{t('scanCode')}</div>
        </div>
      </div>
    </>
  )
}
