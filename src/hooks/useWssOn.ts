import wsService, { type OrderEventType, type SubscribedEventType } from "@/service/webSocket/service";
import { useEffect, useRef } from "react";
import { useSignatureValidStatus } from "./useSignature";
import storage from "@/utils/storage";
import { CONNECT_ACCOUNT } from "@/config/constants";
import { useActiveWeb3 } from "./useActiveWe3";
import type { IAuthData, IOrderData } from "@/service/webSocket/types";
import { useWssStore } from "@/stores/wssStore";

export function useWssOn(event?: SubscribedEventType, callback?: (data: any) => void) {
  const framePending = useRef<Boolean>(false)

  useEffect(() => {
    wsService.init({})
    const listener = (data: any) => {
      if (!framePending.current) {
        framePending.current = true
        requestAnimationFrame(() => {
          callback && callback(data)
          framePending.current = false
        })
      }
    }
    event && wsService.on(event, listener)
    return () => {
      framePending.current = false
      event && wsService.off(event, listener)
    }
  }, [])

  return {
    wsService
  }

}

export function useWssAuth() {
  const { account, chainId } = useActiveWeb3()
  const { wsService } = useWssOn()
  const [isSignatureValid] = useSignatureValidStatus()
  const updateNewOrder = useWssStore(state => state.updateNewOrder)

  useEffect(() => {
    if (!chainId) return

    wsService.init({})
    const listener = (data: IOrderData) => {
      console.log('wss order info: ', data)
      updateNewOrder(data)
    }
    const sub: OrderEventType = `order.${chainId}.*`

    if (isSignatureValid && chainId && account) {
      const account = storage.getItem(CONNECT_ACCOUNT)
      const localSignature = account ? storage.getItem(`signature_${account.toLowerCase()}`) : null
      if (localSignature && localSignature.account && account.toLowerCase() === localSignature.account.toLowerCase()) {
        const auth = `Bearer ecdsa-1.${localSignature.account}-${localSignature.nonce}-${localSignature.expires}.${localSignature.signature}`

        // onAuth 第二个参数是成功之后的回调
        wsService.onAuth(auth, (data: IAuthData) => {
          wsService.on(sub, listener)
        });
      }
    }

    return () => {
      wsService.off(sub, listener)
      wsService.exitAuth()
    }
  }, [isSignatureValid, chainId, account])
}