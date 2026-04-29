import React, { type DetailedHTMLProps, type HTMLAttributes } from 'react'

export type TIconType = 'primary' | 'disabled' | 'white' | 'danger'

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  type?: TIconType
  size?: number
  badge?: boolean
  className?: string
  color?: string
  onClick?: () => void
  onTouchStart?: (e: React.TouchEvent<SVGSVGElement>) => void
}

export interface SvgIconProps extends React.SVGProps<SVGSVGElement> {
  fontSize?: 'inherit' | 'small' | 'medium' | 'large'
  htmlColor?: string
  color?: string
  size: number
  onClick?: () => void
  className?: string
  active?: boolean
  onTouchStart?: (e: React.TouchEvent<SVGSVGElement>) => void
  type?: TIconType
}

export interface FontIconProps
  extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  fontSize?: 'inherit' | 'small' | 'medium' | 'large'
  htmlColor?: string
  color?: string
  size: number
  onClick?: () => void
  className?: string
  active?: boolean
  onTouchStart?: (e: React.TouchEvent<HTMLDivElement>) => void
  type?: TIconType
}

export type IconKey =
  | 'chart'
  | 'close'
  | 'Add'
  | 'NavMenu'
  | 'TikoLogo'
  | 'PreMarket'
  | 'MarketOpen'
  | 'AfterHours'
  | 'Night'
  | 'Closed'
  | 'KycUnverified'
  | 'KycVerified'
  | 'KycException'
  | 'KycAdditionalInfo'
  | 'Copy'
  | 'Disconnect'
  | 'Yes'
