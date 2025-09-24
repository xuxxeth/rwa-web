import type { ChartingLibraryFeatureset } from "@/lib/charting_library/charting_library";

export const CONNECTOR_TYPE = 'CONNECTOR_TYPE';
export const WALLET_UUID = 'WALLET_UUID';


const RED = "#FF6767";
const GREEN = "#47D0A5";
export const DEFAULT_PERIOD = "4h";

const chartStyleOverrides = [
  "candleStyle",
  "hollowCandleStyle",
  "haStyle",
].reduce((acc: Record<string, string | boolean>, cv) => {
  acc[`mainSeriesProperties.${cv}.drawWick`] = true;
  acc[`mainSeriesProperties.${cv}.drawBorder`] = false;
  acc[`mainSeriesProperties.${cv}.upColor`] = GREEN;
  acc[`mainSeriesProperties.${cv}.downColor`] = RED;
  acc[`mainSeriesProperties.${cv}.wickUpColor`] = GREEN;
  acc[`mainSeriesProperties.${cv}.wickDownColor`] = RED;
  acc[`mainSeriesProperties.${cv}.borderUpColor`] = GREEN;
  acc[`mainSeriesProperties.${cv}.borderDownColor`] = RED;
  return acc;
}, {});

export const chartOverrides = {
  "paneProperties.background": "#0d1117",
  "scalesProperties.backgroundColor": "#0d1117",
  "scalesProperties.priceScale.precision": 4,
  "paneProperties.backgroundGradientStartColor": "#06070A",
  "paneProperties.backgroundGradientEndColor": "#06070A",
  "paneProperties.backgroundType": "solid",
  "paneProperties.vertGridProperties.color": "rgba(35, 38, 59, 1)",
  "paneProperties.vertGridProperties.style": 2,
  "paneProperties.horzGridProperties.color": "rgba(35, 38, 59, 1)",
  "paneProperties.horzGridProperties.style": 2,
  "mainSeriesProperties.priceLineColor": "#3a3e5e",
  "scalesProperties.textColor": "#9494A8",
  "scalesProperties.lineColor": "#111114",
  "scalesProperties.fontSize": 12,
  "priceScaleSelectionStrategyName": "right",
  "scalesProperties.showSymbolLabels": true,
  "mainSeriesProperties.candleStyle.upColor": "#26a69a",
  "mainSeriesProperties.candleStyle.downColor": "#ef5350",
  "mainSeriesProperties.candleStyle.borderUpColor": "#26a69a",
  "mainSeriesProperties.candleStyle.borderDownColor": "#ef5350",
  "mainSeriesProperties.candleStyle.wickUpColor": "#26a69a",
  "mainSeriesProperties.candleStyle.wickDownColor": "#ef5350",          // 透明度

  ...chartStyleOverrides,
};

export const disabledFeaturesOnMobile: ChartingLibraryFeatureset[] = [
  "header_saveload",
  "header_fullscreen_button",
  "left_toolbar",
];

export const disabledFeatures: ChartingLibraryFeatureset[] = [
  "volume_force_overlay",
  "create_volume_indicator_by_default",
  "header_compare",
  "display_market_status",
  "show_interval_dialog_on_key_press",
  // "header_symbol_search",
  "header_quick_search",
  "popup_hints",
  // "use_localstorage_for_settings",
  // "right_bar_stays_on_scroll",
  // "symbol_info",
  "hide_left_toolbar_by_default"
];
export const enabledFeatures: ChartingLibraryFeatureset[] = [
  "side_toolbar_in_fullscreen_mode",
  "side_toolbar_in_fullscreen_mode",
  "header_in_fullscreen_mode",
  "items_favoriting",
  "study_templates",
  "study_symbol_ticker_description",
  "study_overlay_compare_legend_option",
  "go_to_date",
  "header_symbol_search", 
  "timeframes_toolbar"
];
