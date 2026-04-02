
export interface ICandlesParams {
  stock: number;
  interval: number;
  endTime: number;
  limit: number;
}

export interface ICandlesItem {
  "s": number,            //股票编号
  "p": number,            //股票间隔时间  
  "t": number,   //开始时间
  "o": number,    //开盘价
  "c": number,    //收盘价
  "h": number,    //最高价
  "l": number     //最低价
}

export interface IMinuteParams {
  stock: number,
  sessionType: number,
  day?: number
}

export interface IMinuteItem {
  stockId: number,
  items: {close: number, startTime: number}[]
}