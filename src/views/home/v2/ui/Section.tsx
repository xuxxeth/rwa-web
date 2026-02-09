import React from 'react'

interface SectionProps {
  id?: string
  className?: string
  children: React.ReactNode
  dark?: boolean
}

export const Section: React.FC<SectionProps> = ({ id, className = '', children, dark = false }) => {
  return (
    <section
      id={id}
      // Adjusted padding: Standardized to py-12 (mobile) / py-20 (desktop) for consistent, closer spacing
      className={`py-12 md:py-20 px-6 md:px-12 lg:px-24 relative overflow-hidden ${className}`}
    >
      <div className='max-w-7xl mx-auto relative z-10'>{children}</div>
    </section>
  )
}
