import { useEffect, useState } from "react"
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock"
import { useTranslation } from "@/hooks/useTranslation"
import { LazyImage } from "../image/LazyImage"
import { Button } from "../ui/button"
import { CheckBox } from "../check-box"
import { kycApi } from "@/service/kyc/api"
import { RESPONSE_CODE } from "@/config/constants"
import { useToast } from "@/hooks/useToast"
import { useActiveWeb3 } from "@/hooks/useActiveWe3"
import { useSignatureValidStatus } from "@/hooks/useSignature"

const Compliance = () => {
  const { t } = useTranslation()
  const { account } = useActiveWeb3()
  const [isSignatureValid] = useSignatureValidStatus()
  const { toastError } = useToast()
  const { unlock, lock } = useBodyScrollLock()
  const [show, setShow] = useState(false)
  const [aggree, setAggreee] = useState(false)
  const [loading, setLoading] = useState(false)

  const getAgreementsAccepted = async () => {
    setLoading(true)
    const res = await kycApi.getAgreementsAccepted()
    setLoading(false)
    if (res && res.data && !res.data.privacy) {
      setShow(true)
      lock()
    } else {
      setShow(false)
      unlock()
    }
    return res
  }

  const handleAggree = async () => {

    setLoading(true)
    const res = await kycApi.postAgreementsAccept('v1')
    setLoading(false)
    if (res?.code === RESPONSE_CODE.SUCCESS) {
      setShow(false)
      const resGet = await getAgreementsAccepted()
      if (resGet?.data?.privacy) {
        setShow(false)
        unlock()
      } 
    } else {
      toastError({title: res?.message || ''})
    }
    
  }

  useEffect(() => {
    if (account && isSignatureValid) {
      getAgreementsAccepted()
    }
  }, [account, isSignatureValid])


  return (
    <>
      {
        show && 
          <div className=" fixed z-[99] top-0 left-0 bottom-0 right-0 bg-[rgba(0,0,0,0.1)] backdrop-blur-[20px] flex justify-center pt-[107px] text-white font-normal">
            <div className=" rounded-[16px] border border-[#333333] max-h-[calc(100vh-214px)] bg-[#0E0E0E] pr-2 py-2">
              <div className=" w-[528px] h-full px-8 py-6 pr-1">
                <div className=" text-center text-[24px]">{t('compliance.t1')}</div>
                <div className=" text-[18px] font-normal h-full pb-10 overflow-auto pr-4">
                  <div className="my-5">{t('compliance.t2')}</div>
                  <div className="mb-5">{t('compliance.t3')}</div>
                  <div className=" space-y-2">
                    <div className="flex items-center gap-x-1">
                      <LazyImage src="/images/country/us.png" className="w-[24px]" />
                      {t('compliance.t4')}
                    </div>
                    <div className="flex items-center gap-x-1">
                      <LazyImage src="/images/country/canada.png" className="w-[24px]" />
                      {t('compliance.t5')}
                    </div>
                    <div className="flex items-center gap-x-1">
                      <LazyImage src="/images/country/ru.png" className="w-[24px]" />
                      {t('compliance.t7')}
                    </div>
                    <div>
                      {t('compliance.t8')}
                    </div>
                  </div>
                  <div className="mt-5">
                    <div>{t('compliance.t9')}</div>
                    <div>• {t('compliance.t10')}</div>
                    <div>• {t('compliance.t11')}</div>
                    <div>• {t('compliance.t12')}</div>
                    <div className="mt-5">{t('compliance.t13')}</div>
                  </div>
                  <Button disabled={!aggree || loading} loading={loading} className="w-full mt-8 mb-5" onClick={handleAggree} >{t('compliance.t14')}</Button>
                  <div className="flex gap-x-2 items-start">
                    <div className=" shrink-0 relative top-[2px]">
                      <CheckBox 
                        onChange={check => {
                          setAggreee(check)
                        }}
                      />
                    </div>
                    <div className="text-[rgba(255,255,255,0.6)] text-[16px]">
                      {t('identity.aggree1')}
                      <a href="/documents/cyberalpha-terms-of-service.pdf" target="_blank" className="text-[rgba(26,133,255,1)]">《{t('compliance.t15')}》</a>
                      {t('compliance.t17')}
                      <a href="/documents/cyberalpha-privacy-policy.pdf" target="_blank" className="text-[rgba(26,133,255,1)]">《{t('compliance.t16')}》</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
      }
    </>
    
  )
}

export default Compliance