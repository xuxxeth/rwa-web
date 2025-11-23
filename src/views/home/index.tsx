
import { XFooter } from "@/components/footer";
import { lazy } from "react";
import Section1 from "./new/Section1";
import { useWssOn } from "@/hooks/useWssOn";
import { useBaseStore } from "@/stores/baseStore";
import { MainLayout } from "@/layouts/main";
const Section2 = lazy(() => import("./new/Section2"));
const Section3 = lazy(() => import("./new/Section3"));
const Section4 = lazy(() => import("./new/Section4"));
const Section5 = lazy(() => import("./new/Section5"));
const Section6 = lazy(() => import("./new/Section6"));


function Home() {
  const setTokenWithPriceByWebSocketData = useBaseStore(
    state => state.setTokenWithPriceByWebSocketData
    )
  useWssOn('summary', (data: any) => {
    setTokenWithPriceByWebSocketData(data || [])
  })

  return (
    <div className=" font-normal">
      <Section1 />

      <MainLayout>
        <Section2 />
        <Section3 />
        <Section4 />
        <Section5 />
        <Section6 />
      </MainLayout>
      
      <XFooter from="home" />
      
    </div>
  );
}

export default Home