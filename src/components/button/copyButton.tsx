import { cn } from "@/utils";
import { useToast } from "@/hooks/useToast";
import { useTranslation } from "@/hooks/useTranslation";

function CopyButton(props: { className?: string; copyText: string }) {
  const { toastSuccess } = useToast();
  const { t } = useTranslation();

  return (
    <button
      className={cn(
        "flex items-center justify-center cursor-pointer",
        props.className
      )}
      onClick={() => {
        navigator.clipboard.writeText(props.copyText);
        toastSuccess({
          title: t("copied"),
          duration: 2000,
        });
      }}
    >
      <img
        src="/images/icons/assets/copy.png"
        className="w-[14px] h-[14px]"
        alt=""
      />
    </button>
  );
}

export default CopyButton;
