import { REQUEST_TIMEOUT } from '@/config/constants'
import axios from 'axios'

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

export const PATH_URL = import.meta.env.VITE_API_BASE_PATH

const abortControllerMap: Map<string, AbortController> = new Map()

const axiosInstance: AxiosInstance = axios.create({
  timeout: REQUEST_TIMEOUT,
  baseURL: PATH_URL
})

axiosInstance.interceptors.request.use((res: InternalAxiosRequestConfig) => {
  const controller = new AbortController()
  const url = res.url || ''
  res.signal = controller.signal
  abortControllerMap.set(
    url,
    controller
  )

  const token = localStorage.getItem('Authorization')
  const chainId = localStorage.getItem('D11-Chain-Id')
  res.headers.set('Authorization', token)
  res.headers.set('D11-Chain-Id', chainId)
  
  return res
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
  get: <T = any>(url: string, params?: any, config?: RequestConfig) => {
    try {
      return client.request<T>({
        url,
        method: 'GET',
        params,
        ...config
      })
    } catch (error) {
      console.log(error)
      return null
    }
    
  },

  post: <T = any>(url: string, data?: any, config?: RequestConfig) => {
    try {
      return client.request<T>({
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

  put: <T = any>(url: string, data?: any, config?: RequestConfig) => {
    try {
      return client.request<T>({
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
