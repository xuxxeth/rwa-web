import { LazyImage } from "@/components/image/LazyImage"
import { memo, useState } from "react"

const KlineSwitch = memo(
  ({ onChange }: { onChange?: (show: boolean) => void}) => {
    const [show, setShow] = useState(false)
    return (
      <button className=" hover:bg-[rgba(255,255,255,0.1)] w-9 h-9 rounded-[8px] overflow-hidden cursor-pointer"
        onClick={() => {
          const _show = !show
          setShow(_show)
          onChange && onChange(_show)
        }}
      >
        <LazyImage src={ show ? "/images/convert/kline_hide.png" : "/images/convert/kline.png"} className="w-9 h-9 cursor-pointer" />
      </button>
    )
  }
)

export { KlineSwitch }