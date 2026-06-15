import { useEffect, useCallback, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X, Share2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LazyImage } from "../image/LazyImage";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { useTranslation } from "@/hooks/useTranslation";
import { Trans } from "../trans";
import QRCode from "../qrcode";
import { handleShare, SHARE_TEXT, type Lang } from "@/utils/share";
import { useToast } from "@/hooks/useToast";

interface TikoInviteModalProps {
  open: boolean;
  onClose: () => void;
  inviteCode?: string;
  qrCodeSrc?: string;
}

export default function TikoInviteModal({
  open,
  onClose,
  inviteCode = "TikoABCDEFG12",
  qrCodeSrc = "",
}: TikoInviteModalProps) {
  const { t, i18n } = useTranslation()
  const { toastSuccess } = useToast()
  const { unlock, lock } = useBodyScrollLock()
  const modalRef = useRef<HTMLDivElement>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, handleKeyDown]);

  const handleSaveImage = async () => {
    if (!modalRef.current || isSaving) return;

    try {
      setIsSaving(true);

      const { toPng } = await import("html-to-image");

      const element = modalRef.current;
      const dataUrl = await toPng(element, {
        backgroundColor: "#111111",
        cacheBust: true,
      });
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `Tiko_Invite_${inviteCode}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Failed to save image:", error);
      alert("保存图片失败，请稍后重试");
    } finally {
      setIsSaving(false);
    }
  };
    useEffect(() => {
      if(!open) {
        unlock()
      } else {
        lock()
      }
    }, [open, unlock, lock])

  if (!open) return null;

  const modal = (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-[418px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-32px)] overflow-y-auto rounded-2xl bg-[#111111] text-white shadow-2xl">
        
        <div ref={modalRef} className="bg-[#0F0F11] pb-4">
          <div className="flex items-center justify-between px-5 pt-6">
            <div className="flex items-center gap-0.5 select-none">
              <LazyImage src="/images/referral/tiko_logo.png" className="w-[55px] h-[21px]" />
            </div>
            <button
              onClick={onClose}
              data-html-to-image-ignore="true"
              className="flex h-8 w-8 items-center justify-center rounded-full text-white/60 hover:bg-white/10 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          <div className="px-6 pt-4 text-center">
            <h2 className="text-[32px] font-medium leading-tight tracking-[1px] ">
              <Trans 
                i18nKey="ref.t26" 
                values={{ r1: '50%' }} 
                components={{
                  r1: <span className=" font-medium text-[#9CFF3A]" />
                }}
              />
              
            </h2>
          </div>

          <div className="flex justify-center px-5 min-h-[249px]">
            <LazyImage src="/images/referral/invite.webp" className="w-full" />
          </div>

          {/* <div className="mt-4 px-9">
            <div className="flex items-center justify-center">
              <div className="flex items-center gap-1.5 text-sm text-[#FFFFFF]">
                <img src="/images/referral/icon_left.png" className="w-[98px] h-[6px]" alt="" />
                <span>{t("ref.t15")}</span>
                <img src="/images/referral/icon_right.png" className="w-[98px] h-[6px]" alt="" />
              </div>
            </div>
            <div className="mt-3 flex items-center justify-center bg-[url('/images/referral/border.svg')] px-6 py-[6px]" style={{backgroundSize: '100% 100%'}}>
              <span className="text-[24px] font-medium tracking-widest text-[#9CFF3A]">{inviteCode}</span>
            </div>
          </div> */}

          <div className="mt-4 flex items-center justify-between px-5">
            <div>
              <p className="text-base font-medium text-white leading-[100%]">{t("ref.t22")}</p>
              <p className=" text-xs text-[#9DA3AF] font-normal leading-[100%] mt-[2px]">{t("ref.t23")}</p>
              <div className="mt-2 border border-[rgba(156,255,58,0.35)] rounded-[4px] h-[24px] flex items-center px-[6px] gap-1 text-[12px] text-[#9CFF3A] font-semibold">
                <span className=" font-medium">{t("ref.t15")}</span> {inviteCode}
              </div>
            </div>
            <div className="h-[72px] w-[72px] overflow-hidden p-[6px] border-[#232427] border rounded-[6px] bg-[rgba(255,255,255, 0.05)]">
              <QRCode value={qrCodeSrc} size={60} rounded={false} />
            </div>
          </div>
        </div>

        <div className="px-6 pb-6">
          <Button
            disabled={isSaving}
            className="w-full h-[48px] bg-[#9CFF3A] py-4 text-black hover:bg-[#6fd42e]"
            onClick={handleSaveImage}
          >
            {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t("ref.t24")}</> : t("ref.t24")}
          </Button>

          <div className="mt-3 flex items-center justify-center gap-4">
            <button className="flex items-center gap-1.5 text-sm text-white/50 ">
              <Share2 size={16} /><span className=" text-white">{t("ref.t25")}</span>
            </button>
            <button className="flex items-center cursor-pointer"
              onClick={() => {
                handleShare({
                  platform: 'twitter',
                  lang: i18n.language as Lang,
                  inviteUrl: qrCodeSrc,
                  rebateRate: 50,
                })
              }}
            >
              <img src="/images/referral/x.png" alt="X" className="w-[32px] h-[32px]" />
            </button>
            <button className="flex items-center cursor-pointer"
              onClick={() => {
                handleShare({
                  platform: 'telegram',
                  lang: i18n.language as Lang,
                  inviteUrl: qrCodeSrc,
                  rebateRate: 50,
                })
              }}
            >
              <img src="/images/referral/tg.png" alt="Telegram" className="w-[32px] h-[32px]" />
            </button>
            <button className="flex items-center cursor-pointer"
              onClick={() => {
                navigator.clipboard?.writeText?.(SHARE_TEXT[i18n.language as Lang](50, qrCodeSrc))
                  .then(() => {
                    toastSuccess({title: t("ref.t32")})
                  })
                  .catch(() => {
                  })

                handleShare({
                  platform: 'discord',
                  lang: i18n.language as Lang,
                  inviteUrl: qrCodeSrc,
                  rebateRate: 50,
                })
              }}
            >
              <img src="/images/referral/dc.png" alt="Discord" className="w-[32px] h-[32px]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
