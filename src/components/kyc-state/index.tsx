import { useCallback, useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react"; // 关闭按钮图标（可换）
import { Button } from "../ui/button";
import { LazyImage } from "../image/LazyImage";
import { KYC_OVERALL_STATUS, KYC_RISK_LEVEL, KYC_STATUS, KYC_VERIFY_TYPE, type IKycStatus } from "@/service/kyc/types";
import { useFetchKycStatus, useKycExpired, useKycStatus } from "@/hooks/useKycStatus";
import { useKycStore } from "@/stores/kycStore";
import { useTranslation } from "@/hooks/useTranslation";
import { useRouter } from "@/hooks/useRouter";
import { usePendingStep } from "@/hooks/usePendingStep";
import { formatSecondsToDateTime } from "@/utils/format";

const NO_SHOW_PATH = ['/identity', '/']

const defaultContent = {title: '', content: '', btnText: '', btn: ''}

const KycState = () => {
  const { t } = useTranslation()
  const router = useRouter()
  const [show, setShow] = useState(false);
  const [content, setContent] = useState(defaultContent)
  const kycDetail = useKycStore(state => state.kycDetail)
  const isNotShow = useMemo(() => NO_SHOW_PATH.includes(router.location.pathname), [router.location.pathname])
  const { expired, expiring, desc } = useKycExpired()
  const pendingStep = usePendingStep()

  useFetchKycStatus()

  // 1. ocr失败，填写信息与证件信息不一致
  const ocrFail = useMemo(() => {
    const fail = kycDetail && kycDetail.overallStatus === KYC_OVERALL_STATUS.VERIFYING &&
      (kycDetail.status === KYC_STATUS.DECLINED || kycDetail.status === KYC_STATUS.REJECTED) &&
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

  const liveNessReject = useMemo(() => {
    const fail = kycDetail && kycDetail.overallStatus === KYC_OVERALL_STATUS.VERIFYING &&
      (kycDetail.status === KYC_STATUS.DECLINED ||  kycDetail.status === KYC_STATUS.VERIFYING) &&
      kycDetail.verifyType === KYC_VERIFY_TYPE.LIVENESS
    return fail

  }, [kycDetail])

  const amlDeclined = useMemo(() => {
    const fail = kycDetail && kycDetail.overallStatus === KYC_OVERALL_STATUS.VERIFYING &&
      (kycDetail.status === KYC_STATUS.DECLINED) &&
      kycDetail.verifyType === KYC_VERIFY_TYPE.AML
    return fail 

  }, [kycDetail])

  
  // 显示后 10 秒自动隐藏
  useEffect(() => {
    if (expired) {
      setContent({
        title: t('kyc.t48'),
        content: t('kyc.t49', { expire: desc }),
        btnText: t('kyc.t50'),
        btn: 'edit'
      })
      
      setShow(true)
      return
    }

    if (pendingStep.expired) {
      setContent({
        title: t('kyc.t45'),
        content: t('kyc.t46', { expire: desc }),
        btnText: t('kyc.t47'),
        btn: 'edit'
      })
      setShow(true)
      return
    }

    if (pendingStep.risk3 && kycDetail?.expireTime) {
      setContent({
        title: t('kyc.t25'),
        content: t('kyc.t32', {expire: formatSecondsToDateTime(Math.floor((kycDetail?.expireTime || 0) / 1000))}),
        btnText: t('kyc.t33'),
        btn: 'upload'
      })
      setShow(true)
      return
    }
    if (!kycDetail && !pendingStep.step) {
      setShow(false)
      setContent(defaultContent)
    }
    if (!kycDetail || isNotShow || pendingStep.step) {
      
      return
    } 


    if (ocrIncome && kycDetail?.expireTime) {
      setContent({
        title: t('kyc.t29'),
        content: t('kyc.t32', {expire: formatSecondsToDateTime(Math.floor((kycDetail?.expireTime || 0) / 1000))}),
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
      return
    }
    if (amlDeclined) {
      setContent({
        title: t('kyc.t29'),
        content: t('kyc.t34'),
        btnText: t('kyc.t35'),
        btn: 'edit'
      })
      setShow(true)
      return
    }
    if (liveNessReject) {
      setContent({
        title: t('kyc.t29'),
        content: t('kyc.t36'),
        btnText: t('kyc.t37'),
        btn: 'edit'
      })
      setShow(true)
      return
    }
    setShow(false)
    setContent(defaultContent)
  }, [t, ocrFail, ocrIncome, amlDeclined, isNotShow, expired, expiring, desc, pendingStep]);

  useEffect(() => {
    if (isNotShow) {
      setShow(false)
      setContent(defaultContent)
    }
  }, [isNotShow])

  const close = () => setShow(false);

  const handleGo = useCallback(async () => {
    setShow(false)
    if (content.btn === 'edit') {
      
    }
    router.push('/identity?retry=true')
  }, [content])

  return ReactDOM.createPortal(
    <AnimatePresence>
      {show && !isNotShow && content.title && (
        <motion.div
          initial={{ opacity: 0, x: 80 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 80 }}
          transition={{
            duration: 0.5,
            ease: "easeOut",
          }}
          className="fixed bottom-4 right-4 z-[99] w-[400px] min-h-[164px] border border-[#232427] bg-[#1A1B1E] rounded-[16px] p-4 flex flex-col justify-between"
        >
          <div className="flex justify-between">
            <div className="flex items-center gap-x-2 mt-1">
              <LazyImage src="/images/v2/icons/id.png" className="w-[21px] h-[14px]" />
              <div className="text-[#FFB219] text-[14px] font-medium">{content.title}</div>
            </div>
            <button
              onClick={close}
              className="absolute top-4 right-4 rounded hover:bg-[#1e1e1e] transition"
            >
              <img src="/images/v2/icons/close_light.png" className="w-3 h-3" />
            </button>
          </div>
          <div className="text-white text-[14px] font-normal leading-6 text-center my-5">
            {content.content}
          </div>
          <Button className="w-full h-[44px] bg-[#232427] text-white text-[14px] font-medium"
            onClick={handleGo}
          >{content.btnText}</Button>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default KycState;
