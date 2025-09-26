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
  open,
  openChange
}: {
  children?: React.ReactNode;
  title?: string
  topFixed?: boolean
  open: boolean
  openChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={openChange}>
      <DialogContent className={cn(
        'rounded-[16px]',
        topFixed ? 'top-[20%] translate-y-[0]' : ''
      )}>
        <DialogHeader>
          <DialogTitle>{title || ''}</DialogTitle>
        </DialogHeader>
        
        {children}
      </DialogContent>
    </Dialog>
  )
}
