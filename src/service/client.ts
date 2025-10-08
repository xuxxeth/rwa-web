import { REQUEST_TIMEOUT } from '@/config/constants'
import axios from 'axios'
import { bscTestnet } from '@/hooks/useCaCommon'

import type {
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosRequestConfig,
  AxiosInstance,
  AxiosRequestHeaders,
  AxiosError
} from 'axios'

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
}
// 通用接口响应结构
export interface ApiResponse<T> {
  code: number
  data: T
  message: string | null
}

export const PATH_URL = import.meta.env.DEV ? '' : import.meta.env.VITE_API_BASE

const abortControllerMap: Map<string, AbortController> = new Map()

const axiosInstance: AxiosInstance = axios.create({
  timeout: REQUEST_TIMEOUT,
  baseURL: PATH_URL
})

axiosInstance.interceptors.request.use((req: InternalAxiosRequestConfig) => {
  const controller = new AbortController()
  const url = req.url || ''
  req.signal = controller.signal
  abortControllerMap.set(
    url,
    controller
  )

  const token = localStorage.getItem('Authorization')
  const chainId = localStorage.getItem('D11-Chain-Id') ?? bscTestnet.id
  req.headers.set('Authorization', token)
  
  req.headers.set('D11-Chain-Id', chainId)
  // 接口用的 header 字段是 chainId
  // req.headers.set('chainId', chainId)
  
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
    console.log('err： ' + error) // for debug
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
        .then((res) => resolve(res.data))
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
        ...config
      })
    } catch (error) {
      console.log(error)
      throw error
      // return null
    }
    
  },

  post: async <T = any>(url: string, data?: any, config?: RequestConfig) => {
    try {
      return await client.request<T>({
        url,
        method: 'POST',
        data,
        ...config
      })
    } catch (error) {
      console.log(error)
      return null
    }
  },

  put: async <T = any>(url: string, data?: any, config?: RequestConfig) => {
    try {
      return await client.request<T>({
        url,
        method: 'PUT',
        data,
        ...config
      })
    } catch (error) {
      console.log(error)
      return null
    }
  }
}

export default client
