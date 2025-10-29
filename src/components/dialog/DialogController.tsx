'use client'

import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
// 全局控制器
export const dialogController = {
  open: () => {},
  close: () => {},
}

export function useShowDialog() {
  const [open, setOpen] = useState(false)
  return {
    open,
    setOpen,
    show: () => setOpen(true),
    hide: () => setOpen(false),
  }
}


export function DialogController({
  children,
  title,
  topFixed,
  top,
  open,
  className,
  openChange
}: {
  children?: React.ReactNode;
  title?: React.ReactNode
  topFixed?: boolean
  top?: number
  open: boolean
  className?: string
  openChange: (open: boolean) => void
}) {
  
  // useBodyScrollLock(open)

  return (
    <Dialog open={open} onOpenChange={openChange}>
      <DialogContent className={cn(
        'rounded-[16px]',
        topFixed ? 'top-[10%] translate-y-[0]' : '',
        className
      )}
      >
        <DialogHeader>
          <DialogTitle>{title || ''}</DialogTitle>
        </DialogHeader>
        
        {children}
      </DialogContent>
    </Dialog>
  )
}
