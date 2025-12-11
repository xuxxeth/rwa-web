import { useEffect, useState, type ReactNode } from 'react'
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
import SignatureVerify from '../assets/SignatureVerify'

function IdentityEntry() {
  const isWalletConnecting = useAppStore(state => state.isWalletConnecting)
  const [isSignatureValid, refreshIsSignatureValid] = useSignatureValidStatus()

  const account = useAccount()
  const chainId = useChainId()

  const walltedConnected = account && chainId

  if (!walltedConnected && isWalletConnecting) return null

  if (!walltedConnected) {
    // TODO: 修改一些文案
    return <WalletNotConnected />
  }

  if (!isSignatureValid) {
    // TODO: 修改一些文案
    return <SignatureVerify className='mt-9' refreshIsSignatureValid={refreshIsSignatureValid} />
  }

  return <Identity />
}

function Identity() {
  const [kycDetail, setKycDetail] = useState<IKycDetail | undefined>(undefined)

  const refresh = async () => {
    const res = await kycApi.getKycDetail()
    setKycDetail(res.data)
    return res
  }

  useEffect(() => {
    refresh()
  }, [])

  if (kycDetail === undefined) {
    return 'loading...'
  }

  const {
    account,
    overallStatus,
    riskLevel,
    status,
    userInfo,
    pendingMaterials,
    verifyType,
    rejectReason,
  } = kycDetail

  if (status === 5) {
    return (
      <MainContentWrapper>
        {/* <IDExpired /> */}
        {/* <Risk3Info /> */}

        <ExtraInfo />
      </MainContentWrapper>
    )
  }

  //  0 未认证, 显示信息采集组件
  if (overallStatus === KYC_OVERALL_STATUS.NOTVERIFIED) {
    return (
      <MainContentWrapper>
        <BaseInfo refresh={refresh} userInfo={kycDetail.userInfo} />
      </MainContentWrapper>
    )
  }

  // 1 认证中
  if (overallStatus === KYC_OVERALL_STATUS.VERIFYING) {
    // 接下来判断处于认证的哪个阶段,
    // 1. basic-info 阶段
    if (verifyType === KYC_VERIFY_TYPE.INCOME) {
      // 高风险，并且用户没有上传收入证明
      if (riskLevel === KYC_RISK_LEVEL.HIGH) {
        // 用户补充收入证明
        return (
          <MainContentWrapper>
            <Risk3Info />
          </MainContentWrapper>
        )
      }
    }

    // 2. OCR 阶段
    if (verifyType === KYC_VERIFY_TYPE.OCR) {
      // 1 认证中
      if (status === KYC_STATUS.VERIFYING) {
        return (
          <MainContentWrapper>
            <Verifying />
          </MainContentWrapper>
        )
      }

      // ocr 认证失败, 6 已拒绝, 3 已失败
      if (status === KYC_STATUS.REJECTED || status === KYC_STATUS.FAIL) {
        return (
          <MainContentWrapper>
            <OCRVerifyFailed
              retryComponent={<BaseInfo refresh={refresh} userInfo={kycDetail.userInfo} />}
            />
          </MainContentWrapper>
        )
      }
    }

    // 3. 活体阶段
    if (verifyType === KYC_VERIFY_TYPE.LIVENESS) {
      // 活体认证 1. 认证中
      if (status === KYC_STATUS.VERIFYING) {
        return (
          <MainContentWrapper>
            <FaceRecognition refresh={refresh} />
          </MainContentWrapper>
        )
      }
      // 活体认证  6 已拒绝, 3 已失败
      if (status === KYC_STATUS.REJECTED || status === KYC_STATUS.FAIL) {
        return (
          <MainContentWrapper>
            <FaceRecognitionFailed retryComponent={<FaceRecognition refresh={refresh} />} />
          </MainContentWrapper>
        )
      }
    }

    // 4. aml 阶段
    if (verifyType === KYC_VERIFY_TYPE.AML) {
      // 4. 人工审核中，即使待审核的意思，等待审核员审核
      if (status === KYC_STATUS.VERIFYING) {
        return (
          <MainContentWrapper>
            <Verifying />
          </MainContentWrapper>
        )
      }

      // 7. 已经驳回
      if (status === KYC_STATUS.DECLINED) {
        // 显示 AML 人审补充信息
        return (
          <MainContentWrapper>
            <div>aml 人审核补充信息</div>
          </MainContentWrapper>
        )
      }
    }

    // 5. kyt 阶段，在电脑端
    if (verifyType === KYC_VERIFY_TYPE.KYT) {
    }
  }

  // 2. 已通过
  if (overallStatus === KYC_OVERALL_STATUS.VERIFIED) {
    return (
      <MainContentWrapper>
        <VerifySucceeded />
      </MainContentWrapper>
    )
  }

  // 3. 已拒绝
  if (overallStatus === KYC_OVERALL_STATUS.FAIL) {
    return (
      <MainContentWrapper>
        <VerifyFailed />
      </MainContentWrapper>
    )
  }
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
