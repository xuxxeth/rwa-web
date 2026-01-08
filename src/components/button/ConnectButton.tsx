import { useEffect, useCallback, useMemo, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import storage from '@/utils/storage'
import { CONNECT_ACCOUNT, CONNECTOR_TYPE, WALLET_UUID } from '@/config/constants'
import { useTranslation } from '@/hooks/useTranslation'
import { useRouter } from '@/hooks/useRouter'
import { useToast } from '@/hooks/useToast'
import { useActiveWeb3 } from '@/hooks/useActiveWe3'
import { ConnectorType, useQrCodeData, type WalletConfig } from '@/hooks/useCaCommon'
import { useBaseStore } from '@/stores/baseStore'
import { useAppStore } from '@/stores/appStore'
import { DialogController } from '@/components/dialog/DialogController'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '../ui/hover-card'
import { Divide } from '../divide'
import { LazyImage } from '../image/LazyImage'
import CopyButton from './copyButton'
import { shortenAddress, formatTokenAmountWithCommas } from '@/utils'
import { useUSDT } from '@/hooks/useTokens'
import { useTokenBalance } from '@/hooks/useTokenBalances'
import { useVerifyTip } from '../market-trading/VerifyIdentity'
import { useSignatureValidStatus } from '@/hooks/useSignature'
import { CircleLoading } from '@/components/loading'
import QRCode from '@/components/qrcode'

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
        <span className='text-[16px] font-semibold'>{wallet.info.name}</span>{' '}
      </div>
      {wallet.detected && (
        <div className=' flex items-center gap-x-2'>
          <span className=' font-normal text-[#6C86AD] text-[14px]'>{t('Detected')}</span>{' '}
          <LazyImage src='/images/icons/arrow-right.png' className='w-[7px]' />{' '}
        </div>
      )}
    </div>
  )
}

/* ================= WalletStatus（按你要求） ================= */

const WalletStatus = {
  IDLE: 'IDLE',
  CONNECTING: 'CONNECTING',
  CONNECTED: 'CONNECTED',
  WRONG_NETWORK: 'WRONG_NETWORK',
} as const

type WalletStatus = (typeof WalletStatus)[keyof typeof WalletStatus]

/* ================= 主组件 ================= */

export function ConnectButton(props: { connectBtnClassName?: string }) {
  const { t } = useTranslation()
  const router = useRouter()
  const { toastSuccess, toastError } = useToast()

  const {
    wallets,
    account,
    chainId,
    handleConnect: rwaHandleConnect,
    handleDisConnect,
    initialized,
  } = useActiveWeb3()

  const chains = useBaseStore(s => s.chainList)
  const showConnect = useBaseStore(s => s.showConnect)
  const setShowConnect = useBaseStore(s => s.setShowConnect)
  const currentWallet = useBaseStore(s => s.currentWallet)
  const setCurrentWallet = useBaseStore(s => s.setCurrentWallet)

  const setIsWalletConnecting = useAppStore(s => s.setIsWalletConnecting)

  const [status, setStatus] = useState<WalletStatus>(WalletStatus.IDLE)
  const prevStatusRef = useRef<WalletStatus>(WalletStatus.IDLE)

  const [connectorType, setConnectorType] = useState<ConnectorType | undefined>(undefined)
  const [hoverOpen, setHoverOpen] = useState(false)

  const isManualConnect = useRef(false)

  const networkText = useMemo(() => chains.map(c => c.displayName).join(' / '), [chains])

  const usdtToken = useUSDT()
  const usdtBalance = useTokenBalance(usdtToken?.symbol ?? '')

  const { verifyTip } = useVerifyTip()
  const [isSignatureValid] = useSignatureValidStatus()

  const [isQrCodeInvalid, setIsQrCodeInvalid] = useState(false)

  const handleConnect = useCallback(
    async (connectorType: ConnectorType, wallet: WalletConfig) => {
      try {
        setIsQrCodeInvalid(false)
        await rwaHandleConnect(connectorType, wallet)
      } catch (error) {
        if (connectorType === ConnectorType.WalletConnect) {
          setIsQrCodeInvalid(true)
        }
      }
    },
    [rwaHandleConnect]
  )

  useEffect(() => {
    if (!account || !chainId) {
      setStatus(WalletStatus.IDLE)
      return
    }

    const supported = chains.some(c => c.id === chainId)

    setStatus(supported ? WalletStatus.CONNECTED : WalletStatus.WRONG_NETWORK)
  }, [account, chainId, chains])

  const hasInitializedRef = useRef(false)
  useEffect(() => {
    if (initialized) {
      hasInitializedRef.current = true
    }
  }, [initialized])

  useEffect(() => {
    const prevStatus = prevStatusRef.current

    switch (status) {
      case WalletStatus.CONNECTED:
        setIsWalletConnecting(false)
        setShowConnect(false)
        storage.setItem(CONNECT_ACCOUNT, account!)

        if (isManualConnect.current) {
          toastSuccess({ title: t('connectSuccess') })
          isManualConnect.current = false
        }
        break

      case WalletStatus.WRONG_NETWORK:
        toastError({
          title: t('switchNetwork', { network: networkText }),
        })
        handleDisConnect()
        break

      case WalletStatus.IDLE:
        setIsWalletConnecting(false)

        if (hasInitializedRef.current && prevStatus === WalletStatus.CONNECTED) {
          toastError({
            title: t('walletDisconnect'),
          })
        }
        break
    }

    prevStatusRef.current = status
  }, [status])

  useEffect(() => {
    if (!wallets.length || account || !initialized) return

    const walletUUID = storage.getItem(WALLET_UUID)
    const connector = storage.getItem(CONNECTOR_TYPE) as ConnectorType | null

    if (!walletUUID || !connector) return

    const wallet = wallets.find(w => w.info.name === walletUUID)
    if (!wallet) return

    if (connector === ConnectorType.Injected && !wallet.detected) {
      return
    }
    setCurrentWallet(wallet)
    setStatus(WalletStatus.CONNECTING)
    setIsWalletConnecting(true)

    handleConnect(connector, wallet)
  }, [wallets, initialized])

  const connectWallet = async (wallet: WalletConfig) => {
    isManualConnect.current = true
    setCurrentWallet(wallet)
    setIsWalletConnecting(true)
    setStatus(WalletStatus.CONNECTING)

    if (wallet.detected) {
      if (!wallet.provider) {
        console.error('Injected wallet missing provider')
        setIsWalletConnecting(false)
        return
      }

      setConnectorType(ConnectorType.Injected)
      storage.setItem(CONNECTOR_TYPE, ConnectorType.Injected)
      storage.setItem(WALLET_UUID, wallet.info.name)

      await handleConnect(ConnectorType.Injected, wallet)
      return
    }

    setConnectorType(ConnectorType.WalletConnect)
    storage.setItem(CONNECTOR_TYPE, ConnectorType.WalletConnect)
    storage.setItem(WALLET_UUID, wallet.info.name)

    await handleConnect(ConnectorType.WalletConnect, wallet)
  }

  const goTo = (path: string) => {
    setHoverOpen(false)
    router.push(path)
  }

  const isShowingQrCode = connectorType === ConnectorType.WalletConnect

  const dialogTitle =
    isShowingQrCode && currentWallet ? (
      <div className='flex items-center justify-center relative'>
        <LazyImage
          onClick={() => setConnectorType(undefined)}
          className='w-6 h-6 absolute left-0 top-0 cursor-pointer'
          src='/images/icons/back.png'
        />
        <span className='text-base font-semibold'>{currentWallet.info.name}</span>
      </div>
    ) : (
      <span className='text-base font-semibold'>{t('Connect Wallet')}</span>
    )

  /* ================= 渲染（UI 原样） ================= */

  return (
    <>
      {!account ? (
        <div
          className={cn(
            'h-[40px] flex items-center px-6 bg-[#9CFF3A] text-sm font-semibold rounded-[8px] cursor-pointer',
            props.connectBtnClassName
          )}
          onClick={() => setShowConnect(true)}
        >
          {t('Connect Wallet')}
        </div>
      ) : (
        <HoverCard open={hoverOpen} onOpenChange={setHoverOpen}>
          <HoverCardTrigger asChild>
            <div className='h-[40px] flex items-center px-2 py-1 bg-[rgba(255,255,255,0.1)] text-sm font-semibold rounded-[8px] cursor-pointer text-white'>
              {currentWallet?.info?.icon && (
                <img src={currentWallet.info.icon} className='w-6 mr-2' />
              )}
              <div className='w-full h-full bg-[rgba(255,255,255,0.1)] rounded-[6px] px-2 flex items-center justify-center'>
                {shortenAddress(account)}
              </div>
            </div>
          </HoverCardTrigger>

          <HoverCardContent
            align='end'
            className='bg-[rgba(0,0,0,0)] w-[230px] border-none pt-2 -mr-[16px]'
          >
            <div
              className='bg-[#131823] rounded-[8px] text-white'
              style={{ boxShadow: '0px 5px 15px 0px rgba(0,0,0,0.25)' }}
            >
              <div className='px-4'>
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

                <div
                  className='flex items-center py-3 cursor-pointer'
                  onClick={() => goTo('identity')}
                >
                  <img src='/images/icons/user-check.png' className='w-[14px] h-[14px]' alt='' />
                  <span className='text-[14px] font-semibold ml-2'>
                    {!isSignatureValid ? t('identity.verifyID') : verifyTip || t('verified')}
                  </span>
                </div>
              </div>

              <Divide />

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
          </HoverCardContent>
        </HoverCard>
      )}

      <DialogController
        topFixed
        open={showConnect}
        openChange={open => {
          setShowConnect(open)

          if (!open) {
            setTimeout(() => {
              setConnectorType(undefined)
            }, 500)
          }
        }}
        title={dialogTitle}
      >
        <div className='rounded-[8px] pt-4 text-white w-[402px]'>
          {connectorType === ConnectorType.WalletConnect ? (
            <QrCodeView
              refresh={() => handleConnect(ConnectorType.WalletConnect, currentWallet)}
              currentWallet={currentWallet}
              isQrCodeInvalid={isQrCodeInvalid}
            />
          ) : (
            <div className='px-4'>
              {wallets.map(wallet => (
                <WalletItem
                  key={wallet.info.name}
                  wallet={wallet}
                  onClick={() => connectWallet(wallet)}
                />
              ))}
            </div>
          )}
        </div>
      </DialogController>
    </>
  )
}

function QrCodeView({
  isQrCodeInvalid,
  currentWallet,
  refresh,
}: {
  currentWallet: WalletConfig
  isQrCodeInvalid: boolean
  refresh: () => void
}) {
  const { t } = useTranslation()
  const qrCodeData = useQrCodeData()

  return (
    <>
      <div className='px-4'>
        <div className='text-white items-center justify-center'>
          <div className='relative m-auto w-[256px] h-[256px] border border-white/10 rounded-xl overflow-hidden flex items-center justify-center'>
            {qrCodeData.dataUrl ? (
              <img src={qrCodeData.dataUrl} className='w-full h-full' alt='' />
            ) : isQrCodeInvalid ? (
              <>
                <QRCode value='connect error, qrcode invalide, please reconnect' size={256} />
                <div className='w-full h-full absolute inset-0 bg-black/80 flex flex-row items-center justify-center'>
                  <div className='relative w-[150px] flex flex-row items-center justify-center'>
                    <button
                      onClick={refresh}
                      className='w-[62px] h-[62px] cursor-pointer bg-[#1D1D1D] rounded-lg disabled:cursor-not-allowed'
                    >
                      <LazyImage
                        src='/images/icons/identity/refresh.png'
                        className='w-[23px] h-7 m-auto'
                      />
                      <div className='absolute left-0 w-full bottom-[-30px] text-[10px] text-white'>
                        <span className='text-base'>{t(`identity.face.fresh`)}</span>
                      </div>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              // <div className='ami-shimmer w-full h-full bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.6)_50%,transparent_100%)]'></div>
              <CircleLoading />
            )}
          </div>
          <div className='text-base/6 text-center font-normal mt-4'>{t('scanCode')}</div>
        </div>
      </div>
    </>
  )
}
