import BaseIcon from "./BaseIcon";

export default function IconKline({className, show}: {className?: string, show?: boolean}) {
  return (
    <BaseIcon className={className} 
      src={!show ? "/images/icons/market/kline.png" : "/images/icons/market/kline_hide.png"} 
      activeSrc={!show ? "/images/icons/market/kline_active.png" : "/images/icons/market/kline_hide_active.png" }
    />
  )
}