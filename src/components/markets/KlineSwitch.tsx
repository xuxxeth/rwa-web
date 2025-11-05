import { memo, useState } from "react"
import IconKline from "../icons/kline"

const KlineSwitch = memo(
  ({ onChange }: { onChange?: (show: boolean) => void}) => {
    const [show, setShow] = useState(false)
    return (
      <button className=" hover:bg-[rgba(255,255,255,0.1)] rounded-[8px] overflow-hidden cursor-pointer"
        onClick={() => {
          const _show = !show
          setShow(_show)
          onChange && onChange(_show)
        }}
      >
        <IconKline show={show} />
      </button>
    )
  }
)

export { KlineSwitch }