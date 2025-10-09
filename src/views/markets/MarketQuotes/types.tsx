type IMarketQuote = {
  rwaId: number;
  name: string;
  token: string;
  price: string;
  icon: string | null;
  change: string;
  marketCap: string;
  dailyHigh: string;
  stockState: 0 | 1 | 5 | 6,
  rwaState: 0 | 1 | 2 | 3 | 4
};

type Change = 0 | 1 | -1;

interface IMarketQuoteResponse {
  data: IMarketQuote[];
}
export type { IMarketQuoteResponse, IMarketQuote, Change }; 
