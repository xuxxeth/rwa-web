import { useEffect } from "react";

/**
 * 禁用 body 滚动且避免滚动条消失导致的闪动
 */
export function useBodyScrollLock(open: boolean) {
  useEffect(() => {
    const body = document.body;

    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
    const originalStyle = {
      overflow: body.style.overflow,
      paddingRight: body.style.paddingRight,
    };

    if (open) {
      body.style.overflow = "hidden";
      if (scrollBarWidth > 0) {
        body.style.paddingRight = `${scrollBarWidth}px`;
      }
    } else {
      body.style.overflow = originalStyle.overflow;
      body.style.paddingRight = originalStyle.paddingRight;
    }

    // 组件卸载时恢复
    return () => {
      body.style.overflow = originalStyle.overflow;
      body.style.paddingRight = originalStyle.paddingRight;
    };
  }, [open]);
}
