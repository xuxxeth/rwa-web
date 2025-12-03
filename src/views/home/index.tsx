import { lazy, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import Section1 from "./new/Section1";
import { useMotionValue } from "framer-motion";
import { XFooter } from "@/components/footer";

const Section2 = lazy(() => import("./new2/Section2"));
const Section3 = lazy(() => import("./new2/Section3"));
const Section4 = lazy(() => import("./new/Section4"));
const Section5 = lazy(() => import("./new/Section5"));
const Section6 = lazy(() => import("./new/Section6"));

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

export default function Page() {
  const sectionsRef = useRef<any[]>([]);
  const sectionsScrollY = useRef<number[]>([0, 300, 100, 0, 0, 0, 0])

  const scrollY2 = useMotionValue(0);
  const scrollY3 = useMotionValue(0);
  const [locked2, setLocked2] = useState(false)
  const [locked3, setLocked3] = useState(false)
  const [animateStart2, setAnimateStart2] = useState(false)

  const stopWeel = useRef(false)

  useEffect(() => {
    const sections = sectionsRef.current;
    const maxIndex = sections.length - 1; // <-- 自动计算最后一页 index

    let currentIndex = 0;

    let locked = false;
    let wheelDelta = 0;
    const threshold = 120;
    
    const bodyRef = document.body
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
    const originalStyle = {
      overflow: bodyRef.style.overflow,
      paddingRight: bodyRef.style.paddingRight,
      scrollBarWidth
    };

    bodyRef.style.paddingRight = `${originalStyle.scrollBarWidth}px`;
    bodyRef.style.overflow = "hidden";
    const preventScroll = (e: any) => {
      if (!stopWeel.current) {
        e.preventDefault()
      }
    };
    window.addEventListener("wheel", preventScroll, { passive: false });

    const onWheel = (e: WheelEvent) => {
      if (locked || stopWeel.current) return;


      const delta = e.deltaY; // delta 可以为正负
      // 调参项（可调）：
      const scale = 60;      // delta / scale -> tanh 输入，scale 越小，响应越敏感（快速到达饱和）
      const maxStep = 2;   // movement 的最大绝对值（避免瞬间跳太大）
      const sensitivity = 2; // 全局灵敏度额外系数（0.5 ~ 2 可选）

      // tanh 映射：随 delta 增大而平滑增长，最终饱和到 ±maxStep
      let movement = Math.tanh(delta / scale) * maxStep * sensitivity;

      // 保留三位小数
      movement = Number(movement.toFixed(3));

      wheelDelta += movement;

      // 将内部动画同步给 Section2/3
      if (currentIndex === 1) scrollY2.set(scrollY2.get() + movement);
      if (currentIndex === 2) scrollY3.set(scrollY3.get() + movement);

      /** =============== 下一页 =============== **/
      if (e.deltaY > 0 && wheelDelta > sectionsScrollY.current[currentIndex] + threshold) {
        goToSection(currentIndex + 1);
        wheelDelta = 0;
        return;
      }

      /** =============== 上一页（最后一页也能往上） =============== **/
      if (e.deltaY < 0 && wheelDelta < -1 - sectionsScrollY.current[currentIndex]) {
        goToSection(currentIndex - 1);
        wheelDelta = 0;
        return;
      }
    };

    window.addEventListener("wheel", onWheel, { passive: false });

    /** =============== 切屏函数 =============== **/
    const goToSection = (index: number) => {
      if (index < 0) return;             // 第一页不能往上
      if (index > maxIndex) return;      // 最后一页不能往下

      if (index === 2) setLocked2(true);
      if (index === 3) setLocked3(true);

      if (index === 1) {
        setAnimateStart2(true)
      }

      locked = true;

      gsap.to(window, {
        duration: 1,
        scrollTo: {
          y: sections[index].offsetTop - 88,
          autoKill: false,
        },
        ease: "power3.out",
        onComplete: () => {
          currentIndex = index;
          locked = false;
          if (currentIndex === 3) {
            stopWeel.current = true
            bodyRef.style.overflow = originalStyle.overflow;
            bodyRef.style.paddingRight = '0px';
          }
        },
      });
    };

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("wheel", preventScroll);
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div className=" font-normal">
      <div
        ref={(el: any) => (el && (sectionsRef.current[0] = el))}
      >
        <Section1 />
      </div>
      <div
        ref={(el: any) => (el && (sectionsRef.current[1] = el))}
      >
        <Section2 scrollY={scrollY2} locked={locked2} animateStart={animateStart2} />
      </div>
      <div
        ref={(el: any) => (el && (sectionsRef.current[2] = el))}
      >
        <Section3 scrollY={scrollY3} locked={locked3} />
      </div>
      <div
        ref={(el: any) => (el && (sectionsRef.current[3] = el))}
      >
        <Section4 />
        <Section5 />
        <Section6 />
        <XFooter from="home" />
        
      </div>
      
    </div>
    
  );
}
