import {
  CA_LANGUAGE,
  CODE_TO_HANDLER,
  CONNECT_ACCOUNT,
  REQUEST_TIMEOUT,
  type ErrorHandlers,
} from '@/config/constants'
import axios from 'axios'
import type {
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosRequestConfig,
  AxiosInstance,
  AxiosRequestHeaders,
  AxiosError,
} from 'axios'
import storage from '@/utils/storage'
import { CONNECT_STATE_KEY } from 'ca-common-web'

// 从本地存储中获取连接状态, 这个会比 react state 优先更新
function getConnectStateFromStorage(): {
  account: string
  chainId: number | null
  isChainSupported: boolean
} {
  try {
    const connectState = storage.getItem(CONNECT_STATE_KEY) || {}
    return {
      account: connectState.accounts?.[0] || '',
      chainId: connectState.chainId || null,
      isChainSupported: connectState.isChainSupported || false,
    }
  } catch(error) {
    return {
      account: '',
      chainId: null,
      isChainSupported: false,
    }
  }
}

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
// /v1/base/public/stock/indicators?stockId=1
const AUTH_URL_PREFIX = ['/scan/api/', '/kyc/api/', '/uc/api', '/risk/api/', '/ref/api/'] // 需要授权的接口前缀列表
const NO_CHAIN_ID_HEADER_URL_SUFFIX = ['/base/public/chains', '/base/public/tokens']
const NO_SUPPORTED_CHAIN_URL_SUFFIX = ['/v1/uc/api/agreements/accept'] // 不支持的链的接口后缀列表

function handleReqSignature(req: InternalAxiosRequestConfig, controller: AbortController, account: string) {
  const url = req.url || ''
  const needAuth = AUTH_URL_PREFIX.some(prefix => url.includes(prefix))
  const localSignature = account ? storage.getItem(`signature_${account.toLowerCase()}`) : null
  if (
    (needAuth && (!localSignature || !localSignature?.account || !localSignature?.expires)) ||
    Number(localSignature?.expires) < Math.floor(Date.now() / 1000)
  ) {
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
  
}

function handleReqChainIdHeader(req: InternalAxiosRequestConfig, chainId: number | null, isChainSupported: boolean) {
  const url = req.url || ''
  if (NO_CHAIN_ID_HEADER_URL_SUFFIX.some(suffix => url.includes(suffix))) {
    return
  }
  if (chainId && isChainSupported) {
    req.headers.set('CA-Chain-Id', chainId)
  }
}

function handleReqLanguageHeader(req: InternalAxiosRequestConfig) {
  const lng = storage.getItem(CA_LANGUAGE) || 'en'
  req.headers.set('Accept-Language', lng)
}

axiosInstance.interceptors.request.use((req: InternalAxiosRequestConfig) => {
  const controller = new AbortController()
  const url = req.url || ''

  req.signal = controller.signal
  abortControllerMap.set(url, controller)
  const { account, chainId, isChainSupported } = getConnectStateFromStorage()

  // 拦截住不支持的 chain 的请求
  // 签署协议，不区分链，不需要拦截
  if (chainId && !isChainSupported && !NO_SUPPORTED_CHAIN_URL_SUFFIX.some(suffix => url.includes(suffix))) {
    controller.abort()
    return Promise.reject(new axios.Cancel(`Chain ID ${chainId} is not supported`))
  }
  // const chainId = localStorage.getItem(LAST_CONNECTED_CHAIN_ID) 

  handleReqSignature(req, controller, account)
  handleReqChainIdHeader(req, chainId, isChainSupported)
  handleReqLanguageHeader(req)

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
