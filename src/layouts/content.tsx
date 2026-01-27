import { type ReactNode } from 'react'
import { cn } from '@/utils'
function ConentLayout({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('min-h-[100vh] text-white bg-gray-950', className)}>{children}</div>
}

export default ConentLayout
