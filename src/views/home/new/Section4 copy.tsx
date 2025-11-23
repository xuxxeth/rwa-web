import { LazyImage } from "@/components/image/LazyImage"
import { motion, useAnimation, useMotionValue, useTransform, type Transition } from "framer-motion"
import { memo, useEffect, useRef } from "react"

const transition: Transition = {
    duration: 60,
    repeat: Infinity,
    delay: 0,
    ease: "linear",
}
const duration = 30
const duration2 = 40
const duration3 = 20

const box1: React.CSSProperties = {
    width: 60,
    height: 60,
    position: "absolute",
    top: 0,
    left: 0,
    offsetPath: `path("M429.217 0.809528C439.611 -0.498905 450.099 2.37538 458.374 8.79986L652.301 159.361C660.575 165.785 665.96 175.234 667.268 185.628L697.932 429.217C699.24 439.611 696.366 450.099 689.942 458.374L539.381 652.301C532.956 660.575 523.507 665.96 513.113 667.268L269.524 697.932C259.13 699.24 248.641 696.366 240.366 689.942L46.4401 539.381C38.1652 532.956 32.7818 523.507 31.4734 513.113L0.809735 269.524C-0.498699 259.13 2.37558 248.641 8.80006 240.366L159.361 46.4401C165.785 38.1654 175.234 32.7817 185.628 31.4732L429.217 0.809528Z")`,
}

const box2: React.CSSProperties = {
    width: 60,
    height: 60,
    position: "absolute",
    top: 0,
    left: 0,
    offsetPath: `path("M317.065 0.979928C327.414 -0.647448 337.986 1.90301 346.455 8.07004L491.666 113.817C500.134 119.984 505.806 129.263 507.433 139.611L535.338 317.066C536.965 327.414 534.415 337.986 528.248 346.455L422.501 491.666C416.334 500.134 407.055 505.806 396.706 507.433L219.252 535.338C208.903 536.965 198.331 534.415 189.863 528.248L44.6521 422.501C36.1838 416.334 30.5121 407.055 28.8847 396.706L0.979898 219.252C-0.647478 208.903 1.90298 198.331 8.07001 189.863L113.817 44.6522C119.984 36.1838 129.263 30.5121 139.611 28.8847L317.065 0.979928Z")`,
}

const box3: React.CSSProperties = {
    width: 60,
    height: 60,
    position: "absolute",
    top: 0,
    left: 0,
    offsetPath: `path("M133.125 8.66307C141.436 2.28566 151.94 -0.529056 162.327 0.838343L288.067 17.3918C298.453 18.7592 307.871 24.1966 314.248 32.5075L391.453 133.125C397.831 141.436 400.646 151.94 399.278 162.327L382.725 288.067C381.357 298.453 375.92 307.871 367.609 314.248L266.992 391.453C258.681 397.831 248.176 400.646 237.79 399.278L112.05 382.725C101.664 381.357 92.2459 375.92 85.8686 367.609L8.66306 266.992C2.28565 258.681 -0.529067 248.176 0.838332 237.79L17.3917 112.05C18.7592 101.664 24.1966 92.2459 32.5075 85.8686L133.125 8.66307Z")`,
}

const Section4 = memo(
  () => {
    const interval1 = useRef<NodeJS.Timeout | null>(null)
    const time1 = useMotionValue(0)
    const opacity1_1 = useTransform(time1, [duration / 8 * 2 - 2, duration / 8 * 2], [0, 1],);
    const opacity1_2 = useTransform(time1, [duration / 8 * 4 - 2, duration / 8 * 4], [0, 1],);
    const opacity1_3 = useTransform(time1, [duration / 8 * 6 - 2, duration / 8 * 6], [0, 1],);

    const interval2 = useRef<NodeJS.Timeout | null>(null)
    const time2 = useMotionValue(0)
    const opacity2_1 = useTransform(time2, [duration2 / 8 * 2 - 2, duration2 / 8 * 2], [0, 1],);
    const opacity2_2 = useTransform(time2, [duration2 / 8 * 4 - 2, duration2 / 8 * 4], [0, 1],);
    const opacity2_3 = useTransform(time2, [duration2 / 8 * 6 - 2, duration2 / 8 * 6], [0, 1],);

    const interval3 = useRef<NodeJS.Timeout | null>(null)
    const time3 = useMotionValue(0)
    const opacity3_1 = useTransform(time2, [duration3 / 8 * 3 - 1, duration3 / 8 * 3], [0, 1],);

    time1.on('change', (v) => {
      if (v >= duration) {
        if (interval1.current) {
          clearInterval(interval1.current)
          interval1.current = null
        }
      }
    })

    time2.on('change', (v) => {
      if (v >= duration2) {
        if (interval2.current) {
          clearInterval(interval2.current)
          interval2.current = null
        }
      }
    })

    time3.on('change', (v) => {
      if (v >= duration3) {
        if (interval3.current) {
          clearInterval(interval3.current)
          interval3.current = null
        }
      }
    })

    useEffect(() => {
      if (!interval1.current) {
        interval1.current = setInterval(() => {
          time1.set(time1.get() + 0.1)
        }, 100)
      }
      if (!interval2.current) {
        interval2.current = setInterval(() => {
          time2.set(time2.get() + 0.1)
        }, 100)
      }
      if (!interval3.current) {
        interval3.current = setInterval(() => {
          time3.set(time3.get() + 0.1)
        }, 100)
      }
      return () => {
        if (interval1.current) {
          clearInterval(interval1.current)
          interval1.current = null
        }
        if (interval2.current) {
          clearInterval(interval2.current)
          interval2.current = null
        }
        if (interval3.current) {
          clearInterval(interval3.current)
          interval3.current = null
        }
      }
    }, [] )

    const  controls3_1 = useAnimation();
    const  runAnimation3_1 = async () => {
      console.log('runAnimation3_2 被调用，run值为:', offsetDistance.get());

      await  controls3_1.start({
        offsetDistance: "100%"
      }, {
        duration: duration3 * ( 1 - Number(offsetDistance.get().replace('%', '')) / 100),
        ease: "linear",
      });
      
      console.log('单次动画完成'); // 这里会执行
      await controls3_1.set({ offsetDistance: "0%" });
      runAnimation3_1();
    };

    const  controls3_2 = useAnimation();
    const offsetDistance = useMotionValue("0%");
    const  runAnimation3_2 = async ({ run }: {run?: boolean}) => {
      await controls3_2.start({
        offsetDistance: "100%"
      }, {
        duration: duration3 * ( 1 - Number(offsetDistance.get().replace('%', '')) / 100),
        ease: "linear",
        delay: run ? 0 : duration3 / 8 * 3,
      });
      await controls3_2.set({ offsetDistance: "0%" });
      runAnimation3_2({ run: true });
    };

    // useEffect(() => {
    //   const unsubscribe = offsetDistance.on("change", (latest) => {
    //     console.log("offsetDistance 发生了变化:", latest);
    //     // 在这里执行你需要依赖于offsetDistance的逻辑
    //   });

    //   // 组件卸载时取消订阅
    //   return () => unsubscribe();
    // }, [offsetDistance]);


    useEffect(() => {
       runAnimation3_1();
       runAnimation3_2({});
    }, [ controls3_1]);

    return (
      <div className="h-[810px] px-[170px] text-white relative overflow-hidden">
        <div className=" absolute -bottom-[454px] left-0 right-0 flex justify-center ">
          <div className="new-circle-bg4">

          </div>
          {/* <LazyImage src="/images/home/new/sec4_bg3.png" className=" h-[350px]" /> */}
        </div>
          <div className="w-[250px] h-[250px] absolute left-[calc(50%-125px)] top-[calc(50%-125px)] flex items-center justify-center">
            <LazyImage src="/images/home/new/sec4_bg.png" className="w-full h-full absolute left-0 top-0" />
            <LazyImage src="/images/home/new/logo.png" className="w-[180px]" />
          </div>
          <div className="w-[699px] h-[699px] absolute left-[calc(50%-349.5px)] top-[calc(50%-349.5px)]">
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
                  opacity: opacity1_3,
                  scale: opacity1_3,
                }}
                initial={{ offsetDistance: "0%" }}
                animate={{ offsetDistance: "100%" }}
                transition={{
                  ...transition,
                  duration: duration,
                  delay: duration / 8 * 6,
                }}
            >
              <img src="/images/tokens/META.png" className="w-[60px] h-[60px] rounded-full" alt="" />
            </motion.div>
            <motion.div
                style={{
                  ...box1,
                  opacity: opacity1_2,
                  scale: opacity1_2,
                }}
                initial={{ offsetDistance: "0%" }}
                animate={{ offsetDistance: "100%" }}
                transition={{
                  ...transition,
                  duration: duration,
                  delay: duration / 8 * 4,
                }}
            >
              <img src="/images/tokens/NVDA.png" className="w-[60px] h-[60px] rounded-full" alt="" />
            </motion.div>
            <motion.div
                style={{
                  ...box1,
                  opacity: opacity1_1,
                  scale: opacity1_1,
                }}
                initial={{ offsetDistance: "0%" }}
                animate={{ offsetDistance: "100%" }}
                transition={{
                  ...transition,
                  duration: duration,
                  delay: duration / 8 * 2,
                }}
            >
              <img src="/images/tokens/HOOD.png" className="w-[60px] h-[60px] rounded-full" alt="" />
            </motion.div>
            <motion.div
                style={box1}
                initial={{ offsetDistance: "0%" }}
                animate={{ offsetDistance: "100%" }}
                transition={{
                  ...transition,
                  duration: duration,
                  delay: 0,
                }}
            >
              <img src="/images/tokens/GOOGL.png" className="w-[60px] h-[60px] rounded-full" alt="" />
            </motion.div>
          </div>
          <div className="w-[537px] h-[537px] absolute left-[calc(50%-268.5px)] top-[calc(50%-268.5px)]">
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
                opacity: opacity2_1,
                scale: opacity2_1,
              }}
              initial={{ offsetDistance: "0%" }}
              animate={{ offsetDistance: "100%" }}
              transition={{
                ...transition,
                duration: duration2,
                delay: duration2 / 8 * 2,
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
                opacity: opacity2_3,
                scale: opacity2_3,
              }}
              initial={{ offsetDistance: "0%" }}
              animate={{ offsetDistance: "100%" }}
              transition={{
                ...transition,
                duration: duration2,
                delay: duration2 / 8 * 6,
              }}
            >
              <img src="/images/home/new/sec4_tip3.png" className="w-[38px] h-[38px] rounded-full" alt="" />
            </motion.div>
            <motion.div
              style={{
                ...box2,
                opacity: opacity2_2,
                scale: opacity2_2,
              }}
              initial={{ offsetDistance: "0%" }}
              animate={{ offsetDistance: "100%" }}
              transition={{
                ...transition,
                duration: duration2,
                delay: duration2 / 8 * 4,
              }}
            >
              <img src="/images/tokens/AAPL.png" className="w-[60px] h-[60px] rounded-full" alt="" />
            </motion.div>
            
            <motion.div
              style={{
                ...box2
              }}
              initial={{ offsetDistance: "0%" }}
              animate={{ offsetDistance: "100%" }}
              transition={{
                ...transition,
                duration: duration2,
                delay: 0,
              }}
            >
              <img src="/images/tokens/TSLA.png" className="w-[60px] h-[60px] rounded-full" alt="" />
            </motion.div>
          </div>
          <div className="w-[401px] h-[401px] absolute left-[calc(50%-200.5px)] top-[calc(50%-200.5px)]">
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
                opacity: opacity3_1,
                scale: opacity3_1,
              }}
              initial={{ offsetDistance: "0%" }}
              animate={ controls3_2 }
              transition={{
                duration: duration3,
              }}
              onHoverStart={(e) => {
                 controls3_2.stop();
              }}
              onHoverEnd={async () => {
                 runAnimation3_2({run: true});
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
              onHoverStart={(e) => {
                 controls3_1.stop();
              }}
              onHoverEnd={async () => {
                 runAnimation3_1();
              }}  
              
            >
              <img src="/images/tokens/AMZN.png" className="w-[60px] h-[60px] rounded-full" alt="" />
            </motion.div>
            
          </div>
      </div>
    )
})



export default Section4
