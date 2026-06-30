import { useMemo, useState, useEffect } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import { useTranslation, Trans } from '@/hooks/useTranslation'
import type { Address } from '@/config/constants'
import { RESPONSE_CODE } from '@/config/constants'
import { useBaseStore } from '@/stores/baseStore'
import type { IInviteCodeInfo } from '@/service/referral/types'
import { useReferralRebates, useChainId, useAccount } from 'ca-common-web'
import { formatAmount, isLess, isLessOrEqual, truncate, formatWithCommas, cn } from '@/utils'
import { DialogController, useShowDialog } from '@/components/dialog/DialogController'
import { useRequest } from '@/hooks/useRequest'
import { useTokens } from '@/hooks/useTokens'
import type { IToken } from '@/service/base/types'
import { LazyImage } from '@/components/image/LazyImage'
import IconWithTooltip from '@/components/icon-tooltip'
import { useKycStore } from '@/stores/kycStore'
import { useRouter } from '@/hooks/useRouter'
import { useToast } from '@/hooks/useToast'
import { useMultiDelayedRefresh } from '@/hooks/useMultiDelayedRefresh'
import { useSignatureValidStatus } from '@/hooks/useSignature'
import { useAppStore } from '@/stores/appStore'
import { CircleLoading } from '@/components/loading'

export function useDiamondAddr() {
  const chainList = useBaseStore(state => state.chainList)
  const chainId = useChainId()

  return useMemo(() => {
    if (!chainId) return undefined
    const chain = chainList.find(item => item.id === chainId)
    return chain?.contract as Address | undefined
  }, [chainId, chainList])
}

function useClaimableReferralTokens(
  account: string,
  chainId: number | null,
  isSignatureValid: boolean
) {
  const tokenList = useTokens()
  const [, , validSignature] = useSignatureValidStatus()
  const chainList = useBaseStore(state => state.chainList)

  const [tokenAddrs, diamondAddress] = useMemo(() => {
    const tokenAddrs = tokenList.map(token => token.address as `0x${string}`)
    const chain = chainList.find(item => item.id === chainId)
    const diamondAddress = chain?.contract as Address | undefined
    return [tokenAddrs, diamondAddress]
  }, [tokenList, chainId, chainList])

  const { getReferralRebates } = useReferralRebates(diamondAddress)

  const ready = Boolean(diamondAddress) && tokenAddrs.length > 0 && !!chainId

  const query = useRequest<Array<[symbol: string, amount: bigint]>>(
    async () => {
      if (!validSignature()) return null
      if (!ready) return null
      const next = await getReferralRebates(tokenAddrs)
      return tokenAddrs
        .slice(0, next.length)
        .map((tokenAddr, index) => [tokenAddr, next[index]] as [string, bigint])
        .filter(([_, amount]) => amount !== 0n)
    },
    [ready, isSignatureValid, account, getReferralRebates, tokenAddrs, chainId],
    {
      immediate: ready,
      initialData: null,
    }
  )

  const rebates = query.data
  const loading = !ready || query.loading || query.data === null

  return { rebates, loading, refresh: query.run }
}

function useRebateClaimState(isSignatureValid: boolean) {
  const account = useAccount()
  const [, , validSignature] = useSignatureValidStatus()
  const currentChainId = useAppStore(state => state.currentChainId)

  const riskUserConfigForReferral = useKycStore(state => state.riskUserConfigForReferral)

  const isKycFinished =
    riskUserConfigForReferral === undefined ? undefined : riskUserConfigForReferral !== null

  const canClaimRebate =
    riskUserConfigForReferral !== undefined
      ? riskUserConfigForReferral !== null
        ? (riskUserConfigForReferral.actions & (1 << 2)) !== 0
        : false
      : undefined

  const {
    rebates,
    loading: rebatesLoading,
    refresh: refreshRebates,
  } = useClaimableReferralTokens(account, currentChainId, isSignatureValid)
  const totalAmount = rebates?.reduce((acc, [, amount]) => acc + amount, BigInt(0))

  return {
    canClaimRebate,
    rebates,
    rebatesLoading,
    totalAmount,
    isKycFinished,
    refreshRebates,
  }
}

export function RebateStats(props: {
  inviteCodeInfo: IInviteCodeInfo | null
  isSignatureValid: boolean
  refreshCodeInfo: () => Promise<void>
  account: string
}) {
  const { inviteCodeInfo, isSignatureValid, refreshCodeInfo, account } = props
  const [, , validSignature] = useSignatureValidStatus()
  const { t } = useTranslation()
  const isSwitchingChain = useAppStore(state => state.isSwitchingChain)

  const { rebates, rebatesLoading, totalAmount, canClaimRebate, isKycFinished, refreshRebates } =
    useRebateClaimState(isSignatureValid)

  const [disabled, setDisabled] = useState(true)

  useEffect(() => {
    setDisabled(true)
  }, [account])

  useEffect(() => {
    if (!validSignature()) {
      setDisabled(true)
      return
    }
    if (totalAmount === undefined || isKycFinished === undefined || canClaimRebate === undefined) {
      setDisabled(true)
      return
    }
    if (isLessOrEqual(totalAmount, '0')) {
      setDisabled(true)
      return
    }
    if (isKycFinished && !canClaimRebate) {
      setDisabled(true)
      return
    }

    setDisabled(false)
  }, [isSignatureValid, rebatesLoading, totalAmount, isKycFinished, canClaimRebate])

  const refresh = async () => {
    await Promise.all([refreshCodeInfo(), refreshRebates()])
  }

  const { startRefresh: startMultiRefresh } = useMultiDelayedRefresh(
    refresh,
    [0, 500, 2500, 3800, 60000]
  )
  const { startRefresh: startOnceRefresh } = useMultiDelayedRefresh(refresh, [0])

  return (
    <div className='flex gap-10 px-8 py-9 h-full'>
      <div className='flex-1 flex flex-col h-[217px] justify-between overflow-hidden'>
        <div className='flex flex-col gap-[8px] pt-[8px]'>
          <div className='flex flex-row gap-[10px]'>
            <span className='font-normal text-[16px] text-[#9da3af] leading-normal whitespace-nowrap'>
              {t('rebate.unClaimed')}
            </span>
            {isKycFinished && canClaimRebate === false && <OnRisk />}
          </div>

          <div className='flex gap-[8px] max-w-full items-baseline relative'>
            <p className='font-bold text-[32px] text-[#9cff3a] leading-none truncate'>
              <AmountDisplay
                amount={totalAmount !== undefined ? formatAmount(totalAmount) : undefined}
              />
            </p>
            <p className='font-medium flex-none text-[18px] text-[#9da3af] leading-normal'>USD</p>
          </div>
        </div>

        <RebateClaimButton
          disabled={disabled || isSwitchingChain}
          rebates={rebates ?? []}
          isKycFinished={isKycFinished}
          multiRefresh={startMultiRefresh}
          onceRefresh={startOnceRefresh}
        />
      </div>
      <DataList inviteCodeInfo={inviteCodeInfo} />
    </div>
  )
}

function OnRisk() {
  const { t } = useTranslation()
  return (
    <IconWithTooltip
      tooltipClassName='max-w-[270px]'
      tooltip={
        <Trans
          i18nKey='rebate.onRiskTip'
          values={{ email: 'contact@tiko.cc' }}
          components={[<a key='0' href='mailto:contact@tiko.cc' className='text-blue-50' />]}
        />
      }
    >
      <button className='flex cursor-pointer flex-row items-center bg-[#F6851B1A] border font-medium gap-[2px] border-[#F6851B] px-2 py-1 text-[#F6851B] text-xs/[15px] rounded-[28px]'>
        {t('rebate.onRisk')}
        <LazyImage src='/images/v2/icons/warn.svg' className='w-4 h-4' />
      </button>
    </IconWithTooltip>
  )
}

export default function RebateClaimButton(props: {
  disabled: boolean
  rebates: Array<[string, bigint]>
  isKycFinished: boolean | undefined
  multiRefresh: () => void
  onceRefresh: () => void
}) {
  const { t } = useTranslation()
  const dialog = useShowDialog()

  return (
    <>
      <button
        className={`disabled:bg-[#1a1b1e] disabled:border-none cursor-pointer h-[48px] rounded-[8px] w-full flex items-center justify-center disabled:cursor-not-allowed font-semibold text-[16px] disabled:text-[#737a87] bg-[#9CFF3A1A] border border-[#9CFF3A80] text-brand whitespace-nowrap`}
        disabled={props.disabled}
        onClick={async () => {
          if (props.disabled) return
          props.onceRefresh()
          dialog.show()
        }}
      >
        {t('rebate.claim')}
      </button>

      {props.isKycFinished === true ? (
        <ClaimRebateDialog dialog={dialog} rebates={props.rebates} refresh={props.multiRefresh} />
      ) : (
        <FinishKycDialog dialog={dialog} />
      )}
    </>
  )
}

function ClaimRebateDialog(props: {
  dialog: {
    open: boolean
    setOpen: Dispatch<SetStateAction<boolean>>
    show: () => void
    hide: () => void
  }
  rebates: Array<[string, bigint]>
  refresh: () => void
}) {
  const { t } = useTranslation()
  const { toastSuccess, toastError } = useToast()

  const tokens = useTokens()
  const getSpecificToken = (address: string, tokens: IToken[]) => {
    const token = tokens.find(item => item.address === address)
    return token
  }

  const diamondAddress = useDiamondAddr()
  const { claimReferralRebates, txStep } = useReferralRebates(diamondAddress)

  const [isClaiming, setIsClaiming] = useState(false)

  const handleClaim = async () => {
    if (isClaiming) return
    if (props.rebates.length === 0) return

    const addresses = props.rebates.map(([address]) => address as `0x${string}`)
    const amounts = props.rebates.map(([, amount]) => amount)

    setIsClaiming(true)
    try {
      const res = await claimReferralRebates(addresses, amounts, {
        wait: true,
        skipSimulate: true,
      })
      const ok = res?.code === RESPONSE_CODE.SUCCESS

      if (ok) {
        toastSuccess({ title: t('rebate.claimSuccess') })
        props.dialog.hide()
        props.refresh()
        return
      }

      toastError({ title: t('rebate.claimFailed') })
    } catch (error) {
      toastError({ title: error instanceof Error ? error.message : t('rebate.claimFailed') })
    } finally {
      setIsClaiming(false)
    }
  }

  return (
    <DialogController
      topFixed
      open={props.dialog.open}
      headerClassName={'border-b pt-4 pb-3 px-6 border-b-gray-850'}
      closeClassName={'w-4 h-4 cursor-pointer opacity-100'}
      closeIconClassName={'w-4 h-4'}
      titleClassName={'text-base/5'}
      openChange={props.dialog.setOpen}
      title={t('rebate.unClaimed')}
      overlayClassName='bg-gray-900/60'
      className='w-[420px] top-[20vh] [@media(min-height:900px)]:top-[197px] bg-gray-950 border border-gray-850 rounded-2xl p-0 gap-0'
    >
      <div className='p-6 gap-6 flex flex-col font-normal'>
        <div className='flex flex-row justify-between'>
          <div className='text-base text-gray-400'>{t('rebate.totalUnClaimed')}</div>
          <div className='flex flex-col gap-1'>
            {props.rebates.map(([address, amount]) => {
              const token = getSpecificToken(address, tokens)
              return (
                <div
                  key={address}
                  className='flex flex-row text-white items-center gap-1 text-sm/4.5'
                >
                  <LazyImage src={token?.icon || ''} className='w-3.5 h-3.5' />
                  <AmountDisplay amount={formatAmount(amount)} />
                  <TokenCell token={token?.symbol || ''} className='ml-auto' />
                </div>
              )
            })}
          </div>
        </div>
        <button
          disabled={isClaiming}
          onClick={() => {
            handleClaim()
          }}
          className='w-full flex items-center justify-center font-semibold cursor-pointer bg-white text-black h-12 text-base/5 rounded-[8px] disabled:text-gray-500 disabled:bg-gray-900 disabled:cursor-not-allowed'
        >
          {isClaiming && (
            <LazyImage
              src='/images/icons/loading.png'
              className='w-[22px] h-[22px] animate-spin mr-2'
            />
          )}
          {isClaiming ? t('rebate.claiming') : t('rebate.claimNow')}
        </button>
      </div>
    </DialogController>
  )
}

function FinishKycDialog(props: {
  dialog: {
    open: boolean
    setOpen: Dispatch<SetStateAction<boolean>>
    show: () => void
    hide: () => void
  }
}) {
  const router = useRouter()
  const { t } = useTranslation()

  return (
    <DialogController
      topFixed
      open={props.dialog.open}
      headerClassName={'pt-4 pb-3 px-6 h-[50px] border-none'}
      closeClassName={'w-4 h-4 cursor-pointer opacity-100'}
      closeIconClassName={'w-4 h-4'}
      titleClassName={'text-base/5'}
      openChange={props.dialog.setOpen}
      overlayClassName='bg-gray-900/60'
      className='w-[400px] top-[20vh] [@media(min-height:900px)]:top-[197px] bg-gray-950 border border-gray-850 rounded-2xl p-0 gap-0'
    >
      <div className='flex flex-col items-center justify-center px-6'>
        <LazyImage src='/images/v2/icons/big-warn.svg' className='w-16 h-16' />
        <h3 className='mt-4 text-xl/7.5 font-medium text-white'>{t('rebate.kycTitle')}</h3>
        <p className='mt-2 text-base/6 text-gray-400 font-normal mt-2 text-center'>
          {t('rebate.kycSubTitle')}
        </p>
        <button
          onClick={() => {
            router.push('/identity')
          }}
          className='w-full my-6 font-semibold cursor-pointer bg-white text-black h-12 text-base/5 rounded-[8px]'
        >
          {t('rebate.verifyNow')}
        </button>
      </div>
    </DialogController>
  )
}

export function TokenCell(props: { token: string; className?: string }) {
  return <div className={cn('w-10', props.className)}>{props.token}</div>
}

export function AmountDisplay(props: {
  amount: bigint | string | null | number | undefined
  precision?: number
  showTooltip?: boolean
}) {
  const { amount, precision = 2, showTooltip = true } = props
  if (amount === null || amount === undefined) return '--'

  if (amount == 0 || amount === '0') return '0'

  const amountStr = typeof amount === 'string' ? amount : amount.toString()

  if (isLess(amountStr, '0.01')) {
    return showTooltip ? (
      <IconWithTooltip tooltip={amountStr} triggerClassName='inline-flex'>
        <span>{'<0.01'}</span>
      </IconWithTooltip>
    ) : (
      <span>{'<0.01'}</span>
    )
  }

  return formatWithCommas(truncate(amountStr, precision))
}

// 右侧数据列表
function DataList(props: { inviteCodeInfo: IInviteCodeInfo | null }) {
  const { inviteCodeInfo } = props
  const { t } = useTranslation()
  return (
    <div className='flex-0 flex flex-col h-[217px] justify-between basis-[338px] overflow-hidden'>
      <DataItem
        label={t('rebate.cum')}
        value={<AmountDisplay amount={inviteCodeInfo?.rebates} />}
        unit='USD'
      />
      <DataItem
        label={t('rebate.claimed')}
        value={<AmountDisplay amount={inviteCodeInfo?.claims} />}
        unit='USD'
      />
      <DataItem label={t('rebate.invitees')} value={inviteCodeInfo?.referees ?? '--'} unit='' />
    </div>
  )
}

// 单个数据项
interface DataItemProps {
  label: string
  value: string | number | React.ReactNode
  unit: string
}

function DataItem({ label, value, unit }: DataItemProps) {
  return (
    <div className='bg-[#1a1b1e] h-[60px] rounded-[8px] flex items-center justify-between px-4 py-2 overflow-hidden'>
      <p className='font-normal text-[16px] mr-3 text-[#9da3af] leading-normal whitespace-nowrap'>
        {label}
      </p>
      <div className='flex gap-2 items-baseline overflow-hidden'>
        <div className='font-bold text-[20px] text-white truncate'>{value}</div>
        <div className='font-medium text-[18px] text-[#9da3af]'>{unit}</div>
      </div>
    </div>
  )
}
