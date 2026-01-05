import { motion, useAnimation, useMotionValue, } from "framer-motion"
import { memo, use, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { TokenBox, type SectionProps } from "./Section4_3"
import type { IRwa } from "@/service/base/types"

const duration2 = 40

const box2: React.CSSProperties = {
  cursor: 'pointer',
  width: 60,
  height: 60,
  position: "absolute",
  top: 0,
  left: 0,
  offsetPath: `path("M317.065 0.979928L139.611 28.8847C129.263 30.5121 119.984 36.1838 113.817 44.6522L8.07001 189.863C1.90298 198.331 -0.647478 208.903 0.979898 219.252L28.8847 396.706C30.5121 407.055 36.1838 416.334 44.6521 422.501L189.863 528.248C198.331 534.415 208.903 536.965 219.252 535.338L396.706 507.433C407.055 505.806 416.334 500.134 422.501 491.666L528.248 346.455C534.415 337.986 536.965 327.414 535.338 317.066L507.433 139.611C505.806 129.263 500.134 119.984 491.666 113.817L346.455 8.07004C337.986 1.90301 327.414 -0.647448 317.065 0.979928Z")`,
}

const Section4_2 = memo(
  ({
    scale = 1,
    rwaList = [],
    onClick
  }: SectionProps) => {
    const [showTip, setShowTip] = useState(false)
    const [showTip2, setShowTip2] = useState(false)
    const [rectPos, setRectPos] = useState<any>({})

    const controls2_1 = useAnimation();
    const offsetDistance1 = useMotionValue("0%");
    const runAnimation2_1 = async () => {
      await controls2_1.start({
        offsetDistance: "100%"
      }, {
        duration: duration2 * ( 1 - Number(offsetDistance1.get().replace('%', '')) / 100),
        ease: "linear",
      });
      
      await controls2_1.set({ offsetDistance: "0%" });
      runAnimation2_1();
    };

    const controls2_2 = useAnimation();
    const offsetDistance2 = useMotionValue("25%");
    const runAnimation2_2 = async () => {
      await controls2_2.start({
        offsetDistance: "100%"
      }, {
        duration: duration2 * ( 1 - Number(offsetDistance2.get().replace('%', '')) / 100),
        ease: "linear",
        // delay: run ? 0 : duration2 / 8 * 2,
      });
      await controls2_2.set({ offsetDistance: "0%" });
      runAnimation2_2();
    };

    const controls2_3 = useAnimation();
    const offsetDistance3 = useMotionValue("40%");
    const runAnimation2_3 = async () => {
      await controls2_3.start({
        offsetDistance: "100%"
      }, {
        duration: duration2 * ( 1 - Number(offsetDistance3.get().replace('%', '')) / 100),
        ease: "linear",
        // delay: run ? 0 : duration2 / 8 * 4,
      });
      await controls2_3.set({ offsetDistance: "0%" });
      runAnimation2_3();
    };
    const controls2_4 = useAnimation();
    const offsetDistance4 = useMotionValue("75%");
    const runAnimation2_4 = async () => {
      await controls2_4.start({
        offsetDistance: "100%"
      }, {
        duration: duration2 * ( 1 - Number(offsetDistance4.get().replace('%', '')) / 100),
        ease: "linear",
        // delay: run ? 0 : duration2 / 8 * 4,
      });
      await controls2_4.set({ offsetDistance: "0%" });
      runAnimation2_4();
    };

    const rwa1 = useMemo(() => rwaList && rwaList[0], [rwaList])
    const rwa2 = useMemo(() => rwaList && rwaList[1], [rwaList])

    const runAnimation = () => {
      runAnimation2_1();
      runAnimation2_2();
      runAnimation2_3();
      runAnimation2_4();
    }
    const stopAnimation = () => {
      controls2_1.stop();
      controls2_2.stop();
      controls2_3.stop();
      controls2_4.stop();
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
      }
      // @ts-ignore
      const rect = e.target.getBoundingClientRect()
      console.log(rect)
      setRectPos(rect)
      stopAnimation()
      if (index === 2) {
        setShowTip2(true)
      }
      if (index === 1) {
        setShowTip(true)
      }
    }
    const handleRunAnimation = (index: number) => {
      runAnimation()
      if (index === 2) {
        setShowTip2(false)
      }
      if (index === 1) {
        setShowTip(false)
      }
    }

    return (
      <div className="w-[537px] h-[537px] absolute left-[calc(50%-268.5px)] top-[calc(50%-268.5px)]"
        style={{
          scale: scale
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="537" height="537" viewBox="0 0 537 537" fill="none">
          <path d="M317.065 0.979928C327.414 -0.647448 337.986 1.90301 346.455 8.07004L491.666 113.817C500.134 119.984 505.806 129.263 507.433 139.611L535.338 317.066C536.965 327.414 534.415 337.986 528.248 346.455L422.501 491.666C416.334 500.134 407.055 505.806 396.706 507.433L219.252 535.338C208.903 536.965 198.331 534.415 189.863 528.248L44.6521 422.501C36.1838 416.334 30.5121 407.055 28.8847 396.706L0.979898 219.252C-0.647478 208.903 1.90298 198.331 8.07001 189.863L113.817 44.6522C119.984 36.1838 129.263 30.5121 139.611 28.8847L317.065 0.979928Z" stroke="url(#paint0_linear_3090_8007)"/>
          <defs>
          <linearGradient id="paint0_linear_3090_8007" x1="398.7" y1="525.701" x2="116.709" y2="34.3974" gradientUnits="userSpaceOnUse">
          <stop stopColor="white" stopOpacity="0.1"/>
          <stop offset="1" stopColor="white" stopOpacity="0.3"/>
          </linearGradient>
          </defs>
        </svg>
        <motion.div
          style={{
            ...box2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            // opacity: opacity2_1,
            // scale: opacity2_1,
            offsetDistance: offsetDistance2,
          }}
          initial={{ offsetDistance: "25%" }}
          animate={ controls2_2 }
          transition={{
            duration: duration2,
          }}
          onHoverStart={(e) => {
            stopAnimation()
          }}
          onHoverEnd={async () => {
            runAnimation()
          }}
          onMouseDown={() => {
            stopAnimation()
          }}
        >
          <img src="/images/home/new/sec4_tip2.png" className="w-[20px] h-[20px] rounded-full" alt="" />
        </motion.div>
        <motion.div
          style={{
            ...box2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            offsetDistance: offsetDistance4,
            // opacity: opacity2_3,
            // scale: opacity2_3,
          }}
          initial={{ offsetDistance: "75%" }}
          animate={ controls2_4 }
          transition={{
            // ...transition,
            duration: duration2,
            // delay: duration2 / 8 * 6,
          }} 
          onHoverStart={(e) => {
            stopAnimation()

          }}
          onHoverEnd={async () => {
            runAnimation()
          }}
          onMouseDown={() => {
            stopAnimation()
          }}
        >
          <img src="/images/home/new/sec4_tip3.png" className="w-[38px] h-[38px] rounded-full" alt="" />
        </motion.div>
        <motion.div
          style={{
            ...box2,
            // opacity: opacity2_2,
            // scale: opacity2_2,
            offsetDistance: offsetDistance3,
          }}
          initial={{ offsetDistance: "40%" }}
          animate={ controls2_3}
          transition={{
            duration: duration2,
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
            ...box2,
            offsetDistance: offsetDistance1,
          }}
          initial={{ offsetDistance: "0%" }}
          animate={controls2_1}
          transition={{
            duration: duration2,
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
      </div>
    )
})



export default Section4_2
