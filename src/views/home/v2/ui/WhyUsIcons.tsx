export const SpeedIcon = () => (
  <svg className='w-full h-full' viewBox='0 0 200 200'>
    <circle
      cx='100'
      cy='100'
      r='80'
      stroke='#FFFFFF'
      strokeWidth='1'
      fill='none'
      strokeDasharray='10 10'
      className='opacity-20 animate-[spin_20s_linear_infinite]'
    />
    <circle
      cx='100'
      cy='100'
      r='60'
      stroke='#9CFF3A'
      strokeWidth='2'
      fill='none'
      strokeDasharray='200'
      strokeDashoffset='200'
      className='group-hover:stroke-dashoffset-0 transition-all duration-1000 ease-out'
      style={{ strokeDashoffset: '100' }}
    />
    <path
      d='M100 100 L140 100'
      stroke='#FFFFFF'
      strokeWidth='2'
      className='origin-center animate-[spin_3s_linear_infinite] opacity-50'
    />
  </svg>
)

export const FeeModelIcon = () => (
  <svg className='w-full h-full' viewBox='0 0 200 200'>
    <defs>
      <pattern id='smallGrid' width='20' height='20' patternUnits='userSpaceOnUse'>
        <path d='M 20 0 L 0 0 0 20' fill='none' stroke='#FFFFFF' strokeWidth='0.5' opacity='0.2' />
      </pattern>
    </defs>
    <rect width='100%' height='100%' fill='url(#smallGrid)' />
    <rect
      x='0'
      y='0'
      width='200'
      height='2'
      fill='#9CFF3A'
      className='animate-[translate-y_4s_linear_infinite]'
      style={{ animationName: 'scanline' }}
    />
    <style>{`
      @keyframes scanline {
          0% { transform: translateY(-10%); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(110%); opacity: 0; }
      }
    `}</style>
  </svg>
)

export const LiquidityIcon = () => (
  <svg className='w-full h-full' viewBox='0 0 200 200' preserveAspectRatio='none'>
    <path
      d='M0 200 L40 160 L80 180 L120 140 L160 170 L200 120 V200 H0 Z'
      fill='#2A2B2E'
      className='group-hover:translate-y-2 transition-transform duration-1000'
    />
    <path
      d='M0 200 L50 140 L90 160 L140 100 L180 130 L200 80 V200 H0 Z'
      fill='#9CFF3A'
      className='opacity-10 mix-blend-overlay group-hover:-translate-y-2 transition-transform duration-1000'
    />
  </svg>
)
