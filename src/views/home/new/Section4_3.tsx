import { LazyImage } from "@/components/image/LazyImage"
import { useRwaPrice } from "@/hooks/useTokenBalances"
import type { IRwa } from "@/service/base/types"
import { cn } from "@/utils/tw"
import { motion, transform, useAnimation, useMotionValue, useTransform } from "framer-motion"
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react"
import ReactDOM from "react-dom"

export const TokenBox = memo(
  ({
    rwa,
    canGo,
    style,
    onClick
  }: { style?: any, rwa?: IRwa, canGo?: boolean, onClick?: () => void}) => {
    const rwaPrice = useRwaPrice(rwa?.symbol || '')
    const up = useMemo(() => Number(rwaPrice?.up), [rwaPrice?.up])
    const [isMounted, setIsMounted] = useState(false);
    
    useEffect(() => {
      setIsMounted(true);
    }, []);
    
    if (!isMounted) return null;

    return ReactDOM.createPortal(
      <div className=" border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.08)] rounded-[8px] h-[48px] md:h-[58px] px-[8px] flex items-center justify-between
        fixed left-[68px] top-0 text-white min-w-[140px] translate-x-[-45px] backdrop-blur-[60px] z-[59]"
        style={{
          ...style,
        }}
        onClick={e => {
          if (canGo && onClick) {
            e.stopPropagation()
            onClick()
          }
        }}
      >
        <div className=" flex flex-col justify-center min-w-[140px]">
          <div className=" font-normal flex items-center justify-between shrink-0">
            <div className="text-[14px] md:text-[16px]">{rwa?.symbol || '--'}</div>
            <div className="text-[14px] md:text-[16px]">${rwaPrice?.price || '--'}</div>
          </div>
          <div className=" font-normal flex items-center justify-between gap-x-2">
            <div className="text-[12px] md:text-[14px] text-[rgba(255,255,255,0.6)] mt-[2]">{rwa?.name || '--'}</div>
            <div className={cn(
              " text-[12px] h-[19px] rounded-[4px] min-w-[59px] px-[8px] flex items-center justify-center bg-[rgba(255,255,255,0.1)]",
              up === 0 ? 'text-[#A1A1A1]' : up > 0
                ? "text-[#2EBD85] "
                : "text-[rgba(227,80,122,1)]"
            )}>
              {up !== 0 && (up > 0 ? '+' : '-')}
              {Math.abs(Number(rwaPrice?.up || "0"))}%
            </div>
          </div>
        </div>
        
        { canGo &&
          <div className=" cursor-pointer">
            <LazyImage src="/images/home/new/to_trade.png" className="w-[28px] h-[28px] ml-2" />
          </div>
        }
      </div>,
      document.body
    )
  }
)

export type SectionProps = {
  scale?: number
  rwaList?: IRwa[],
  onClick?: (rwa: IRwa) => void
}

const duration3 = 20

const box3: React.CSSProperties = {
  cursor: 'pointer',
  width: 60,
  height: 60,
  position: "absolute",
  top: 0,
  left: 0,
  offsetPath: `path("M133.125 8.66307C141.436 2.28566 151.94 -0.529056 162.327 0.838343L288.067 17.3918C298.453 18.7592 307.871 24.1966 314.248 32.5075L391.453 133.125C397.831 141.436 400.646 151.94 399.278 162.327L382.725 288.067C381.357 298.453 375.92 307.871 367.609 314.248L266.992 391.453C258.681 397.831 248.176 400.646 237.79 399.278L112.05 382.725C101.664 381.357 92.2459 375.92 85.8686 367.609L8.66306 266.992C2.28565 258.681 -0.529067 248.176 0.838332 237.79L17.3917 112.05C18.7592 101.664 24.1966 92.2459 32.5075 85.8686L133.125 8.66307Z")`,
}


const Section4_3 = memo(
  ({
    scale = 1,
    rwaList = [],
    onClick
  }: SectionProps) => {
    const controls3_1 = useAnimation();
    const offsetDistance = useMotionValue("0%");
    const rotation = useMotionValue(0);
    const [showTip, setShowTip] = useState(false)
    const [rectPos, setRectPos] = useState<any>({})

    const rwa = useMemo(() => rwaList && rwaList[0], [rwaList])

    const runAnimation3_1 = async () => {
      await controls3_1.start({
        offsetDistance: "100%"
      }, {
        duration: duration3 * ( 1 - Number(offsetDistance.get().replace('%', '')) / 100),
        ease: "linear",
      });
      
      await controls3_1.set({ offsetDistance: "0%" });
      runAnimation3_1();
    };

    const controls3_2 = useAnimation();
    const offsetDistance2 = useMotionValue("40%");
    const runAnimation3_2 = async () => {
      await controls3_2.start({
        offsetDistance: "100%"
      }, {
        duration: duration3 * ( 1 - Number(offsetDistance2.get().replace('%', '')) / 100),
        ease: "linear",
        // delay: run ? 0 : duration3 / 8 * 3,
      });
      await controls3_2.set({ offsetDistance: "0%" });
      runAnimation3_2();
    };
    const runAnimation = () => {
      runAnimation3_1();
      runAnimation3_2();
    }
    const stopAnimation = () => {
      controls3_1.stop();
      controls3_2.stop();
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
      }
      // @ts-ignore
      const rect = e.target.getBoundingClientRect()
      console.log(rect)
      setRectPos(rect)
      stopAnimation()
      if (index === 1) {
        setShowTip(true)
      }
    }
    const handleRunAnimation = (index: number) => {
      runAnimation()
      if (index === 1) {
        setShowTip(false)
      }
    }

    return (
      <div className="w-[401px] h-[401px] relative left-[calc(50%-200.5px)] top-[calc(50%-200.5px)]"
        style={{
          scale: scale
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="401" height="401" viewBox="0 0 401 401" fill="none">
          <path d="M133.125 8.66307C141.436 2.28566 151.94 -0.529056 162.327 0.838343L288.067 17.3918C298.453 18.7592 307.871 24.1966 314.248 32.5075L391.453 133.125C397.831 141.436 400.646 151.94 399.278 162.327L382.725 288.067C381.357 298.453 375.92 307.871 367.609 314.248L266.992 391.453C258.681 397.831 248.176 400.646 237.79 399.278L112.05 382.725C101.664 381.357 92.2459 375.92 85.8686 367.609L8.66306 266.992C2.28565 258.681 -0.529067 248.176 0.838332 237.79L17.3917 112.05C18.7592 101.664 24.1966 92.2459 32.5075 85.8686L133.125 8.66307Z" stroke="url(#paint0_linear_3090_8024)"/>
          <defs>
          <linearGradient id="paint0_linear_3090_8024" x1="378.83" y1="323.189" x2="16.0292" y2="100.146" gradientUnits="userSpaceOnUse">
          <stop stopColor="white" stopOpacity="0.1"/>
          <stop offset="1" stopColor="white" stopOpacity="0.5"/>
          </linearGradient>
          </defs>
        </svg>
        <motion.div
          style={{
            ...box3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            // opacity: opacity3_1,
            // scale: opacity3_1,
            offsetDistance: offsetDistance2,
            rotate: rotation
          }}
          initial={{ offsetDistance: "40%" }}
          animate={ controls3_2 }
          transition={{
            duration: duration3,
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
          <img src="/images/home/new/sec4_tip1.png" className="w-[32px] h-[32px] rounded-full" alt="" />
        </motion.div>
        <motion.div
          style={{
            ...box3,
            offsetDistance: offsetDistance,
          }}
          initial={{ offsetDistance: "0%" }}
          animate={ controls3_1}
          transition={{
            duration: duration3
          }}
          onHoverStart={(e) => handleStopAnimation(e, 1)}
          onHoverEnd={() => handleRunAnimation(1)} 
          onMouseDown={(e) => handleStopAnimation(e as any, 1, 'down')} 
          
        >
          {
            rwa && 
            <div data-token-id="1" onClick={() => onTokenClick(rwa)}>
              <img src={rwa.icon} className="w-[60px] h-[60px] rounded-full" alt="" />
            </div>
          }
          
        </motion.div>
        {
          showTip && <TokenBox rwa={rwa} 
            canGo={!canGo}
            onClick={() => {
              onClick && onClick(rwa)
            }}
            style={{ left: rectPos.x, top: rectPos.y - 70 }}
          />
        }
      </div>
    )
})



export default Section4_3
