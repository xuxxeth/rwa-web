import { memo, useState } from "react"
import { LazyImage } from "../image/LazyImage"
import { useTranslation } from "@/hooks/useTranslation"
import React from "react"
import type { IOpenOrder } from "@/service/scan/types"
import { cn } from "@/lib/utils"
import { formatNumberWithCommas, formatTimestamp, textPrefix, textSuffix, toFixed } from "@/utils/format"
import {  OrderStatusCell } from "@/views/assets/Shared"
import { useRwaByStockId } from "@/hooks/useRwaBalances"
import { shortenAddress } from "@/utils"
import CopyButton from "../button/copyButton"

const OrderItemWRap = memo(
  ({ children }: { children: React.ReactNode }) => {
    return (
      <div className="flex items-center justify-between mb-[6px] text-[rgba(255,255,255,0.6)] text-[14px]">
        {children}
      </div>
    )
  }
)

type OrderItemProps = {
  order: IOpenOrder,
  type: string,
  expand?: boolean,
  cancelOrder?: (orderId: number) => void
  onExpand?: (orderId: string) => void
}

const OrderItem = memo(
  ({ order, type, expand, cancelOrder, onExpand }: OrderItemProps) => {
    const { t } = useTranslation()
    const rwaToken = useRwaByStockId(order.stockId)
    return (
      <div className="mt-2 p-2">
        <OrderItemWRap>
          <div className=" text-[14px] flex items-center gap-x-1">
            <div className="w-5 h-5 rounded-full shrink-0">
              {
                rwaToken?.icon && <LazyImage src={rwaToken?.icon} className="w-5 h-5 rounded-full" />
              }

            </div>
            <span className=" text-white font-normal">{rwaToken?.symbol}</span>
            <span className=" font-normal text-[14px]">{rwaToken?.name}</span>
          </div>
          <div className=" text-white">
            {formatTimestamp(order.txTime)}
          </div>
        </OrderItemWRap>
        <OrderItemWRap>
          <div className={cn(
            "text-[14px] flex items-center gap-x-1",
            order.side === 0 ? 'text-[rgba(33,201,94,1)]' : 'text-[rgba(255,89,60,1)]'
          )}>
            {order.side === 0 ? t('assets.order.buy') : t('assets.order.sell')}
          </div>
          <div className=" text-white">
            {order.orderType === 0 ? t('limit') : t('market')}
          </div>
        </OrderItemWRap>
        <OrderItemWRap>
          <div className="text-[14px] flex items-center gap-x-1">
            {t('Order Price')}
          </div>
          <div className=" text-white">
            {textPrefix(toFixed(order.price), '$')}
          </div>
        </OrderItemWRap>
        <OrderItemWRap>
          <div className="text-[14px] flex items-center gap-x-1">
            {t('Order Amount')}
          </div>
          <div className=" text-white">
            {toFixed(order.size, 0)}
          </div>
        </OrderItemWRap>
        
        {
          expand && 
          <>
            <OrderItemWRap>
              <div className="text-[14px] flex items-center gap-x-1">
                {t('Filled Amount')}
              </div>
              <div className=" text-white">
                {toFixed(order.settledSize, 0)}
              </div>
            </OrderItemWRap>
            <OrderItemWRap>
              <div className="text-[14px] flex items-center gap-x-1">
                {t('Filled Value')}
              </div>
              <div className=" text-white">
                {formatNumberWithCommas(order.settledAmount, 3)} {' USDT'}
              </div>
            </OrderItemWRap>
            <OrderItemWRap>
              <div className="text-[14px] flex items-center gap-x-1">
                {type === 'open' ? t('Order Time') : t('Execution Time')}
              </div>
              <div className=" text-white">
                {formatTimestamp(order.txTime)}
              </div>
            </OrderItemWRap>
            {
              type === 'open' && 
                <OrderItemWRap>
                  <div className="text-[14px] flex items-center gap-x-1">
                    {t('Expiration')}
                  </div>
                  <div className=" text-white">
                    {order.validDate} {t('days')}
                  </div>
                </OrderItemWRap>
            }
            
            <OrderItemWRap>
              <div className="text-[14px] flex items-center gap-x-1">
                {t('assets.order.orderStatus')}
              </div>
              {/* <div className=" h-[21px] px-2 flex items-center rounded-[4px] bg-[rgba(38,192,226,0.1)] text-[rgba(38,192,226,1)] font-medium text-[10px]">
                10 {t('days')}
              </div> */}
              <OrderStatusCell state={order.state} />
            </OrderItemWRap>
            {
              type === 'history' && 
              <>
                <OrderItemWRap>
                  <div className="text-[14px] flex items-center gap-x-1">
                    {t('assets.tradeHistory.tableHeader.txHash')}
                  </div>
                  <div className='flex flex-row items-center gap-2 cursor-pointer'>
                    <span className='text-sm font-medium text-[rgba(26,133,255,1)]'>
                      {shortenAddress(order.txHash ?? '', 4, 4)}
                    </span>
                    <CopyButton copyText={order.txHash ?? ''} />
                  </div>
                </OrderItemWRap>
                <OrderItemWRap>
                  <div className="text-[14px] flex items-center gap-x-1 capitalize">
                    {t('Details')}
                  </div>
                  <div className='flex flex-row items-center gap-2 cursor-pointer'>
                    --
                  </div>
                </OrderItemWRap>
              </>
            }
          </>
        }
        {
          type === 'open' && 
            <OrderItemWRap>
              <div className="text-[14px] flex items-center gap-x-1">
                {t('Actions')}
              </div>
              <button className=" h-[21px] px-4 flex items-center rounded-[4px] bg-[rgba(255,255,255,0.1)] text-[#1A85FF] font-medium text-[14px] cursor-pointer"
                onClick={() => {
                  cancelOrder && cancelOrder(Number(order.orderId))
                }}
              >
                {t('assets.order.cancelOrder')}
              </button>
            </OrderItemWRap>
        }
        
        <div className="h-[13px] flex justify-center items-center mt-1 bg-[rgba(255,255,255,0.1)] cursor-pointer"
          onClick={() => {
            onExpand && onExpand( expand ? '' : order.orderId)
          }}
        >
          <LazyImage src="/images/icons/down-arrow.png" className={cn(
            "w-[9px] h-[5px]",
            expand ? ' rotate-180' : ' rotate-0'
          )} />
        </div>
      </div>
    )
  }
)

export { OrderItem }