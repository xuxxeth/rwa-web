import { motion, useAnimation, useMotionValue } from "framer-motion"
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { TokenBox, type SectionProps } from "./Section4_3"
import type { IRwa } from "@/service/base/types"

const duration = 30

const box1: React.CSSProperties = {
  cursor: 'pointer',
  width: 60,
  height: 60,
  position: "absolute",
  top: 0,
  left: 0,
  offsetPath: `path("M429.217 0.809528C439.611 -0.498905 450.099 2.37538 458.374 8.79986L652.301 159.361C660.575 165.785 665.96 175.234 667.268 185.628L697.932 429.217C699.24 439.611 696.366 450.099 689.942 458.374L539.381 652.301C532.956 660.575 523.507 665.96 513.113 667.268L269.524 697.932C259.13 699.24 248.641 696.366 240.366 689.942L46.4401 539.381C38.1652 532.956 32.7818 523.507 31.4734 513.113L0.809735 269.524C-0.498699 259.13 2.37558 248.641 8.80006 240.366L159.361 46.4401C165.785 38.1654 175.234 32.7817 185.628 31.4732L429.217 0.809528Z")`,
}

const Section4_1 = memo(
  ({
    scale = 1,
    rwaList = [],
    onClick
  }: SectionProps) => {
    const [showTip, setShowTip] = useState(false)
    const [showTip2, setShowTip2] = useState(false)
    const [showTip3, setShowTip3] = useState(false)
    const [showTip4, setShowTip4] = useState(false)
    const [rectPos, setRectPos] = useState<any>({})
    const rwa1 = useMemo(() => rwaList && rwaList[0], [rwaList])
    const rwa2 = useMemo(() => rwaList && rwaList[1], [rwaList])
    const rwa3 = useMemo(() => rwaList && rwaList[2], [rwaList])
    const rwa4 = useMemo(() => rwaList && rwaList[3], [rwaList])

    const controls1_1 = useAnimation();
    const offsetDistance1 = useMotionValue("0%");
    const runAnimation1_1 = async () => {
      await controls1_1.start({
        offsetDistance: "100%"
      }, {
        duration: duration * ( 1 - Number(offsetDistance1.get().replace('%', '')) / 100),
        ease: "linear",
      });
      
      await controls1_1.set({ offsetDistance: "0%" });
      runAnimation1_1();
    };

    const controls1_2 = useAnimation();
    const offsetDistance2 = useMotionValue("20%");
    const runAnimation1_2 = async () => {
      await controls1_2.start({
        offsetDistance: "100%"
      }, {
        duration: duration * ( 1 - Number(offsetDistance2.get().replace('%', '')) / 100),
        ease: "linear",
      });
      
      await controls1_2.set({ offsetDistance: "0%" });
      runAnimation1_2();
    };

    const controls1_3 = useAnimation();
    const offsetDistance3 = useMotionValue("45%");
    const runAnimation1_3 = async () => {
      await controls1_3.start({
        offsetDistance: "100%"
      }, {
        duration: duration * ( 1 - Number(offsetDistance3.get().replace('%', '')) / 100),
        ease: "linear",
      });
      
      await controls1_3.set({ offsetDistance: "0%" });
      runAnimation1_3();
    };

    const controls1_4 = useAnimation();
    const offsetDistance4 = useMotionValue("75%");
    const runAnimation1_4 = async () => {
      await controls1_4.start({
        offsetDistance: "100%"
      }, {
        duration: duration * ( 1 - Number(offsetDistance4.get().replace('%', '')) / 100),
        ease: "linear",
      });
      
      await controls1_4.set({ offsetDistance: "0%" });
      runAnimation1_4();
    };

    const runAnimation = () => {
      runAnimation1_1();
      runAnimation1_2();
      runAnimation1_3();
      runAnimation1_4();
    }
    const stopAnimation = () => {
      controls1_1.stop();
      controls1_2.stop();
      controls1_3.stop();
      controls1_4.stop();
    }

    useEffect(() => {
      runAnimation();

    }, [])
    // 点击任意空白处（非 token 元素）重新启动动画
    useEffect(() => {
      const handler = (e: PointerEvent) => {
        // const target = e.target as HTMLElement | null;
        // if (!target) return;
        // // 如果点在 token 元素上，则不触发重启
        // if (target.closest('[data-token-id]')) return;

        // 关闭提示并恢复可点击状态，然后重新开启动画
        setShowTip(false);
        setShowTip2(false);
        setShowTip3(false);
        setShowTip4(false);
        setCanGo(true);

        runAnimation()
      };

      document.addEventListener('pointerdown', handler);
      return () => document.removeEventListener('pointerdown', handler);
    }, []);


    const mouseOver = useRef(false)
    const [canGo, setCanGo] = useState(true)

    const onTokenClick = useCallback((rwa: IRwa) => {
      if (!canGo) {
        return
      }
      onClick && onClick(rwa)
      setCanGo(false)
    }, [canGo]) 

    const handleStopAnimation = (e: MouseEvent, index: number, action?: string) => {
      if (e.type === 'pointerenter') {
        mouseOver.current = true
      }
      if (e.type === 'mousedown' && mouseOver.current) {
        return
      }
      if (e.type === 'mousedown' ) {
        setCanGo(false)
        setShowTip(false)
        setShowTip2(false)
        setShowTip3(false)
        setShowTip4(false)
      }
      // @ts-ignore
      const rect = e.target.getBoundingClientRect()
      setRectPos(rect)
      stopAnimation()
      if (index === 4) {
        setShowTip4(true)
      }
      if (index === 3) {
        setShowTip3(true)
      }
      if (index === 2) {
        setShowTip2(true)
      }
      if (index === 1) {
        setShowTip(true)
      }
    }
    const handleRunAnimation = (index: number) => {
      runAnimation()
      if (index === 4) {
        setShowTip4(false)
      }
      if (index === 3) {
        setShowTip3(false)
      }
      if (index === 2) {
        setShowTip2(false)
      }
      if (index === 1) {
        setShowTip(false)
      }
    }


    return (
      <div className="w-[699px] h-[699px] absolute left-[calc(50%-349.5px)] top-[calc(50%-349.5px)]"
        style={{
          scale: scale
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="699" height="699" viewBox="0 0 699 699" fill="none">
          <path d="M429.217 0.809528C439.611 -0.498905 450.099 2.37538 458.374 8.79986L652.301 159.361C660.575 165.785 665.96 175.234 667.268 185.628L697.932 429.217C699.24 439.611 696.366 450.099 689.942 458.374L539.381 652.301C532.956 660.575 523.507 665.96 513.113 667.268L269.524 697.932C259.13 699.24 248.641 696.366 240.366 689.942L46.4401 539.381C38.1652 532.956 32.7818 523.507 31.4734 513.113L0.809735 269.524C-0.498699 259.13 2.37558 248.641 8.80006 240.366L159.361 46.4401C165.785 38.1654 175.234 32.7817 185.628 31.4732L429.217 0.809528Z" stroke="url(#paint0_linear_3090_8016)"/>
          <defs>
          <linearGradient id="paint0_linear_3090_8016" x1="509.879" y1="691.748" x2="403.35" y2="-26.488" gradientUnits="userSpaceOnUse">
          <stop stopColor="white" stopOpacity="0.1"/>
          <stop offset="1" stopColor="white" stopOpacity="0.3"/>
          </linearGradient>
          </defs>
        </svg>
        <motion.div
          style={{
            ...box1,
            // opacity: opacity1_3,
            // scale: opacity1_3,
            offsetDistance: offsetDistance4,
          }}
          initial={{ offsetDistance: "75%" }}
          animate={ controls1_4 }
          transition={{
            duration: duration,
          }}
          onHoverStart={(e) => handleStopAnimation(e, 4)}
          onHoverEnd={() => handleRunAnimation(4)} 
          onMouseDown={(e) => handleStopAnimation(e as any, 4, 'down')}
        >
          {
            rwa4 && 
            <div data-token-id="4" onClick={() => onTokenClick(rwa4)}>
              <img src={rwa4.icon} className="w-[60px] h-[60px] rounded-full" alt="" />
            </div>
          }
        </motion.div>
        <motion.div
          style={{
            ...box1,
            // opacity: opacity1_2,
            // scale: opacity1_2,
            offsetDistance: offsetDistance3,
          }}
          initial={{ offsetDistance: "45%" }}
          animate={ controls1_3 }
          transition={{
            duration: duration,
          }}
          onHoverStart={(e) => handleStopAnimation(e, 3)}
          onHoverEnd={() => handleRunAnimation(3)} 
          onMouseDown={(e) => handleStopAnimation(e as any, 3, 'down')}
        >
          {
            rwa3 && 
            <div data-token-id="3" onClick={() => onTokenClick(rwa3)}>
              <img src={rwa3.icon} className="w-[60px] h-[60px] rounded-full" alt="" />
            </div>
          }
        </motion.div>
        <motion.div
          style={{
            ...box1,
            // opacity: opacity1_1,
            // scale: opacity1_1,
            offsetDistance: offsetDistance2,
          }}
          initial={{ offsetDistance: "20%" }}
          animate={ controls1_2 }
          transition={{
            duration: duration,
          }}
          onHoverStart={(e) => handleStopAnimation(e, 2)}
          onHoverEnd={() => handleRunAnimation(2)} 
          onMouseDown={(e) => handleStopAnimation(e as any, 2, 'down')}
        >
          {
            rwa2 && 
            <div data-token-id="2" onClick={() => onTokenClick(rwa2)}>
              <img src={rwa2.icon} className="w-[60px] h-[60px] rounded-full" alt="" />
            </div>
          }
        </motion.div>
        <motion.div
          style={{
            ...box1,
            offsetDistance: offsetDistance1,
          }}
          initial={{ offsetDistance: "0%" }}
          animate={ controls1_1 }
          transition={{
            duration: duration,
          }}
          onHoverStart={(e) => handleStopAnimation(e, 1)}
          onHoverEnd={() => handleRunAnimation(1)} 
          onMouseDown={(e) => handleStopAnimation(e as any, 1, 'down')}
        >
          {
            rwa1 && 
            <div data-token-id="1" onClick={() => onTokenClick(rwa1)}>
              <img src={rwa1.icon} className="w-[60px] h-[60px] rounded-full" alt="" />
            </div>
          }
        </motion.div>
        {
          showTip && <TokenBox rwa={rwa1}
            canGo={!canGo}
            onClick={() => {
              onClick && onClick(rwa1)
            }}
            style={{ left: rectPos.x, top: rectPos.y - 70 }}
          />
        }
        {
          showTip2 && <TokenBox rwa={rwa2} 
            canGo={!canGo}
            onClick={() => {
              onClick && onClick(rwa2)
            }}
            style={{ left: rectPos.x, top: rectPos.y - 70 }}
          />
        }
        {
          showTip3 && <TokenBox rwa={rwa3} 
            canGo={!canGo}
            onClick={() => {
              onClick && onClick(rwa3)
            }}
            style={{ left: rectPos.x, top: rectPos.y - 70 }}
          />
        }
        {
          showTip4 && <TokenBox rwa={rwa4} 
            canGo={!canGo}
            onClick={() => {
              onClick && onClick(rwa4)
            }}
            style={{ left: rectPos.x, top: rectPos.y - 70 }}
          />
        }
      </div>
    )
})



export default Section4_1
