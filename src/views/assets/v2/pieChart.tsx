import { PieChart, Pie, Cell, Sector, ResponsiveContainer, Customized } from 'recharts'
import { cn, formatLargeNumber, textPrefix, toFixed } from '@/utils'
import { truncate } from '@/utils'
import { useState, useRef } from 'react'
import { useTranslation } from '@/hooks/useTranslation'

// 预定义颜色：前个资产的颜色
export const COLORS = ['#00E096', '#818CF8', '#F473B6', '#FBC024', '#62A7FB', '#94A3B8']
export const PieChartCx = 70

export interface ChartData {
  name: string
  value: number
  symbol: string
  [key: string]: any
  ratio?: string
  holdings: string
  isTooSmall?: boolean
}

export default function AssetsPieChart({
  chartData,
  activeIndex,
  onActiveIndexChange,
}: {
  chartData: ChartData[]
  activeIndex: number
  onActiveIndexChange: (index: number) => void
}) {
  const { t } = useTranslation()

  const renderActiveShape = (props: any, showTooltip: boolean = true) => {
    const { cx, cy, innerRadius, outerRadius, midAngle, payload, startAngle, endAngle, fill } =
      props

    const RADIAN = Math.PI / 180
    const cos = Math.cos(-RADIAN * midAngle)
    const sin = Math.sin(-RADIAN * midAngle)

    const labelRadius = innerRadius + (outerRadius - innerRadius) * 0.35
    const dotX = cx + labelRadius * cos
    const dotY = cy + labelRadius * sin

    const isRight = cos >= 0

    return (
      <g style={{ cursor: 'pointer' }}>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius - 3}
          outerRadius={outerRadius + 3}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          cornerRadius={3}
        />
        {showTooltip && (
          <circle cx={dotX} cy={dotY} r={3} fill='#fff' className='pointer-events-none' />
        )}
        {showTooltip && (
          <foreignObject
            // x={isRight ? dotX + 10 : dotX - 10} // 如果在右侧，起点为圆点右侧 10px；如果在左侧，起点为圆点左侧 10px
            // y={dotY - 12}
            x={isRight ? dotX - 70 : dotX + 70}
            y={dotY - 30}
            height={24}
            className='overflow-visible pointer-events-none'
          >
            <div
              className={cn(
                'bg-white/10 py-1 px-2 backdrop-blur-[15px] rounded-sm text-xs/[15px] w-max',
                isRight ? '' : '-translate-x-full' // 如果在左侧，通过 transform 向左平移 100% 自身宽度
              )}
            >
              <div className='flex flex-row justify-center gap-1'>
                <span>{payload.symbol}</span>
                <div>{textPrefix(formatLargeNumber(truncate(payload.value, 2)), '$')}</div>
              </div>
              <div>
                {t('portfolio.allc')} {!payload.isTooSmall ? payload.ratio : '<1'}%
              </div>
            </div>
          </foreignObject>
        )}
      </g>
    )
  }

  const selectedColors = COLORS.slice(0, chartData.length)

  const cx = PieChartCx
  const cy = 67
  const innerRadius = 49
  const outerRadius = 57
  const paddingAngle = 3

  const [hoverIndex, setHoverIndex] = useState(-1)
  const anglesRef = useRef<
    {
      startAngle: number
      endAngle: number
      midAngle: number
      cx: number
      cy: number
      innerRadius: number
      outerRadius: number
    }[]
  >([])

  return (
    <ResponsiveContainer width='100%' height={132}>
      <PieChart>
        <Pie
          data={chartData}
          cx={cx}
          cy={cy}
          activeShape={hoverIndex !== -1 ? renderActiveShape : false}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          paddingAngle={paddingAngle}
          cornerRadius='30%'
          startAngle={0}
          endAngle={360}
          label={(p: any) => {
            const { index, cx, cy, innerRadius, outerRadius, startAngle, endAngle } = p
            anglesRef.current[index] = {
              startAngle,
              endAngle,
              midAngle: (startAngle + endAngle) / 2,
              cx,
              cy,
              innerRadius,
              outerRadius,
            }
            return null
          }}
          labelLine={false}
          dataKey='value'
          stroke='none'
          animationDuration={300}
          onMouseEnter={(data, idx) => {
            setHoverIndex(idx)
            onActiveIndexChange(idx)
          }}
          onMouseLeave={() => {
            setHoverIndex(-1)
            onActiveIndexChange(-1)
          }}
        >
          {chartData.map((entry, index) => (
            <Cell
              key={entry.name}
              fill={selectedColors[index % selectedColors.length]}
              fillOpacity={activeIndex === -1 ? 1 : index === activeIndex ? 1 : 0.25}
            />
          ))}
          <Customized
            component={() =>
              hoverIndex === -1 && activeIndex !== -1 && anglesRef.current[activeIndex]
                ? renderActiveShape(
                    {
                      cx: anglesRef.current[activeIndex].cx ?? cx,
                      cy: anglesRef.current[activeIndex].cy ?? cy,
                      innerRadius: anglesRef.current[activeIndex].innerRadius ?? innerRadius,
                      outerRadius: anglesRef.current[activeIndex].outerRadius ?? outerRadius,
                      startAngle: anglesRef.current[activeIndex].startAngle,
                      endAngle: anglesRef.current[activeIndex].endAngle,
                      midAngle: anglesRef.current[activeIndex].midAngle,
                      fill: selectedColors[activeIndex % selectedColors.length],
                      payload: chartData[activeIndex],
                    },
                    false
                  )
                : null
            }
          />
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  )
}
