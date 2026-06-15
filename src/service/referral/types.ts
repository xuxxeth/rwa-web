export interface IInviteCodeInfo {
  code: string
  ratio: number
  referees: number
  rebates: number
  claims: number
}

export interface IInvitee {
  id: string
  referee: string
  ratio: number
  contribute: string
  createTime: number
}

export interface IRelationshipInfo {
  "referrer": string,    // 被邀请人地址
  "ratio": number,                 // 返佣比例
  "createTime": number   // 邀请时间(毫秒)
}
