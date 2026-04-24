import withIconColor from '../withIconColor'
import type { SvgIconProps } from '../types'

const CloseX = ({ size, color, ...props }: SvgIconProps) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M15 5L5 15M5 5L15 15"
        stroke={color || 'currentColor'}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

const Icon = withIconColor(CloseX)
export default Icon
