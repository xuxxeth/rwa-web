import { HomeButton } from "@/components/button/HomeButton";
import { VideoPlayer } from "@/components/video/VideoPlayer";
import { useRouter } from "@/hooks/useRouter";
import { memo, use, useEffect, useState } from "react";

const factor = 1456 / 816;

const Section1 = memo(
  () => {
    const router = useRouter()
    const [height, setHeight] = useState(816);

    useEffect(() => {
      const handleResize = () => {
        const newWidth = document.body.clientWidth;
        const newHeight = newWidth / factor;
        setHeight(newHeight);
      };

      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }, [])

    return (
      <div className="w-full relative text-white"
        style={{
          height: height + 'px'
        }}
      >
        <div className=" absolute left-0 top-0 h-full w-full">
          <VideoPlayer
            src="/images/home/new/bg-video.mp4"
            poster="/images/home/new/small.png"
            muted
            loop
            className="w-full h-full"
          />
        </div>
        <div className=" relative z-10 flex flex-col items-center justify-center h-full">
          <div className="text-[48px] font-semibold leading-[56px] md:w-[662px] text-center">Building a Tokenized Reality for Everyone</div>
          <div className="text-[18px] font-normal mt-4 leading-[26px] text-[rgba(255,255,255,0.8)] w-[363px] text-center">A world where every real asset can move freely, securely, and compliantly.</div>
          <div className=" mt-8">
            <HomeButton type="start" 
              onClick={() => {
                router.push('/lite-trade')
              }}
            >
              <div className="flex items-center justify-center text-[18px] font-semibold gap-x-1">
                Start Trading
                <div className="w-[35px] h-[35px] flex items-center justify-center bg-white rounded-full">
                  <img src="/images/home/new/arrow-right.png" className="w-[12px] h-[12px]" alt="" />
                </div>
              </div>
            </HomeButton>
          </div>
        </div>
      </div>
    )
  }
)

export default Section1;