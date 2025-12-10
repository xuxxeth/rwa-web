import { useEffect, useRef, useCallback } from "react";

export function useBodyScrollLock(open?: boolean) {
  const originalStyle = useRef({
    overflow: "",
    paddingRight: ""
  });

  const unlock = useCallback(() => {
    const body = document.body;
    body.style.overflow = originalStyle.current.overflow;
    body.style.paddingRight = originalStyle.current.paddingRight;
  }, []);

  const lock = useCallback(() => {
    const body = document.body;
    const scrollBarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    body.style.overflow = "hidden"; // 禁止滚动
    if (scrollBarWidth > 0) {
      body.style.paddingRight = `${scrollBarWidth}px`; // 防止闪动
    }
  }, [])

  useEffect(() => {
    const body = document.body;
    // 保存原样式（只保存一次）
    originalStyle.current = {
      overflow: body.style.overflow,
      paddingRight: body.style.paddingRight,
    };

    if (open) {
      lock();
    } else {
      unlock(); // 关闭时恢复
    }

    return () => {
      unlock(); // 卸载也恢复
    };
  }, [open, lock, unlock]);

  return { lock, unlock };
}
