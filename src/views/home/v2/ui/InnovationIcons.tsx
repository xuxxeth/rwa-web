import { cn } from '@/utils'

export const GlobalIcon = () => (
  <svg viewBox='0 0 24 24' fill='none' className='w-full h-full stroke-current' strokeWidth='1.2'>
    <circle cx='12' cy='12' r='9' />
    <ellipse cx='12' cy='12' rx='4' ry='9' />
    <path d='M3 12 H21' strokeDasharray='2 2' />
    <path d='M5 7 H19' strokeWidth='0.8' opacity='0.5' />
    <path d='M5 17 H19' strokeWidth='0.8' opacity='0.5' />
  </svg>
)

export const DividendsIcon = () => (
  <svg viewBox='0 0 24 24' fill='none' className='w-full h-full stroke-current' strokeWidth='1.2'>
    <circle cx='12' cy='12' r='2' fill='currentColor' />
    <path d='M12 8 V4' strokeLinecap='round' />
    <path d='M16 12 H20' strokeLinecap='round' />
    <path d='M12 16 V20' strokeLinecap='round' />
    <path d='M8 12 H4' strokeLinecap='round' />
    <path d='M15 9 L18 6' strokeLinecap='round' opacity='0.5' />
    <path d='M15 15 L18 18' strokeLinecap='round' opacity='0.5' />
    <path d='M9 15 L6 18' strokeLinecap='round' opacity='0.5' />
    <path d='M9 9 L6 6' strokeLinecap='round' opacity='0.5' />
  </svg>
)

export const ComposabilityIcon = () => (
  <svg viewBox='0 0 24 24' fill='none' className='w-full h-full stroke-current' strokeWidth='1.2'>
    <rect x='3' y='11' width='10' height='10' rx='1' />
    <rect x='11' y='3' width='10' height='10' rx='1' opacity='0.7' />
    <path d='M13 13 H11 V11' strokeLinecap='round' strokeLinejoin='round' />
  </svg>
)

export const TikoLogo = (props: { className?: string }) => (
  <svg
    width='56'
    height='21'
    viewBox='0 0 56 21'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
    className={cn('h-5 md:h-6 w-auto', props.className)}
  >
    <path
      d='M47.8124 3.375C51.851 3.375 55.1249 6.64893 55.1249 10.6875C55.1249 14.7261 51.851 18 47.8124 18C43.7738 18 40.4999 14.7261 40.4999 10.6875C40.4999 6.64894 43.7738 3.37501 47.8124 3.375ZM47.8124 7.875C46.2591 7.875 44.9999 9.1342 44.9999 10.6875C44.9999 12.2408 46.2591 13.5 47.8124 13.5C49.3656 13.4999 50.6249 12.2407 50.6249 10.6875C50.6249 9.13425 49.3656 7.87508 47.8124 7.875Z'
      fill='#9CFF3A'
    />
    <path d='M14.625 6.75H10.125V18H4.5V6.75H0V2.25H14.625V6.75Z' fill='black' />
    <path
      d='M30.3749 8.25L34.8749 3.375H40.4999L33.7499 10.6875L40.4999 18H34.8749L30.3749 13.125V18H24.7499V1.125H30.3749V8.25Z'
      fill='black'
    />
    <rect
      x='22.4999'
      y='7.875'
      width='10.125'
      height='5.62501'
      transform='rotate(90 22.4999 7.875)'
      fill='black'
    />
    <ellipse cx='19.6876' cy='3.37511' rx='3.37512' ry='3.37511' fill='#131416' />
    <path
      d='M21.7108 5.40015H20.4042V3.61401L18.5858 5.43237L17.662 4.50854L19.5135 2.65698H17.661V1.35034H21.7108V5.40015Z'
      fill='#9CFF3A'
    />
  </svg>
)
