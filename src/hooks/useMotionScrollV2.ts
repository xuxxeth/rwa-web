import { useMotionValue, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const throttleGap = 16; // 约等于 60FPS

export function useMotionScrollV2(to: number, sectionRef: React.RefObject<HTMLElement | null>, innerRef: React.RefObject<HTMLElement | null>, isH5?: boolean) {
  const { scrollYProgress  } = useScroll({target: sectionRef});
  const rectY = useRef(0);  

  const [animateStart, setAnimateStart] = useState(false)

  const scrollY = useMotionValue(0);
  const animated = useRef(false);
  const lastScrollY = useRef(0);
  const scrollThreshold = 50;

  const isOutOfViewport = useRef(false)
  const direction = useRef('')


  useEffect(() => {
    if (!sectionRef.current || !innerRef.current) return
      // @ts-ignore
    const rect = sectionRef.current.getBoundingClientRect();
    rectY.current = rect.y;
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          setAnimateStart(true)
          window.scrollTo({
            top: rectY.current,
            behavior: 'smooth'
          })
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(innerRef.current)
    return () => observer.disconnect()
  }, [])

  return { 
    scrollY,
    scrollYProgress,
    animateStart,
    animated: animated.current,
  };
}
