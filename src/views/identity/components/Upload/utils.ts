import { kycApi } from '@/service/kyc/api'
import axios from 'axios'
import type { FilePutMimeType } from '@/service/kyc/types'

export const AcceptedFiles = {
    // 'image/png': ['.png'],
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/jpg': ['.jpg'],
    // 'image/webp': ['.webp'],
}

export const getFileAccessUrl = async (key: string) => {
    try {
        const { data: accessUrlRes } = await kycApi.getFileAccessUrl(key)
        const accessUrl = accessUrlRes.find((item) => item.key === key)?.url
        return accessUrl
    } catch (error) {
        return undefined
    }
}

export const uploadFile = async (
    file: File,
    onProgress: (progress: number) => void
): Promise<{ success: boolean; url: string } | null> => {
    try {
        const fileType = file.type as FilePutMimeType
        const fileName = file.name
        const { data } = await kycApi.getFilePutUrl(fileType, fileName)

        if (!data || !data.url) {
            console.error('Failed to get pre-signed URL.')
            return null
        }

        // 使用预签名 URL 上传文件到 S3
        // 这里直接使用原始的 `axios` 实例，而不是封装的 `client`，
        // 是因为上传到 S3 预签名 URL 是一个特殊请求。
        // 封装的 `client` 包含全局拦截器（如添加认证头或 baseURL），
        // 这些拦截器会干扰 S3 的上传过程，导致请求失败。
        await axios.put(data.url, file, {
            headers: {
                // Content-Type 必须与生成预签名 URL 时指定的完全一致
                'Content-Type': fileType
            },
            onUploadProgress: (processEvent) => {
                const { loaded, total } = processEvent
                if (total) {
                    const percentCompleted = Math.round((loaded * 100) / total)
                    onProgress(percentCompleted)
                }
            }
        })

        const { data: accessUrlRes } = await kycApi.getFileAccessUrl(data.key)

        const accessUrl = accessUrlRes.find((item) => item.key === data.key)?.url

        if (accessUrl) {
            return { success: true, url: accessUrl }
        }

        return null
    } catch (error) {
        return null
    }
}