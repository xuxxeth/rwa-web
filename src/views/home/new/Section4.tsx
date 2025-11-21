import { LazyImage } from "@/components/image/LazyImage"
import { memo } from "react"
import Section4_3 from "./Section4_3"
import Section4_2 from "./Section4_2"
import Section4_1 from "./Section4_1"

const Section4 = memo(
  () => {

    return (
      <div className="h-[810px] px-[170px] text-white relative overflow-hidden">
        <div className=" absolute -bottom-[454px] left-0 right-0 flex justify-center ">
          <div className="new-circle-bg4">

          </div>
          {/* <LazyImage src="/images/home/new/sec4_bg3.png" className=" h-[350px]" /> */}
        </div>
        <div className="w-[250px] h-[250px] absolute left-[calc(50%-125px)] top-[calc(50%-125px)] flex items-center justify-center">
          <LazyImage src="/images/home/new/sec4_bg.png" className="w-full h-full absolute left-0 top-0" />
          <LazyImage src="/images/home/new/logo.png" className="w-[180px]" />
        </div>
        <Section4_1 />
        <Section4_2 />
        <Section4_3 />  
      </div>
    )
})



export default Section4
