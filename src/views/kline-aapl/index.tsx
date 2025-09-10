import { useScript } from "@/hooks/useScript";
import { lazy } from "react";
const TVChartContainer = lazy(() => import("./TVChartContainer"))

export function KLineAAPL() {
  const status = useScript("/libraries/datafeeds/udf/dist/bundle.js");
  const statusLibrary = useScript("/libraries/charting_library/charting_library.js");

  return (status === 'ready' && statusLibrary === 'ready') ? <TVChartContainer /> : null
  
}

export default KLineAAPL