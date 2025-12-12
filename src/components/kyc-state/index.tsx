import { useCallback, useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react"; // 关闭按钮图标（可换）
import { Button } from "../ui/button";
import { kycApi } from "@/service/kyc/api";
import { LazyImage } from "../image/LazyImage";
import { KYC_OVERALL_STATUS, KYC_RISK_LEVEL, KYC_STATUS, KYC_VERIFY_TYPE, type IKycStatus } from "@/service/kyc/types";
import { useFetchKycStatus, useKycExpired, useKycStatus } from "@/hooks/useKycStatus";
import { useKycStore } from "@/stores/kycStore";
import { useTranslation } from "@/hooks/useTranslation";
import { useRouter } from "@/hooks/useRouter";

const NO_SHOW_PATH = ['/identity']

const KycState = () => {
  const { t } = useTranslation()
  const router = useRouter()
  const [show, setShow] = useState(false);
  const [content, setContent] = useState({title: '', content: '', btnText: '', btn: ''})
  const kycDetail = useKycStore(state => state.kycDetail)
  const isNotShow = useMemo(() => NO_SHOW_PATH.includes(router.location.pathname), [router.location.pathname])
  const { expired, expiring, desc } = useKycExpired()

  useFetchKycStatus()

  // 1. ocr失败，填写信息与证件信息不一致
  const ocrFail = useMemo(() => {
    const fail = kycDetail && kycDetail.overallStatus === KYC_OVERALL_STATUS.VERIFYING &&
      (kycDetail.status === KYC_STATUS.FAIL || kycDetail.status === KYC_STATUS.REJECTED) &&
      kycDetail.verifyType === KYC_VERIFY_TYPE.OCR 
    return fail

  }, [kycDetail])

  // 2. // 高风险用户，需要上传收证明
  const ocrIncome = useMemo(() => {
    const fail = kycDetail && kycDetail.overallStatus === KYC_OVERALL_STATUS.VERIFYING &&
      (kycDetail.status !== KYC_STATUS.VERIFIED) &&
      kycDetail.verifyType === KYC_VERIFY_TYPE.INCOME
    return fail && kycDetail?.riskLevel === KYC_RISK_LEVEL.HIGH

  }, [kycDetail])
  // 3. 
  const amlDeclined = useMemo(() => {
    const fail = kycDetail && kycDetail.overallStatus === KYC_OVERALL_STATUS.VERIFYING &&
      (kycDetail.status === KYC_STATUS.DECLINED) &&
      kycDetail.verifyType === KYC_VERIFY_TYPE.AML
    return fail && kycDetail?.riskLevel === KYC_RISK_LEVEL.HIGH

  }, [kycDetail])

  const liveNessReject = useMemo(() => {
    const fail = kycDetail && kycDetail.overallStatus === KYC_OVERALL_STATUS.VERIFYING &&
      (kycDetail.status === KYC_STATUS.REJECTED) &&
      kycDetail.verifyType === KYC_VERIFY_TYPE.LIVENESS
    return fail && kycDetail?.riskLevel === KYC_RISK_LEVEL.HIGH

  }, [kycDetail])
  
  // 显示后 10 秒自动隐藏
  useEffect(() => {
    if (expired && !show) {
      setContent({
        title: t('kyc.t48'),
        content: t('kyc.t49', { expire: desc }),
        btnText: t('kyc.t50'),
        btn: 'edit'
      })
      setShow(true)
    }

    if (expiring && !show) {
      setContent({
        title: t('kyc.t45'),
        content: t('kyc.t46', { expire: desc }),
        btnText: t('kyc.t47'),
        btn: 'edit'
      })
      setShow(true)
    }

    if (!kycDetail || isNotShow || show) return

    if (ocrIncome) {
      setContent({
        title: t('kyc.t29'),
        content: t('kyc.t32'),
        btnText: t('kyc.t33'),
        btn: 'upload'
      })
      setShow(true)
      return
    }

    if (ocrFail) {
      setContent({
        title: t('kyc.t29'),
        content: t('kyc.t30'),
        btnText: t('kyc.t31'),
        btn: 'edit'
      })
      setShow(true)
    }
    if (amlDeclined) {
      setContent({
        title: t('kyc.t29'),
        content: t('kyc.t34'),
        btnText: t('kyc.t35'),
        btn: 'edit'
      })
      setShow(true)
    }
    if (liveNessReject) {
      setContent({
        title: t('kyc.t29'),
        content: t('kyc.t36'),
        btnText: t('kyc.t37'),
        btn: 'edit'
      })
      setShow(true)
    }
    
    
  }, [t, ocrFail, ocrIncome, amlDeclined, isNotShow, expired, expiring, desc]);

  const close = () => setShow(false);

  const handleGo = useCallback(async () => {
    setShow(false)
    if (content.btn === 'edit') {
      
    }
    router.push('/identity?retry=true')
  }, [content])

  return ReactDOM.createPortal(
    <AnimatePresence>
      {show && !isNotShow && (
        <motion.div
          initial={{ opacity: 0, x: 80 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 80 }}
          transition={{
            duration: 0.5,
            ease: "easeOut",
          }}
          className="fixed bottom-4 right-4 z-[99] w-[450px] min-h-[200px] border border-[#333333] bg-[#0E0E0E] rounded-[16px] p-4 flex flex-col justify-between"
        >
          <div className="flex justify-between">
            <div className="flex items-center gap-x-2">
              <LazyImage src="/images/kyc/id.png" className="w-6 h-4" />
              <div className="text-[#FFB219] text-[18px] font-medium">{content.title}</div>
            </div>
            <button
              onClick={close}
              className="absolute top-4 right-4 rounded hover:bg-[#1e1e1e] transition"
            >
              <X size={24} className="text-white" />
            </button>
          </div>
          <div className="text-white text-base font-normal leading-6 text-center my-5">
            {content.content}
          </div>
          <Button className="w-full h-[44px] bg-[#1D1D1D] text-white"
            onClick={handleGo}
          >{content.btnText}</Button>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default KycState;
