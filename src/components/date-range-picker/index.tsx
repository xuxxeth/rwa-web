'use client'

import * as React from 'react'
import { format, addYears, addMonths } from 'date-fns'
import { enUS, zhTW } from 'date-fns/locale'
import { Calendar as CalendarIcon, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { DayPicker, getDefaultClassNames, useDayPicker, type DateRange } from 'react-day-picker'

import VectorSVG from '../pagination/vector.svg?react'
import ChevronSVG from './chevron.svg?react'
import ArrowSVG from './arrow.svg?react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
// import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

import 'react-day-picker/dist/style.css'
import { useTranslation } from '@/hooks/useTranslation'

export const FormatStr = 'yyyy-MM-dd'

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

function CustomNav({
  className,
  onPreviousClick,
  onNextClick,
  previousMonth,
  nextMonth,
}: {
  className?: string
  onPreviousClick?: React.MouseEventHandler<HTMLButtonElement>
  onNextClick?: React.MouseEventHandler<HTMLButtonElement>
  previousMonth?: Date
  nextMonth?: Date
}) {
  const { goToMonth, months } = useDayPicker()
  const currentMonth = months?.[0]?.date

  const onPrevYearClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (currentMonth) {
      goToMonth(addYears(currentMonth, -1))
    }
  }

  const onNextYearClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (currentMonth) {
      goToMonth(addYears(currentMonth, 1))
    }
  }

  return (
    <nav className={cn(className, 'flex items-center justify-between')}>
      <div className='flex items-center'>
        <button
          type='button'
          onClick={onPrevYearClick}
          className='p-1 pr-0 cursor-pointer focus:outline-none text-gray-500 hover:text-white transition-colors'
        >
          <ChevronsLeft className='size-4' />
        </button>
        <button
          type='button'
          onClick={onPreviousClick}
          disabled={!previousMonth}
          className={cn(
            'p-1 pl-0 text-gray-500 focus:outline-none cursor-pointer hover:text-white transition-colors',
            !previousMonth && 'opacity-50 pointer-events-none'
          )}
        >
          <ChevronSVG className='text-gray-500 hover:text-white' />
        </button>
      </div>

      <div className='flex items-center'>
        <button
          type='button'
          onClick={onNextClick}
          disabled={!nextMonth}
          className={cn(
            'p-1 pr-0 cursor-pointer text-gray-500 focus:outline-none hover:text-white transition-colors',
            !nextMonth && 'opacity-50 pointer-events-none'
          )}
        >
          <ChevronSVG className='rotate-180 text-gray-500 hover:text-white' />
        </button>
        <button
          type='button'
          onClick={onNextYearClick}
          className='p-1 pl-0 cursor-pointer focus:outline-none text-gray-500 hover:text-white transition-colors'
        >
          <ChevronsRight className='size-4' />
        </button>
      </div>
    </nav>
  )
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
  const { t, i18n } = useTranslation()
  const locale = i18n.language === 'zh' ? zhTW : enUS
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: userSelectedDateRange.from ? new Date(userSelectedDateRange.from * 1000) : undefined,
    to: userSelectedDateRange.end ? new Date(userSelectedDateRange.end * 1000) : undefined,
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
            // onUserSelectedDataRangeChanged({
            //   startTime: date?.from ? Math.floor(date.from.getTime() / 1000) : undefined,
            //   endTime: date?.to ? Math.ceil(date.to.getTime() / 1000) : undefined,
            // })
            // 从毫秒转换为秒，去掉小数部分
            onUserSelectedDataRangeChanged({
              startTime: date?.from ? Math.trunc(date.from.getTime() / 1000) : undefined,
              endTime: date?.to ? Math.trunc(date.to.getTime() / 1000) : undefined,
            })
          }
        }}
      >
        <PopoverTrigger asChild>
          <Button
            id='date'
            className={cn(
              'w-[211px] h-8 rounded-sm border border-gray-850 text-gray-400 bg-transparent justify-start text-left text-xs/4 font-normal',
              isOpen ? 'border-[rgba(156,255,58,0.5)]' : ''
            )}
          >
            <CalendarIcon className={cn('w-3 h-4.5', date?.from || date?.to ? 'text-white' : '')} />
            {date?.from ? (
              date.to ? (
                <>
                  <span className='text-white'>{format(date.from, FormatStr)}</span>
                  <span className='w-4 h-4 py-1 px-[2.5px]'>
                    <ArrowSVG className='text-white' style={{ width: '11.7px', height: 8 }} />
                  </span>
                  <span className='text-white'>{format(date.to, FormatStr)}</span>
                </>
              ) : (
                <span className='text-white'>{format(date.from, FormatStr)}</span>
              )
            ) : (
              <>
                <span>{t('portfolio.start')}</span>
                <span className='w-4 h-4 py-1 px-[2.5px]'>
                  <ArrowSVG style={{ width: '11.7px', height: 8 }} />
                </span>
                <span>{t('portfolio.end')}</span>
              </>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-auto p-0' style={{ border: 'none' }} align='end'>
          <DayPicker
            locale={locale}
            numberOfMonths={2}
            defaultMonth={date?.to ? addMonths(date.to, -1) : date?.from || new Date()}
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
              Nav: CustomNav,
              // Chevron: ({ className, orientation, ...props }) => {
              //   if (orientation === 'left') {
              //     return <ChevronSVG />
              //   }
              //   if (orientation === 'right') {
              //     return <ChevronSVG className='rotate-180' />
              //   }
              //   return <ChevronSVG className={cn('size-4', className)} {...props} />
              // },
            }}
            style={
              {
                '--rdp-range_middle-background-color': 'rgba(0,157,255,0.2)',
                '--rdp-day-width': '36px',
                '--rdp-day-height': '36px',
                '--rdp-day_button-width': '36px',
                '--rdp-day_button-height': '36px',
                '--rdp-range_end-date-background-color': 'rgba(0,157,255,1)',
                '--rdp-range_start-date-background-color': 'rgba(0,157,255,1)',
                '--rdp-selected-border': 'none',
                '--rdp-day_button-border-radius': '0px',
                '--rdp-months-gap': '0px',
              } as React.CSSProperties
            }
            classNames={{
              root: cn(
                defaultClassNames.root,
                'px-4 py-3 bg-gray-900 text-white !border !border-gray-850 !rounded-[6px] font-normal'
              ),
              nav: cn(
                defaultClassNames.nav,
                'w-full !h-5 flex flex-row items-center justify-between cursor-pointer'
              ),
              month_caption: cn(
                defaultClassNames.month_caption,
                'flex w-full items-center justify-center !h-5 !mb-1'
              ),
              months: cn(
                defaultClassNames.months,
                '[&_.rdp-month:last-child]:pl-4 [&_.rdp-month:last-child]:border-l [&_.rdp-month:last-child]:border-l-gray-850 [&_.rdp-month:last-child]:ml-4'
              ),
              caption_label: cn(defaultClassNames['caption_label'], 'text-xs/[15px]'),
              day_button: cn(defaultClassNames.day_button, '!text-xs/[15px]'),
              weekday: cn(defaultClassNames.weekday, '!py-1 text-xs/[15px] text-gray-500'),
              range_start: cn(defaultClassNames.range_start, '[&_button]:!rounded-l-[4px]'),
              range_end: cn(defaultClassNames.range_end, '[&_button]:!rounded-r-[4px]'),
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
  activeColor,
  captionLayout,
  minDate,
  maxDate,
}: {
  userSelectedDate: number
  onUserSelectedDateChanged: (date?: number) => void
  placeholder?: string
  className?: string
  activeColor?: string
  captionLayout?: 'label' | 'dropdown' | 'dropdown-months' | 'dropdown-years'
  minDate?: number
  maxDate?: number
}) {
  const { i18n } = useTranslation()
  const locale = i18n.language === 'zh' ? zhTW : enUS
  const [selected, setSelected] = React.useState<Date | undefined>()
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
            style={{ borderColor: isOpen ? (activeColor ? activeColor : '') : '' }}
          >
            <div className='text-[14px] font-normal'>
              {selected ? (
                format(selected?.getTime(), FormatStr)
              ) : userSelectedDate ? (
                format(userSelectedDate, FormatStr)
              ) : (
                <span className='text-[rgba(255,255,255,0.3)]'>{placeholder ?? ''}</span>
              )}
            </div>
            <CalendarIcon />
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-auto p-0' style={{ border: 'none' }} align='start'>
          <DayPicker
            locale={locale}
            numberOfMonths={1}
            // captionLayout={captionLayout || 'label'}
            captionLayout='label'
            showOutsideDays={false}
            selected={selected || (userSelectedDate ? new Date(userSelectedDate) : undefined)}
            defaultMonth={selected ?? (userSelectedDate ? new Date(userSelectedDate) : undefined)}
            onSelect={setSelected}
            mode='single'
            endMonth={maxDate ? new Date(maxDate) : undefined}
            startMonth={minDate ? new Date(minDate) : undefined}
            components={{
              Nav: CustomNav,
              // Chevron: ({ className, orientation, ...props }) => {
              //   if (orientation === 'left') {
              //     return <VectorSVG className='rotate-180' />
              //   }
              //   if (orientation === 'right') {
              //     return <VectorSVG />
              //   }
              //   return <VectorSVG className={cn('size-4', className)} {...props} />
              // },
            }}
            style={
              {
                '--rdp-range_middle-background-color': 'rgba(0,157,255,0.2)',
                '--rdp-day-width': '36px',
                '--rdp-day-height': '36px',
                '--rdp-day_button-width': '36px',
                '--rdp-day_button-height': '36px',
                '--rdp-range_end-date-background-color': 'rgba(0,157,255,1)',
                '--rdp-range_start-date-background-color': 'rgba(0,157,255,1)',
                '--rdp-selected-border': 'none',
                '--rdp-day_button-border-radius': '0px',
                '--rdp-months-gap': '0px',
              } as React.CSSProperties
            }
            classNames={{
              // root: cn(
              //   defaultClassNames.root,
              //   'w-fit bg-[rgba(19,24,35,1)] text-white rounded-sm p-4 [--cell-size:36px]'
              // ),
              // nav: cn(
              //   defaultClassNames.nav,
              //   'absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1'
              // ),
              // month_caption: cn(
              //   defaultClassNames.month_caption,
              //   'flex h-[--cell-size] w-full items-center justify-center px-[--cell-size]'
              // ),
              // button_previous: cn(
              //   defaultClassNames.button_previous,
              //   'h-[--cell-size] w-[--cell-size] select-none p-0 aria-disabled:opacity-50'
              // ),
              root: cn(
                defaultClassNames.root,
                'px-4 py-3 bg-gray-900 text-white !border !border-gray-850 !rounded-[6px] font-normal'
              ),
              nav: cn(
                defaultClassNames.nav,
                'w-full !h-5 flex flex-row items-center justify-between cursor-pointer'
              ),
              month_caption: cn(
                defaultClassNames.month_caption,
                'flex w-full items-center justify-center !h-5 !mb-1'
              ),
              caption_label: cn(defaultClassNames['caption_label'], 'text-xs/[15px]'),
              day_button: cn(defaultClassNames.day_button, '!text-xs/[15px]'),
              weekday: cn(defaultClassNames.weekday, '!py-1 text-xs/[15px] text-gray-500'),
              selected: cn(
                defaultClassNames.selected,
                '!bg-[rgba(0,157,255,1)] !text-white hover:!bg-[rgba(0,157,255,1)] hover:!text-white focus:!bg-[rgba(0,157,255,1)] focus:!text-white !rounded-[4px]'
              ),
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
