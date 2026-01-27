import { memo, useEffect, useState } from 'react'
import { LazyImage } from '../image/LazyImage'
import CheckSVG from './check.svg?react'
import { cn } from '@/utils'

type CheckBoxProps = {
  checked?: boolean
  onChange?: (checked: boolean) => void
}

const CheckBox = memo(({ checked, onChange }: CheckBoxProps) => {
  const [check, setCheck] = useState(checked)
  useEffect(() => {
    setCheck(checked)
  }, [checked])
  return (
    <button
      type='button'
      className=' cursor-pointer outline-none'
      onClick={() => {
        setCheck(!check)
        onChange && onChange(!check)
      }}
    >
      <LazyImage
        src={check ? "/images/icons/checked.png" : "/images/icons/check.png"}
        className="w-3 h-3"
      />
    </button>
  )
})

const CheckBoxBySVG = memo(({ checked, onChange }: CheckBoxProps) => {
  return (
    <button
      className={cn(
        'w-3.5 h-3.5 rounded-[4px] border border-white/20 cursor-pointer outline-none flex items-center justify-center bg-transparent',
        checked ? 'bg-white' : ''
      )}
      onClick={() => {
        if (onChange) {
          onChange(!checked)
        }
      }}
    >
      {checked && <CheckSVG className='w-2.5 h-2.5' />}
    </button>
  )
})

export { CheckBox, CheckBoxBySVG }
