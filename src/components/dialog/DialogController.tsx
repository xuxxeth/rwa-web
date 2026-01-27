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
  headerClassName,
  overlayClassName,
  titleClassName,
  closeClassName,
  closeIconClassName,
  openChange
}: {
  children?: React.ReactNode;
  title?: React.ReactNode
  topFixed?: boolean
  top?: number
  open: boolean
  className?: string
  headerClassName?: string
  overlayClassName?: string
  closeClassName?: string
  titleClassName?: string
  closeIconClassName?: string
  openChange: (open: boolean) => void
}) {
  
  // useBodyScrollLock(open)

  return (
    <Dialog open={open} onOpenChange={openChange}>
      <DialogContent 
        overlayClassName={overlayClassName}
        closeClassName={closeClassName}
        closeIconClassName={closeIconClassName}
        className={cn(
        'rounded-[8px]',
        topFixed ? 'top-[4vh] translate-y-[0]' : '',
        className
      )}
      >
        <DialogHeader className={cn(
          "",
          headerClassName
        )}>
          <DialogTitle className={titleClassName}>{title || ''}</DialogTitle>
        </DialogHeader>
        
        {children}
      </DialogContent>
    </Dialog>
  )
}
