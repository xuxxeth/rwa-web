import { memo } from 'react'
import { Loading } from '.'
import { cn } from '@/utils'

const SuspenseLoading = memo(() => {
  const isHome = window.location.pathname === '/'

  return (
    <div
      className={cn(
        'text-white flex justify-center items-center h-screen',
        isHome ? 'bg-[#f8fafc]' : ''
      )}
    >
      <Loading />
    </div>
  )
})

export { SuspenseLoading }
