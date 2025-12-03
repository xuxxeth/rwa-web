import { useEffect, useState, type ReactNode } from 'react'
import { MainLayout } from '@/layouts/main'
import { XFooter } from '@/components/footer'
import { BaseInfo } from './components/BaseInfo'
import { IdentityLayout } from './components/IdentityLayout'
import { WarningInfo } from './components/WarningInfo'
import { kycApi } from '@/service/kyc/api'
import type { IKycDetail } from '@/service/kyc/types'

function Identity() {
  const [kycDetail, setKycDetail] = useState<IKycDetail | undefined>(undefined)

  const refresh = async () => {
    const res = await kycApi.getKycDetail()
    setKycDetail(res.data)
  }

  useEffect(() => {
    refresh()
  }, [])

  if (kycDetail === undefined) {
    return 'loading...'
  }

  // 这样简单的 Mock 一下
  const MockKycDetail: IKycDetail = {
    account: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    overallStatus: 0,
    riskLevel: 3,
    verifyType: 'basic-info',
    pendingMaterials: 'income-certificate',
  }

  const { account, overallStatus, riskLevel, userInfo, pendingMaterials, verifyType } =
    MockKycDetail

  //  0 未认证, 显示信息采集组件
  if (overallStatus === 0) {
    return (
      <MainContentWrapper>
        <WarningInfo />
        <BaseInfo />
      </MainContentWrapper>
    )
  }

  // 1 认证中
  if (overallStatus === 1) {
    // 接下来判断处于认证的哪个阶段, 1. basic-info 阶段
    if (verifyType === 'basic-info') {
      // 高风险，并且用户没有上传收入证明
      if (riskLevel === 3 && pendingMaterials === 'income-certificate') {
        // 用户补充收入证明
        return (
          <MainContentWrapper>
            <div>高风险用户，补充收入证明</div>
          </MainContentWrapper>
        )
      }
    }

    // 2. ocr 阶段
    if (verifyType === 'ocr') {
      // ocr 认证失败了，应该还是展示信息采集组件
      return (
        <MainContentWrapper>
          <WarningInfo />
          <BaseInfo />
        </MainContentWrapper>
      )
    }

    // 3. 活体阶段
    if (verifyType === 'liveness') {
    }

    // 4. aml 阶段
    if (verifyType === 'aml') {
    }

    // 5. kyt 阶段
    if (verifyType === 'kyt') {
      
    }
  }

  // 2. 已通过
  if (overallStatus === 2) {
  }

  // 3. 已拒绝
  if (overallStatus === 3) {
  }

  // 4. 人工审核中
  if (overallStatus === 4) {
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
