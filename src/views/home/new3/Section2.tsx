import { memo, useEffect, useMemo, useRef, useState } from "react";
import { motion, useTransform } from "framer-motion";
import { TitlePrimary } from "@/components/title-primary";
import { LazyImage } from "@/components/image/LazyImage";
import { cn } from "@/utils/tw";
import { useTranslation } from "@/hooks/useTranslation";
import { useTailwindBreakpoints } from "@/hooks/useBreakpoints";
import { useMotionScrollV2 } from "@/hooks/useMotionScrollV2";

const from = 0
const to = 1
const xTransition = 'all 0.5s linear'


export const ItemContent = memo(
  ({ children, isZh }: { children: React.ReactNode, isZh?: boolean }) => {
    return (
      <div className="font-light text-[16px] leading-[150%] mt-[30px]"
        style={{
          minHeight: isZh ? '100px' : 'auto'
        }}
      >
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
          "irregular-square px-5 py-[38px]",
          className
        )}>
          {children}
        </div>
      </div>
    );
  }
);

const Section2Lg = memo(() => {
  const { t, i18n } = useTranslation()
  const { windowWidth } = useTailwindBreakpoints();
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const innerRef = useRef<HTMLDivElement | null>(null);

  const { animateStart, scrollYProgress } = useMotionScrollV2(to, sectionRef, innerRef);
  // 动画完成状态，初始都为 false
  const [doneMap, setDoneMap] = useState({
    A: false,
    B: false,
    C: false,
    D: false,
    BG: false,
    logo: false,
  });

  const lt1440 = useMemo(() => {
    return windowWidth < 1440
  }, [windowWidth])

  const isZh = useMemo(() => {
    return i18n.language === 'zh' && windowWidth >= 1024
  }, [i18n.language, windowWidth])

  const yBG = useTransform(scrollYProgress, [from, to], [913, 810]);

  const logoOpacity = useTransform(scrollYProgress, [to - 0.1, to], [0, 1]);
  const logoOpacity2 = useTransform(scrollYProgress, [to - 0.001, to], [1, 0]);
  const logoOpacity3 = useTransform(scrollYProgress, [to - 0.001, to], [1, 0]);
  const blur = useTransform(scrollYProgress, [to - 0.05, to], ["blur(20px)", "blur(0px)"]);

  const [animate1, setAnimate1] = useState({x: 0})
  const [animate2, setAnimate2] = useState({x: 0})
  const [animate3, setAnimate3] = useState({x: 0})
  const [animate4, setAnimate4] = useState({x: 0})

  scrollYProgress.on('change', v => {
    if (v <= 0) {
      setAnimate1({x: 0})
      setAnimate2({x: 0})
      setAnimate3({x: 0})
      setAnimate4({x: 0})
    }
    if (v > 0.2) {
      setAnimate1({x: 81})
      setAnimate2({x: 27})
      setAnimate4({x: -81})
      setAnimate3({x: -27})
    }
    if (v > 0.4) {
      setAnimate1({x: 177})
      setAnimate2({x: 60})
      setAnimate4({x: -177})
      setAnimate3({x: -60})
    }
    if (v > 0.6) {
      setAnimate1({x: 267})
      setAnimate2({x: 90})
      setAnimate4({x: -267})
      setAnimate3({x: -90})
    }
    if (v > 0.8) {
      setAnimate1({x: lt1440 ? 361 : 357})
      setAnimate2({x: 120})
      setAnimate4({x: lt1440 ? -361 : -357})
      setAnimate3({x: -120})
    }
    if (v >= 1) {
      setAnimate1({x: lt1440 ? 375 : 432})
      setAnimate2({x: lt1440 ? 120 : 153})
      setAnimate4({x: lt1440 ? -375 : -414})
      setAnimate3({x: lt1440 ? -129 : -135})
    }
  })

  return (
    <div ref={sectionRef} className="h-[4000px] hidden lg:block ">
      <div ref={innerRef}
        className="h-[calc(100vh-88px)] min-h-[810px] lg:px-4 xl:px-[170px] text-white sticky top-[88px]"
      >
        <div className=" relative w-full h-full flex items-center justify-center">
          <div className=" absolute w-full h-full left-0 top-0 flex items-center justify-center overflow-hidden">
            <motion.div
              style={{
                // width: doneMap.BG ? 927 : xBG,
                height: doneMap.BG ? 810 : yBG,
                transition: 'all 0.1s linear',
                
              }}
            >
              <LazyImage src="/images/home/new/sec2_bg.png" className="w-full h-full" />
            </motion.div>
            
          </div>
          <div className=" relative z-30">
            {/* 标题区域 */}
            <motion.div
              animate={
                animateStart ? 
                  {
                    y: 0,
                    opacity: 1
                  }: 
                  {
                    y: 200,
                    opacity: 0.6
                  }
              }
              transition={{
                duration: 0.6,
                ease: 'easeInOut'
              }}
            >
              <div className="flex justify-center flex-col items-center">
                <TitlePrimary className={cn(
                  "font-normal text-[28px] mb-5",
                  isZh ? 'w-[100%] text-center' : 'w-auto'
                )}>
                  {t('newHome.t3')}
                </TitlePrimary>
                <div className="font-normal text-[20px] leading-[150%] mb-[68px] w-[763px] text-center">
                  {t('newHome.t4')}
                </div>
              </div>
            </motion.div>
            

            {/* 动画卡片区域 */}
            <div className="flex items-center justify-center lg:gap-x-[18px] xl:gap-x-[54px] relative">
              <motion.div 
                style={{ x: animate1?.x, zIndex: 10, transition: xTransition }}
                animate={
                  animateStart ? 
                    {
                      y: 0
                    }: 
                    {
                      y: 220
                    }
                }
                transition={{
                  duration: 0.5,
                  ease: 'easeInOut'
                }}

              >
                <ItemBox>
                    <motion.div
                      className="h-full"
                      style={{
                        opacity: doneMap.logo ? 0 : logoOpacity2,
                        transition: 'all 0.1s linear'
                      }}
                    >
                      <div className={cn(
                        " relative z-10 ",
                        isZh ? ' flex flex-col justify-between h-full' : '',
                      )}
                        
                      >
                        <div className={cn(
                          isZh ? 'w-full' : 'w-[120px]]',
                        )}>
                          <TitlePrimary>{t('newHome.t5')}</TitlePrimary>
                        </div>
                        <ItemContent isZh={isZh}>
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

              <motion.div 
                style={{ x: animate2?.x, zIndex: 9, opacity: doneMap.logo ? 0 : logoOpacity3, transition: xTransition }}
                animate={
                  animateStart ? 
                    {
                      y: 0
                    }: 
                    {
                      y: 200
                    }
                }
                transition={{
                  duration: 0.6,
                  ease: 'easeInOut'
                }}
              >
                <ItemBox
                  className={cn(
                    isZh ? ' flex flex-col justify-between ' : '',
                  )}
                >
                  <div className={cn(
                    isZh ? 'w-full' : 'w-[170px]]',
                  )}>
                    <TitlePrimary>{t('newHome.t7')}</TitlePrimary>
                  </div>
                  <ItemContent isZh={isZh}>
                    {t('newHome.t8')}
                  </ItemContent>
                </ItemBox>
              </motion.div>

              <motion.div 
                style={{ x: animate3.x, zIndex: 8, opacity: doneMap.logo ? 0 : logoOpacity3, transition: xTransition }}
                animate={
                  animateStart ? 
                    {
                      y: 0
                    }: 
                    {
                      y: 170
                    }
                }
                transition={{
                  duration: 0.6,
                  ease: 'easeInOut'
                }}
              >
                <ItemBox
                  className={cn(
                    isZh ? ' flex flex-col justify-between ' : '',
                  )}
                >
                  <div className={cn(
                    isZh ? 'w-full' : 'w-[120px]',
                  )}>
                    <TitlePrimary
                    >{t('newHome.t9')}</TitlePrimary>
                  </div>
                  <ItemContent isZh={isZh}>
                    {t('newHome.t10')}
                  </ItemContent>
                </ItemBox>
              </motion.div>

              <motion.div 
                style={{ x: animate4.x, zIndex: 7, opacity: doneMap.logo ? 0 : logoOpacity3, transition: xTransition }}
                animate={
                  animateStart ? 
                    {
                      y: 0
                    }: 
                    {
                      y: 120
                    }
                }
                transition={{
                  duration: 0.6,
                  ease: 'easeInOut'
                }}
              >
                <ItemBox
                  className={cn(
                    isZh ? ' flex flex-col justify-between ' : '',
                  )}
                >
                  <div>
                    <TitlePrimary>
                      {t('newHome.t11')} {!isZh ? <br /> : null}{t('newHome.t12')}
                    </TitlePrimary>
                  </div>
                  <ItemContent isZh={isZh}>
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
            <div className="flex justify-center flex-col items-center px-4 md:px-[100px]">
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
                  <ItemContent
                  >
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
      <Section2Lg/>
      <Section2H5 />
    </>
  )
}

export default Section2;
