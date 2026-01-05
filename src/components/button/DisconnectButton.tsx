import { useActiveWeb3 } from "@/hooks/useActiveWe3";
import { useTranslation } from "@/hooks/useTranslation";
import { cn } from "@/utils";

function DisconnectButton(props: { className?: string }) {
  const { handleDisConnect } = useActiveWeb3();
  const { t } = useTranslation();

  return (
    <div
      className="flex items-center justify-center py-2 px-3 cursor-pointer"
      onClick={async () => {
        await handleDisConnect();
      }}
    >
      <img
        src="/images/icons/disconnect.png"
        className="w-[14px] h-[14px]"
        alt=""
      />
      <div className={cn("ml-2 text-sm/6 font-semibold", props.className)}>
        {t("Disconnect")}
      </div>
    </div>
  );
}

export default DisconnectButton;
