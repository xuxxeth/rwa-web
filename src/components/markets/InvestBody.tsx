import { useTranslation } from "@/hooks/useTranslation"
import { RwaItem } from "../../views/lite-trade/components/RwaItem"
import { useId, useMemo } from "react"
import { useBaseStore } from "@/stores/baseStore"
import { useRouter } from "@/hooks/useRouter"

export function InvestBody() {
  const router = useRouter()
  const { t } = useTranslation()
  const _id = useId()
  // const rwaList = [
  //   {stock: 'Apple', rwa: 'AAPLc', icon: '/images/tokens/aaplc.png', price: '203.22', up: '2.98'},
  //   {stock: 'Tesla', rwa: 'TSLAc', icon: '/images/tokens/tslac.png', price: '203.22', up: '2.98'},
  //   {stock: 'NVIDIA', rwa: 'NVIDIAc', icon: '/images/tokens/nvdac.png', price: '203.22', up: '-2.98', lock: 1},
  //   {stock: 'Amazon', rwa: 'AMZNc', icon: '/images/tokens/amznc.png', price: '203.22', up: '-2.98', lock: 1},
  // ]
  const rwaList = useBaseStore(state => state.rwaList)
  const filterRwaList = useMemo(() => rwaList.slice(0, 6), [rwaList])

  return (
    <div className=" flex flex-col items-center">
      <div className="w-[562px] text-[28px] font-medium text-center">
        {t('Institutional-Grade Trading Experience')}
      </div>
      <div className="w-[562px] mt-4 text-[16px] text-[rgba(255,255,255,0.8)] text-center font-normal">
        {t('Fast execution')}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4 w-full">
        {
          filterRwaList.map((rwa, index) => {
            return (
              <RwaItem key={`${_id}-${index}`} data={rwa} />
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