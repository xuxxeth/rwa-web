'use client'

import * as React from 'react'
import { subDays, format } from 'date-fns'
import { Calendar as CalendarIcon } from 'lucide-react'
import { type DateRange } from 'react-day-picker'
import VectorSVG from '../pagination/vector.svg?react'
import ArrowSVG from './arrow.svg?react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
// import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { DayPicker, getDefaultClassNames } from 'react-day-picker'
import 'react-day-picker/dist/style.css'
import './custom.css'

const FormatStr = 'yyyy-MM-dd'

export function setStartOfDay(date: Date): Date {
  const newDate = new Date(date)
  newDate.setHours(0, 0, 0, 0)
  return newDate
}

export function setEndOfDay(date: Date): Date {
  const newDate = new Date(date)
  newDate.setHours(23, 59, 59, 999)
  return newDate
}

export function DatePickerWithRange({
  userSelectedDateRange,
  onUserSelectedDataRangeChanged,
}: {
  userSelectedDateRange: {
    from: number | undefined
    end: number | undefined
  }
  onUserSelectedDataRangeChanged: (dateRange: { startTime?: number; endTime?: number }) => void
}) {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: userSelectedDateRange.from ? new Date(userSelectedDateRange.from * 1000) : new Date(),
    to: userSelectedDateRange.end ? new Date(userSelectedDateRange.end * 1000) : new Date(),
  })

  const [isOpen, setIsOpen] = React.useState(false)

  const defaultClassNames = getDefaultClassNames()

  return (
    <div className={cn('grid gap-2')}>
      <Popover
        open={isOpen}
        onOpenChange={_open => {
          setIsOpen(_open)
          if (!_open) {
            onUserSelectedDataRangeChanged({
              startTime: date?.from ? Math.floor(date.from.getTime() / 1000) : undefined,
              endTime: date?.to ? Math.ceil(date.to.getTime() / 1000) : undefined,
            })
          }
        }}
      >
        <PopoverTrigger asChild>
          <Button
            id='date'
            className={cn(
              'w-[265px] h-10 rounded-sm border border-white/10 text-white bg-transparent justify-start text-left font-normal',
              isOpen ? 'border-[rgba(156,255,58,0.5)]' : ''
            )}
          >
            <CalendarIcon />
            {date?.from ? (
              date.to ? (
                <>
                  <span className='text-sm/5.5 font-medium'>{format(date.from, FormatStr)}</span>
                  <span className='w-4 h-4 py-1 px-[2.5px]'>
                    <ArrowSVG style={{ width: '11.7px', height: 8 }} />
                  </span>
                  <span className='text-sm/5.5 font-medium'>{format(date.to, FormatStr)}</span>
                </>
              ) : (
                <span className='text-sm/5.5 font-medium'>{format(date.from, FormatStr)}</span>
              )
            ) : (
              <span className='text-sm/5.5 font-medium'>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-auto p-0' style={{ border: 'none' }} align='start'>
          <DayPicker
            numberOfMonths={2}
            captionLayout={'label'}
            showOutsideDays={false}
            selected={date}
            onSelect={(_date: DateRange | undefined) => {
              setDate({
                from: _date?.from ? setStartOfDay(_date.from) : undefined,
                to: _date?.to ? setEndOfDay(_date.to) : undefined,
              })
            }}
            mode='range'
            components={{
              Chevron: ({ className, orientation, ...props }) => {
                if (orientation === 'left') {
                  return <VectorSVG className='rotate-180' />
                }
                if (orientation === 'right') {
                  return <VectorSVG />
                }
                return <VectorSVG className={cn('size-4', className)} {...props} />
              },
            }}
            classNames={{
              root: cn(
                defaultClassNames.root,
                'w-fit bg-[rgba(19,24,35,1)] text-white rounded-sm p-4 date-range'
              ),
              nav: cn(
                defaultClassNames.nav,
                'absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1'
              ),
              month_caption: cn(
                defaultClassNames.month_caption,
                'flex h-[--cell-size] w-full items-center justify-center px-[--cell-size]'
              ),
              button_previous: cn(
                defaultClassNames.button_previous,
                'h-[--cell-size] w-[--cell-size] select-none p-0 aria-disabled:opacity-50'
              ),
            }}
          />
          {/* <Calendar  原生的 Calendar 有奇怪的样式问题，暂时不使用
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={2}
          /> */}
        </PopoverContent>
      </Popover>
    </div>
  )
}
export function DatePicker({
  userSelectedDate,
  onUserSelectedDateChanged,
  placeholder,
  className,
  activeColor
}: {
  userSelectedDate: number
  onUserSelectedDateChanged: (date?: number) => void
  placeholder?: string
  className?: string
  activeColor?: string

}) {
  const [selected, setSelected] = React.useState<Date>();
  const [isOpen, setIsOpen] = React.useState(false)

  const defaultClassNames = getDefaultClassNames()

  return (
    <div className={cn('grid gap-2')}>
      <Popover
        open={isOpen}
        onOpenChange={_open => {
          setIsOpen(_open)
          if (!_open) {
            onUserSelectedDateChanged(selected?.getTime())
          }
        }}
      >
        <PopoverTrigger asChild>
          <Button
            id='date'
            className={cn(
              'w-full h-[56px] rounded-sm border border-white/1 text-white bg-transparent justify-between text-left font-normal',
              className,
              isOpen ? 'border-[rgba(156,255,58,0.5)]' : ''
            )}
            style={{borderColor: isOpen ? activeColor ? activeColor : '' : ''}}
          >
            <div className='text-[16px] font-normal'>
              { selected ? format(selected?.getTime(), FormatStr) : userSelectedDate ? format(userSelectedDate, FormatStr) : <span className='text-[rgba(255,255,255,0.3)]'>{placeholder ?? ''}</span> }
            </div>
            <CalendarIcon />
            {/* {date?.from ? (
              date.to ? (
                <>
                  <span className='text-sm/5.5 font-medium'>{format(date.from, FormatStr)}</span>
                  <span className='w-4 h-4 py-1 px-[2.5px]'>
                    <ArrowSVG style={{ width: '11.7px', height: 8 }} />
                  </span>
                  <span className='text-sm/5.5 font-medium'>{format(date.to, FormatStr)}</span>
                </>
              ) : (
                <span className='text-sm/5.5 font-medium'>{format(date.from, FormatStr)}</span>
              )
            ) : (
              <span className='text-sm/5.5 font-medium'>Pick a date</span>
            )} */}
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-auto p-0' style={{ border: 'none' }} align='start'>
          <DayPicker
            numberOfMonths={1}
            captionLayout={'label'}
            showOutsideDays={false}
            selected={selected}
            onSelect={setSelected}
            mode='single'
            components={{
              Chevron: ({ className, orientation, ...props }) => {
                if (orientation === 'left') {
                  return <VectorSVG className='rotate-180' />
                }
                if (orientation === 'right') {
                  return <VectorSVG />
                }
                return <VectorSVG className={cn('size-4', className)} {...props} />
              },
            }}
            classNames={{
              root: cn(
                defaultClassNames.root,
                'w-fit bg-[rgba(19,24,35,1)] text-white rounded-sm p-4 [--cell-size:36px]'
              ),
              nav: cn(
                defaultClassNames.nav,
                'absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1'
              ),
              month_caption: cn(
                defaultClassNames.month_caption,
                'flex h-[--cell-size] w-full items-center justify-center px-[--cell-size]'
              ),
              button_previous: cn(
                defaultClassNames.button_previous,
                'h-[--cell-size] w-[--cell-size] select-none p-0 aria-disabled:opacity-50'
              ),
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
