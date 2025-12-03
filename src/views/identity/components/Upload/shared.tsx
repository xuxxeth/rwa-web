import { useEffect, useState, useCallback, useMemo } from 'react'
import { kycApi } from '@/service/kyc/api'
import axios from 'axios'
import type { FilePutMimeType } from '@/service/kyc/types'
import storage from '@/utils/storage'
import { useTranslation } from '@/hooks/useTranslation'
import { cn } from '@/utils'
import { useDropzone } from 'react-dropzone'
import { LazyImage } from '@/components/image/LazyImage'
import { SpinLoading, CircularProgress } from '@/components/loading'

export interface IUploadedRes {
  success: boolean
  url?: string
  key?: string
}

export function checkImgUploaded(uploadedRes: IUploadedRes | null) {
  return uploadedRes?.key && uploadedRes?.url
}

export const AcceptedFiles = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/jpg': ['.jpg'],
}

const langPrefix = 'identity.upload'

export function Text(props: { text: string; className?: string }) {
  const { t } = useTranslation()
  const { text, className } = props
  return (
    <div className={cn('text-base text-[rgba(144,144,144,1)]', className)}>
      {t(`${langPrefix}.${text}`)}
    </div>
  )
}

export function useUploadedRes(
  fileType: UploadFileType
): [IUploadedRes | null, (res: IUploadedRes | null) => void] {
  const [uploadedRes, setUploadedRes] = useState<IUploadedRes | null>(null)
  const [isFirstFetched, setIsFirstFetched] = useState(false)

  const onUploaded = (res: IUploadedRes | null) => {
    setUploadedRes(res)
  }

  const uploadedKeys = useMemo(() => {
    return uploadedRes?.key
  }, [uploadedRes])

  useEffect(() => {
    if (!isFirstFetched) return
    saveUploadKey(fileType, uploadedKeys)
  }, [uploadedKeys, isFirstFetched])

  useEffect(() => {
    getUploadedFileUrl(fileType).then(res => {
      if (res) {
        setUploadedRes({ success: true, ...res[0] })
      }
      setIsFirstFetched(true)
    })
  }, [])

  return [uploadedRes, onUploaded]
}

export function useUploadedArrRes(props: {
  fileType: UploadFileType
}): [
  Array<IUploadedRes | null>,
  (idx: number, res: IUploadedRes | null) => void,
  () => void,
  (idx: number) => void,
] {
  const [uploadedRes, setUploadedRes] = useState<Array<IUploadedRes | null>>([null])
  const [isFetched, setIsFetched] = useState(false)

  const onUploaded = (idx: number, res: IUploadedRes | null) => {
    setUploadedRes(prev => {
      const newRes = [...prev]
      newRes[idx] = res
      return newRes
    })
  }

  const uploadedKeys = useMemo(() => {
    return uploadedRes.filter(item => item?.key).map(item => item?.key) as string[]
  }, [uploadedRes])

  useEffect(() => {
    if (!isFetched) return
    if (uploadedKeys.length > 0) {
      saveUploadKey('addressCertificates', uploadedKeys)
    } else {
      saveUploadKey('addressCertificates', null)
    }
  }, [uploadedKeys, isFetched])

  useEffect(() => {
    getUploadedFileUrl('addressCertificates').then(res => {
      if (res) {
        setUploadedRes(res.map(item => ({ success: true, ...item })))
      }
      setIsFetched(true)
    })
  }, [])

  const onAdd = () => setUploadedRes([...uploadedRes, null])
  const onDelete = (idx: number) => setUploadedRes(uploadedRes.filter((_, i) => i !== idx))

  return [uploadedRes, onUploaded, onAdd, onDelete]
}

export const getFileAccessUrl = async (key: string) => {
  try {
    const { data: accessUrls } = await kycApi.getFileAccessUrl(key)
    return accessUrls
  } catch (error) {
    return undefined
  }
}

export const uploadFile = async (
  file: File,
  onProgress: (progress: number) => void
): Promise<{ success: boolean; url: string; key: string } | null> => {
  try {
    const fileType = file.type as FilePutMimeType
    const fileName = file.name
    const { data } = await kycApi.getFilePutUrl(fileType, fileName)

    if (!data || !data.url) {
      throw new Error('Failed to get pre-signed URL.')
    }
    // 使用预签名 URL 上传文件到 S3
    // 这里直接使用原始的 `axios` 实例，而不是封装的 `client`，
    // 是因为上传到 S3 预签名 URL 是一个特殊请求。
    // 封装的 `client` 包含全局拦截器（如添加认证头或 baseURL），
    // 这些拦截器会干扰 S3 的上传过程，导致请求失败。
    await axios.put(data.url, file, {
      headers: {
        // Content-Type 必须与生成预签名 URL 时指定的完全一致
        'Content-Type': fileType,
      },
      onUploadProgress: processEvent => {
        const { loaded, total } = processEvent
        if (total) {
          const percentCompleted = Math.round((loaded * 100) / total)
          onProgress(percentCompleted)
        }
      },
    })

    const accessUrl = await getFileAccessUrl(data.key)

    if (accessUrl) {
      return { success: true, url: accessUrl[0].url, key: data.key }
    }

    throw new Error('Failed to get access URL.')
  } catch (error) {
    throw error
  }
}

const KYC_UPLOAD_STORAGE_KEY = 'kyc_upload_key'

export type UploadFileType =
  | 'idFront'
  | 'idBack'
  | 'idMerged'
  | 'passport'
  | 'addressCertificates'
  | 'incomeCertificates'

type StorageData = {
  [key in UploadFileType]?: string | string[]
}

export const saveUploadKey = (
  storageKey: UploadFileType,
  fileKey: string | string[] | undefined | null
) => {
  try {
    const item = (storage.getItem(KYC_UPLOAD_STORAGE_KEY) || {}) as StorageData
    if (fileKey) {
      item[storageKey] = fileKey
      storage.setItem(KYC_UPLOAD_STORAGE_KEY, item)
    } else if (Object.hasOwnProperty.call(item, storageKey)) {
      delete item[storageKey]
      storage.setItem(KYC_UPLOAD_STORAGE_KEY, item)
    }
  } catch (error) {
    console.error('Failed to save key to local storage', error)
  }
}

export async function getUploadedFileUrl(storageKey: UploadFileType) {
  try {
    const item = (storage.getItem(KYC_UPLOAD_STORAGE_KEY) || {}) as StorageData
    let s3Key = item[storageKey]
    if (s3Key) {
      s3Key = Array.isArray(s3Key) ? s3Key.join(',') : s3Key
      const accessUrl = await getFileAccessUrl(s3Key)
      if (accessUrl) {
        return accessUrl
      }
    }
    return null
  } catch (error) {
    console.error('Failed to get key from local storage', error)
    return null
  }
}

export function UploadCardAdd(props: { onClick: () => void }) {
  return (
    <div
      onClick={props.onClick}
      className='w-full h-[262px] flex flex-row items-center justify-center rounded-lg border border-[#5B5B5B] border-dashed'
    >
      <LazyImage src='/images/icons/identity/add.png' className='w-6 h-6 cursor-pointer' />
    </div>
  )
}

export function UploadCard(props: {
  fileType: UploadFileType
  uploadedRes: IUploadedRes | null
  onUploaded: (res: IUploadedRes | null) => void
}) {
  const { fileType, onUploaded, uploadedRes } = props

  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)

  const [isHover, setIsHover] = useState(false)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return
    const file = acceptedFiles[0]
    onUploaded(null)
    setIsUploading(true)
    setUploadProgress(0)

    try {
      const result = await uploadFile(file, progress => {
        setUploadProgress(progress)
      })
      onUploaded(result)
    } catch (error) {
      console.error('上传失败:', error)
      onUploaded({ success: false })
    } finally {
      setIsUploading(false)
    }
  }, [])

  const { getRootProps, getInputProps } = useDropzone({
    // disables SPACE/ENTER to open the native file selection dialog
    noKeyboard: true,
    accept: AcceptedFiles,
    onDrop,
    disabled: isUploading,
  })

  return (
    <>
      <div
        {...getRootProps({
          className: cn(
            'dropzone flex-1 border border-[#5B5B5B] border-dashed h-[262px] rounded-lg cursor-pointer bg-[#1A1A1A] hover:border-[rgba(26,133,255,1)] relative'
          ),
        })}
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
      >
        <input {...getInputProps()} />
        <div className='w-full h-full flex flex-col items-center justify-center gap-4'>
          {isUploading ? (
            <>
              <CircularProgress className='text-[rgba(26,133,255,1)]' progress={uploadProgress} />
              <div className='flex flex-row gap-2 items-center justify-center'>
                <SpinLoading className='w-5 h-5' />
                <Text text='uploading' className='text-sm text-60' />
              </div>
            </>
          ) : uploadedRes?.url ? (
            <>
              <LazyImage
                src={uploadedRes.url}
                className='rounded-lg'
                style={{ opacity: isHover ? 0.1 : 1 }}
              />
              {isHover && (
                <button className='absolute bg-[#0E0E0E] rounded-lg cursor-pointer left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 p-4'>
                  <Text text='reUpload' className='text-sm text-white' />
                </button>
              )}
            </>
          ) : (
            <>
              <LazyImage className='w-4.5 h-4.5' src='/images/icons/identity/upload.png' />
              {['idFront', 'idBack'].includes(fileType) && (
                <Text text={fileType} className='text-base' />
              )}
              <div className='flex flex-row gap-1'>
                <Text text='clickUpload' className='text-sm text-[rgba(41,98,255,1)]' />
                <Text text='dragUpload' className='text-sm' />
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
