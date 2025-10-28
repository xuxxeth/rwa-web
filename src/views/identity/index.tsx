import { Menus } from '@/components/menu'
import { MainLayout } from '@/layouts/main'
import { XFooter } from '@/components/footer'
import { BaseInfo } from './components/BaseInfo'
import { IdentityLayout } from './components/IdentityLayout'
import { useParams } from 'react-router-dom'
import { Upload } from './components/Upload'
import { FaceRecognition } from './components/FaceRecognition'
import { VerifyStatus } from './components/VerifyStatus'

function Identity() {
  const { step } = useParams<{ step: 'info' | 'identityUpload' | 'addressUpload' | 'face' | 'state' }>()

  return (
    <>
      {/* <Menus /> */}
      <MainLayout>
        <IdentityLayout>
          <div className='mt-8'>
            {step === 'info' && <BaseInfo />}
            {step === 'identityUpload' && <Upload type='identity' />}
            {step === 'addressUpload' && <Upload type='address' />}
            {step === 'face' && <FaceRecognition />}
            {step === 'state' && <VerifyStatus />}
          </div>
        </IdentityLayout>
      </MainLayout>
      <XFooter />
    </>
  )
}

export default Identity
