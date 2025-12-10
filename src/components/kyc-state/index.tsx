import { useCallback, useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react"; // 关闭按钮图标（可换）
import { Button } from "../ui/button";
import { kycApi } from "@/service/kyc/api";
import { LazyImage } from "../image/LazyImage";
import { KYC_OVERALL_STATUS, KYC_RISK_LEVEL, KYC_STATUS, KYC_VERIFY_TYPE, type IKycStatus } from "@/service/kyc/types";
import { useFetchKycStatus } from "@/hooks/useKycStatus";
import { useKycStore } from "@/stores/kycStore";
import { useTranslation } from "@/hooks/useTranslation";
import { useRouter } from "@/hooks/useRouter";

const KycState = () => {
  const { t } = useTranslation()
  const router = useRouter()
  const [show, setShow] = useState(false);
  const [content, setContent] = useState({title: '', content: '', btnText: '', btn: ''})
  const kycDetail = useKycStore(state => state.kycDetail)

  useFetchKycStatus()

  const ocrFail = useMemo(() => {
    const fail = kycDetail && kycDetail.overallStatus === KYC_OVERALL_STATUS.VERIFYING &&
      (kycDetail.status === KYC_STATUS.FAIL || kycDetail.status === KYC_STATUS.REJECTED) &&
      kycDetail.verifyType === KYC_VERIFY_TYPE.OCR 
    return fail && kycDetail?.riskLevel !== KYC_RISK_LEVEL.HIGH

  }, [kycDetail])
  const ocrExtra = useMemo(() => {
    const fail = kycDetail && kycDetail.overallStatus === KYC_OVERALL_STATUS.VERIFYING &&
      (kycDetail.status === KYC_STATUS.FAIL || kycDetail.status === KYC_STATUS.REJECTED) &&
      kycDetail.verifyType === KYC_VERIFY_TYPE.OCR
    return fail && kycDetail?.riskLevel === KYC_RISK_LEVEL.HIGH

  }, [kycDetail])
  
  // 显示后 10 秒自动隐藏
  useEffect(() => {
    if (!kycDetail) return
    if (ocrFail) {
      setContent({
        title: t('kyc.t29'),
        content: t('kyc.t30'),
        btnText: t('kyc.t31'),
        btn: 'edit'
      })
      setShow(true)
    }
  }, [t, ocrFail]);

  const close = () => setShow(false);

  const handleGo = useCallback(async () => {
    setShow(false)
    if (content.btn === 'edit') {
      router.push('/identity')
    }
  }, [content])

  return ReactDOM.createPortal(
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, x: 80 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 80 }}
          transition={{
            duration: 0.5,
            ease: "easeOut",
          }}
          className="fixed bottom-4 right-4 z-[99] w-[450px] min-h-[200px] border border-[#333333] bg-[#0E0E0E] rounded-[16px] p-4"
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
