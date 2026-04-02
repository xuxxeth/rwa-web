import { memo, useMemo } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, ReferenceArea } from "recharts";
import { cn } from "@/lib/utils";

type Point = {
  ts: number;
  price: number;
};

type IntradayLineChartProps = {
  from?: string;
  data?: Point[];
  session?: "pre" | "after";
};

function buildMockData(startTs: number, minutes: number): Point[] {
  const points: Point[] = [];
  let price = 100;

  for (let i = 0; i <= minutes; i++) {
    const ts = startTs + i * 60 * 1000;
    // 有涨有跌的走势：低频趋势 + 高频扰动
    const wave = Math.sin(i / 35) * 0.12;
    const noise = Math.sin(i / 7) * 0.03;
    const drift = wave + noise;
    price = Math.max(1, price + drift);
    points.push({ ts, price: Number(price.toFixed(2)) });
  }

  return points;
}

const IntradayLineChart = memo(({ from, data, session = "pre" }: IntradayLineChartProps) => {
  const formatTime = (ts: number) => {
    const d = new Date(ts);
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
  };

  const preStart = new Date();
  preStart.setHours(4, 0, 0, 0);
  const preEnd = new Date();
  preEnd.setHours(9, 30, 0, 0);

  const afterStart = new Date();
  afterStart.setHours(16, 0, 0, 0);
  const afterEnd = new Date();
  afterEnd.setHours(20, 0, 0, 0);

  const sessionRange =
    session === "pre"
      ? [preStart.getTime(), preEnd.getTime()]
      : [afterStart.getTime(), afterEnd.getTime()];

  const series = useMemo(() => {
    if (data) return data;

    const startTs = sessionRange[0];
    const minutes = 240; // 模拟 4 小时数据：04:00-08:00 或 16:00-20:00
    return buildMockData(startTs, minutes);
  }, [data, sessionRange]);

  const displaySeries = useMemo(() => {
    const [start, end] = sessionRange;
    return series.filter((p) => p.ts >= start && p.ts <= end);
  }, [series, sessionRange]);

  const lastIndex = displaySeries.length - 1;

 
  const priceDomain = useMemo(() => {
    if (displaySeries.length === 0) return ["auto", "auto"] as const;
    let min = Infinity;
    let max = -Infinity;
    for (const p of displaySeries) {
      if (p.price < min) min = p.price;
      if (p.price > max) max = p.price;
    }
    if (!Number.isFinite(min) || !Number.isFinite(max)) return ["auto", "auto"] as const;
    const padding = Math.max((max - min) * 0.1, max * 0.1);
    return [min - padding, max + padding] as const;
  }, [displaySeries]);

  return (
    <div
      className={cn(
        "relative text-white pr-4",
        from === "market" ? "h-[500px]" : "h-[300px]"
      )}
    >
      <div className="absolute w-4 h-1 -left-0 top-[38px] bg-[#1A1B1E] z-30">&nbsp;</div>
      <div className="absolute w-4 h-1 -right-0 top-[38px] bg-[#1A1B1E] z-30">&nbsp;</div>
      <div className="h-full pl-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={displaySeries} margin={{ top: 12, right: 6, left: 0, bottom: 10 }}>
            <ReferenceArea
              x1={sessionRange[0]}
              x2={sessionRange[1]}
              fill="rgba(255, 255, 255, 0.04)"
              strokeOpacity={0}
            />
            <XAxis
              dataKey="ts"
              type="number"
              domain={sessionRange}
              tickFormatter={formatTime}
              tick={{ fill: "#9DA3AF", fontSize: 11 }}
              axisLine={{ stroke: "#1A1B1E" }}
              tickLine={false}
              minTickGap={30}
            />
            <YAxis
              dataKey="price"
              domain={priceDomain}
              tick={{ fill: "#9DA3AF", fontSize: 11 }}
              axisLine={{ stroke: "#1A1B1E" }}
              tickLine={false}
              width={40}
            />
            <Tooltip
              cursor={{ stroke: "#25A750", strokeWidth: 1, strokeDasharray: "3 3" }}
              labelFormatter={(label) => formatTime(Number(label))}
              formatter={(val) => [val, "Price"]}
              contentStyle={{ background: "#131416", border: "1px solid #232427" }}
              labelStyle={{ color: "#9DA3AF" }}
            />
            <Line
              type="linear"
              dataKey="price"
              stroke="#25A750"
              strokeWidth={1.5}
              dot={({ index, cx, cy }) => {
                if (cx === undefined || cy === undefined) {
                  return <circle cx={0} cy={0} r={0} />;
                }
                if (index !== lastIndex) {
                  return <circle cx={cx} cy={cy} r={0} />;
                }
                return (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={3}
                    fill="#25A750"
                    stroke="#FFFFFF"
                    strokeWidth={1}
                  />
                );
              }}
              activeDot={{ r: 3 }}
              isAnimationActive={false}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
});

IntradayLineChart.displayName = "IntradayLineChart";

export { IntradayLineChart };
