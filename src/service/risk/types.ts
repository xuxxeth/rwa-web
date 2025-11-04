
export interface IUserCofnig {
  "verifyType": number, // 验证类型: 0-KYC;1-AML;2-KYT
  "verifyState": number, // 验证状态: 0-验证中; 1-验证成功 2-验证失败
  "actions": number, // 操作限制：按位处理 1正常 0禁止 -1 未签名
  "blacklist": boolean // 是否风控黑名单 true/false
}

export interface IStartVerification {
  "status": number // kyc认证状态：0-未认证，1-认证中，2-已认证，3-认证失败
}