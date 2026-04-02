import { memo, useEffect, useMemo, useRef, useState } from 'react'
import { ProfileTitle } from './ProfileTitle'
import { useTranslation } from '@/hooks/useTranslation'
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { cn } from '@/lib/utils'
import { useTradeStore } from '@/stores/tradeStore'
import { baseApi } from '@/service/base/api'
import type { IIndicators } from '@/service/base/types'
import { formatLargeNumber } from '@/utils/format'
import { formatToQuarterLabel } from '@/utils'

const CustomDot = (props: { cx: any; cy: any; stroke: string; r: number }) => {
  const { cx, cy, stroke, r } = props
  const [hovered, setHovered] = useState(false)

  return (
    <circle
      cx={cx}
      cy={cy}
      r={r || 4}
      fill='#141418' // 空心
      stroke={hovered ? '#FFA500' : stroke} // 悬浮高亮变橙色
      strokeWidth={2}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ cursor: 'pointer' }} // 鼠标悬停变手型
    />
  )
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className='bg-[#222] p-[10px] rounded border border-gray-700 shadow-lg'>
        <p className='text-[#fff] text-[12px] font-normal m-0 mb-2 leading-none'>{label}</p>
        <div className='flex flex-col gap-2'>
          {payload.map((entry: any, index: number) => {
            // bar1 的颜色是特殊的渐变色
            const style =
              entry.dataKey === 'bar1'
                ? {
                    background:
                      'linear-gradient(180deg, rgba(190, 255, 110, 0.5) 0%, rgba(106, 252, 223, 0.5) 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    color: 'transparent',
                  }
                : { color: entry.color }

            return (
              <div
                key={index}
                className='flex items-center gap-2 text-[12px] font-normal leading-none'
                style={style}
              >
                {/* 使用 entry.color 或者自定义颜色逻辑 */}
                <span>{entry.name}:</span>
                <span>
                  {entry.name === 'YOY'
                    ? `${Number(entry.value).toFixed(2)}%`
                    : formatLargeNumber(entry.value)}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }
  return null
}

const FilterItem = memo(
  ({
    itemData,
    selected,
    onClick,
  }: {
    itemData: { label: string; value: string }
    selected?: boolean
    onClick?: (item: string) => void
  }) => {
    return (
      <div
        className={cn(
          'text-xs/[15px] px-3 py-1 flex items-center justify-center shrink-0  rounded-[6px] text-gray-400 font-normal cursor-pointer',
          selected ? 'bg-gray-750 text-white' : ''
        )}
        onClick={() => {
          onClick && onClick(itemData.value)
        }}
      >
        {itemData.label}
      </div>
    )
  }
)

const Financials = memo(() => {
  const { t } = useTranslation()
  const annualList = [
    { label: t('financials.roe'), value: 'roe' },
    { label: t('financials.roa'), value: 'roa' },
    { label: t('financials.pe'), value: 'pe' },
    { label: t('financials.pb'), value: 'pb' },
    { label: t('financials.eps'), value: 'eps' },
    { label: t('financials.bps'), value: 'bps' },
    { label: t('financials.ocfps'), value: 'ocfps' },
    { label: t('financials.grps'), value: 'grps' },
  ]

  const [current, setCurrent] = useState('roe')
  const inputToken = useTradeStore(state => state.inputToken)
  const initRef = useRef(false)
  const [indicatorsData, setIndicatorsData] = useState<IIndicators[]>([])

  useEffect(() => {
    if (inputToken?.stockId) {
      initRef.current = true
      baseApi.getIndicators(inputToken.stockId).then(res => {
        // @ts-ignore
        setIndicatorsData(res?.data?.indicators || [])
      })
    }
  }, [inputToken?.stockId])

  const filterData = useMemo(() => {
    const key = current.toLowerCase()
    const annualKey = (key + '_annual') as string
    // yoy 是 Year-Over-Year 的缩写，用于表示同比增长率
    const yoyKey = (annualKey + '_yoy') as string

    let _data: any[] = []
    indicatorsData
      .sort((a, b) => a.report_period - b.report_period)
      .forEach(item => {
        _data.push({
          quarter: formatToQuarterLabel(item.report_period),
          // @ts-ignore
          bar1: item[annualKey],

          // bar2: 0.5,
          // @ts-ignore
          line: item[yoyKey],
        })
      })
    return _data
  }, [current, indicatorsData])

  const roeName = useMemo(() => {
    return annualList.find(item => item.value === current)?.label
  }, [current, annualList])

  const roeFormula = useMemo(() => {
    if (['ocfps', 'grps'].includes(current)) {
      return undefined
    }
    return t(`financials.formulas.${current}`)
  }, [current, t])

  return (
    <div className='p-4 bg-gray-900 rounded-[4px] mt-2'>
      <div className='text-xs/5 font-normal mb-2'>{t('companyProfile.financial')}</div>
      <div>
        <div className='inline-flex basis-auto p-1 rounded-[8px] items-center gap-x-2 border border-gray-850 mb-4'>
          {annualList.map(item => {
            return (
              <FilterItem
                key={item.value}
                selected={current === item.value}
                itemData={item}
                onClick={item => setCurrent(item)}
              />
            )
          })}
        </div>
        <div className='w-full h-[260px] rounded-2xl' tabIndex={-1}>
          <ResponsiveContainer width='100%' height='100%'>
            <ComposedChart
              data={filterData}
              margin={{ top: 5, right: 40, bottom: 20, left: 10 }} // ✅ 给够空间
              barCategoryGap='25%'
              barGap={6}
            >
              <CartesianGrid
                horizontal={true}
                vertical={false}
                // stroke='rgba(59, 60, 78, 1)'
                stroke='rgba(35,36,39,1)'
                strokeDasharray='0'
              />

              <YAxis
                dataKey='bar1'
                yAxisId='left'
                interval='preserveStartEnd'
                allowDecimals={true}
                tickFormatter={v => `${formatLargeNumber(v)}`}
                tick={{ fill: '#FFFFFF', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                className='font-normal'
                width={40}
              />

              <YAxis
                dataKey='line'
                yAxisId='right'
                orientation='right'
                tickFormatter={v => `${v.toFixed(2)}$`}
                tick={({ x, y, payload }) => (
                  <text x={x + 70} y={y} textAnchor='end' fill='#FFFFFF' fontSize={12} dy={4}>
                    {`${payload.value.toFixed(2)}%`}
                  </text>
                )}
                className='font-normal'
                axisLine={false}
                tickLine={false}
                width={80}
              />

              <XAxis
                dataKey='quarter'
                tick={{ fill: '#FFFFFF', fontSize: 12 }}
                axisLine={false}
                className='font-normal'
                tickLine={false}
                dy={10}
              />

              <defs>
                <linearGradient id='financials_bar_gradient' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='0%' stopColor='rgba(190, 255, 110)' stopOpacity={0.5} />
                  <stop offset='100%' stopColor='rgba(106, 252, 223)' stopOpacity={0.5} />
                </linearGradient>
              </defs>

              <Tooltip
                content={<CustomTooltip />}
                // contentStyle={{
                //   backgroundColor: '#222',
                //   border: 'none',
                //   color: '#fff',
                //   fontSize: 12,
                //   fontWeight: 400,
                // }}
                // formatter={(value, name) => {
                //   return typeof value === 'number'
                //     ? name === 'YOY'
                //       ? `${value.toFixed(2)}%`
                //       : `${formatLargeNumber(value)}`
                //     : value
                // }}
              />
              <Bar
                yAxisId='left'
                dataKey='bar1'
                name={roeName}
                barSize={70}
                radius={[2, 2, 0, 0]}
                // fill='#578CF9'
                fill='url(#financials_bar_gradient)'
              />
              {/* 青柱 */}
              {/* <Bar
                  yAxisId="left"
                  dataKey="bar2"
                  name="Bar 2"
                  barSize={35}
                  radius={[2, 2, 0, 0]}
                  fill="#76CEDF"
                /> */}
              {/* 折线：直线 + 空心圆 */}
              <Line
                yAxisId='right'
                type='linear'
                dataKey='line'
                name='YOY'
                stroke='#FFB219'
                strokeWidth={2}
                strokeLinecap='round' // ✅ 圆角收尾，避免穿过
                // dot={<CustomDot cx={7} cy={7} stroke={'#E4842E'} />}
                dot={<CustomDot cx={7} r={2.5} cy={7} stroke={'#FFB219'} />}
                activeDot={{
                  r: 3,
                  stroke: '#FFB219',
                  strokeWidth: 2,
                  fill: 'transparent',
                }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div className='flex justify-center items-center gap-x-6'>
          <div className='flex items-center gap-x-1'>
            <div className='w-[11px] h-[11px] bg-[linear-gradient(180deg,rgba(190,255,110,0.5)_0%,rgba(106,252,223,0.5)_100%)] rounded-full'></div>
            <div className='text-[12px] font-normal'>{roeName}</div>
          </div>
          {/* <div className="flex items-center gap-x-1">
              <div className="w-[11px] h-[11px] bg-[#76CEDF] rounded-full"></div>
              <div className="text-[12px] font-normal">Net income</div>
            </div> */}
          <div className='flex items-center gap-x-1'>
            <div className='w-[11px] h-[11px] bg-[#FFB219] rounded-full'></div>
            <div className='text-[12px] font-normal'>YOY%</div>
          </div>
        </div>
        <div className='text-gray-400 text-xs/[15px] h-[15px] font-normal mt-4'>{roeFormula}</div>
      </div>
    </div>
  )
})

export { Financials }
