import { HomeButton } from "@/components/button/HomeButton";
import { VideoPlayer } from "@/components/video/VideoPlayer";
import { useRouter } from "@/hooks/useRouter";
import { useTranslation } from "@/hooks/useTranslation";
import { memo, use, useEffect, useState } from "react";

const factor = 1456 / 816;

const Section1 = memo(
  () => {
    const { t } = useTranslation()
    const router = useRouter()
    const [height, setHeight] = useState(816);

    useEffect(() => {
      const handleResize = () => {
        const newWidth = document.body.clientWidth;
        let newHeight = newWidth / factor;
        if (newWidth > 1456) {
          newHeight = 816
        }
        
        setHeight(newHeight > 816 ? 816 : newHeight);
      };

      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }, [])

    const MainContent = () => {
      return (
        <div className=" relative z-10 flex flex-col items-center justify-center h-full">
          <div className="text-[28px] sm:text-[34px] lg:text-[48px] font-semibold leading-[34px] sm:leading-[100%] lg:leading-[56px] w-[90%] sm:w-full md:w-[662px] text-center">{t('newHome.t1')}</div>
          <div className="text-[16px] lg:text-[18px] font-normal mt-4 leading-[26px] text-[rgba(255,255,255,0.8)] w-[80%] sm:w-[363px] text-center">{t('newHome.t2')}</div>
          <div className=" mt-8">
            <HomeButton type="start" 
              onClick={() => {
                router.push('/lite-trade')
              }}
            >
              <div className="flex items-center justify-center text-[14px] lg:text-[18px] font-semibold gap-x-1">
                {t('newHome.btn2')}
                <div className="w-5 h-5 lg:w-[35px] lg:h-[35px] flex items-center justify-center bg-white rounded-full">
                  <img src="/images/home/new/arrow-right.png" className="w-[7px] h-[7px] lg:w-[12px] lg:h-[12px]" alt="" />
                </div>
              </div>
            </HomeButton>
          </div>
        </div>
      )
    }

    return (
      <>
        <div className=" hidden lg:flex h-[calc(100vh-88px)] items-center justify-center text-white">
          <div className=" w-full max-w-[1456px] relative text-white"
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
            <MainContent />
          </div>
        </div>
        <div className=" block lg:hidden w-full relative text-white pt-[124px] sm:pt-[211px]"
        >
          <MainContent />
          <div className="h-[79px]"></div>
          <div className=" h-auto w-full">
            <VideoPlayer
              src="/images/home/new/bg-video.mp4"
              poster="/images/home/new/small.png"
              muted
              loop
              className="w-full h-full"
            />
          </div>
        </div>
      </>
      
    )
  }
)

export default Section1;