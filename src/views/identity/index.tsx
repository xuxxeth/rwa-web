import { useEffect, useState, useMemo, type ReactNode, useRef } from 'react'
import { MainLayout } from '@/layouts/main'
import { XFooter } from '@/components/footer'
import { BaseInfo } from './components/BaseInfo'
import { IdentityLayout } from './components/IdentityLayout'
import { kycApi } from '@/service/kyc/api'
import {
  KYC_RISK_LEVEL,
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

function IdentityEntry() {
  const isWalletConnecting = useAppStore(state => state.isWalletConnecting)
  const [isSignatureValid, refreshIsSignatureValid] = useSignatureValidStatus()
  const account = useAccount()
  const chainId = useChainId()

  const walltedConnected = account && chainId

  if (!walltedConnected && isWalletConnecting) return null

  if (!walltedConnected) {
    return <WalletNotConnected desc='identity.cwdesc' />
  }

  if (!isSignatureValid) {
    return (
      <SignatureVerify
        desc='identity.signd'
        subDesc='identity.signSubd'
        className='mt-9'
        refreshIsSignatureValid={refreshIsSignatureValid}
      />
    )
  }

  return <Identity account={account} />
}

function Identity({ account }: { account: string }) {
  const [kycDetail, setKycDetail] = useState<IKycDetail | undefined>(undefined)
  const expireStatus = useKycExpired()

  const [searchParams] = useSearchParams()
  const isRetryFromUrl = searchParams.get('retry') === 'true'
  const [isRetry, setIsRetry] = useState(isRetryFromUrl)
  const pendingStep = usePendingStep()
  const pendingStepRef = useRef(0)

  const resetRetry = () => {
    setIsRetry(prev => (prev === true ? false : prev))
  }

  const refresh = async () => {
    try {
      const res = await kycApi.getKycDetail()
      if (res?.data) {
        if (!res.data.userInfo || pendingStepRef.current) {
          const stepRes = await kycApi.getKycStepDetail(pendingStepRef.current)
          const stepData = stepRes.data[0] ? stepRes.data[0] : {}
          // @ts-ignore
          stepData.overallStatus = stepData.applyStatus || res.data?.overallStatus
          res.data = {
            ...res.data,
            ...stepData
          }
        }
      }
      setKycDetail(res?.data || {})
      return res
    } catch (error) {
      return {
        code: 500,
        data: {
          overallStatus: KYC_OVERALL_STATUS.VERIFYING,
        },
        message: null,
      }
    }
  }

  useEffect(() => {
    if (pendingStep.step) {
      pendingStepRef.current = pendingStep.step
    }
    refresh()
  }, [account, pendingStep.step])

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
          overallStatus === KYC_OVERALL_STATUS.VERIFYING && verifyType === KYC_VERIFY_TYPE.ID_INFO,
        render: () => <IDExpired userInfo={kycDetail.userInfo} refresh={refresh} expired={pendingStep.expired} />,
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
      // 认证成功
      {
        match: () => overallStatus === KYC_OVERALL_STATUS.VERIFIED,
        render: () => <VerifySucceeded />,
      },
      // 认证失败
      {
        match: () => overallStatus === KYC_OVERALL_STATUS.REJECTED,
        render: () => <VerifyFailed />,
      },
      // 认证中 - Income High Risk
      {
        match: () =>
          overallStatus === KYC_OVERALL_STATUS.VERIFYING &&
          verifyType === KYC_VERIFY_TYPE.INCOME &&
          riskLevel === KYC_RISK_LEVEL.HIGH,
        render: () => <Risk3Info refresh={refresh} />,
      },
      // 认证中 - OCR Verifying
      {
        match: () =>
          overallStatus === KYC_OVERALL_STATUS.VERIFYING &&
          verifyType === KYC_VERIFY_TYPE.OCR &&
          status === KYC_STATUS.VERIFYING,
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
        render: () => <ExtraInfo />,
      },
      // 认证中 - KYT Verifying
      {
        match: () =>
          overallStatus === KYC_OVERALL_STATUS.VERIFYING &&
          verifyType === KYC_VERIFY_TYPE.KYT &&
          status === KYC_STATUS.VERIFYING,
        render: () => <Verifying refresh={refresh} />,
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
    <>
      <MainLayout>
        <IdentityLayout>{props.children}</IdentityLayout>
      </MainLayout>
      <XFooter />
    </>
  )
}

export default IdentityEntry
