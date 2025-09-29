type MarketQuote = {
  rwaid: number;
  name: string;
  token: string;
  price: string;
  icon: string | null;
  change: string;
  marketCap: string;
  dailyHigh: string;
};

type Change = 0 | 1 | -1;

interface MarketQuoteResponse {
  data: MarketQuote[];
}
export type { MarketQuoteResponse, MarketQuote, Change };
