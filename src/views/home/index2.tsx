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
  const sectionsScrollY = useRef<number[]>([0, 200, 100, 0, 0, 0])

  const scrollY2 = useMotionValue(0);
  const scrollY3 = useMotionValue(0);
  const [locked2, setLocked2] = useState(false)
  const [locked3, setLocked3] = useState(false)

  useEffect(() => {
    const sections = sectionsRef.current;
    let currentIndex = 0;
    
    let locked = false; // 是否锁住滚动
    let wheelDelta = 0; // 滚动累计距离阈值
    const threshold = 120; // 鼠标滚轮触发阈值（可调）

    // 1. 禁用原生滚动
    const preventScroll = (e: { preventDefault: () => any; }) => e.preventDefault();
    document.body.style.overflow = "hidden"; // 彻底禁止浏览器滚动
    window.addEventListener("wheel", preventScroll, { passive: false });

    // 2. 监听 mousewheel 来判断手势方向
    const onWheel = (e: { deltaY: number; }) => {
      if (locked) return; // 动画期间禁止再次触发

      wheelDelta += e.deltaY;
      if (currentIndex === 1) {
        scrollY2.set(wheelDelta)
      }
      if (currentIndex === 2) {
        scrollY3.set(wheelDelta)
      }
      // console.log(sectionsScrollY.current[currentIndex])
      // 👇 向下滚（下一屏）
      if (wheelDelta > sectionsScrollY.current[currentIndex] + threshold) {
        goToSection(currentIndex + 1);
        wheelDelta = 0;
        if (currentIndex === 1) {
          scrollY2.set(wheelDelta)
        }
        if (currentIndex === 2) {
          scrollY3.set(wheelDelta)
      }
      }

      // 👇 向上滚（上一屏）
      if (wheelDelta < -1 - sectionsScrollY.current[currentIndex]) {
        goToSection(currentIndex - 1);
        wheelDelta = 0;
      }
    };

    window.addEventListener("wheel", onWheel, { passive: false });

    // 3. 切屏函数
    const goToSection = (index: number) => {
      if (index < 0 || index >= sections.length) return;
      if (index === 2) {
        setLocked2(true)
      }
      if (index === 3) {
        setLocked3(true)
      }
      locked = true; // 锁动画
      gsap.to(window, {
        duration: 1,
        scrollTo: {
          y: sections[index].offsetTop - 88,
          autoKill: false,
        },
        ease: "power3.out",
        onComplete: () => {
          currentIndex = index;
          locked = false; // 允许下一次滚动
          // storage.setItem('HOME_INDEX', String(currentIndex))
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
        <Section2 scrollY={scrollY2} locked={locked2} />
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
      </div>
      <div
        ref={(el: any) => (el && (sectionsRef.current[4] = el))}
      >
        <Section5 />
      </div>
      <div
        ref={(el: any) => (el && (sectionsRef.current[5] = el))}
      >
        <Section6 />
      </div>
      <XFooter from="home" />
    </div>
    
  );
}
