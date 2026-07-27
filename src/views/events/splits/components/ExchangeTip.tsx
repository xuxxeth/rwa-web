import { Trans } from "@/components/trans";
import { useToast } from "@/hooks/useToast";
import { useTranslation } from "@/hooks/useTranslation";
import { formatTimestamp } from "@/utils/format";

const template = {
  zh: `郵件主題： 【資產置換人工處理申請】[股票代碼] - [您的帳戶地址後4位]
郵件正文：
帳戶持有人身份驗證（Account Verification）
--------------------------------------------------
* 持倉錢包地址：
* 綁定的 KYC 姓名：
* 綁定的 KYC 出生日期： (年/月/日)


置換資產明細（Asset & Action Details）
--------------------------------------------------
* 需置換的資產代碼： （例如：NVDA.t）
* 申請置換的資產數量：
* 申請置換的特定期數： （例如：共3期中的第1期，或填寫具體執行日期）


免責與確認（Acknowledgment）
--------------------------------------------------
本人確認上述提供的信息真實有效。由於錯過了平台規定的鏈上自主置換截止時間，現申請由客服後台協助進行人工核對及資產折算。

本人已知悉人工處理需要一定的鏈上數據核驗時間。`,        

  en: `Subject: [Manual Asset Replacement Application] [Asset Code] - [Last 4 Digits of Account Address]
Body：
Account Verification
--------------------------------------------------
* Holding Wallet Address: 
* Bound KYC Full Name: 
* Bound KYC Date of Birth: (YYYY/MM/DD)
    
    
Asset & Action Details
--------------------------------------------------
* Asset Code for Replacement: (e.g., NVDA.t)
* Asset Quantity for Replacement: 
* Specific Batch/Tranche for Replacement: (e.g., Batch 1 of 3, or specify the execution date)
    
    
Acknowledgment
--------------------------------------------------
I hereby confirm that the information provided above is true and valid. As I have missed the platform's deadline for self-service on-chain asset replacement, I am requesting the customer service team to assist with manual verification and asset conversion on the backend.

I acknowledge and understand that this manual process requires time for on-chain data verification.`
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