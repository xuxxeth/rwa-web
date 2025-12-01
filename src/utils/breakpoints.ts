const screens = {
  'sm': '375px',
  'md': '768px',
  'lg': '1024px',
  'xl': '1440px',
  '2xl': '1920px',
}

// 获取所有断点配置
export const getBreakpoints = () => {
  return screens;
};

// 获取断点数值（去单位）
export const getBreakpointValues = () => {
  return Object.fromEntries(
    Object.entries(screens).map(([key, value]) => {
      return [key, parseInt(value)];
    })
  );
};

// 获取断点排序数组（从小到大）
export const getSortedBreakpoints = () => {
  const breakpoints = getBreakpointValues();
  return Object.entries(breakpoints)
    .sort(([, a], [, b]) => a - b)
    .map(([key, value]) => ({ key, value }));
};

// 判断当前处于哪个断点
export const getCurrentBreakpoint = (width = window.innerWidth) => {
  const sorted = getSortedBreakpoints();
  let current = 'xs';
  
  for (const { key, value } of sorted) {
    if (width >= value) {
      current = key;
    } else {
      break;
    }
  }
  
  return current;
};

// 检查是否大于某个断点
export const isBreakpointUp = (breakpoint: string, width = window.innerWidth) => {
  const breakpoints = getBreakpointValues();
  return width >= (breakpoints[breakpoint] || 0);
};

// 检查是否小于某个断点
export const isBreakpointDown = (breakpoint: string, width = window.innerWidth) => {
  const breakpoints = getBreakpointValues();
  return width < (breakpoints[breakpoint] || 0);
};