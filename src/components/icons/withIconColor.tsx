import React, { forwardRef } from 'react'
import { type SvgIconProps } from './types'

function withIconColor(WrappedIcon: React.ComponentType<any>) {
  const Component = forwardRef<SVGSVGElement, SvgIconProps>(
    ({ type, size = 24, className, color, ...others }, ref) => {
      return <WrappedIcon ref={ref} {...others} className={className} size={size} color={color} />
    },
  )

  Component.displayName = `withIconColor(${WrappedIcon.displayName || WrappedIcon.name || 'Icon'})`

  return Component
}

export default withIconColor
