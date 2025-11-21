import { LazyImage } from "@/components/image/LazyImage";
import { TitlePrimary } from "@/components/title-primary";
import { memo, useId } from "react";

const Section6 = memo(
  () => {
    const partnerList = [
      {
        logo: '/images/home/new/usmart.svg',
        title: 'Licensed Brokerage Partner',
        desc: 'A regulated broker providing real-market liquidity and execution for tokenized equities traded on our platform.',
        web: 'www.usmart.sg'
      },
      {
        logo: '/images/home/new/slowmist.png',
        title: 'Security Audit Partner',
        desc: 'A leading blockchain security firm that audited and verified our smart contracts and platform infrastructure.',
        web: 'slowmist.com'
      },
      {
        logo: '/images/home/new/megvii.svg',
        title: 'Licensed Brokerage Partner',
        desc: 'A regulated broker providing real-market liquidity and execution for tokenized equities traded on our platform.',
        web: 'www.usmart.sg'
      },
      {
        logo: '/images/home/new/pyth.png',
        title: 'Oracle Provider',
        desc: 'Delivering accurate and verifiable market data to guarantee fair and transparent on-chain settlement prices.',
        web: 'www.pyth.network'
      },
      {
        logo: '/images/home/new/arisk.png',
        title: 'On-Chain KYT & Compliance Partner',
        desc: 'Powering real-time transaction monitoring and on-chain identity verification, ensuring full regulatory compliance.',
        web: 'arisk.io'
      },
    ]
    const _id = useId()
    return (
      <div className="p-[93px] flex justify-center text-white">
        <div className="w-[1254px] min-h-[526px] relative"
        >
          <LazyImage src="/images/home/new/sec6_bg.png" className="w-full absolute left-0 top-0" />
          <div className=" relative py-[28px] px-[60px]">
            <TitlePrimary className=" font-medium text-[36px] w-full text-center leading-[100%]">
              Ecosystem & Partnerships
            </TitlePrimary>
            <div className=" flex items-center justify-center mt-[40px] gap-x-[40px]">
              {
                partnerList.slice(0, 3).map((item, index) => {
                  return (
                    <div key={`${_id}-${index}`} className="border-[rgba(255,255,255,0.1)] border rounded-[16px] w-[352px] min-h-[287px] p-10">
                      <LazyImage src={item.logo} />
                      <div className="mt-5 text-[16px] font-semibold">{item.title}</div>
                      <div className="mt-5 text-[16px] leading-[20px] font-normal text-[rgba(255,255,255,0.6)]">{item.desc}</div>
                      <a href={item.web} target="_blank">
                        <div className=" flex mt-4 items-center cursor-pointer">
                          <div className=" underline text-[14px] font-normal">{item.web}</div>
                          <LazyImage src="/images/home/new/link_white.png" className="w-5 ml-1" />
                        </div>
                      </a>
                      
                    </div>
                  )
                })
              }
            </div>
            <div className=" flex items-center justify-center mt-[40px] gap-x-[40px]">
              {
                partnerList.slice(3, 5).map((item, index) => {
                  return (
                    <div key={`${_id}-${index}`} className="border-[rgba(255,255,255,0.1)] border rounded-[16px] w-[548px] min-h-[287px] p-10">
                      <LazyImage src={item.logo} />
                      <div className="mt-5 text-[16px] font-semibold">{item.title}</div>
                      <div className="mt-5 text-[16px] leading-[20px] font-normal text-[rgba(255,255,255,0.6)]">{item.desc}</div>
                      <a href={item.web} target="_blank">
                        <div className=" flex mt-4 items-center cursor-pointer">
                          <div className=" underline text-[14px] font-normal">{item.web}</div>
                          <LazyImage src="/images/home/new/link_white.png" className="w-5 ml-1" />
                        </div>
                      </a>
                      
                    </div>
                  )
                })
              }
            </div>
          </div>
        </div>
      </div>
    )
  }
)

export default Section6