import BaseIcon from "./BaseIcon";

export default function IconKline({className}: {className?: string}) {
  return (
    <BaseIcon className={className} src="/images/icons/market/kline.png" activeSrc="/images/icons/market/kline_active.png" />
  )
}