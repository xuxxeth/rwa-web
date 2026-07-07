import { useMemo, useState, useEffect, useCallback } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import { useTranslation, Trans } from '@/hooks/useTranslation'
import type { Address } from '@/config/constants'
import { useBaseStore } from '@/stores/baseStore'
import type { IInviteCodeInfo } from '@/service/referral/types'
import { RESPONSE_CODE } from '@/config/constants'
import { useReferralRebates, useReferralRebatesBatch, useChainId, useAccount } from 'ca-common-web'
import { type RebateParam } from 'ca-common-web'
import { formatAmount, isLess, isLessOrEqual, truncate, formatWithCommas, cn } from '@/utils'
import { DialogController, useShowDialog } from '@/components/dialog/DialogController'
import { useRequest } from '@/hooks/useRequest'
import type { IToken } from '@/service/base/types'
import { LazyImage } from '@/components/image/LazyImage'
import IconWithTooltip from '@/components/icon-tooltip'
import { useKycStore } from '@/stores/kycStore'
import { useRouter } from '@/hooks/useRouter'
import { useToast } from '@/hooks/useToast'
import { useMultiDelayedRefresh } from '@/hooks/useMultiDelayedRefresh'
import { useSignatureValidStatus } from '@/hooks/useSignature'
import { useAppStore } from '@/stores/appStore'
import VectorSVG from '@/components/pagination/vector.svg?react'
import { useSwitchChainAction } from '@/hooks/useSwitchChainAction'

export function useDiamondAddr() {
  const chainList = useBaseStore(state => state.chainList)
  const chainId = useChainId()

  return useMemo(() => {
    if (!chainId) return undefined
    const chain = chainList.find(item => item.id === chainId)
    return chain?.contract as Address | undefined
  }, [chainId, chainList])
}

function useClaimableReferralTokens(account: string, isSignatureValid: boolean) {
  const chainList = useBaseStore(state => state.chainList)
  const tokenList = useBaseStore(state => state.tokenList)

  const rebateParams: RebateParam[] = useMemo(() => {
    const params: RebateParam[] = []
    chainList
      .filter(chain => chain.state === 1)
      .forEach(chain => {
        const chainId = chain.id
        const diamondAddress = chain.contract as Address | undefined
        if (!diamondAddress) return
        params.push({
          chainId,
          diamondAddress,
          tokens: tokenList
            .filter(token => token.chainId === chainId && token.state === 1)
            .map(token => token.address as `0x${string}`),
        })
      })
    return params
  }, [chainList, tokenList])

  const [, , validSignature] = useSignatureValidStatus()

  const { getReferralRebatesBatch } = useReferralRebatesBatch()

  const ready = rebateParams.length > 0

  const query = useRequest<
    [
      bigint,
      {
        [chainId: number]: {
          details: Array<[string, bigint]>
          totalAmount: bigint
        }
      },
    ]
  >(
    async () => {
      if (!validSignature()) return null
      if (!ready) return null
      const next = await getReferralRebatesBatch(rebateParams)
      let totalAmount = 0n
      const rebatesInfo = rebateParams.reduce(
        (acc, cur, index) => {
          const chainId = cur.chainId
          const rebates = next[index]
          let chainAmount = 0n
          const details: Array<[string, bigint]> = cur.tokens.map((token, idx) => {
            chainAmount += rebates[idx]
            totalAmount += rebates[idx]
            return [token, rebates[idx]]
          })
          acc[chainId] = {
            details: details,
            totalAmount: chainAmount,
          }
          return acc
        },
        {} as Record<
          number,
          {
            details: Array<[string, bigint]>
            totalAmount: bigint
          }
        >
      )
      return [totalAmount, rebatesInfo]
    },
    [ready, isSignatureValid, account, rebateParams],
    {
      immediate: ready,
      initialData: null,
    }
  )

  const loading = query.loading
  const totalAmount = query.data?.[0]
  const rebates = query.data?.[1]

  console.log(rebates)

  return { totalAmount, rebates, loading, refresh: query.run }
}

function useRebateClaimState(isSignatureValid: boolean) {
  const account = useAccount()

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
    totalAmount,
    rebates,
    loading: rebatesLoading,
    refresh: refreshRebates,
  } = useClaimableReferralTokens(account, isSignatureValid)

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

  const { totalAmount, rebates, rebatesLoading, canClaimRebate, isKycFinished, refreshRebates } =
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
          disabled={disabled}
          rebates={rebates ?? {}}
          totalAmount={totalAmount}
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
  totalAmount: bigint | undefined
  rebates: Record<
    number,
    {
      details: Array<[string, bigint]>
      totalAmount: bigint
    }
  >
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
        <ClaimRebateDialog
          totalAmount={props.totalAmount}
          dialog={dialog}
          rebates={props.rebates}
          refresh={props.multiRefresh}
        />
      ) : (
        <FinishKycDialog dialog={dialog} />
      )}
    </>
  )
}

function ClaimRebateDialog(props: {
  totalAmount: bigint | undefined
  dialog: {
    open: boolean
    setOpen: Dispatch<SetStateAction<boolean>>
    show: () => void
    hide: () => void
  }
  rebates: Record<
    number,
    {
      details: Array<[string, bigint]>
      totalAmount: bigint
    }
  >
  refresh: () => void
}) {
  const { t } = useTranslation()
  const { toastSuccess, toastError } = useToast()

  const chainList = useBaseStore(state => state.chainList)
  const currentChainId = useAppStore(state => state.currentChainId)

  const displayChainList = useMemo(() => {
    return chainList
      .filter(
        item =>
          item.state === 1 &&
          props.rebates[item.id] !== undefined &&
          props.rebates[item.id].totalAmount > 0n
      )
      .sort((a, b) => (a.id === currentChainId ? -1 : b.id === currentChainId ? 1 : 0))
  }, [chainList, currentChainId, props.rebates])

  const allTokens = useBaseStore(state => state.tokenList)
  const getSpecificToken = useCallback(
    (address: string, tokens: IToken[]) => {
      const token = tokens.find(item => item.address === address)
      return token
    },
    [allTokens]
  )

  const diamondAddress = useDiamondAddr()
  const { claimReferralRebates, txStep } = useReferralRebates(diamondAddress)

  const [isClaiming, setIsClaiming] = useState(false)
  const [expandedChainId, setExpandedChainId] = useState<number | null>(currentChainId)

  const handleClaim = async () => {
    if (isClaiming || currentChainId === null) return
    const chainAmount = props.rebates[currentChainId]?.totalAmount
    if (chainAmount === undefined || chainAmount === 0n) return

    const chainRebates = props.rebates[currentChainId]
    const addresses = chainRebates.details.map(([address]) => address as `0x${string}`)
    const amounts = chainRebates.details.map(([, amount]) => amount)

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

  const { switchToChain } = useSwitchChainAction()

  return (
    <DialogController
      topFixed
      open={props.dialog.open}
      headerClassName={'border-b pt-4 pb-3 px-6 border-b-gray-850'}
      closeClassName={'cursor-pointer opacity-100 mr-1'}
      closeIconClassName={'w-6 h-6'}
      titleClassName={'text-base/5'}
      openChange={props.dialog.setOpen}
      title={t('rebate.unClaimed')}
      overlayClassName='bg-gray-900/60'
      className='w-[420px] top-[20vh] [@media(min-height:900px)]:top-[197px] bg-gray-950 border border-gray-850 rounded-2xl p-0 gap-0'
    >
      <div className='px-6 py-5 flex flex-col font-normal'>
        <div className='flex flex-row justify-between text-sm/4.5 font-medium px-1'>
          <div className='text-gray-300'>{t('rebate.totalUnClaimed')}</div>
          <div>
            <AmountDisplay
              amount={props.totalAmount !== undefined ? formatAmount(props.totalAmount) : undefined}
            />
            <span className='ml-1'>USD</span>
          </div>
        </div>
        <div className='flex flex-col gap-3 mt-3'>
          {displayChainList.map(item => {
            const expanded = expandedChainId === item.id

            return (
              <div key={item.id} className='border bg-gray-900 border-gray-500 p-4 rounded-[10px]'>
                <div className='flex flex-row text-sm/4.5 font-medium items-center'>
                  <img src={item.icon} className='w-[24px] h-[24px] mr-2' />
                  <span className='text-gray-300'>{item.displayName}</span>
                  <div className='ml-auto flex items-center gap-1'>
                    <div className={cn('font-semibold', expanded ? 'text-brand' : '')}>
                      <AmountDisplay amount={formatAmount(props.rebates[item.id].totalAmount)} />
                      <span className='ml-1'>USD</span>
                    </div>
                    <button
                      type='button'
                      className='flex h-4 w-4 items-center justify-center cursor-pointer'
                      onClick={() => {
                        setExpandedChainId(prev => (prev === item.id ? null : item.id))
                      }}
                    >
                      <VectorSVG
                        className={cn(
                          'h-3 w-3 transition-transform duration-200 [&>path]:[stroke-width:0.8]',
                          expanded ? 'rotate-270 text-brand' : 'rotate-450'
                        )}
                      />
                    </button>
                  </div>
                </div>
                {expanded && (
                  <>
                    <div className='border border-gray-800 p-4 rounded-[10px] mt-3'>
                      {props.rebates[item.id].details
                        .filter(([, amount]) => amount > 0n)
                        .map(([address, amount], index) => {
                          const token = getSpecificToken(address, allTokens)
                          return (
                            <>
                              {index > 0 && (
                                <div className='w-full border-t border-gray-850 my-3'></div>
                              )}
                              <div
                                key={address}
                                className='flex flex-row items-center text-xs/[15px]'
                              >
                                <LazyImage src={token?.icon || ''} className='w-5 h-5 mr-2' />
                                <span className='text-gray-300'>{token?.symbol || address}</span>
                                <div className='ml-auto font-semibold text-sm/4.5'>
                                  <AmountDisplay amount={formatAmount(amount)} />
                                </div>
                              </div>
                            </>
                          )
                        })}
                    </div>
                    {item.id === currentChainId ? (
                      <button
                        disabled={isClaiming}
                        onClick={() => {
                          handleClaim()
                        }}
                        className='w-full flex items-center justify-center font-semibold cursor-pointer bg-white text-black h-12 text-base/5 rounded-[8px] disabled:text-gray-500 disabled:bg-gray-900 disabled:cursor-not-allowed mt-4'
                      >
                        {isClaiming && (
                          <LazyImage
                            src='/images/icons/loading.png'
                            className='w-[22px] h-[22px] animate-spin mr-2'
                          />
                        )}
                        {isClaiming ? t('rebate.claiming') : t('rebate.claimNow')}
                      </button>
                    ) : (
                      <button
                        disabled={isClaiming}
                        onClick={() => {
                          switchToChain(item.id)
                        }}
                        className='w-full flex items-center justify-center font-semibold cursor-pointer bg-white text-black h-12 text-base/5 rounded-[8px] disabled:text-gray-500 disabled:bg-gray-900 disabled:cursor-not-allowed mt-4'
                      >
                        {t('rebate.switchThenClaim')}
                      </button>
                    )}
                  </>
                )}
              </div>
            )
          })}
        </div>
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
