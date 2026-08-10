import { Trans } from "@/components/trans";
import { useToast } from "@/hooks/useToast";
import { useTranslation } from "@/hooks/useTranslation";
import { formatTimestamp } from "@/utils/format";

const template = {
  zh: `郵件主題： 【拆並股資產置換人工處理申請】[股票代碼] - [持倉錢包地址前4位...後4位]
郵件正文：
帳戶與資產详情（Account & Asset Details）
 
- 持倉錢包地址（完整地址）：
 
- 需置換的舊資產代碼（例如 NVDA.t）：
 
免責聲明與授權確認（Acknowledgment & Authorization）
 
1. 本人確認上述所提供之錢包地址及資產資訊均真實、完整且無誤。
 
2. 本人已知悉並理解：因錯過平台規定的鏈上自主置換窗口期，現主動申請由平台客服與技術團隊進行後台人工核對及資產折算/置換。
 
3. 本人理解並同意，人工數據核驗與鏈上處理需要一定的作業時間，置換結果將以鏈上最終核驗數據為準。
 
安全提示（Security Notice）
⚠️ 官方提醒：平台客服人員在任何情況下都「絕不會」向您索取錢包私鑰（Private Key）或助記詞（Mnemonic Phrase）。請勿向任何人透露您的私鑰資訊。`,        

  en: `Subject: [Manual Processing Request for Stock Split/Reverse Split Asset Swap] [Stock Ticker] - [First 4 & Last 4 Digits of Wallet Address]
Email Body:
Account & Asset Details
- Wallet Address (Full Address):
- Old Asset Ticker to Swap (e.g., NVDA.t):
Acknowledgment & Authorization
1. I confirm that all wallet address and asset information provided above is true, complete, and accurate.
2. I acknowledge and understand that due to missing the platform's designated period for on-chain self-service swapping, I am hereby requesting the support and technical teams to conduct manual verification and execute asset conversion/swapping based on the corporate action (stock split/reverse split) ratio.
3. I understand and agree that manual data verification and on-chain processing require administrative time, and the final swapped amount will be subject to the verified on-chain data and the official split ratio.
Security Notice
⚠️ Official Warning: Platform support staff will NEVER, under any circumstances, ask for your Wallet Private Key or Mnemonic Seed Phrase. Never share your private key or seed phrase with anyone.`
}

export function ExchangeTip({status, startTime}: {status: number, startTime: number}) {
  const { t, i18n } = useTranslation();
  const { toastSuccess } = useToast()

  return (
    <>
      {
        status === 0 && (
          <span className="text-[#c7ccd6] text-[12px] leading-normal">
            {t('events.t31', {t1: formatTimestamp(startTime, true)})}
          </span>
        )
      }
      {
        status === 2 && (
          <span className="text-[#c7ccd6] text-[12px] leading-normal">
            {t('events.t33')}
          </span>
        )
      }
      {
        status === 3 && (
          <span className="text-[#c7ccd6] text-[12px] leading-normal">
            <Trans 
              i18nKey="events.t32" 
              values={{ }} 
              components={{
                r1: (
                  <span
                    className="text-[#009DFF] cursor-pointer"
                    onClick={(ev) => {
                      ev.stopPropagation()
                      try {
                        const language = i18n.language ||  'en'
                        // @ts-ignore
                        navigator.clipboard.writeText(template[language])
                          .then(res => {
                            toastSuccess({title: t('events.t45')})
                          })
                      } catch (error) {

                      }
                      
                    }}
                  />
                ),
                r2: <span className=" text-[#009DFF]" />,
              }}
            />
          </span>
        )
      }
    </>

  )
}