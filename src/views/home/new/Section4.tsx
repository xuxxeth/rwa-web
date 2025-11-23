import { LazyImage } from "@/components/image/LazyImage"
import { memo, useCallback } from "react"
import Section4_3 from "./Section4_3"
import Section4_2 from "./Section4_2"
import Section4_1 from "./Section4_1"
import { useRouter } from "@/hooks/useRouter"
import { useBaseStore } from "@/stores/baseStore"
import { useTradeStore } from "@/stores/tradeStore"
import type { IRwa } from "@/service/base/types"

const Section4 = memo(
  () => {
    const router = useRouter()
    const rwaList = useBaseStore(state => state.rwaList)
    const updateInputToken = useTradeStore(state => state.updateInputToken)

    const handleClick = useCallback((rwa: IRwa) => {
      updateInputToken(rwa)
      router.push('/lite-trade')
    }, [updateInputToken])

    return (
      <div className="h-[810px] px-[170px] text-white relative overflow-hidden">
        <div className=" absolute -bottom-[0] left-0 right-0 flex justify-center w-full h-full">
          {/* <div className="new-circle-bg4 w-[80%] h-[70%]">

          </div> */}
          <LazyImage src="/images/home/new/sec4_bg3.png" className="w-full" />
        </div>
        <div className="w-[250px] h-[250px] absolute left-[calc(50%-125px)] top-[calc(50%-125px)] flex items-center justify-center">
          <LazyImage src="/images/home/new/sec4_bg.png" className="w-full h-full absolute left-0 top-0" />
          <LazyImage src="/images/home/new/logo.png" className="w-[180px]" />
        </div>
        <Section4_1 rwaList={rwaList.slice(3, 7)} onClick={handleClick} />
        <Section4_2 rwaList={rwaList.slice(1, 3)} onClick={handleClick} />
        <Section4_3 rwaList={rwaList.slice(0, 1)} onClick={handleClick} />  
      </div>
    )
})



export default Section4
