import { memo, useState } from "react"
import { LazyImage } from "../image/LazyImage"

type CheckBoxProps = {
  checked?: boolean
  onChange?: (checked: boolean) => void
}

const CheckBox = memo(
  ({ checked, onChange }: CheckBoxProps) => {
    const [check, setCheck] = useState(checked)

    return (
      <button className=" cursor-pointer"
        onClick={() => {
          setCheck(!check)
          onChange && onChange(!check)
        }}
      >
        <LazyImage src={check ? '/images/icons/checked.png' : '/images/icons/check.png'} className="w-[20px] h-[20px]" />
      </button>
    )
  }
)

export { CheckBox }