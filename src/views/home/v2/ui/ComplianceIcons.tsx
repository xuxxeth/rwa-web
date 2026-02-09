export const DualLicenseIcon = () => (
  <svg
    viewBox='0 0 24 24'
    fill='none'
    className='w-full h-full stroke-current'
    strokeWidth='1'
  >
    <circle
      cx='9'
      cy='9'
      r='6'
      className='stroke-gray-900 group-hover:stroke-[#9CFF3A] transition-colors duration-300'
    />
    <circle
      cx='15'
      cy='15'
      r='6'
      className='stroke-gray-400 group-hover:stroke-[#9CFF3A]/60 transition-colors duration-300'
      strokeOpacity='0.5'
    />
    <path d='M9 15 L15 9' strokeWidth='0.8' className='stroke-gray-900' />
  </svg>
)

export const NativeComplianceIcon = () => (
  <svg
    viewBox='0 0 24 24'
    fill='none'
    className='w-full h-full stroke-current'
    strokeWidth='1'
  >
    <path
      d='M12 2 L20 7 V17 L12 22 L4 17 V7 L12 2 Z'
      className='stroke-gray-900 group-hover:stroke-[#9CFF3A] transition-colors duration-300'
    />
    <path
      d='M12 6 V18'
      strokeDasharray='2 2'
      strokeOpacity='0.5'
      className='stroke-gray-400'
    />
    <path
      d='M7 10 L17 10'
      strokeDasharray='2 2'
      strokeOpacity='0.5'
      className='stroke-gray-400'
    />
    <circle cx='12' cy='12' r='1.5' className='fill-[#9CFF3A] stroke-none' />
  </svg>
)

export const KycRiskIcon = () => (
  <svg
    viewBox='0 0 24 24'
    fill='none'
    className='w-full h-full stroke-current'
    strokeWidth='1'
  >
    <path d='M12 5 A7 7 0 0 1 19 12' strokeLinecap='round' className='stroke-[#9CFF3A]' />
    <path
      d='M19 12 A7 7 0 0 1 12 19'
      strokeLinecap='round'
      strokeOpacity='0.5'
      className='stroke-gray-900'
    />
    <path d='M12 19 A7 7 0 0 1 5 12' strokeLinecap='round' className='stroke-gray-400' />
    <path
      d='M5 12 A7 7 0 0 1 12 5'
      strokeLinecap='round'
      strokeOpacity='0.5'
      className='stroke-gray-900'
    />
    <circle
      cx='12'
      cy='12'
      r='2'
      fill='currentColor'
      className='text-gray-900 group-hover:text-[#9CFF3A] transition-colors duration-300 opacity-80'
    />
  </svg>
)

export const DualAuditIcon = () => (
  <svg
    viewBox='0 0 24 24'
    fill='none'
    className='w-full h-full stroke-current'
    strokeWidth='1'
  >
    <path
      d='M4 7 H20'
      strokeLinecap='round'
      className='stroke-gray-900 group-hover:stroke-[#9CFF3A] transition-colors duration-300'
    />
    <path
      d='M4 17 H20'
      strokeLinecap='round'
      className='stroke-gray-900 group-hover:stroke-[#9CFF3A] transition-colors duration-300'
    />
    <path d='M7 7 V17' strokeDasharray='2 2' className='stroke-gray-400' />
    <path d='M17 7 V17' strokeDasharray='2 2' className='stroke-gray-400' />
    <path d='M12 4 V20' strokeWidth='0.5' className='stroke-[#9CFF3A] opacity-50' />
  </svg>
)

// Background Icons for GlassCard
export const BgIconVariant1 = () => (
  <svg className='absolute -right-10 -top-10 w-64 h-64' viewBox='0 0 100 100' fill='none'>
    <circle cx='50' cy='50' r='45' stroke='currentColor' strokeWidth='0.5' />
    <circle cx='50' cy='50' r='30' stroke='currentColor' strokeWidth='0.5' />
  </svg>
)

export const BgIconVariant2 = () => (
  <svg className='absolute right-0 top-0 w-full h-full' preserveAspectRatio='none'>
    <defs>
      <pattern id='grid-2' width='40' height='40' patternUnits='userSpaceOnUse'>
        <path d='M 40 0 L 0 0 0 40' fill='none' stroke='currentColor' strokeWidth='0.5' />
      </pattern>
    </defs>
    <rect width='100%' height='100%' fill='url(#grid-2)' />
  </svg>
)

export const BgIconVariant3 = () => (
  <svg
    className='absolute right-[-10%] bottom-[-20%] w-[120%] h-[120%]'
    viewBox='0 0 100 100'
    fill='none'
  >
    <path d='M0 100 Q 50 50 100 0' stroke='currentColor' strokeWidth='0.5' fill='none' />
    <path d='M20 100 Q 60 60 100 20' stroke='currentColor' strokeWidth='0.5' fill='none' />
  </svg>
)

export const BgIconVariant4 = () => (
  <svg className='absolute -right-5 -bottom-5 w-48 h-48' viewBox='0 0 100 100' fill='none'>
    <rect
      x='20'
      y='20'
      width='60'
      height='60'
      stroke='currentColor'
      strokeWidth='0.5'
      transform='rotate(45 50 50)'
    />
    <rect
      x='30'
      y='30'
      width='40'
      height='40'
      stroke='currentColor'
      strokeWidth='0.5'
      transform='rotate(45 50 50)'
    />
  </svg>
)