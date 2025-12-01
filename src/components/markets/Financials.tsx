import { memo, useEffect, useMemo, useRef, useState } from "react"
import { ProfileTitle } from "./ProfileTitle"
import { useTranslation } from "@/hooks/useTranslation"
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils";
import { useTradeStore } from "@/stores/tradeStore";
import { baseApi } from "@/service/base/api";
import type { IIndicators } from "@/service/base/types";
import { formatLargeNumber } from "@/utils/format";
import { formatToQuarterLabel } from "@/utils";

const CustomDot = (props: { cx: any; cy: any; stroke: string }) => {
  const { cx, cy, stroke } = props;
  const [hovered, setHovered] = useState(false);

  return (
    <circle
      cx={cx}
      cy={cy}
      r={4}
      fill="#141418"                     // 空心
      stroke={hovered ? "#FFA500" : stroke} // 悬浮高亮变橙色
      strokeWidth={2}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ cursor: "pointer" }}   // 鼠标悬停变手型
    />
  );
};

const FilterItem = memo(
  ({
    itemData,
    selected,
    onClick
  }: {
    itemData: {label: string, value: string}
    selected?: boolean
    onClick?: (item: string) => void
  }) => {
    return (
      <div className={cn(
        "h-[33px] px-4 flex items-center justify-center shrink-0 bg-[#131823] rounded-[8px] text-[rgba(255,255,255,0.6)] text-[14px] font-medium min-w-[94px] cursor-pointer",
        selected ? "bg-[#324054] text-white" : ""
      )}
        onClick={() => {
          onClick && onClick(itemData.value)
        }}
      >
        { itemData.label }
      </div>
    )
  }
)


const Financials = memo(
  () => {
    const { t } = useTranslation()
    const annualList = [
      { label: t('financials.roe'), value: 'roe' }, 
      { label: t('financials.roa'), value: 'roa'}, 
      { label: t('financials.pe'), value: 'pe'}, 
      { label: t('financials.pb'), value: 'pb'}, 
      { label: t('financials.eps'), value: 'eps'}, 
      { label: t('financials.bps'), value: 'bps'}, 
      { label: t('financials.ocfps'), value: 'ocfps'}, 
      { label: t('financials.grps'), value: 'grps'}
    ]

    const [current, setCurrent] = useState('roe')
    const inputToken = useTradeStore(state => state.inputToken)
    const initRef = useRef(false)
    const [indicatorsData, setIndicatorsData] = useState<IIndicators[]>([])

    useEffect(() => {
      if (inputToken?.stockId && !initRef.current) {
        initRef.current = true
        baseApi.getIndicators(inputToken.stockId)
          .then(res => {
            // @ts-ignore
            setIndicatorsData(res?.data?.indicators || {})
          })
      }
      
    }, [inputToken?.stockId])
    
    const filterData = useMemo(() => {
      const key = current.toLowerCase()
      const annualKey = key + '_annual' as string
      const yoyKey = annualKey + '_yoy' as string

      let _data: any[] = []
      indicatorsData.sort((a, b) => a.report_period - b.report_period).forEach(item => {

        _data.push({
          quarter: formatToQuarterLabel(item.report_period) , 
          // @ts-ignore
          bar1: item[annualKey], 
          
          // bar2: 0.5, 
          // @ts-ignore
          line: item[yoyKey]
        })
      })
      return _data

    }, [current, indicatorsData])

    const roeName = useMemo(() => {
      return annualList.find(item => item.value === current)?.label
    }, [current, annualList])

    return (
      <div>
        <ProfileTitle title={t('financials.t1')} className=" mt-10 mb-6" />
        <div className="text-[14px] font-medium mb-6 px-2">{t('financials.t2')}</div>
        <div className="px-[43px]">
          <div className="flex items-center gap-x-2 pl-14 mb-10">
            {
              annualList.map(item => {
                return <FilterItem key={item.value} selected={current === item.value} itemData={item} onClick={item => setCurrent(item)} />
              })
            }
            
          </div>
          <div className="w-full h-[260px] rounded-2xl" tabIndex={-1}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={filterData}
                margin={{ top: 20, right: 40, bottom: 20, left: 50 }} // ✅ 给够空间
                barCategoryGap="25%"
                barGap={6}
              >
                <CartesianGrid
                  horizontal={true}
                  vertical={false}
                  stroke="rgba(59, 60, 78, 1)"
                  strokeDasharray="0"
                />

                <YAxis
                  dataKey="bar1"
                  yAxisId="left"
                  interval="preserveStartEnd"
                  allowDecimals={true}
                  tickFormatter={(v) => `${formatLargeNumber(v)}`}
                  tick={{ fill: "#FFFFFF", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  width={40}
                />

                <YAxis
                  dataKey="line"
                  yAxisId="right"
                  orientation="right"
                  tickFormatter={(v) => `${(v).toFixed(2)}$`}
                  tick={({ x, y, payload }) => (
                    <text
                      x={x + 70} 
                      y={y}
                      textAnchor="end"
                      fill="#FFFFFF"
                      fontSize={12}
                      dy={4}
                    >
                      {`${(payload.value).toFixed(2)}%`}
                    </text>
                  )}
                  axisLine={false}
                  tickLine={false}
                  width={80}
                />

                <XAxis
                  dataKey="quarter"
                  tick={{ fill: "#FFFFFF", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                />

                <Tooltip
                  contentStyle={{
                    backgroundColor: "#222",
                    border: "none",
                    color: "#fff",
                    fontSize: 12
                  }}
                  formatter={(value, name) => {
                    return typeof value === "number"
                      ? name === "YOY"
                        ? `${value.toFixed(2)}%`
                        : `${formatLargeNumber(value)}`
                      : value
                  }
                    
                  }
                />
                <Bar
                  yAxisId="left"
                  dataKey="bar1"
                  name={roeName}
                  barSize={35}
                  radius={[2, 2, 0, 0]}
                  fill="#578CF9"
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
                  yAxisId="right"
                  type="linear"
                  dataKey="line"
                  name="YOY"
                  stroke="#f28c38"
                  strokeWidth={2}
                  strokeLinecap="round"           // ✅ 圆角收尾，避免穿过
                  dot={<CustomDot cx={7} cy={7} stroke={'#E4842E'} />} 
                  activeDot={{
                    r: 5,
                    stroke: "#f28c38",
                    strokeWidth: 2,
                    fill: "transparent",
                  }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center items-center gap-x-6">
            <div className="flex items-center gap-x-1">
              <div className="w-[11px] h-[11px] bg-[#578CF9] rounded-full"></div>
              <div className="text-[12px] font-normal">{roeName}</div>
            </div>
            {/* <div className="flex items-center gap-x-1">
              <div className="w-[11px] h-[11px] bg-[#76CEDF] rounded-full"></div>
              <div className="text-[12px] font-normal">Net income</div>
            </div> */}
            <div className="flex items-center gap-x-1">
              <div className="w-[11px] h-[11px] bg-[#E4842E] rounded-full"></div>
              <div className="text-[12px] font-normal">YOY%</div>
            </div>
          </div>
        </div>
        
      </div>
    )
  }
)

export { Financials }