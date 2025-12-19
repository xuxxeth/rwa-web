import { useState, useEffect } from 'react';
import { getCurrentBreakpoint, isBreakpointUp, isBreakpointDown } from '../utils/breakpoints';

export const useTailwindBreakpoints = () => {
  const [breakpoint, setBreakpoint] = useState(getCurrentBreakpoint());
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? document.body.clientWidth : 0);

  useEffect(() => {
    const handleResize = () => {
      const width = document.body.clientWidth;
      setWindowWidth(width);
      setBreakpoint(getCurrentBreakpoint(width));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    breakpoint,
    windowWidth,
    isSm: isBreakpointUp('sm', windowWidth),
    isMd: isBreakpointUp('md', windowWidth),
    isLg: isBreakpointUp('lg', windowWidth),
    isXl: isBreakpointUp('xl', windowWidth),
    is2Xl: isBreakpointUp('2xl', windowWidth),
    isSmDown: isBreakpointDown('sm', windowWidth),
    isMdDown: isBreakpointDown('md', windowWidth),
    // ... 其他便捷方法
  };
};