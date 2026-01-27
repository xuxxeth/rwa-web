import UpSVG from './up.svg?react'
import DownSVG from './down.svg?react'
import { cn } from '@/utils'
const SortButton = ({ order }: { order?: 'asc' | 'desc' }) => {
  return (
    <div className={' w-4 h-4 flex flex-col text-gray-400 items-center justify-center gap-0.5'}>
      <UpSVG
        className={cn('w-[7px] h-[5px] cursor-pointer', order === 'asc' ? 'text-white' : '')}
      />
      <DownSVG
        className={cn('w-[7px] h-[5px] cursor-pointer', order === 'desc' ? 'text-white' : '')}
      />
    </div>
  )
}

export { SortButton }
