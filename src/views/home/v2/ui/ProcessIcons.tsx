export const OrderIcon = () => (
  <svg viewBox='0 0 24 24' fill='none' className='w-full h-full stroke-current' strokeWidth='1.2'>
    {/* Central active node */}
    <circle cx='6' cy='12' r='2.5' />
    <circle cx='6' cy='12' r='1' fill='currentColor' stroke='none' />
    {/* Target nodes */}
    <circle cx='18' cy='6' r='1.5' />
    <circle cx='18' cy='18' r='1.5' />
    {/* Dots at connection points */}
    <circle cx='18' cy='6' r='0.5' fill='currentColor' stroke='none' />
    <circle cx='18' cy='18' r='0.5' fill='currentColor' stroke='none' />
    {/* Wireframe lines */}
    <path d='M8.5 12 L18 6' strokeDasharray='2 2' />
    <path d='M8.5 12 L18 18' strokeDasharray='2 2' />
  </svg>
)

export const ExecutionIcon = () => (
  <svg viewBox='0 0 24 24' fill='none' className='w-full h-full stroke-current' strokeWidth='1.2'>
    {/* Outer frame points */}
    <circle cx='12' cy='4' r='1.5' fill='currentColor' stroke='none' />
    <circle cx='20' cy='12' r='1.5' fill='currentColor' stroke='none' />
    <circle cx='12' cy='20' r='1.5' fill='currentColor' stroke='none' />
    <circle cx='4' cy='12' r='1.5' fill='currentColor' stroke='none' />
    {/* Central Hub */}
    <rect x='9' y='9' width='6' height='6' rx='1' />
    <circle cx='12' cy='12' r='1' fill='currentColor' stroke='none' />
    {/* Connecting spokes */}
    <path d='M12 4V9' />
    <path d='M20 12H15' />
    <path d='M12 20V15' />
    <path d='M4 12H9' />
  </svg>
)

export const SettlementIcon = () => (
  <svg viewBox='0 0 24 24' fill='none' className='w-full h-full stroke-current' strokeWidth='1.2'>
    {/* Hexagon Outline / Cube */}
    <path d='M12 2L20.66 7V17L12 22L3.34 17V7L12 2Z' strokeLinejoin='round' />
    {/* Internal edges */}
    <path d='M12 2V12' />
    <path d='M12 12L20.66 7' />
    <path d='M12 12L3.34 7' />
    {/* Vertex dots */}
    <circle cx='12' cy='2' r='1.5' fill='currentColor' stroke='none' />
    <circle cx='20.66' cy='7' r='1.5' fill='currentColor' stroke='none' />
    <circle cx='3.34' cy='7' r='1.5' fill='currentColor' stroke='none' />
    <circle cx='12' cy='12' r='1.5' fill='currentColor' stroke='none' />
  </svg>
)

export const DeliveryIcon = () => (
  <svg viewBox='0 0 24 24' fill='none' className='w-full h-full stroke-current' strokeWidth='1.2'>
    {/* Wallet U-shape wireframe */}
    <path d='M4 8V16C4 18.2 5.8 20 8 20H16C18.2 20 20 18.2 20 16V8' />
    {/* Incoming arrow wireframe */}
    <path d='M12 2V14' />
    <path d='M8 10L12 14L16 10' strokeLinejoin='round' />
    {/* Dots at terminals */}
    <circle cx='4' cy='8' r='1.5' fill='currentColor' stroke='none' />
    <circle cx='20' cy='8' r='1.5' fill='currentColor' stroke='none' />
    <circle cx='12' cy='2' r='1.5' fill='currentColor' stroke='none' />
    <circle cx='12' cy='14' r='1.5' fill='currentColor' stroke='none' />
  </svg>
)
