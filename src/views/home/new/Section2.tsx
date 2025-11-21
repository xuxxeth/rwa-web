import { memo, useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { TitlePrimary } from "@/components/title-primary";
import { useMotionScroll } from "@/hooks/useMotionScroll";
import { LazyImage } from "@/components/image/LazyImage";
import { cn } from "@/utils/tw";

// const from = 0.4
// const to = 0.6

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

const Section2 = memo(() => {
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
  const xA = useTransform(scrollY, [from, to], [0, 432],);
  const xB = useTransform(scrollY, [from, to], [0, 144],);
  const xC = useTransform(scrollY, [from, to], [0, -144],);
  const xD = useTransform(scrollY, [from, to], [0, -432],);
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
      className="h-[810px] px-[170px] text-white sticky top-[88px]"
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
              Built on Regulation. Driven by Transparency.
            </TitlePrimary>
            <div className="font-normal text-[20px] leading-[150%] mb-[68px] w-[763px] text-center">
              Licensed under the Mauritius FSC Investment Dealer framework,
              we operate with full AML/CFT, KYC, and KYT compliance — ensuring a
              globally trusted, transparent, and fully compliant trading environment.
            </div>
          </div>

          {/* 动画卡片区域 */}
          <div className="flex items-center justify-center gap-x-[54px] relative">
            <motion.div style={{ x: doneMap.A ? 432 : xA, zIndex: 10, transition: 'all 0.1s linear' }}>
              <ItemBox>
                  <motion.div
                    style={{
                      opacity: doneMap.logo ? 0 : logoOpacity2,
                      transition: 'all 0.1s linear'
                    }}
                  >
                    <div className=" relative z-10">
                      <div className="w-[120px]">
                        <TitlePrimary>Regulated by Mauritius FSC</TitlePrimary>
                      </div>
                      <ItemContent>
                        Licensed and supervised under the Mauritius Investment Dealer
                        framework, ensuring full compliance, credibility, and investor protection.
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

            <motion.div style={{ x: doneMap.B ? 144 : xB, zIndex: 9, opacity: doneMap.logo ? 0 : logoOpacity3, transition: 'all 0.1s linear' }}>
              <ItemBox
              >
                <div className="w-[170px]">
                  <TitlePrimary>Comprehensive AML/CFT Standards</TitlePrimary>
                </div>
                <ItemContent>
                  Operations follow strict anti–money laundering and counter–terrorism financing protocols aligned with global FSC requirements.
                </ItemContent>
              </ItemBox>
            </motion.div>

            <motion.div style={{ x: doneMap.C ? -144 : xC, zIndex: 8, opacity: doneMap.logo ? 0 : logoOpacity3, transition: 'all 0.1s linear' }}>
              <ItemBox
              >
                <div className="w-[120px]">
                  <TitlePrimary>KYC & KYT Integration</TitlePrimary>
                </div>
                <ItemContent>
                  Partnering with trusted compliance providers to implement real-time KYT and robust identity verification — ensuring transparent and traceable transactions
                </ItemContent>
              </ItemBox>
            </motion.div>

            <motion.div style={{ x: doneMap.D ? -432 : xD, zIndex: 7, opacity: doneMap.logo ? 0 : logoOpacity3, transition: 'all 0.1s linear' }}>
              <ItemBox
              >
                <div>
                  <TitlePrimary>
                    {'Audit & '} <br /> {'Transparency'}
                  </TitlePrimary>
                </div>
                <ItemContent>
                  <div className="">
                    Regulated by Mauritius FSC with ongoing audits and compliance reviews. Audited by 
                    <span className=" cursor-pointer text-[#6AFCDF]"> SlowMist 
                    <img src="/images/home/new/link.png" className="w-[12px] h-[12px] inline-block relative top-[-2px] mx-1" />

                    </span>
                     for proven security.
                  </div>
                  
                </ItemContent>
                
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
