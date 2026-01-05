import { useMotionValue, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const throttleGap = 16; // 约等于 60FPS

export function useMotionScroll(to: number, sectionRef: React.RefObject<HTMLElement | null>, isH5?: boolean) {
  const { scrollY: scrollYBody, scrollYProgress  } = useScroll({target: sectionRef});
  const bodyRef = useRef<HTMLElement | null>(null);
  const originalStyle = useRef<{ overflow: string; paddingRight: string, scrollBarWidth: number }>({ overflow: "", paddingRight: "", scrollBarWidth: 0 });
  const rectY = useRef(0);  

  const scrollYLast = useRef(0);
  const scrollY = useMotionValue(0);
  const animateStart = useRef(false);
  const animated = useRef(false);
  const lastScrollY = useRef(0);
  const scrollThreshold = 50;

  const isOutOfViewport = useRef(false)
  const direction = useRef('')

  scrollYBody.on("change", (v) => {
    const scrollDirection = v > lastScrollY.current ? 'down' : 'up';
    const scrollDelta = Math.abs(v - lastScrollY.current);
    lastScrollY.current = v;
    if (v > rectY.current && !isH5 && !animateStart.current) {
      if (!animated.current && bodyRef.current) {
        bodyRef.current.style.overflow = "hidden";
        if (originalStyle.current.scrollBarWidth > 0) {
          bodyRef.current.style.paddingRight = `${originalStyle.current.scrollBarWidth}px`;
        }
        animateStart.current = true; // 标记动画开始
      }
    }
    if (animateStart.current && v < rectY.current) {
      if ( bodyRef.current) {
        bodyRef.current.style.overflow = "hidden";
        if (originalStyle.current.scrollBarWidth > 0) {
          bodyRef.current.style.paddingRight = `${originalStyle.current.scrollBarWidth}px`;
        }
      }

    }
    return
    // if (scrollDelta < scrollThreshold) return;
    // if (scrollDirection === 'down') {
    //   if (v > rectY.current) {
    //     if (!animated.current && bodyRef.current) {
    //       bodyRef.current.style.overflow = "hidden";
    //       if (originalStyle.current.scrollBarWidth > 0) {
    //         bodyRef.current.style.paddingRight = `${originalStyle.current.scrollBarWidth}px`;
    //       }
    //       animateStart.current = true; // 标记动画开始
    //     }
    //   }
    // }
    // if (scrollDirection === 'up' && v > rectY.current) {
    //   if (sectionRef.current) {
    //     sectionRef.current.style.position = 'sticky';
    //   }
    // }
    
  });
  scrollY.on("change", (v) => {
    const now = Date.now();
    if (now - scrollYLast.current < throttleGap) return; 
    scrollYLast.current = now;

    if (v <= 0 && animateStart.current) {
      animateStart.current = false;
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
      // animated.current = true;
      
    }
  });


  useEffect(() => {
    const checkElementPosition = () => {
      if (!sectionRef.current) return;
      
      const rect = sectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      const isOutTop = rect.bottom < 0;
      const isOutBottom = rect.top > windowHeight;
      
      const isOut = isOutTop || isOutBottom;
      const newDirection = isOutTop ? 'top' : isOutBottom ? 'bottom' : '';
      
      isOutOfViewport.current = isOut
      direction.current = newDirection
      
    };

    // 初始检查
    checkElementPosition();
    
    // 监听滚动事件
    window.addEventListener('scroll', checkElementPosition);
    window.addEventListener('resize', checkElementPosition);
    
    return () => {
      window.removeEventListener('scroll', checkElementPosition);
      window.removeEventListener('resize', checkElementPosition);
    };
  }, [sectionRef]);

  useEffect(() => {
    bodyRef.current = document.body
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
    originalStyle.current = {
      overflow: bodyRef.current.style.overflow,
      paddingRight: bodyRef.current.style.paddingRight,
      scrollBarWidth
    };
    if (sectionRef.current) {
      // @ts-ignore
      const rect = sectionRef.current.getBoundingClientRect();
      rectY.current = rect.y - 88;
    }
    

    let last = 0; // 节流：记录上一次触发时间
    const onWheel = (e: WheelEvent) => {
      if (!sectionRef?.current || !bodyRef.current) return;
      
      const now = Date.now();
      if (now - last < throttleGap) return;
      last = now;
      if (animateStart.current && !animated.current) {
        // scrollY.set(scrollY.get() + (e.deltaY > 0 ? 1 : - 1)); // 可以调大或调小速度
        const delta = e.deltaY; // delta 可以为正负
        // 调参项（可调）：
        const scale = 60;      // delta / scale -> tanh 输入，scale 越小，响应越敏感（快速到达饱和）
        const maxStep = 2;   // movement 的最大绝对值（避免瞬间跳太大）
        const sensitivity = 2; // 全局灵敏度额外系数（0.5 ~ 2 可选）

        // tanh 映射：随 delta 增大而平滑增长，最终饱和到 ±maxStep
        let movement = Math.tanh(delta / scale) * maxStep * sensitivity;

        // 保留三位小数
        movement = Number(movement.toFixed(3));

        scrollY.set(scrollY.get() + movement);
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

  return { 
    scrollY,
    scrollYProgress,
    animated: animated.current,
  };
}
