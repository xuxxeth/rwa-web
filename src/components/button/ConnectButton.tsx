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
import { shortenAddress } from '@/utils'
import { useVerifyTip } from '../market-trading/VerifyIdentity'
import { useSignatureValidStatus } from '@/hooks/useSignature'
import { CircleLoading } from '@/components/loading'
import QRCode from '@/components/qrcode'
import { useKycStatus } from '@/hooks/useKycStatus'
import { KYC_OVERALL_STATUS } from '@/service/kyc/types'
import { usePendingStep } from '@/hooks/usePendingStep'

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

const WalletStatus = {
  IDLE: 'IDLE',
  CONNECTING: 'CONNECTING',
  CONNECTED: 'CONNECTED',
  WRONG_NETWORK: 'WRONG_NETWORK',
} as const

type WalletStatus = (typeof WalletStatus)[keyof typeof WalletStatus]

export function ConnectButton(props: { connectBtnClassName?: string }) {
  const { t } = useTranslation()
  const router = useRouter()
  const { toastSuccess, toastError, toastWarning, toastInfo } = useToast()
  const {
    wallets,
    account,
    chainId,
    handleConnect: rwaHandleConnect,
    handleDisConnect,
    handleSwitchChain,
    initialized,
    isSameChain
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
  const isMobile = useMemo(() => /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent), [])

  const networkText = useMemo(() => chains.map(c => c.displayName).join(' / '), [chains])

  const { verifyTip } = useVerifyTip()
  const [isSignatureValid] = useSignatureValidStatus()
  const [isQrCodeInvalid, setIsQrCodeInvalid] = useState(false)

  const { kycStatus } = useKycStatus()
  const pendingStep = usePendingStep()

  const handleConnect = useCallback(
    async (connectorType: ConnectorType, wallet: WalletConfig) => {
      try {
        setIsQrCodeInvalid(false)
        await rwaHandleConnect(connectorType, wallet)
      } catch (error) {
        if (connectorType === ConnectorType.WalletConnect) {
          setIsQrCodeInvalid(true)
        }
      } finally {
        setIsWalletConnecting(false)
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
    if (initialized && account && chainId) {
      hasInitializedRef.current = true
    }
  }, [initialized, account, chainId])

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
        
        if (chains[0]) {
          handleSwitchChain(chains[0].id)
            .then(res => {
              if (res) {
                // window.location.reload()
              } else {
                toastError({
                  title: t('switchNetwork', { network: networkText }),
                })
              }
            })
        } else {
          toastError({
            title: t('switchNetwork', { network: networkText }),
          })
        }
        
        // handleDisConnect()
        break

      // case WalletStatus.IDLE:
      //   if (!isRestoringRef.current && hasInitializedRef.current && prevStatus === WalletStatus.CONNECTED) {
      //     toastError({
      //       title: t('walletDisconnect'),
      //     })
      //   }
      //   break
    }

    prevStatusRef.current = status
  }, [status])

  useEffect(() => {
    if (!wallets.length || account || !initialized) return

    const walletUUID = storage.getItem(WALLET_UUID)
    const connector = storage.getItem(CONNECTOR_TYPE) as ConnectorType | null

    // 默认 isWalletConnecting 为 true, 如果发现不需要重连，把 isWalletConnecting 设为 false
    if (!walletUUID || !connector) {
      setIsWalletConnecting(false)
      return
    }

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

    if (wallet.detected || isMobile) {
      if (!wallet.provider) {
        setIsWalletConnecting(false)
        return
      }

      setConnectorType(ConnectorType.Injected)

      await handleConnect(ConnectorType.Injected, wallet)
      return
    }

    setConnectorType(ConnectorType.WalletConnect)

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

  return (
    <>
      {(!account || !isSameChain) ? (
        <div
          className={cn(
            'h-[36px] flex items-center px-6 bg-[#9CFF3A] text-sm font-medium rounded-[8px] cursor-pointer',
            props.connectBtnClassName
          )}
          onClick={() => {
            setShowConnect(true)
            setHoverOpen(false)
            // toastTxSteps({duration: 100000, action: 'cancel', approveed: true})
          }}
          onMouseEnter={e => {
            e.stopPropagation()
            e.preventDefault()
            setHoverOpen(false)
          }}
          onMouseOver={e => {
            e.stopPropagation()
            e.preventDefault()
          }}
        >
          {t('Connect Wallet')}
        </div>
      ) : (
        <HoverCard open={hoverOpen} onOpenChange={setHoverOpen}>
          <HoverCardTrigger asChild>
            <div className={cn(
              'h-[36px] flex items-center px-2 py-1 bg-[#191B1E] text-sm font-semibold rounded-[8px] cursor-pointer text-white',
              hoverOpen ? "bg-[#383A40]" : ""
            )}>
              {currentWallet?.info?.icon && (
                <img src={currentWallet.info.icon} className='w-6 mr-2' />
              )}
              <div className='w-full h-full rounded-[6px] px-2 flex items-center justify-center'>
                {shortenAddress(account)}
              </div>
            </div>
          </HoverCardTrigger>

          <HoverCardContent
            align='end'
            className='bg-[rgba(0,0,0,0)] w-[240px] border-none pt-2 -mr-[16px]'
          >
            <div
              className='bg-[#131416] border border-[#232427] rounded-[8px] pt-2 text-white'
            >
              <div className='px-5 pb-2'>
                <div className='flex items-center justify-between py-3'>
                  <div className=' text-sm font-medium'>{shortenAddress(account)}</div>
                  <CopyButton copyText={account} />
                </div>

                {/* <div className='py-3'>
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
                </div> */}
                <div
                  className='flex items-center py-3 cursor-pointer'
                  onClick={() => goTo('identity')}
                >
                  <div className={cn(
                    ' flex items-center h-[23px] rounded-[4px] px-[6px] ',
                    kycStatus === KYC_OVERALL_STATUS.VERIFIED && !pendingStep.step ? 'bg-[#25A750]' :
                    (kycStatus === KYC_OVERALL_STATUS.ISSUE) ? 'bg-[#CA3F64]' : 'bg-[#FFB219]'
                  )}>
                    <img src={
                      kycStatus === KYC_OVERALL_STATUS.VERIFIED ? '/images/v2/icons/verify.png' :
                      (kycStatus === KYC_OVERALL_STATUS.ISSUE || pendingStep.step) ? '/images/v2/icons/issue.png' : '/images/v2/icons/unverify.png'
                    } className='w-[20px] h-[14px]' alt='' />
                    <span className='text-[12px] font-medium ml-1 text-black'>
                      {!isSignatureValid ? t('identity.verifyID') : verifyTip || t('verified')}
                    </span>
                  </div>
                  
                </div>
                <div
                  className='flex items-center py-3 cursor-pointer'
                  onClick={() => goTo('portfolio')}
                >
                  <img src='/images/v2/icons/assets.png' className='w-[16px] h-[16px]' alt='' />
                  <span className='text-[14px] font-medium ml-2'>{t('v2.hd.h2')}</span>
                </div>
                <div
                  className='flex items-center py-3 cursor-pointer'
                  onClick={() => goTo('order')}
                >
                  <img src='/images/v2/icons/order.png' className='w-[16px] h-[16px]' alt='' />
                  <span className='text-[14px] font-medium ml-2'>{t('v2.hd.h1')}</span>
                </div>

                
              </div>

              <Divide />

              <div
                className=' flex items-center justify-center py-3 cursor-pointer'
                onClick={async () => {
                  await handleDisConnect()
                  toastError({
                    title: t('walletDisconnect'),
                  })
                }}
              >
                <img src='/images/icons/disconnect.png' className='w-[14px] h-[14px]' alt='' />
                <div className='ml-2 text-sm font-medium'>{t('Disconnect')}</div>
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>
      )}

      <DialogController
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
