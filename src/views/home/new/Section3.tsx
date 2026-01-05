import { memo, useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { useMotionScroll } from "@/hooks/useMotionScroll";
import { LazyImage } from "@/components/image/LazyImage";
import { ItemBox, ItemContent } from "./Section2";
import { useTranslation } from "@/hooks/useTranslation";
import { useTailwindBreakpoints } from "@/hooks/useBreakpoints";

const from = 0
const to = 5

const Section3Lg = memo(() => {
  const { t } = useTranslation()
  const { isLg, isXl, is2Xl } = useTailwindBreakpoints();
  const sectionRef = useRef<HTMLDivElement | null>(null);

  const { scrollY, animated } = useMotionScroll(to, sectionRef, !(isLg || isXl || is2Xl));
  // 动画完成状态，初始都为 false
  const [doneMap, setDoneMap] = useState({
    A: false,
    B: false,
    C: false,
    D: false,
    BG: false,
    logo: false,
  });

  // 计算动画值
  const xA = useTransform(scrollY, [from, to], [-52, 26],);
  const xB = useTransform(scrollY, [from, to], [-26, 0],);
  const xC = useTransform(scrollY, [from, to], [0, -26],);
  const xD = useTransform(scrollY, [from, to], [26, -52],);
  const xBG = useTransform(scrollY, [from, to], [1380, 878]);
  
  useEffect(() => {
    if (animated) {
      setDoneMap({
        A: true,
        B: true,
        C: true,
        D: true,
        BG: true,
        logo: true,
      });
    }
  }, [animated])


  return (
    <div
      ref={sectionRef}
      className=" hidden lg:block h-[810px] lg:px-4 xl:px-[170px] text-white"
    >
      <div className=" relative w-full h-full flex items-center justify-center">
        <div className=" absolute w-full h-full left-0 top-0 flex items-center justify-center overflow-hidden">
          <motion.div
            style={{
              width: doneMap.BG ? 878 : xBG,
              height: doneMap.BG ? 878 : xBG,
              transition: 'all 0.1s linear',
              
            }}
          >
            <LazyImage src="/images/home/new/sec3_bg.png" className="w-full h-full" />
          </motion.div>
          
        </div>
        <div className=" relative z-30">

          {/* 动画卡片区域 */}
          <div className="flex items-center justify-center lg:gap-x-5 xl:gap-x-[54px] relative">
            
            <motion.div style={{ y: doneMap.A ? 26 : xA, zIndex: 10, transition: 'all 0.1s linear' }}>
              <ItemBox
                className="pl-[14px]"
              >
                <div className="w-full h-full flex flex-col justify-between">
                  <div className="w-[120px] h-[120px]">
                    <LazyImage src="/images/home/new/sec3_1.png" className="w-full h-full" />
                  </div>
                  <ItemContent>
                    <div className="pl-[18px] pb-[18px]">{t('newHome.t15')}</div>
                  </ItemContent>
                </div>
                
              </ItemBox>
            </motion.div>
            <motion.div style={{ y: doneMap.B ? 0 : xB, zIndex: 9, transition: 'all 0.1s linear' }}>
              <ItemBox
                className="pl-[14px]"
              >
                <div className="w-full h-full flex flex-col justify-between">
                  <div className="w-[120px] h-[120px]">
                    <LazyImage src="/images/home/new/sec3_2.png" className="w-full h-full" />
                  </div>
                  <ItemContent>
                    <div className="pl-[18px] pb-[18px]">{t('newHome.t16')}</div>
                  </ItemContent>
                </div>
                
              </ItemBox>
            </motion.div>

            <motion.div style={{ y: doneMap.C ? -26 : xC, zIndex: 8, transition: 'all 0.1s linear' }}>
              <ItemBox
                className="pl-[14px]"
              >
                <div className="w-full h-full flex flex-col justify-between">
                  <div className="w-[120px] h-[120px]">
                    <LazyImage src="/images/home/new/sec3_3.png" className="w-full h-full" />
                  </div>
                  <ItemContent>
                    <div className="pl-[18px] pb-[18px]">{t('newHome.t17')}</div>
                  </ItemContent>
                </div>
                
              </ItemBox>
            </motion.div>

            <motion.div style={{ y: doneMap.D ? -52 : xD, zIndex: 7, transition: 'all 0.1s linear' }}>
              <ItemBox
                className="pl-[14px]"
              >
                <div className="w-full h-full flex flex-col justify-between">
                  <div className="w-[120px] h-[120px]">
                    <LazyImage src="/images/home/new/sec3_4.png" className="w-full h-full" />
                  </div>
                  <ItemContent>
                    <div className="pl-[18px] pb-[18px]">{t('newHome.t18')}</div>
                  </ItemContent>
                </div>
                
              </ItemBox>
            </motion.div>
            
          </div>
        </div>
      </div>
      
    </div>
  );
});
const Section3H5 = memo(() => {
  const { t } = useTranslation()
  const { windowWidth} = useTailwindBreakpoints();
  return (
    <div
      className=" block lg:hidden text-white"
    >
      <div className=" relative w-full h-full flex items-center justify-center">
        <div className=" absolute w-full h-full left-0 top-0 flex items-center justify-center overflow-hidden">
          <motion.div
          >
            <LazyImage src="/images/home/new/sec3_bg_h5.png" className="w-full" />
          </motion.div>
          
        </div>
        <div className=" relative z-30 py-[100px] sm:py-[200px] md:flex md:justify-center overflow-x-auto px-10 md:px-0 scrollbar-hide"
          style={{
            width: windowWidth
          }}
        >

          {/* 动画卡片区域 */}
          <div className="w-[996px] md:w-auto grid grid-cols-4 md:grid-cols-2 md:gap-[60px] relative">
            
            <motion.div>
              <ItemBox
                className="pl-[14px]"
              >
                <div className="w-full h-full flex flex-col justify-between">
                  <div className="w-[120px] h-[120px]">
                    <LazyImage src="/images/home/new/sec3_1.png" className="w-full h-full" />
                  </div>
                  <ItemContent>
                    <div className="pl-[18px] pb-[18px]">{t('newHome.t15')}</div>
                  </ItemContent>
                </div>
                
              </ItemBox>
            </motion.div>
            <motion.div>
              <ItemBox
                className="pl-[14px]"
              >
                <div className="w-full h-full flex flex-col justify-between">
                  <div className="w-[120px] h-[120px]">
                    <LazyImage src="/images/home/new/sec3_2.png" className="w-full h-full" />
                  </div>
                  <ItemContent>
                    <div className="pl-[18px] pb-[18px]">{t('newHome.t16')}</div>
                  </ItemContent>
                </div>
                
              </ItemBox>
            </motion.div>

            <motion.div>
              <ItemBox
                className="pl-[14px]"
              >
                <div className="w-full h-full flex flex-col justify-between">
                  <div className="w-[120px] h-[120px]">
                    <LazyImage src="/images/home/new/sec3_3.png" className="w-full h-full" />
                  </div>
                  <ItemContent>
                    <div className="pl-[18px] pb-[18px]">{t('newHome.t17')}</div>
                  </ItemContent>
                </div>
                
              </ItemBox>
            </motion.div>

            <motion.div>
              <ItemBox
                className="pl-[14px]"
              >
                <div className="w-full h-full flex flex-col justify-between">
                  <div className="w-[120px] h-[120px]">
                    <LazyImage src="/images/home/new/sec3_4.png" className="w-full h-full" />
                  </div>
                  <ItemContent>
                    <div className="pl-[18px] pb-[18px]">{t('newHome.t18')}</div>
                  </ItemContent>
                </div>
                
              </ItemBox>
            </motion.div>
            
          </div>
        </div>
      </div>
      
    </div>
  );
});

const Section3 = () => {
  return (
    <>
      <Section3Lg />
      <Section3H5 />
    </>
  )
}

export default Section3;
