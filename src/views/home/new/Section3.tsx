import { memo, useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { useMotionScroll } from "@/hooks/useMotionScroll";
import { LazyImage } from "@/components/image/LazyImage";
import { ItemBox, ItemContent } from "./Section2";
import { useTranslation } from "@/hooks/useTranslation";

// const from = 0.4
// const to = 0.6

const from = 0
const to = 10

const Section2 = memo(() => {
  const { t } = useTranslation()
  const sectionRef = useRef<HTMLDivElement | null>(null);

  const { scrollY, animated } = useMotionScroll(to, sectionRef);
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
      className="h-[810px] px-[170px] text-white sticky top-[88px]"
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
          <div className="flex items-center justify-center gap-x-[54px] relative">
            
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

            {/* Logo 层 */}
            {/* <motion.div
              style={{
                zIndex: 11,
                opacity: doneMap.logo ? 1 : logoOpacity,
                left: '50%',
                top: '50%',
                position: 'absolute',
                transform: 'translate(-50%, -50%)',
                transition: 'all 0.1s linear'
              }}
            >
              <motion.div
                className="px-5 py-[38px] w-[234px] h-[347px] bg-cover bg-no-repeat flex items-center justify-center"
                style={{
                  backgroundImage: `url('/images/home/new/sec25.png')`,
                  filter: doneMap.logo ? 'blur(0px)' : blur,
                  WebkitFilter: doneMap.logo ? 'blur(0px)' : blur,
                  transition: 'all 0.1s linear'
                }}
              >
                <img
                  src="/images/home/new/logo.png"
                  className="w-[206px] h-[32px]"
                  alt=""
                />
              </motion.div>
            </motion.div> */}
          </div>
        </div>
      </div>
      
    </div>
  );
});

export default Section2;
