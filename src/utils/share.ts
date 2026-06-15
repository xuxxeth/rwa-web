
type SharePlatform = 'twitter' | 'telegram' | 'discord'
export type Lang = 'en' | 'zh'

interface ShareParams {
  platform: SharePlatform
  lang: Lang
  inviteUrl: string
  rebateRate: number | string
}

export const SHARE_TEXT = {
  'zh': (rate: number | string, inviteUrl: string) =>
    `🚀 與我一起加入 Tiko，在鏈上交易美股，解鎖全球優質資產！📈 現在點擊下方連結加入，即可尊享 ${rate}% 手續費返傭！👇 ${inviteUrl}`,

  'en': (rate: number | string, inviteUrl: string) =>
    `🚀 Join me on Tiko to trade US equities on-chain and unlock premium global assets! 📈 Use my link to join now and enjoy ${rate}% fee rebate! 👇 ${inviteUrl}`,
}

export function getShareLink({
  platform,
  lang,
  inviteUrl,
  rebateRate,
}: ShareParams) {
  const text = SHARE_TEXT[lang](rebateRate, platform === 'twitter' ? '' : inviteUrl)

  const encodedText = encodeURIComponent(text)
  const encodedUrl = encodeURIComponent(inviteUrl)

  switch (platform) {
    case 'twitter':
      return `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`

    case 'telegram':
      return `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`

    case 'discord':
      return 'https://discord.com/channels/@me'

    default:
      return ''
  }
}
async function shareToDiscord(params: ShareParams) {
  setTimeout(() => {
    window.open('https://discord.com/channels/@me', '_blank')
  }, 1000)
  
}

export async function handleShare(params: ShareParams) {
  if (params.platform === 'discord') {
    return shareToDiscord(params)
  }

  const link = getShareLink(params)

  window.open(link, '_blank')
}