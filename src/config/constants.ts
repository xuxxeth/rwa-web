import type { ChartingLibraryFeatureset } from '@/lib/charting_library/charting_library'

export const CONNECTOR_TYPE = 'CONNECTOR_TYPE'
export const WALLET_UUID = 'WALLET_UUID'
export const LATEST_WALLET_UUID = 'LATEST_WALLET_UUID'
export const CONNECT_ACCOUNT = 'CONNECT_ACCOUNT'
export const CA_LANGUAGE = 'CA_LANGUAGE'

export const REQUEST_TIMEOUT = 60000

export const RESPONSE_CODE = {
  SUCCESS: 9200,
  UNAUTHORIZED: 9401,
  NOT_FOUND: 9404
}

export const CODE_TO_HANDLER = {
  [RESPONSE_CODE.UNAUTHORIZED]: 'onUnAuthorized',
} as const

type ErrorHandlerKeys = (typeof CODE_TO_HANDLER)[keyof typeof CODE_TO_HANDLER]

export type ErrorHandlers = {
  [key in ErrorHandlerKeys]?: () => void
}

export const MARKET_STATUS = {
  DEFAULT: -1,
  CLOSE: 0,
  BEFORE: 1,
  OPEN: 2,
  AFTER: 3,
}

export const RISK_STATUS = {
  DEFAULT: -1,
  NOTVERIFIED: 0,
  VERIFYING: 1,
  VERIFIED: 2,
  REJECTED: 3,
  REVIEW: 4,
  EXPIRED: 5,
  NOTSIGN: 6,
  ISSUE: 9
}

export type Address = `0x${string}`

// 签名过期时间15天
export const SIGNATURE_EXPIRES = 15 * 24 * 60 * 60;
// export const SIGNATURE_EXPIRES = 1 * 60 * 60;
export const ID_EXPIRES = 30 * 24 * 60 * 60;

const RED = '#FF6767'
const GREEN = '#47D0A5'
export const DEFAULT_PERIOD = '4h'

const chartStyleOverrides = ['candleStyle', 'hollowCandleStyle', 'haStyle'].reduce(
  (acc: Record<string, string | boolean>, cv) => {
    acc[`mainSeriesProperties.${cv}.drawWick`] = true
    acc[`mainSeriesProperties.${cv}.drawBorder`] = false
    acc[`mainSeriesProperties.${cv}.upColor`] = GREEN
    acc[`mainSeriesProperties.${cv}.downColor`] = RED
    acc[`mainSeriesProperties.${cv}.wickUpColor`] = GREEN
    acc[`mainSeriesProperties.${cv}.wickDownColor`] = RED
    acc[`mainSeriesProperties.${cv}.borderUpColor`] = GREEN
    acc[`mainSeriesProperties.${cv}.borderDownColor`] = RED
    return acc
  },
  {}
)

export const chartOverrides = {
  "paneProperties.background": "#131416",
  "paneProperties.backgroundGradientStartColor": "#131416",
  "paneProperties.backgroundGradientEndColor": "#131416",
  "paneProperties.backgroundType": "solid",
  "paneProperties.vertGridProperties.color": "rgba(35,38,59,1)",
  "paneProperties.vertGridProperties.style": 2,
  "paneProperties.horzGridProperties.color": "rgba(35,38,59,1)",
  "paneProperties.horzGridProperties.style": 2,
  "mainSeriesProperties.candleStyle.upColor": "#26a69a",
  "mainSeriesProperties.candleStyle.downColor": "#ef5350",
  "mainSeriesProperties.candleStyle.borderUpColor": "#26a69a",
  "mainSeriesProperties.candleStyle.borderDownColor": "#ef5350",
  "mainSeriesProperties.candleStyle.wickUpColor": "#26a69a",
  "mainSeriesProperties.candleStyle.wickDownColor": "#ef5350",
  "scalesProperties.textColor": "#9494A8",
  "scalesProperties.lineColor": "#111114",
  "scalesProperties.fontSize": 12,
  "scalesProperties.showSymbolLabels": true,
  "priceScaleProperties.autoScale": true,
  "mainSeriesProperties.style": 3, // 3 = area
  "mainSeriesProperties.areaStyle.color1": "rgba(37, 167, 80, 0.42)", // 上
  "mainSeriesProperties.areaStyle.color2": "rgba(37, 167, 80, 0)",   // 下
  "mainSeriesProperties.areaStyle.linecolor": "#25A750",             // 线
  priceScaleSelectionStrategyName: 'right',
  // "paneProperties.rightMargin": 0,
  ...chartStyleOverrides,
}

export const disabledFeaturesOnMobile: ChartingLibraryFeatureset[] = [
  'header_saveload',
  'header_fullscreen_button',
  'left_toolbar',
]

export const disabledFeatures: ChartingLibraryFeatureset[] = [
  'volume_force_overlay',
  'create_volume_indicator_by_default',
  'header_compare',
  'display_market_status',
  'show_interval_dialog_on_key_press',
  // "header_symbol_search",
  'header_quick_search',
  'popup_hints',
  // "use_localstorage_for_settings",
  // "right_bar_stays_on_scroll",
  // "symbol_info",
  'hide_left_toolbar_by_default',
  "header_symbol_search",
  "go_to_date",
  "header_symbol_search",
  // 'timeframes_toolbar',
  'use_localstorage_for_settings',  // 不从本地加载模板
  'study_templates',  
  "header_chart_type",
  
]
export const enabledFeatures: ChartingLibraryFeatureset[] = [
  'side_toolbar_in_fullscreen_mode',
  'side_toolbar_in_fullscreen_mode',
  'header_in_fullscreen_mode',
  'items_favoriting',
  'study_symbol_ticker_description',
  'study_overlay_compare_legend_option',
  "hide_left_toolbar_by_default", // 左侧工具栏隐藏
]

export const  DISCORD_URL = 'https://discord.com/invite/J34YYjTh'
export const  X_URL = 'https://x.com/CyberAlpha_x'
export const  TG_URL = 'https://t.me/+SI2ZHu3_QDdlY2Zl'
export const  GITBOOK_URL = 'https://cyberalpha.gitbook.io/cyberalpha-docs'

// 推荐滑点
export const DEFAULT_SLIPPAGE = 0.5
