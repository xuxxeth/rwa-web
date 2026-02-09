import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}) => {
  const baseStyles =
    'inline-flex cursor-pointer items-center justify-center rounded-full font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed'

  const variants = {
    // VIXO Style: Primary is Black with White text
    primary:
      'bg-black text-white hover:bg-brand hover:text-black hover:scale-105 active:scale-95 shadow-lg shadow-black/20',
    // Secondary: Brand color
    secondary:
      'bg-brand text-black hover:bg-brand-hover shadow-[0_4px_14px_0_rgba(156,255,58,0.39)]',
    outline:
      'border border-gray-300 bg-transparent text-gray-900 hover:border-black hover:bg-white/50 backdrop-blur-sm',
    ghost: 'text-gray-600 hover:text-black hover:bg-black/5',
  }

  const sizes = {
    sm: 'px-5 py-2 text-sm',
    md: 'px-7 py-3 text-base',
    lg: 'px-10 py-4 text-lg',
  }

  return (
    <button className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  )
}
