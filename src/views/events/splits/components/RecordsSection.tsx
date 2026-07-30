import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import { symbolToLower } from '@/utils'
import { TabNav, type TabKey } from './TabNav'
import { EventCard, type EventData } from './EventCard'
import type { IStockActionEvent } from '@/service/event/types'
import { useSignatureValidStatus } from '@/hooks/useSignature'
import { useAppStore } from '@/stores/appStore'
import { eventApi } from '@/service/event/api'
import { RESPONSE_CODE } from '@/config/constants'
import { useBaseStore } from '@/stores/baseStore'
import { useWssStore } from '@/stores/wssStore'
import { useWssOn } from '@/hooks/useWssOn'
import { DialogController, useShowDialog } from '@/components/dialog/DialogController'
import { ExchangeStock } from './Exchange'
import { KycTip } from './KycTip'
import { useKycStatus } from '@/hooks/useKycStatus'
import { KYC_OVERALL_STATUS } from '@/service/kyc/types'
import { useGetRwaByAddress } from '@/hooks/useTokens'
import { useGetTokenBalances } from '@/hooks/useTokenBalances'
import { WalletNotConnectedSmallVersion } from '@/components/wallet-not-connected'
import { CircleLoading } from '@/components/loading'
import { useRwas } from '@/hooks/useRwaBalances'
import NoRecord from '@/components/no-record'
import { useActiveWeb3 } from '@/hooks/useActiveWe3'
import { usePageContentState } from '@/hooks/usePageContentState'
import { sortEventsByStatusAndTime } from './eventSort'
import { ExchangeHistoryTable } from './HistoryTable'
import Pagination from '@/components/pagination'

const PAGE_LIMIT = 9

export default function RecordsSection() {
  
  const { t } = useTranslation()
  const exchangeDialog = useShowDialog()
  const kycTipDialog = useShowDialog()
  const { getTokensDataByAddress } = useGetTokenBalances()

  const [currentEvent, setCurrentEvent] = useState<IStockActionEvent | null>(null)
  const { kycStatus } = useKycStatus()

  const payinToken = useGetRwaByAddress(currentEvent?.payinAddress)
  const isSwitchingChain = useAppStore(state => state.isSwitchingChain)
  const isWalletConnecting = useAppStore(state => state.isWalletConnecting)
  const [activeTab, setActiveTab] = useState<TabKey>("held");

  const [isSignatureValid, _, validSignature] = useSignatureValidStatus()
  const { account, initialized } = useActiveWeb3()
  const currentChainId = useAppStore(state => state.currentChainId)

  const [eventList, setEventList] = useState<IStockActionEvent[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasLoadedCurrentKey, setHasLoadedCurrentKey] = useState(false)

  const rwaList = useRwas()
  const tokenWithBalance = useBaseStore(state => state.tokenWithBalance)
  const currentChainRwaList = useMemo(() => {
    if (!currentChainId) {
      return []
    }

    return rwaList.filter(rwa => rwa.chainId === currentChainId)
  }, [currentChainId, rwaList])
  const isHeldTab = activeTab === 'held'
  const isRwaBalanceReady = useMemo(() => {
    if (!isHeldTab) {
      return true
    }

    if (!account || !currentChainId) {
      return false
    }

    if (currentChainRwaList.length === 0) {
      return true
    }

    return currentChainRwaList.every(rwa => tokenWithBalance[symbolToLower(rwa.address)] !== undefined)
  }, [account, currentChainId, currentChainRwaList, isHeldTab, tokenWithBalance])
  const rwaListWithBalanceSorted = useMemo(() => {
    if (!isRwaBalanceReady) {
      return []
    }

    return [...new Set(currentChainRwaList.filter(rwa => {
      const balance = tokenWithBalance[symbolToLower(rwa.address)]
      return Number(balance?.balance) > 0
    }).map(rwa => rwa.address))].sort()
  }, [isRwaBalanceReady, currentChainRwaList, tokenWithBalance])
  const rwaListWithBalanceKey = useMemo(() => {
    return rwaListWithBalanceSorted.join(',')
  }, [rwaListWithBalanceSorted])
  const currentRequestKey = useMemo(() => {
    if (!initialized || !currentChainId || (isHeldTab && !account)) {
      return ''
    }
    return `${currentChainId}:${isHeldTab ? account : activeTab}:${isHeldTab ? rwaListWithBalanceKey : 'all'}`
  }, [account, activeTab, currentChainId, initialized, isHeldTab, rwaListWithBalanceKey])


  const [pageNum, setPageNum] = useState(1)
  const [total, setTotal] = useState(0)

  // next: true，执行下一页，false，执行上一页
  const handleGetStockAction = useCallback(async (t?: TabKey, _pageNum: number = 1) => {
    if (!currentChainId || (t === 'history' && (!account || !validSignature()))) {
      setEventList([])
      setHasLoadedCurrentKey(true)
      setIsLoading(false)
      return null
    }

    if (t === 'held' && isRwaBalanceReady && rwaListWithBalanceSorted.length <= 0) {
      setEventList([])
      setHasLoadedCurrentKey(true)
      setIsLoading(false)
      return
    }

    const res = await eventApi.getStockAction(
      currentChainId, 
      _pageNum,
      t === 'held' ? rwaListWithBalanceKey : undefined, 
      PAGE_LIMIT
    )
    
    if (res?.code === RESPONSE_CODE.SUCCESS) {
      setHasLoadedCurrentKey(true)
      const data = res?.data?.list || []
      if (total === 0) {
        setTotal(res?.data?.total || 0)
      }
      if (data.length > 0) {
        setEventList(data)
        setPageNum(_pageNum)
      }
    }
    setTimeout(() => {
      setIsLoading(false)
    }, 300)

  }, [currentChainId, account, isRwaBalanceReady, rwaListWithBalanceKey, rwaListWithBalanceSorted, validSignature, pageNum, total])

  const initRef = useRef<string>('')
  const {
    viewState,
    shouldShowWalletNotConnected,
    shouldShowLoading,
    shouldShowEmpty,
  } = usePageContentState({
    active: activeTab === 'held' || activeTab === 'all',
    requiresWallet: isHeldTab,
    initialized,
    isWalletConnecting,
    account,
    chainId: currentChainId,
    isSwitchingChain,
    isDataReady: isHeldTab ? isRwaBalanceReady : true,
    isLoading,
    hasLoadedCurrentKey,
    hasData: eventList.length > 0,
  })
  const displayEventList = useMemo(() => {
    return sortEventsByStatusAndTime(eventList)
  }, [activeTab, eventList])

  useEffect(() => {
    if (!isSwitchingChain) {
      return
    }
    setEventList([])
    setIsLoading(true)
  }, [isSwitchingChain])

  useEffect(() => {
    if (!initialized || !currentChainId || (isHeldTab && !account)) {
      initRef.current = ''
      setEventList([])
      setHasLoadedCurrentKey(false)
      setIsLoading(false)
      return
    }

    if (isHeldTab && !isRwaBalanceReady) {
      setEventList([])
      setHasLoadedCurrentKey(false)
      setIsLoading(true)
      return
    }

    if (initRef.current === currentRequestKey) {
      return
    }

    initRef.current = currentRequestKey
    setEventList([])
    setHasLoadedCurrentKey(false)
    setIsLoading(true)
    handleGetStockAction(activeTab, 1)
  }, [activeTab, currentChainId, account, initialized, isHeldTab, isRwaBalanceReady, currentRequestKey])


  const setTokenWithPriceByWebSocketData = useBaseStore(
    state => state.setTokenWithPriceByWebSocketData
  )
  const setStockWithPriceByWebSocketData = useBaseStore(
    state => state.setStockWithPriceByWebSocketData
  )
  const stableTokenWithPrice = useWssStore(state => state.setStableTokenWithPrice)
  const updateOriginSummary = useWssStore(state => state.updateOriginSummary)

  useWssOn('aggregate', (data: any) => {
    const _data = data?.items || []
    setTokenWithPriceByWebSocketData(_data)
    setStockWithPriceByWebSocketData(_data)
    stableTokenWithPrice(_data)
    updateOriginSummary(_data)
  })

  const handleExchange = useCallback(async (data: IStockActionEvent) => {
    
    setCurrentEvent(data)
    // 进行中，且kyc未通过，则弹起kyc认证提示弹窗
    if (account && data?.showStatus === 1 && kycStatus !== KYC_OVERALL_STATUS.VERIFIED) {
      kycTipDialog.show()
      return
    }
    exchangeDialog.show()
  }, [kycStatus, account])

  const handleTabChange = useCallback(async (t: TabKey) => {
    if (isLoading) return
    setActiveTab(t);
    setIsLoading(true)
    setTotal(0)
    setPageNum(1)

    // handleGetStockAction(t, 1)
  }, [isLoading])

  return (
    <div className='min-h-[680px] rounded-[16px] w-full'>
      <div className='flex flex-col gap-[16px] h-full'>
          {/* Tabs */}
        <TabNav active={activeTab} onChange={handleTabChange} />
        <div className=' relative'>
          {
            (activeTab === 'held' || activeTab === 'all') && (
              shouldShowWalletNotConnected ? 
                (
                  <WalletNotConnectedSmallVersion />
                ) : (
                <>
                  {
                    shouldShowLoading && <div className=' bg-[rgba(0,0,0,0)] h-full min-h-[600px] rounded-[16px] w-full text-white absolute z-20 left-0 top-0 right-0 bottom-0 flex justify-center'>
                      <CircleLoading className='absolute top-[50px] left-1/2 -translate-x-1/2 -translate-y-1/2' />
                    </div>
                  }
                  {
                    displayEventList.length > 0 && (
                      <>
                        <div className="grid grid-cols-3 gap-5 mt-1 items-start min-h-[500px]">
                          {displayEventList.map((event, i) => (
                            <EventCard key={i} 
                              data={event} 
                              account={account}
                              onClick={handleExchange}
                            />
                          ))}
                        </div>
                        <p className="text-[#737a87] text-[14px] flex items-start gap-2 mt-5">
                          <span className="text-[#ffb219] mt-px">⚠</span>
                          {t("events.t24")}
                        </p>
                      </>
                    ) 
                  }
                  {
                    shouldShowEmpty && <NoRecord />
                  }
                  <div className='mt-6'>
                    {total >= PAGE_LIMIT && (
                        <div className='mt-2'>
                          <Pagination
                            prevDisabled={pageNum <= 1}
                            nextDisabled={displayEventList.length < PAGE_LIMIT}
                            onPrevClick={() => {
                              setIsLoading(true)
                              handleGetStockAction(activeTab, pageNum - 1)
                            }}
                            className={''}
                            onNextClick={() => {
                              setIsLoading(true)
                              handleGetStockAction(activeTab, pageNum + 1)
                            }}
                          />
                        </div>
                      )}
                  </div>
                </>

              )
            )
          }
          {activeTab === 'history' && <ExchangeHistoryTable chainId={currentChainId} account={account} />}
        </div>
      </div>
      <DialogController
          className="p-0 "
          headerClassName="px-4 pt-4 border-b border-[#232427] pb-4"
          overlayClassName='z-[49]'
          title={
            <div className="flex items-center gap-1">
              <span className="text-white text-[16px] font-semibold">{payinToken?.symbol || '--'}</span>
              <span className="text-[#737a87] text-[16px] font-semibold ml-1">{payinToken?.name || '--'}</span>
            </div>
          }
          open={exchangeDialog.open}
          openChange={exchangeDialog.setOpen}
        >
          <ExchangeStock 
            currentEvent={currentEvent}
            onSuccess={async () => {
              if (currentEvent?.payinAddress && currentEvent?.payoutAddress && currentEvent?.paymentAddress) {
                getTokensDataByAddress([currentEvent?.payinAddress, currentEvent?.payoutAddress, currentEvent?.paymentAddress], currentChainId)
              }

              exchangeDialog.hide()
            }}
          />
        </DialogController>
        <DialogController
          className="p-0 "
          headerClassName="px-4 pt-4 pb-4"
          overlayClassName='z-[49]'
          title={''}
          open={kycTipDialog.open}
          openChange={kycTipDialog.setOpen}
        >
          <KycTip />
        </DialogController>
    </div>
  )
}