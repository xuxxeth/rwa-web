import { useMemo, useState } from 'react'
import { PieChart, Pie, Cell, Sector, Tooltip } from 'recharts'
import { type IAssetItem } from '../assetsList'
import { advancedSort, cn, textPrefix, toFixed, sum } from '@/utils'

// 预定义颜色：前7个资产的颜色
const COLORS = ['#0F8660', '#0AC083', '#21F69A', '#23FF9F', '#4FFF7C', '#76FE5E']

interface AssetsPieChartProps {
  data: IAssetItem[]
  className?: string
}

interface ChartData {
  name: string
  value: number
  symbol: string
  [key: string]: any
}

export default function AssetsPieChart({ data, className }: AssetsPieChartProps) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return []

    // 1. 预处理数据：转换 value 为数字并过滤掉 0 值
    const validData = data.filter(item => item.value !== undefined && item.value !== '0')

    // 2. 按价值降序排序
    const sortedData = validData
      .sort((a, b) => advancedSort(a.value, b.value, 'desc'))
      .map(item => ({
        name: item.name!,
        value: parseFloat(item.value!),
        symbol: item.symbol,
      }))

    let top6: ChartData[] = []

    if (sortedData.length > 6) {
      const top5 = sortedData.slice(0, 5)
      const others = sortedData.slice(5)
      const othersValue = others.reduce((acc, cur) => sum(acc, cur.value!), '0')
      const othersItem: ChartData = {
        name: 'Others',
        value: parseFloat(othersValue),
        symbol: 'Others',
      }
      top6 = [...top5, othersItem]
    } else {
      top6 = sortedData.slice(0, 6)
    }

    return top6
  }, [data])

  const renderActiveShape = (props: any) => {
    const {
      cx,
      cy,
      innerRadius,
      outerRadius,
      midAngle,
      payload,
      value,
      startAngle,
      endAngle,
      percent,
      fill,
    } = props

    const RADIAN = Math.PI / 180
    const cos = Math.cos(-RADIAN * midAngle)
    const sin = Math.sin(-RADIAN * midAngle)

    const midRadius = (innerRadius + outerRadius) / 2
    const dotX = cx + midRadius * cos
    const dotY = cy + midRadius * sin

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
          cornerRadius={5}
        />
        <circle cx={dotX} cy={dotY} r={3} fill='#fff' className='pointer-events-none' />
        <foreignObject
          x={isRight ? dotX + 10 : dotX - 10} // 如果在右侧，起点为圆点右侧 10px；如果在左侧，起点为圆点左侧 10px
          y={dotY - 12}
          height={24}
          className='overflow-visible pointer-events-none'
        >
          <div
            className={cn(
              'flex flex-row justify-center gap-1 bg-white/10 py-1 px-2 rounded-sm text-xs w-max',
              isRight ? '' : '-translate-x-full' // 如果在左侧，通过 transform 向左平移 100% 自身宽度
            )}
          >
            <span>{payload.symbol}</span>
            <div>{textPrefix(toFixed(payload.value, 2), '$')}</div>
          </div>
        </foreignObject>
      </g>
    )
  }

  const selectedColors = COLORS.slice(COLORS.length - chartData.length)

  return (
    <PieChart style={{ width: '100%', height: '100%' }}>
      <Pie
        data={chartData}
        cx='50%'
        cy='50%'
        activeShape={renderActiveShape}
        innerRadius={49}
        outerRadius={57}
        paddingAngle={3}
        cornerRadius='30%'
        dataKey='value'
        stroke='none'
        animationDuration={710}
      >
        {chartData.map((entry, index) => (
          <Cell key={entry.name} fill={selectedColors[index % selectedColors.length]} />
        ))}
      </Pie>
    </PieChart>
  )
}
