import { MainLayout } from '@/layouts/main'
import { XFooter } from '@/components/footer'
import { BaseInfo } from './components/BaseInfo'
import { IdentityLayout } from './components/IdentityLayout'
import { WarningInfo } from './components/WarningInfo'

function Identity() {

  return (
    <>
      <MainLayout>
        <IdentityLayout>
          <WarningInfo />
          <BaseInfo />
        </IdentityLayout>
      </MainLayout>
      <XFooter />
    </>
  )
}

export default Identity
