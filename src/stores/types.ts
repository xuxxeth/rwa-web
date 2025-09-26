
export interface BaseStore {
  count: number,

  getChains: () => Promise<any>
}