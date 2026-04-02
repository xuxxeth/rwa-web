import { useEffect, useState, useMemo, type ReactNode, useRef } from 'react'
import { MainLayout } from '@/layouts/main'
import { XFooter } from '@/components/footer'
import { BaseInfo } from './components/BaseInfo'
import { IdentityLayout } from './components/IdentityLayout'
import { kycApi } from '@/service/kyc/api'
import {
  KYC_VERIFY_TYPE,
  KYC_OVERALL_STATUS,
  KYC_STATUS,
  type IKycDetail,
} from '@/service/kyc/types'
import FaceRecognition from './components/FaceRecognition'
import { Risk3Info } from './components/Risk3Info'
import { ExtraInfo } from './components/ExtraInfo'
import {
  OCRVerifyFailed,
  FaceRecognitionFailed,
  VerifySucceeded,
  VerifyFailed,
  Verifying,
  VerifyIssue,
} from './components/VerifyStatus'
import { useAccount, useChainId } from 'ca-common-web'
import { useAppStore } from '@/stores/appStore'
import WalletNotConnected from '@/components/wallet-not-connected'
import { useSignatureValidStatus } from '@/hooks/useSignature'
import SignatureVerify from '@/components/signature-verify'
import { useKycExpired } from '@/hooks/useKycStatus'
import { IDExpired } from './components/IDExpired'
import { useSearchParams } from 'react-router-dom'
import { ReviewInfo } from './components/ReviewInfo'
import { useKycStore } from '@/stores/kycStore'
import { usePendingStep } from '@/hooks/usePendingStep'
import { useTranslation, useI18nLanguage } from '@/hooks/useTranslation'

function IdentityEntry() {
  const isWalletConnecting = useAppStore(state => state.isWalletConnecting)
  const [isSignatureValid, refreshIsSignatureValid] = useSignatureValidStatus()
  const { i18n } = useTranslation()
  const account = useAccount()
  const chainId = useChainId()

  const lang = useI18nLanguage(i18n)

  const walltedConnected = account && chainId

  const initialConnectingFinished = useRef(false)

  useEffect(() => {
    if (!isWalletConnecting) {
      initialConnectingFinished.current = true
    }
  }, [isWalletConnecting])

  if (!walltedConnected && isWalletConnecting && !initialConnectingFinished.current) {
    return null
  }
  if (!walltedConnected) {
    return <WalletNotConnected desc='identity.cwdesc' />
  }

  if (!isSignatureValid) {
    return (
      <SignatureVerify
        isTitleSameLine={lang === 'zh'}
        buttonClassName='mt-4 text-base'
        titleClassName='text-2xl'
        descClassName='w-[550px] text-lg'
        desc='identity.signd'
        subDescClassName='w-[750px] text-lg'
        subDesc='identity.signSubd'
        className='mt-24'
        refreshIsSignatureValid={refreshIsSignatureValid}
      />
    )
  }

  return <Identity account={account} />
}

function Identity({ account }: { account: string }) {
  const { i18n } = useTranslation()

  const [kycDetail, setKycDetail] = useState<IKycDetail | undefined>(undefined)
  const expireStatus = useKycExpired()
  const [searchParams] = useSearchParams()
  const isRetryFromUrl = searchParams.get('retry') === 'true'
  const [isRetry, setIsRetry] = useState(isRetryFromUrl)
  const pendingStep = usePendingStep()
  const pendingStepRef = useRef(0)
  const kycDetailInit = useRef(false)
  const retryCount = useRef(0)
  const updateRetryCount = useKycStore(state => state.updateRetryCount)

  const resetRetry = () => {
    setIsRetry(prev => (prev === true ? false : prev))
  }

  const refresh = async (init?: boolean) => {
    try {
      if (init) {
        retryCount.current = 1
      } 
      if (!init) {
        updateRetryCount(retryCount.current)
      }
      const res = await kycApi.getKycDetail()
      if (res?.data) {
        if (pendingStepRef.current) {
          const stepRes = await kycApi.getKycStepDetail(pendingStepRef.current)
          const stepData = stepRes.data[0] ? stepRes.data[0] : ({} as IKycDetail)

          stepData.overallStatus = stepData.applyStatus || res.data?.overallStatus
          if (stepData.status === undefined) stepData.status = -1
          res.data = {
            ...res.data,
            ...stepData,
          }
        }
      }
      kycDetailInit.current = true
      setKycDetail(res?.data || {})
      if (!init) {
        retryCount.current = retryCount.current + 1
        updateRetryCount(retryCount.current)
      }
      return res
    } catch (error) {
      kycDetailInit.current = true
      return {
        code: 500,
        data: {
          overallStatus: KYC_OVERALL_STATUS.VERIFYING,
          applyStatus: KYC_OVERALL_STATUS.VERIFYING,
        },
        message: null,
      }
    }
  }

  useEffect(() => {
    if (pendingStep.step) {
      pendingStepRef.current = pendingStep.step
    }
    refresh(true)
  }, [account, pendingStep.step])

  // 切换语言， 重新拉取认证详情
  useEffect(() => {
    if (kycDetailInit.current) {
      refresh(true)
    }
  }, [i18n.language])

  // 根据 kycDetail 刷新 KycStatus and Conifg
  const refetchKycStatusAndConfigIfNeed = useKycStore(
    state => state.refetchKycStatusAndConfigIfNeed
  )
  useEffect(() => {
    if (!kycDetail) return
    refetchKycStatusAndConfigIfNeed(kycDetail)
  }, [kycDetail])

  const rules = useMemo(() => {
    if (kycDetail === undefined) return []

    const { overallStatus, riskLevel, status, verifyType } = kycDetail

    return [
      // 已过期/即将过期
      {
        match: () =>
          overallStatus === KYC_OVERALL_STATUS.EXPIRED ||
          (overallStatus === KYC_OVERALL_STATUS.VERIFIED && expireStatus.expiring) ||
          (overallStatus === KYC_OVERALL_STATUS.VERIFYING &&
            verifyType === KYC_VERIFY_TYPE.ID_INFO) ||
          (pendingStep.step &&
            overallStatus === KYC_OVERALL_STATUS.VERIFYING &&
            verifyType === KYC_VERIFY_TYPE.OCR &&
            status === KYC_STATUS.REJECTED),
        render: () => (
          <IDExpired
            userInfo={kycDetail.userInfo}
            refresh={refresh}
            expired={expireStatus.expired}
            reviewCommentToUser={kycDetail?.userInfo?.reviewInfo?.reviewCommentToUser}
          />
        ),
      },
      // 未认证
      {
        match: () => overallStatus === KYC_OVERALL_STATUS.NOTVERIFIED,
        render: () => (
          <BaseInfo
            refresh={refresh}
            userInfo={kycDetail.userInfo}
            rejectReason={kycDetail.rejectReason}
          />
        ),
      },

      // 认证失败
      {
        match: () => overallStatus === KYC_OVERALL_STATUS.REJECTED,
        render: () => <VerifyFailed />,
      },
      {
        match: () => overallStatus === KYC_OVERALL_STATUS.ISSUE,
        render: () => <VerifyIssue />,
      },
      // 认证中 - Income High Risk
      {
        match: () =>
          overallStatus === KYC_OVERALL_STATUS.VERIFYING &&
          verifyType === KYC_VERIFY_TYPE.INCOME &&
          (status === KYC_STATUS.VERIFYING ||
            status === KYC_STATUS.EXPIRED ||
            status === KYC_STATUS.DECLINED),
        render: () => (
          <Risk3Info
            refresh={refresh}
            reviewCommentToUser={kycDetail?.userInfo?.reviewInfo?.reviewCommentToUser}
          />
        ),
      },
      // 认证中 - OCR Verifying
      {
        match: () =>
          (overallStatus === KYC_OVERALL_STATUS.VERIFYING &&
            verifyType === KYC_VERIFY_TYPE.OCR &&
            // 认证中或人工审核中都显示 认证中状态， 因为人工审核中也是在审核这个 OCR 结果
            (status === KYC_STATUS.VERIFYING || status === KYC_STATUS.REVIEW)) ||
          // 认证后，子流程需要重新提交收入证明材料
          (verifyType === KYC_VERIFY_TYPE.INCOME && status === KYC_STATUS.REVIEW),
        render: () => <Verifying refresh={refresh} />,
      },
      // 认证中 - OCR Failed/Rejected Retry
      {
        match: () =>
          overallStatus === KYC_OVERALL_STATUS.VERIFYING &&
          verifyType === KYC_VERIFY_TYPE.OCR &&
          status === KYC_STATUS.REJECTED &&
          isRetry,
        // 因为 isRetry 为 true 进入的 BaseInfo 组件，需要 BaseInfo 组件卸载的时候，执行 resetRetry, 把 isRetry 设置为 false
        render: () => (
          <BaseInfo
            onResetRetry={resetRetry}
            refresh={refresh}
            userInfo={kycDetail.userInfo}
            rejectReason={kycDetail.rejectReason}
          />
        ),
      },
      // 认证中 - OCR Failed/Rejected
      {
        match: () =>
          overallStatus === KYC_OVERALL_STATUS.VERIFYING &&
          verifyType === KYC_VERIFY_TYPE.OCR &&
          status === KYC_STATUS.REJECTED,
        render: () => (
          <OCRVerifyFailed
            retry={() => {
              setIsRetry(true)
            }}
          />
        ),
      },
      // TODO: 暂时不做
      // 认证中 - Liveness Verifying and retry OCR
      // 认证中 - 活体认证达最大次数之后，如果要重试的话，重新进入 BaseInfo 组件
      // {
      //   match: () =>
      //     overallStatus === KYC_OVERALL_STATUS.VERIFYING &&
      //     verifyType === KYC_VERIFY_TYPE.LIVENESS &&
      //     status === KYC_STATUS.VERIFYING &&
      //     isRetry,
      //   render: () => (
      //     <BaseInfo
      //       refresh={refresh}
      //       userInfo={kycDetail.userInfo}
      //       rejectReason={kycDetail.rejectReason}
      //     />
      //   ),
      // },
      // 认证中 - Liveness Verifying or Retry
      {
        match: () =>
          overallStatus === KYC_OVERALL_STATUS.VERIFYING &&
          verifyType === KYC_VERIFY_TYPE.LIVENESS &&
          (status === KYC_STATUS.VERIFYING || (status === KYC_STATUS.REJECTED && isRetry)),
        render: () => (
          <FaceRecognition status={status} refresh={refresh} onResetRetry={resetRetry} />
        ),
      },
      // 认证中 - Liveness Verify Failed/Rejected
      {
        match: () =>
          overallStatus === KYC_OVERALL_STATUS.VERIFYING &&
          status === KYC_STATUS.REJECTED &&
          verifyType === KYC_VERIFY_TYPE.LIVENESS,
        render: () => (
          <FaceRecognitionFailed
            retry={() => {
              setIsRetry(true)
            }}
          />
        ),
      },
      // 认证中 - AML verifying 和 review (人工审核中)
      {
        match: () =>
          overallStatus === KYC_OVERALL_STATUS.VERIFYING &&
          verifyType === KYC_VERIFY_TYPE.AML &&
          (status === KYC_STATUS.VERIFYING || status === KYC_STATUS.REVIEW),
        render: () => <Verifying refresh={refresh} />,
      },
      // 认证中 - AML Declined (AML 驳回)
      {
        match: () =>
          overallStatus === KYC_OVERALL_STATUS.VERIFYING &&
          verifyType === KYC_VERIFY_TYPE.AML &&
          status === KYC_STATUS.DECLINED,
        render: () => (
          <ExtraInfo
            reviewCommentToUser={kycDetail?.userInfo?.reviewInfo?.reviewCommentToUser}
            refresh={refresh}
          />
        ),
      },
      // 认证中 - KYT Verifying
      {
        match: () =>
          overallStatus === KYC_OVERALL_STATUS.VERIFYING &&
          verifyType === KYC_VERIFY_TYPE.KYT &&
          status === KYC_STATUS.VERIFYING,
        render: () => <Verifying refresh={refresh} />,
      },
      // 认证成功
      {
        match: () => overallStatus === KYC_OVERALL_STATUS.VERIFIED,
        render: () => <VerifySucceeded />,
      },
      // 加一个兜底渲染
      {
        match: () =>
          overallStatus === KYC_OVERALL_STATUS.VERIFYING && status === KYC_STATUS.VERIFYING,
        render: () => <Verifying refresh={refresh} />,
      },
    ]
  }, [kycDetail, expireStatus, isRetry])

  const matchedRule = rules.find(r => r.match())
  if (matchedRule) {
    return <MainContentWrapper>{matchedRule.render()}</MainContentWrapper>
  }
  return null
}

function MainContentWrapper(props: { children: ReactNode }) {
  return (
    <div className=' min-h-screen bg-[#0E0E0E]'>
      <MainLayout className="pb-11">
        <IdentityLayout>{props.children}</IdentityLayout>
      </MainLayout>
      {/* <XFooter /> */}
    </div>
  )
}

export default IdentityEntry
