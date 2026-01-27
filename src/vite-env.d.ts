/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

declare global {
  interface Window {
    TradingView: {
      widget: (options: any) => any;
    };
    currentToastId: string | number | null
  }
}

interface ImportMetaEnv {
  readonly VITE_API_BASE: string
}