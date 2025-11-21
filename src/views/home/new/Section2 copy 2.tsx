import { memo, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { TitlePrimary } from "@/components/title-primary";

const from = 0.5
const to = 0.6

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

  // 动画完成状态，初始都为 false
  const [doneMap, setDoneMap] = useState({
    A: false,
    B: false,
    C: false,
    D: false,
    logo: false,
  });

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // 计算动画值
  const xA = useTransform(scrollYProgress, [from, to], [0, 432]);
  const xB = useTransform(scrollYProgress, [from, to], [0, 144]);
  const xC = useTransform(scrollYProgress, [from, to], [0, -144]);
  const xD = useTransform(scrollYProgress, [from, to], [0, -432]);

  const logoOpacity = useTransform(scrollYProgress, [0.55, 0.6], [0, 1]);
  const blur = useTransform(scrollYProgress, [0.55, 0.6], ["blur(20px)", "blur(0px)"]);

  // 监听 scrollYProgress 达到阈值，标记完成状态
  scrollYProgress.on("change", (v) => {
    if (v >= 1) {
      setDoneMap({
        A: true,
        B: true,
        C: true,
        D: true,
        logo: true,
      });
    }
  });

  return (
      <div
        ref={sectionRef} 
        className="h-[810px] px-[170px] text-white flex items-center justify-center"
      >
        <div className="">
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
                className="px-5 py-[38px] bg-cover bg-no-repeat w-[234px] h-[347px]"
                style={{ backgroundImage: `url('/images/home/new/sec21.png')` }}
              >
                <div className="w-[120px]">
                  <TitlePrimary>Regulated by Mauritius FSC</TitlePrimary>
                </div>
                <ItemContent>
                  Licensed and supervised under the Mauritius Investment Dealer
                  framework, ensuring full compliance, credibility, and investor protection.
                </ItemContent>
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