import { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react"; // 关闭按钮图标（可换）
import { Button } from "../ui/button";
import { kycApi } from "@/service/kyc/api";
import { LazyImage } from "../image/LazyImage";
import type { IKycStatus } from "@/service/kyc/types";
import { useFetchKycStatus } from "@/hooks/useKycStatus";

const KycState = () => {
  const [show, setShow] = useState(false);

  useFetchKycStatus()
  
  const [statusDetail, setStatusDetail] = useState<IKycStatus | null>()
  // 3 秒后显示
  useEffect(() => {
    kycApi.getKycStatus()
      .then(res => {
        setStatusDetail(res.data)
      })
    // const showTimer = setTimeout(() => {
    //   setShow(true);
    // }, 3000);

    // return () => clearTimeout(showTimer);
  }, []);

  // 显示后 10 秒自动隐藏
  useEffect(() => {
    // if (!show) return;

    // const hideTimer = setTimeout(() => {
    //   setShow(false);
    // }, 10000);

    // return () => clearTimeout(hideTimer);
  }, [show]);

  const close = () => setShow(false);

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
              <div className="text-[#FFB219] text-[18px] font-medium">证件即将到期</div>
            </div>
            <button
              onClick={close}
              className="absolute top-4 right-4 rounded hover:bg-[#1e1e1e] transition"
            >
              <X size={24} className="text-white" />
            </button>
          </div>
          <div className="text-white text-base font-normal leading-6 text-center my-5">
            您的證件即將到期，請於 YYYY-MM-DD HH:MM 前儘速更新，以免影響後續交易。
          </div>
          <Button className="w-full h-[44px] bg-[#1D1D1D] text-white">立即更新</Button>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default KycState;
