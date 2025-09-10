/// <reference types="vite/client" />

declare global {
  interface Window {
    TradingView: {
      widget: (options: any) => any;
    };
  }
}