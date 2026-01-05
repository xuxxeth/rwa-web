import { memo, useEffect, useMemo, useRef, useState } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { TitlePrimary } from "@/components/title-primary";
import { useMotionScroll } from "@/hooks/useMotionScroll";
import { LazyImage } from "@/components/image/LazyImage";
import { cn } from "@/utils/tw";
import { useTranslation } from "@/hooks/useTranslation";
import { useTailwindBreakpoints } from "@/hooks/useBreakpoints";

const from = 0
const to = 50


export const ItemContent = memo(
  ({ children }: { children: React.ReactNode }) => {
    return (
      <div className="font-light text-[16px] leading-[150%] mt-[30px]">
        {children}
      </div>
    );
  }
);

export const ItemBox = memo(
  ({ children, className }: { children: React.ReactNode, className?: string }) => {
    return (
      <div
        className="bg-no-repeat w-[234px] h-[347px] relative overflow-hidden p-[1px]"
        style={{ backgroundImage: `url('/images/home/new/bg-border.png')`, backgroundSize: '100% 100%' }}
      >
        <div className={cn(
          "irregular-square px-5 py-[38px] ",
          className
        )}>
          {children}
        </div>
      </div>
    );
  }
);

const Section2Lg = memo(() => {
  const { t } = useTranslation()
  const { isLg, isXl, is2Xl, windowWidth } = useTailwindBreakpoints();
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
  const xATo = useMemo(() => windowWidth < 1440 ? 432 - 36 - 36 : 432, [windowWidth])
  const xBTo = useMemo(() => windowWidth < 1440  ? 144 - 36 : 144, [windowWidth])
  const xCTo = useMemo(() => windowWidth < 1440  ? -144 : -144, [windowWidth])
  const xDTo = useMemo(() => windowWidth < 1440  ? -432 + 36 : -432, [windowWidth])
  // 计算动画值
  const xA = useTransform(scrollY, [from, to], [0, xATo],);
  const xB = useTransform(scrollY, [from, to], [0, xBTo],);
  const xC = useTransform(scrollY, [from, to], [0, xCTo],);
  const xD = useTransform(scrollY, [from, to], [0, xDTo],);
  const xBG = useTransform(scrollY, [from, to], [1261, 927]);
  const yBG = useTransform(scrollY, [from, to], [1101, 810]);

  const logoOpacity = useTransform(scrollY, [to - 10, to], [0, 1]);
  const logoOpacity2 = useTransform(scrollY, [to - 15, to], [1, 0]);
  const logoOpacity3 = useTransform(scrollY, [to - 1, to], [1, 0]);
  const blur = useTransform(scrollY, [to - 10, to], ["blur(20px)", "blur(0px)"]);
  
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
              width: doneMap.BG ? 927 : xBG,
              height: doneMap.BG ? 810 : yBG,
              transition: 'all 0.1s linear',
              
            }}
          >
            <LazyImage src="/images/home/new/sec2_bg.png" className="w-full h-full" />
          </motion.div>
          
        </div>
        <div className=" relative z-30">
          {/* 标题区域 */}
          <div className="flex justify-center flex-col items-center">
            <TitlePrimary className="font-normal text-[28px] mb-5">
              {t('newHome.t3')}
            </TitlePrimary>
            <div className="font-normal text-[20px] leading-[150%] mb-[68px] w-[763px] text-center">
              {t('newHome.t4')}
            </div>
          </div>

          {/* 动画卡片区域 */}
          <div className="flex items-center justify-center lg:gap-x-[18px] xl:gap-x-[54px] relative">
            <motion.div style={{ x: doneMap.A ? xATo : xA, zIndex: 10, transition: 'all 0.1s linear' }}>
              <ItemBox>
                  <motion.div
                    style={{
                      opacity: doneMap.logo ? 0 : logoOpacity2,
                      transition: 'all 0.1s linear'
                    }}
                  >
                    <div className=" relative z-10">
                      <div className="w-[120px]">
                        <TitlePrimary>{t('newHome.t5')}</TitlePrimary>
                      </div>
                      <ItemContent>
                        {t('newHome.t6')}
                      </ItemContent>
                    </div>
                  </motion.div>
                  <motion.div
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
                  </motion.div>
              </ItemBox>

            </motion.div>

            <motion.div style={{ x: doneMap.B ? xBTo : xB, zIndex: 9, opacity: doneMap.logo ? 0 : logoOpacity3, transition: 'all 0.1s linear' }}>
              <ItemBox
              >
                <div className="w-[170px]">
                  <TitlePrimary>{t('newHome.t7')}</TitlePrimary>
                </div>
                <ItemContent>
                  {t('newHome.t8')}
                </ItemContent>
              </ItemBox>
            </motion.div>

            <motion.div style={{ x: doneMap.C ? xCTo : xC, zIndex: 8, opacity: doneMap.logo ? 0 : logoOpacity3, transition: 'all 0.1s linear' }}>
              <ItemBox
              >
                <div className="w-[120px]">
                  <TitlePrimary>{t('newHome.t9')}</TitlePrimary>
                </div>
                <ItemContent>
                  {t('newHome.t10')}
                </ItemContent>
              </ItemBox>
            </motion.div>

            <motion.div style={{ x: doneMap.D ? xDTo : xD, zIndex: 7, opacity: doneMap.logo ? 0 : logoOpacity3, transition: 'all 0.1s linear' }}>
              <ItemBox
              >
                <div>
                  <TitlePrimary>
                    {t('newHome.t11')} <br /> {t('newHome.t12')}
                  </TitlePrimary>
                </div>
                <ItemContent>
                  <div className="">
                    {t('newHome.t13')}
                    <span className=" cursor-pointer text-[#6AFCDF]"> SlowMist 
                    <img src="/images/home/new/link.png" className="w-[12px] h-[12px] inline-block relative top-[-2px] mx-1" />

                    </span>
                    {t('newHome.t14')}
                  </div>
                  
                </ItemContent>
                
              </ItemBox>
            </motion.div>
            
          </div>
        </div>
      </div>
      
    </div>
  );
});

const Section2H5 = memo(
  () => {
    const { t } = useTranslation()
    const { windowWidth} = useTailwindBreakpoints();
    return (
      <div
        className=" block lg:hidden text-white"
      >
        <div className=" relative w-full h-full flex items-center justify-center">
          <div className=" absolute w-full h-full left-0 top-[90px] sm:top-0 flex items-center justify-center overflow-hidden">
            <motion.div
              style={{
              }}
            >
              <LazyImage src="/images/home/new/sec2_bg_h5.png" className="w-full " />
            </motion.div>
          </div>
          <div className=" relative z-30 pt-[67px] md:pt-[148px] pb-[100px]">
            {/* 标题区域 */}
            <div className="flex justify-center flex-col items-center md:px-[100px]">
              <TitlePrimary className="font-normal text-center text-[28px] mb-5 w-[90%] leading-[36px]">
                {t('newHome.t3')}
              </TitlePrimary>
              <div className="font-normal text-[16px] md:text-[20px] leading-[150%] mb-[68px] md:w-[557px] lg:w-[763px] text-center">
                {t('newHome.t4')}
              </div>
            </div>

            {/* 动画卡片区域 */}
            <div className="md:flex md:justify-center overflow-x-auto px-10 md:px-0 scrollbar-hide"
              style={{
                width: windowWidth
              }}
            >
              <div className="w-[996px] md:w-auto grid grid-cols-4 md:grid-cols-2 md:gap-[60px] relative  ">
                <ItemBox>
                    <motion.div
                    >
                      <div className=" relative z-10">
                        <div className="w-[120px]">
                          <TitlePrimary>{t('newHome.t5')}</TitlePrimary>
                        </div>
                        <ItemContent>
                          {t('newHome.t6')}
                        </ItemContent>
                      </div>
                    </motion.div>
                </ItemBox>
                <ItemBox
                >
                  <div className="w-[170px]">
                    <TitlePrimary>{t('newHome.t7')}</TitlePrimary>
                  </div>
                  <ItemContent>
                    {t('newHome.t8')}
                  </ItemContent>
                </ItemBox>

                <ItemBox
                >
                  <div className="w-[120px]">
                    <TitlePrimary>{t('newHome.t9')}</TitlePrimary>
                  </div>
                  <ItemContent>
                    {t('newHome.t10')}
                  </ItemContent>
                </ItemBox>

                <ItemBox
                >
                  <div>
                    <TitlePrimary>
                      {t('newHome.t11')} <br /> {t('newHome.t12')}
                    </TitlePrimary>
                  </div>
                  <ItemContent>
                    <div className="">
                      {t('newHome.t13')}
                      <span className=" cursor-pointer text-[#6AFCDF]"> SlowMist 
                      <img src="/images/home/new/link.png" className="w-[12px] h-[12px] inline-block relative top-[-2px] mx-1" />

                      </span>
                      {t('newHome.t14')}
                    </div>
                    
                  </ItemContent>
                  
                </ItemBox>
                
              </div>
            </div>
            
          </div>
        </div>
        
      </div>
    )
  }
)

const Section2 = () => {
  return (
    <>
      <Section2Lg />
      <Section2H5 />
    </>
  )
}

export default Section2;
