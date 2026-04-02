import {
  CA_LANGUAGE,
  CODE_TO_HANDLER,
  CONNECT_ACCOUNT,
  REQUEST_TIMEOUT,
  type ErrorHandlers,
} from '@/config/constants'
import axios from 'axios'
import { defaultChains, bscTestnet } from '@/hooks/useCaCommon'

import type {
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosRequestConfig,
  AxiosInstance,
  AxiosRequestHeaders,
  AxiosError,
} from 'axios'
import storage from '@/utils/storage'

interface RequestInterceptors<T> {
  // 请求拦截
  requestInterceptors?: (config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig
  requestInterceptorsCatch?: (err: any) => any
  // 响应拦截
  responseInterceptors?: (config: T) => T
  responseInterceptorsCatch?: (err: any) => any
}

interface RequestConfig<T = AxiosResponse> extends AxiosRequestConfig {
  interceptors?: RequestInterceptors<T>
  errorHandlers?: ErrorHandlers
}
// 通用接口响应结构
export interface ApiResponse<T> {
  code: number
  data: T
  message: string | null
}

export const PATH_URL = import.meta.env.DEV ? '' : import.meta.env.VITE_API_BASE
export const isTiko = import.meta.env.VITE_API_BASE.includes('tiko.cc')

const abortControllerMap: Map<string, AbortController> = new Map()

const axiosInstance: AxiosInstance = axios.create({
  timeout: REQUEST_TIMEOUT,
  baseURL: PATH_URL,
})

const AUTH_URL_PREFIX = ['/scan/api/', '/kyc/api/', '/uc/api']

axiosInstance.interceptors.request.use((req: InternalAxiosRequestConfig) => {
  const controller = new AbortController()
  const url = req.url || ''
  req.signal = controller.signal
  abortControllerMap.set(url, controller)
  // const needAuth = url.includes('/scan/api/') || url.includes('/kyc/api/') // ✅ 判断 URL 是否需要授权
  const needAuth = AUTH_URL_PREFIX.some(prefix => url.includes(prefix))
  const account = storage.getItem(CONNECT_ACCOUNT)
  const localSignature = account ? storage.getItem(`signature_${account.toLowerCase()}`) : null
  // ✅ 如果存在 account 但没有签名信息，则中止请求
  if (needAuth && (!localSignature || !localSignature.account)) {
    controller.abort()
    // 抛出一个自定义错误让上层能识别
    return Promise.reject(new axios.Cancel(`Missing signature for account ${account}`))
  }

  if (
    localSignature &&
    localSignature.account &&
    account.toLowerCase() === localSignature.account.toLowerCase()
  ) {
    const auth = `Bearer ecdsa-1.${localSignature.account}-${localSignature.nonce}-${localSignature.expires}.${localSignature.signature}`
    req.headers.set('Authorization', auth)
  }
  const chainId =
    localStorage.getItem('CA-Chain-Id') ?? (isTiko ? defaultChains[0]?.id : bscTestnet.id)
  const lng = storage.getItem(CA_LANGUAGE) || 'en'

  req.headers.set('CA-Chain-Id', chainId)
  req.headers.set('Accept-Language', lng)

  return req
})

axiosInstance.interceptors.response.use(
  (res: AxiosResponse) => {
    const url = res.config.url || ''
    abortControllerMap.delete(url)
    // 这里不能做任何处理，否则后面的 interceptors 拿不到完整的上下文了

    return res
  },
  (error: AxiosError) => {
    const config = error.config as RequestConfig
    console.log('err： ' + error) // for debug

    // 在这里可以统一处理下错误
    if (error.response && error.response.data) {
      const apiResponse = error.response.data as ApiResponse<any>
      const apiResponseCode = apiResponse.code
      const handler = config.errorHandlers?.[CODE_TO_HANDLER[apiResponseCode]]
      if (handler) {
        handler()
      }
      return Promise.resolve(error.response)
    }

    return Promise.reject(error)
  }
)

const client = {
  request: <T = any>(config: RequestConfig): Promise<T> => {
    return new Promise((resolve, reject) => {
      if (config.interceptors?.requestInterceptors) {
        config = config.interceptors.requestInterceptors(config as any)
      }
      axiosInstance
        .request(config)
        .then(res => resolve(res.data))
        .catch((err: any) => reject(err))
    })
  },
  cancelRequest: (url: string | string[]) => {
    const urlList = Array.isArray(url) ? url : [url]
    for (const _url of urlList) {
      abortControllerMap.get(_url)?.abort()
      abortControllerMap.delete(_url)
    }
  },
  cancelAllRequest() {
    for (const [_, controller] of abortControllerMap) {
      controller.abort()
    }
    abortControllerMap.clear()
  },
  // ✅ 单独方法封装
  get: async <T = any>(url: string, params?: any, config?: RequestConfig) => {
    try {
      return await client.request<T>({
        url,
        method: 'GET',
        params,
        ...config,
      })
    } catch (error) {
      // if (params.noError) {
      //   return null
      // }
      throw error
    }
  },

  post: async <T = any>(url: string, data?: any, config?: RequestConfig) => {
    try {
      return await client.request<T>({
        url,
        method: 'POST',
        data,
        ...config,
      })
    } catch (error) {
      console.log(error)
      throw error
    }
  },

  put: async <T = any>(url: string, data?: any, config?: RequestConfig) => {
    try {
      return await client.request<T>({
        url,
        method: 'PUT',
        data,
        ...config,
      })
    } catch (error) {
      console.log(error)
      return null
    }
  },
  delete: async <T = any>(url: string, data?: any, config?: RequestConfig) => {
    try {
      return await client.request<T>({
        url,
        method: 'DELETE',
        data,
        ...config,
      })
    } catch (error) {
      console.log(error)
      return null
    }
  },
}

export default client
