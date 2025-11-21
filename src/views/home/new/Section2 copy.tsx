import { memo, useEffect, useRef, useState } from "react";
import { easeIn, easeOut, motion, useMotionValue, useScroll, useTransform } from "framer-motion";
import { TitlePrimary } from "@/components/title-primary";

// const from = 0.4
// const to = 0.6

const from = 0
const to = 120
const throttleGap = 16; // 约等于 60FPS

const ItemContent = memo(
  ({ children }: { children: React.ReactNode }) => {
    return (
      <div className="font-light text-[16px] leading-[150%] mt-[30px]">
        {children}
      </div>
    );
  }
);

const Section2 = memo(() => {
  const sectionRef = useRef(null);
  const bodyRef = useRef<HTMLElement | null>(null);
  const originalStyle = useRef<{ overflow: string; paddingRight: string }>({ overflow: "", paddingRight: "" });

  const scrollYLast = useRef(0);


  const scrollY = useMotionValue(0);
  const animated = useRef(false);
  // 动画完成状态，初始都为 false
  const [doneMap, setDoneMap] = useState({
    A: false,
    B: false,
    C: false,
    D: false,
    logo: false,
  });

  // 计算动画值
  const xA = useTransform(scrollY, [from, to], [0, 432],);
  const xB = useTransform(scrollY, [from, to], [0, 144],);
  const xC = useTransform(scrollY, [from, to], [0, -144],);
  const xD = useTransform(scrollY, [from, to], [0, -432],);

  const logoOpacity = useTransform(scrollY, [to - 10, to], [0, 1]);
  const blur = useTransform(scrollY, [to - 10, to], ["blur(20px)", "blur(0px)"]);
  
  scrollY.on("change", (v) => {
    const now = Date.now();
    if (now - scrollYLast.current < throttleGap) return; 
    scrollYLast.current = now;

    if (v <= 0 && animated.current) {
      animated.current = false;
      if (bodyRef.current) {
        bodyRef.current.style.overflow = originalStyle.current.overflow;
        bodyRef.current.style.paddingRight = originalStyle.current.paddingRight;
      }
    }
    if (v >= to + 2) {
      if (bodyRef.current) {
        bodyRef.current.style.overflow = originalStyle.current.overflow;
        bodyRef.current.style.paddingRight = originalStyle.current.paddingRight;
      }
      animated.current = true;
      setDoneMap({
        A: true,
        B: true,
        C: true,
        D: true,
        logo: true,
      });
    }
  });
  useEffect(() => {
    bodyRef.current = document.body
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
    originalStyle.current = {
      overflow: bodyRef.current.style.overflow,
      paddingRight: bodyRef.current.style.paddingRight,
    };

    let last = 0; // 节流：记录上一次触发时间
    const onWheel = (e: WheelEvent) => {
      if (!sectionRef.current || !bodyRef.current) return;

      const now = Date.now();
      if (now - last < throttleGap) return;
      last = now;
      // @ts-ignore
      const rect = sectionRef.current.getBoundingClientRect();

      // section 顶部到达屏幕顶部（你要的触发条件）
      if (rect.top <= 85) {
        if (!animated.current) {
          bodyRef.current.style.overflow = "hidden";
          if (scrollBarWidth > 0) {
            bodyRef.current.style.paddingRight = `${scrollBarWidth}px`;
          }
          animated.current = true; // 标记动画开始
          // // 阻止默认滚动（很关键）
          e.preventDefault();
          e.stopPropagation();
        }

        // ⭐ 推进动画 — 每次滚动推进一点 scrollY
        scrollY.set(scrollY.get() + (e.deltaY > 0 ? 1 : - 1)); // 可以调大或调小速度
      }
    };

    window.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      window.removeEventListener("wheel", onWheel);
      if (bodyRef.current) {
        bodyRef.current.style.overflow = originalStyle.current.overflow;
        bodyRef.current.style.paddingRight = originalStyle.current.paddingRight;
      }
      
    }
  }, []);


  return (
    <div
      ref={sectionRef}
      className="h-[810px] px-[170px] text-white flex items-center justify-center"
    >
      <div>
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
          <motion.div style={{ x: doneMap.A ? 432 : xA, zIndex: 10 }}>
            <div
              className="px-5 py-[38px] bg-cover bg-no-repeat w-[234px] h-[347px] relative"
              style={{ backgroundImage: `url('/images/home/new/sec21.png')` }}
            >
              {/* <div className=" absolute w-full h-full left-0 top-0">
                <img
                  src="/images/home/new/bg-fill.png"
                  className="w-full h-full absolute left-0 top-0 backdrop-blur-[50px]"
                  alt=""
                />
                <img
                  src="/images/home/new/bg-border.png"
                  className="w-full h-full absolute left-0 top-0"
                  alt=""
                />
              </div> */}
              <div className=" relative z-10">
                <div className="w-[120px]">
                  <TitlePrimary>Regulated by Mauritius FSC</TitlePrimary>
                </div>
                <ItemContent>
                  Licensed and supervised under the Mauritius Investment Dealer
                  framework, ensuring full compliance, credibility, and investor protection.
                </ItemContent>
              </div>
              
            </div>
          </motion.div>

          <motion.div style={{ x: doneMap.B ? 144 : xB, zIndex: 9 }}>
            <div
              className="px-5 py-[38px] bg-cover bg-no-repeat w-[234px] h-[347px]"
              style={{ backgroundImage: `url('/images/home/new/sec22.png')` }}
            >
              <div className="w-[178px]">
                <TitlePrimary>Comprehensive AML/CFT Standards</TitlePrimary>
              </div>
              <ItemContent>
                Operations follow strict anti–money laundering and counter–terrorism financing protocols aligned with global FSC requirements.
              </ItemContent>
            </div>
          </motion.div>

          <motion.div style={{ x: doneMap.C ? -144 : xC, zIndex: 8 }}>
            <div
              className="px-5 py-[38px] bg-cover bg-no-repeat w-[234px] h-[347px]"
              style={{ backgroundImage: `url('/images/home/new/sec23.png')` }}
            >
              <div className="w-[120px]">
                <TitlePrimary>KYC & KYT Integration</TitlePrimary>
              </div>
              <ItemContent>
                Partnering with trusted compliance providers to implement real-time KYT and robust identity verification — ensuring transparent and traceable transactions
              </ItemContent>
            </div>
          </motion.div>

          <motion.div style={{ x: doneMap.D ? -432 : xD, zIndex: 7 }}>
            <div
              className="px-5 py-[38px] bg-cover bg-no-repeat w-[234px] h-[347px]"
              style={{ backgroundImage: `url('/images/home/new/sec24.png')` }}
            >
              <div>
                <TitlePrimary>
                  {'Audit & '} <br /> {'Transparency'}
                </TitlePrimary>
              </div>
              <ItemContent>
                Regulated by Mauritius FSC with ongoing audits and compliance reviews. Audited by SlowMist for proven security.
              </ItemContent>
            </div>
          </motion.div>

          {/* Logo 层 */}
          <motion.div
            style={{
              zIndex: 11,
              opacity: doneMap.logo ? 1 : logoOpacity,
              left: '50%',
              top: '50%',
              position: 'absolute',
              transform: 'translate(-50%, -50%)',
            }}
          >
            <motion.div
              className="px-5 py-[38px] w-[234px] h-[347px] bg-cover bg-no-repeat flex items-center justify-center"
              style={{
                backgroundImage: `url('/images/home/new/sec25.png')`,
                filter: doneMap.logo ? 'blur(0px)' : blur,
                WebkitFilter: doneMap.logo ? 'blur(0px)' : blur,
              }}
            >
              <img
                src="/images/home/new/logo.png"
                className="w-[206px] h-[32px]"
                alt=""
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
});

export default Section2;
