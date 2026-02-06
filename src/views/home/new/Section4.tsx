import { LazyImage } from "@/components/image/LazyImage"
import { memo, useCallback, useEffect, useState } from "react"
import Section4_3 from "./Section4_3"
import Section4_2 from "./Section4_2"
import Section4_1 from "./Section4_1"
import { useRouter } from "@/hooks/useRouter"
import { useBaseStore } from "@/stores/baseStore"
import { useTradeStore } from "@/stores/tradeStore"
import type { IRwa } from "@/service/base/types"
import { useTailwindBreakpoints } from "@/hooks/useBreakpoints"
import { useWssOn } from "@/hooks/useWssOn"
import { useWssStore } from "@/stores/wssStore"

const Section4 = memo(
  () => {
    const router = useRouter()
    const rwaList = useBaseStore(state => state.rwaList)
    const updateInputToken = useTradeStore(state => state.updateInputToken)

    const setTokenWithPriceByWebSocketData = useBaseStore(
        state => state.setTokenWithPriceByWebSocketData
      )
    const setStockWithPriceByWebSocketData = useBaseStore(
      (state) => state.setStockWithPriceByWebSocketData
    );
    const stableTokenWithPrice = useWssStore(state => state.setStableTokenWithPrice)
    
    useWssOn('aggregate', (data: any) => {
      const _data = data?.items || []
      setTokenWithPriceByWebSocketData(_data)
      setStockWithPriceByWebSocketData(_data)
      stableTokenWithPrice(_data)
    })

    const handleClick = useCallback((rwa: IRwa) => {
      updateInputToken(rwa)
      router.push('/lite-trade')
    }, [updateInputToken])

    const [scale, setScale] = useState(1)
    const { windowWidth} = useTailwindBreakpoints();

    useEffect(() => {
      if (windowWidth < 768) {
        const _scale = windowWidth / 840
        setScale( _scale )
      }
    }, [windowWidth])

    return (
      <div className="h-[510px] sm:h-[810px] md:h-[1110px] lg:h-[810px] lg:pb-0 lg:px-4 xl:px-[170px] text-white relative overflow-hidden"
        
      >
        <div className=" absolute -bottom-[0] left-0 right-0 flex justify-center w-full h-full">
          {/* <div className="new-circle-bg4 w-[80%] h-[70%]">

          </div> */}
          <LazyImage src="/images/home/new/sec4_bg3.png" className="w-full" />
        </div>
        <div className="w-[250px] h-[250px] absolute left-[calc(50%-125px)] top-[calc(50%-125px)] flex items-center justify-center"
          style={{scale: scale}}
        >
          <LazyImage src="/images/home/new/sec4_bg.png" className="w-full h-full absolute left-0 top-0" />
          <LazyImage src="/images/home/new/logo.png" className="w-[180px]" />
        </div>
        <Section4_1 rwaList={rwaList.slice(3, 7)} onClick={handleClick} scale={scale} />
        <Section4_2 rwaList={rwaList.slice(1, 3)} onClick={handleClick} scale={scale} />
        <Section4_3 rwaList={rwaList.slice(0, 1)} onClick={handleClick} scale={scale} />  
      </div>
    )
})



export default Section4
