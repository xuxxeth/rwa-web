import { useTranslation } from "@/hooks/useTranslation"
import { RwaItem } from "../../views/lite-trade/components/RwaItem"
import { useId, useMemo } from "react"
import { useBaseStore } from "@/stores/baseStore"
import { useRouter } from "@/hooks/useRouter"
import { useTradeStore } from "@/stores/tradeStore"

export function InvestBody() {
  const router = useRouter()
  const { t } = useTranslation()
  const _id = useId()
  const rwaList = useBaseStore(state => state.rwaList)
  const filterRwaList = useMemo(() => rwaList.slice(0, 6), [rwaList])
  const updateInputToken = useTradeStore(state => state.updateInputToken)

  return (
    <div className=" flex flex-col items-center">
      <div className="w-[502px] text-[18px] font-medium text-center">
        {t('Institutional-Grade Trading Experience')}
      </div>
      <div className="w-[468px] mt-4 text-[16px] text-[rgba(255,255,255,0.8)] text-center font-normal">
        {t('Fast execution')}
      </div>
      <div className="mt-8 grid grid-cols-2 gap-4 w-full ">
        {
          filterRwaList.map((rwa, index) => {
            return (
              <RwaItem key={`${_id}-${index}`} data={rwa} onClick={data => {
                updateInputToken(data)
              }} />
            )
          })
        }
      </div>
      <div className="mt-4 text-center text-[#9CFF3A] text-[14px] font-semibold leading-[24px] cursor-pointer"
        onClick={() => {
          router.push('/markets')
        }}
      >
        {t('Start Exploring')}  {">"}
      </div>
    </div>
  )
}