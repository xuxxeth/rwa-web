import { useEffect, useState, useCallback, useMemo } from 'react'
import { kycApi } from '@/service/kyc/api'
import axios from 'axios'
import type { FilePutMimeType } from '@/service/kyc/types'
import storage from '@/utils/storage'
import { useTranslation } from '@/hooks/useTranslation'
import { cn } from '@/utils'
import { useDropzone, type FileRejection } from 'react-dropzone'
import { LazyImage } from '@/components/image/LazyImage'
import { SpinLoading, CircularProgress } from '@/components/loading'

export interface IUploadedRes {
  success: boolean
  url?: string
  key?: string
}

export interface IUploadedResV2 {
  success: boolean
  key?: string
  blobUrl?: string
}

export function checkImgUploaded(uploadedRes: IUploadedRes | null) {
  return uploadedRes?.key && uploadedRes?.url
}

export const AcceptedImageFiles = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/jpg': ['.jpg'],
  'image/png': ['.png'],
}

export const AcceptedFiles = {
  ...AcceptedImageFiles,
  'application/pdf': ['.pdf'],
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
  fileType: UploadFileType,
  key?: string
): [IUploadedRes | null, (res: IUploadedRes | null) => void] {
  const [uploadedRes, setUploadedRes] = useState<IUploadedRes | null>(() => {
    if (!key) return null
    return {
      success: true,
      key,
    }
  })

  const onUploaded = (res: IUploadedRes | null) => {
    setUploadedRes(res)
  }

  useEffect(() => {
    if (!key) return
    if (uploadedRes?.key === key) return
    getUploadedFileUrl(key).then(res => {
      if (res) {
        setUploadedRes({ success: true, ...res[0] })
      }
    })
  }, [key])

  return [uploadedRes, onUploaded]
}

// 2M
const MAX_FILE_SIZE = 1024 * 1024 * 2

export function useUploadedArrRes(props: {
  fileType: UploadFileType
  keys?: string[]
}): [
  Array<IUploadedRes | null>,
  (idx: number, res: IUploadedRes | null) => void,
  () => void,
  (idx: number) => void,
] {
  const [uploadedRes, setUploadedRes] = useState<Array<IUploadedRes | null>>(() => {
    if (!props.keys || props.keys.length === 0) return [null]
    return props.keys.map(key => ({ success: true, key }))
  })
  // const [isFetched, setIsFetched] = useState(false)

  const onUploaded = (idx: number, res: IUploadedRes | null) => {
    setUploadedRes(prev => {
      const newRes = [...prev]
      newRes[idx] = res
      return newRes
    })
  }

  useEffect(() => {
    if (!props.keys || props.keys.length === 0) return
    getUploadedFileUrl(props.keys).then(res => {
      if (res) {
        setUploadedRes(res.map(item => ({ success: true, ...item })))
      }
      // setIsFetched(true)
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

export class LivenessCheckError extends Error {
  constructor(message: string | null) {
    super(message ?? 'Liveness check failed.')
    this.name = 'LivenessCheckError'
  }
}

export const uploadFile = async (
  file: File,
  onProgress: (progress: number) => void,
  shouldCheckLiveness: boolean = false,
  step: number = 1
): Promise<{ success: boolean; key: string } | null> => {
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

    if (shouldCheckLiveness) {
      const { data: isValid, message } = await kycApi.validateLivenessImage(data.key, step)
      if (!isValid) {
        throw new LivenessCheckError(message)
      }
    }

    return { success: true, key: data.key }
  } catch (error) {
    throw error
  }
}

export const KYC_UPLOAD_STORAGE_KEY = 'kyc_upload_key'

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

export async function getUploadedFileUrl(keys: string | string[]) {
  try {
    keys = Array.isArray(keys) ? keys.join(',') : keys
    const accessUrl = await getFileAccessUrl(keys)
    if (!accessUrl) return []
    return accessUrl
  } catch (error) {
    console.error('Failed to get key from keys', keys)
    return []
  }
}

export function UploadCardAdd(props: { onClick: () => void; mode?: 'edit' | 'view' }) {
  return (
    <button
      type='button'
      disabled={props.mode === 'view'}
      onClick={props.onClick}
      className={cn(
        'w-full h-[262px] flex flex-row items-center justify-center rounded-lg border border-[#5B5B5B] border-dashed',
        props.mode === 'view' ? 'cursor-not-allowed disabled' : 'cursor-pointer'
      )}
    >
      <LazyImage
        src='/images/icons/identity/add.png'
        className={cn('w-6 h-6 cursor-pointer', { 'cursor-not-allowed': props.mode === 'view' })}
      />
    </button>
  )
}

export function UploadCard(props: {
  fileType: UploadFileType
  s3Key?: string
  onUploaded: (res: IUploadedResV2) => void
  mode?: 'edit' | 'view'
  shouldCheckLiveness?: boolean
  onlyImageMimeType?: boolean
  step?: number
}) {
  const { fileType, onUploaded, onlyImageMimeType, s3Key, mode } = props

  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)

  const [isHover, setIsHover] = useState(false)

  const [previewUrl, setPreviewUrl] = useState<{ key: string; url: string } | null>(null)

  const [isFileTooLarge, setIsFileTooLarge] = useState(false)
  const [isUploadFailed, setIsUploadFailed] = useState(false)
  const [isLivenessCheckFailed, setIsLivenessCheckFailed] = useState(false)

  const [isPdf, setIsPdf] = useState(false)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return
    const file = acceptedFiles[0]

    const isFilePdf = file.type === 'application/pdf'
    setIsPdf(isFilePdf)

    setIsUploading(true)
    setUploadProgress(0)
    setIsFileTooLarge(false)
    setIsUploadFailed(false)
    setIsLivenessCheckFailed(false)

    try {
      const result = await uploadFile(
        file,
        progress => {
          setUploadProgress(progress)
        },
        props.shouldCheckLiveness,
        props.step
      )

      if (result && result.success && result.key) {
        const blobUrl = isFilePdf ? '' : URL.createObjectURL(file)
        onUploaded({ ...result, blobUrl })

        // 上传成功后，生成预览 URL, 优先使用本地的 url
        if (result && !isFilePdf) {
          setPreviewUrl({
            key: result.key,
            url: blobUrl,
          })
        }
      }
    } catch (error) {
      if (error instanceof LivenessCheckError) {
        setIsLivenessCheckFailed(true)
      } else {
        setIsUploadFailed(true)
      }

      // 上传失败时，不调用 onUploaded 函数，保持当前状态
      // onUploaded({ success: false })
    } finally {
      setIsUploading(false)
    }
  }, [])

  const onDropRejected = (fileRejections: FileRejection[]) => {
    if (fileRejections.length > 0) {
      const { errors } = fileRejections[0]
      if (errors.length > 0) {
        const { code } = errors[0]
        if (code === 'file-too-large') {
          setIsFileTooLarge(true)
        }
      }
    }
  }

  const { getRootProps, getInputProps } = useDropzone({
    // disables SPACE/ENTER to open the native file selection dialog
    noKeyboard: true,
    accept: onlyImageMimeType ? AcceptedImageFiles : AcceptedFiles,
    onDrop,
    onDropRejected,
    disabled: isUploading || mode === 'view',
    maxSize: MAX_FILE_SIZE,
  })

  useEffect(() => {
    if (!s3Key) {
      setPreviewUrl(null)
      return
    }
    //  如果本地已经有了 previewUrl 且 key 相同，直接返回
    if (previewUrl && s3Key === previewUrl.key) return

    getUploadedFileUrl(s3Key).then(urls => {
      if (urls.length > 0) {
        const url = urls[0].url

        const isFilePdf = s3Key.includes('.pdf')
        setIsPdf(isFilePdf)
        setPreviewUrl({ key: s3Key, url: url })
      }
    })
  }, [s3Key])

  const isSomethingError = isFileTooLarge || isUploadFailed || isLivenessCheckFailed

  return (
    <>
      <div
        {...getRootProps({
          className: cn(
            'dropzone flex-1 border border-[#5B5B5B] border-dashed cursor-pointer h-[262px] rounded-lg disabled:cursor-not-allowed bg-[#1A1A1A] relative',
            mode === 'view' ? 'disabled cursor-not-allowed' : 'hover:border-[rgba(26,133,255,1)]',
            isSomethingError ? 'border-[#CA3F64]' : ''
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
          ) : previewUrl ? (
            <>
              <LazyImage
                src={isPdf ? '/images/icons/identity/pdf.png' : previewUrl.url}
                className='rounded-lg'
                style={{ opacity: isHover ? 0.1 : 1, maxWidth: '100%', maxHeight: '100%' }}
              />
              {mode === 'edit' && isHover && (
                <button
                  type='button'
                  className='absolute bg-[#0E0E0E] rounded-lg cursor-pointer left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 p-4'
                >
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
        {isSomethingError && (
          <div className='mt-2 flex flex-row items-center gap-1'>
            <LazyImage className='w-3.5 h-3.5' src='/images/icons/identity/error2.png' />
            <Text
              text={isFileTooLarge ? 'large' : isLivenessCheckFailed ? 'livenessFail' : 'fail'}
              className='text-xs text-[#CA3F64]'
            />
          </div>
        )}
      </div>
    </>
  )
}
