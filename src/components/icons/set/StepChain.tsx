import withIconColor from '../withIconColor'
import type { SvgIconProps } from '../types'

const StepChain = ({ size, color, ...props }: SvgIconProps) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 14 13"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M9.33337 12.5641V10.4102H6.46159V3.23073H4.66663V5.38459H0V0H4.66663V2.15386H9.33337V0H14V5.38459H9.33337V3.23073H7.53841V9.33336H9.33337V7.17949H14V12.5641H9.33337ZM10.4102 4.30769H12.9231V1.07692H10.4102V4.30769ZM10.4102 11.4872H12.9231V8.25641H10.4102V11.4872ZM1.07692 4.30769H3.58978V1.07692H1.07692V4.30769Z"
        fill={color || 'currentColor'}
      />
    </svg>
  )
}

const Icon = withIconColor(StepChain)
export default Icon
