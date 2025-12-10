import { useEffect, useState, type ReactNode } from 'react'
import { MainLayout } from '@/layouts/main'
import { XFooter } from '@/components/footer'
import { BaseInfo } from './components/BaseInfo'
import { IdentityLayout } from './components/IdentityLayout'
import { WarningInfo } from './components/WarningInfo'
import { kycApi } from '@/service/kyc/api'
import type { IKycDetail } from '@/service/kyc/types'
import FaceRecognition from './components/FaceRecognition'
import { Risk3Info } from './components/Risk3Info'
import { IDExpired } from './components/IDExpired'
import { ExtraInfo } from './components/ExtraInfo'
import { ReviewInfo } from './components/ReviewInfo'
import {
  OCRVerifyFailed,
  FaceRecognitionFailed,
  VerifySucceeded,
  VerifyFailed,
  Verifying,
} from './components/VerifyStatus'

function Identity() {

  const [kycDetail, setKycDetail] = useState<IKycDetail | undefined>(undefined)

  const refresh = async () => {
    const res = await kycApi.getKycDetail()
    setKycDetail(res.data || { overallStatus: 0, verifyType: 'basic-info', status: 0 })
    return res
  }

  useEffect(() => {
    refresh()
  }, [])

  if (kycDetail === undefined) {
    return 'loading...'
  }

  // 这样简单的 Mock 一下
  // const MockKycDetail: IKycDetail = {
  //   account: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
  //   overallStatus: 1,
  //   riskLevel: 3,
  //   verifyType: 'aml',
  //   pendingMaterials: 'income-certificate',
  //   status: 4,
  // }

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
  if (overallStatus === 0) {
    return (
      <MainContentWrapper>
        <BaseInfo refresh={refresh} userInfo={kycDetail.userInfo} />
      </MainContentWrapper>
    )
  }

  // 1 认证中
  if (overallStatus === 1) {
    // 接下来判断处于认证的哪个阶段,
    // 1. basic-info 阶段
    if (verifyType === 'basic-info') {
      // 高风险，并且用户没有上传收入证明
      if (riskLevel === 3 && pendingMaterials === 'income-certificate') {
        // 用户补充收入证明
        return (
          <MainContentWrapper>
            <Risk3Info />
          </MainContentWrapper>
        )
      }
    }

    // 2. OCR 阶段
    if (verifyType === 'OCR') {
      // 1 认证中
      if (status === 1) {
        return (
          <MainContentWrapper>
            <Verifying />
          </MainContentWrapper>
        )
      }

      // ocr 认证失败, 6 已拒绝, 3 已失败
      if (status === 6 || status === 3) {
        return (
          <MainContentWrapper>
            <OCRVerifyFailed retryComponent={<BaseInfo refresh={refresh} userInfo={kycDetail.userInfo} />} />
          </MainContentWrapper>
        )
      }
    }

    // 3. 活体阶段
    if (verifyType === 'liveness') {
      // 活体认证 1. 认证中
      if (status === 1) {
        return (
          <MainContentWrapper>
            <FaceRecognition refresh={refresh} />
          </MainContentWrapper>
        )
      }
      // 活体认证  6 已拒绝, 3 已失败
      if (status === 6 || status === 3) {
        return (
          <MainContentWrapper>
            <FaceRecognitionFailed retryComponent={<FaceRecognition refresh={refresh} />} />
          </MainContentWrapper>
        )
      }
    }

    // 4. aml 阶段
    if (verifyType === 'aml') {
      // 4. 人工审核中，即使待审核的意思，等待审核员审核
      if (status === 4) {
        return (
          <MainContentWrapper>
            <Verifying />
          </MainContentWrapper>
        )
      }

      // 7. 已经驳回
      if (status === 7) {
        // 显示 AML 人审补充信息
        return (
          <MainContentWrapper>
            <div>aml 人审核补充信息</div>
          </MainContentWrapper>
        )
      }
    }

    // 5. kyt 阶段，在电脑
    if (verifyType === 'kyt') {
    }
  }

  // 2. 已通过
  if (overallStatus === 2) {
    return (
      <MainContentWrapper>
        <VerifySucceeded />
      </MainContentWrapper>
    )
  }

  // 3. 已拒绝
  if (overallStatus === 3) {
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

export default Identity
