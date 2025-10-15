import { LazyImage } from '@/components/image/LazyImage'
import { useTranslation } from '@/hooks/useTranslation'
import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { SpinLoading, CircularProgress } from '@/components/loading'
import { cn } from '@/utils'

function AddressUpload() {
  return (
    <div className='w-[600px] relative'>
      <UploadTitleDesc desc={'uploadAddress'} />
      <UploadSubTitleDesc desc={'uploadAddressDesc1'} />
      <ul className='list-disc pl-5'>
        {Array.from({ length: 5 }).map((_, index) => (
          <li key={index} className='text-lg/7 font-normal text-60'>
            <UploadSubTitleDesc className='mt-0' desc={`uploadAddressDesc${index + 2}`} />
          </li>
        ))}
      </ul>
      <UploadSubTitleDesc className='mt-0' desc={'uploadAddressDesc7'} />
      <div className='mt-10'>
        <UploadCard title={'addressProof'} />
      </div>
      <UploadSupportedDesc />
      <div className='mt-10'>
        <ContinueBtn disabled={false} handleClick={() => {}} />
      </div>
    </div>
  )
}

export function Upload({ type }: { type: 'identity' | 'address' }) {
  if (type === 'identity') {
    return <IdentityUpload />
  }
  if (type === 'address') {
    return <AddressUpload />
  }
  return null
}

// 需要根据身份证还是护照来区别展示
function IdentityUpload(props: {}) {
  const { t } = useTranslation()
  const [requirementReaded, setRequirementReaded] = useState(false)

  const handleClick = () => {
    if (!requirementReaded) {
      setRequirementReaded(true)
      return
    }
  }

  return (
    <div className='w-[600px] relative'>
      {!requirementReaded ? (
        <IdentityUploadRequireInfo />
      ) : (
        <div className='mb-10'>
          <UploadTitleDesc desc={'uploadYourDoc'} />
          <UploadSubTitleDesc desc={'uploadYourDocDesc'} />
          <div className='mt-10 flex flex-col gap-6'>
            <UploadCard title='frontSide' />
            <UploadCard title='backSide' />
          </div>
          <UploadSupportedDesc />
        </div>
      )}
      <ContinueBtn disabled={false} handleClick={handleClick} />
    </div>
  )
}

function ContinueBtn({ handleClick, disabled }: { handleClick: () => void; disabled: boolean }) {
  const { t } = useTranslation()
  return (
    <button
      disabled={false}
      onClick={handleClick}
      className='w-full bg-white rounded-2xl text-base/6 font-semibold h-14 py-2 px-6 text-black cursor-pointer disabled:bg-[rgba(50,64,84,1)] disabled:text-[rgba(108,134,173,1)]'
    >
      {t('identity.continue')}
    </button>
  )
}

function UploadTitleDesc({ desc }: { desc: string }) {
  const { t } = useTranslation()
  return <div className='text-2xl/9 font-normal'>{t(`${identityUploadLangPrefix}.${desc}`)}</div>
}

function UploadSubTitleDesc({ desc, className }: { desc: string; className?: string }) {
  const { t } = useTranslation()
  return (
    <div className={cn('text-lg/7 font-normal text-60 mt-2', className)}>
      {t(`${identityUploadLangPrefix}.${desc}`)}
    </div>
  )
}

function UploadSupportedDesc() {
  const { t } = useTranslation()
  return (
    <div className='text-base/6 font-normal text-60 mt-6 text-center'>
      {t(`${identityUploadLangPrefix}.supportedFileDesc`)}
    </div>
  )
}

const identityUploadLangPrefix = 'identity.identityUpload'

const AcceptedFiles = {
  'image/png': ['.png'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/jpg': ['.jpg'],
  'image/webp': ['.webp'],
}

const uploadFile = async (
  file: File,
  onProgress: (progress: number) => void
): Promise<{ success: boolean; url: string }> => {
  return new Promise((resolve, reject) => {
    // 模拟上传过程
    // let progress = 0
    // const interval = setInterval(() => {
    //   progress += Math.random() * 15 + 5
    //   if (progress >= 100) {
    //     progress = 100
    //     clearInterval(interval)
    //     setTimeout(() => {
    //       resolve({ success: true, url: URL.createObjectURL(file) })
    //     }, 300)
    //   }
    //   onProgress(progress)
    // }, 300)
    const formData = new FormData()
    formData.append('file', file)

    const xhr = new XMLHttpRequest()

    xhr.upload.onprogress = event => {
      if (event.lengthComputable) {
        const progress = (event.loaded / event.total) * 100
        onProgress(progress)
      }
    }

    xhr.onload = () => {
      if (xhr.status === 200) {
        resolve({
          success: true,
          url: URL.createObjectURL(file),
        })
      }
    }

    xhr.onerror = () => {
      reject(new Error('上传失败'))
    }

    xhr.open('POST', 'https://httpbin.org/post')

    xhr.send(formData)
  })
}

function UploadCard(props: { title: string }) {
  const { title } = props
  const { t } = useTranslation()

  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploadResult, setUploadResult] = useState<{ success: boolean; url?: string } | null>(null)

  const [previewUrl, setPreviewUrl] = useState<string | undefined>(undefined)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return
    const file = acceptedFiles[0]
    setUploadedFile(file)
    setUploadResult(null)
    setIsUploading(true)
    setUploadProgress(0)

    try {
      const result = await uploadFile(file, progress => {
        setUploadProgress(progress)
      })
      setUploadResult(result)
    } catch (error) {
      console.error('上传失败:', error)
      setUploadResult({ success: false })
    } finally {
      setIsUploading(false)
    }
  }, [])

  const { acceptedFiles, getRootProps, getInputProps } = useDropzone({
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
          className:
            'dropzone w-full border border-white/30 border-dashed h-[130px] rounded-lg cursor-pointer p-6 hover:border-[rgba(26,133,255,1)]',
        })}
      >
        <input {...getInputProps()} />
        <div className='flex flex-row items-center gap-4'>
          <div
            onClick={event => {
              if (uploadResult?.success) {
                event.stopPropagation()
                setPreviewUrl(uploadResult.url)
              }
            }}
            className='w-20 h-20 rounded-lg bg-white/10 flex flex-row items-center justify-center'
          >
            {uploadResult?.success ? (
              <LazyImage className='w-[68px] h-[68px]' src={uploadResult.url || ''} />
            ) : isUploading ? (
              <CircularProgress className='text-[rgba(26,133,255,1)]' progress={uploadProgress} />
            ) : (
              <LazyImage className='w-4' src='/images/icons/identity/file.png' />
            )}
          </div>
          <div>
            <div className='text-base/6 font-medium mb-2'>
              {t(`${identityUploadLangPrefix}.${title}`)}
            </div>
            {uploadResult ? (
              uploadResult.success ? (
                <UploadStatus icon='/images/icons/identity/check-right.png' text='uploaded' />
              ) : (
                <UploadStatus icon='/images/icons/identity/error-circle.png' text='failed' />
              )
            ) : isUploading ? (
              <div className='flex flex-row items-center gap-2'>
                <SpinLoading className='w-5 h-5' />
                <span className='text-60 text-sm/5.5 font-normal'>
                  {t(`${identityUploadLangPrefix}.uploading`)}
                </span>
              </div>
            ) : (
              <div className='mt-2 text-base/5.5 font-normal text-60'>
                <span className='mr-1 text-[rgba(26,133,255,1)]'>
                  {t(`${identityUploadLangPrefix}.upload`)}
                </span>
                <span>{t(`${identityUploadLangPrefix}.uploadDesc`)}</span>
              </div>
            )}
          </div>
          {uploadResult?.success && (
            <div className='ml-auto'>
              <LazyImage
                onClick={event => {
                  event.stopPropagation()
                  setUploadResult(null)
                }}
                className='w-4 cursor-pointer'
                src='/images/icons/identity/trash.png'
                alt=''
              />
            </div>
          )}
        </div>
      </div>
      {previewUrl && (
        <ImagePreview
          url={previewUrl}
          title={title}
          onPreviewClose={() => setPreviewUrl(undefined)}
        />
      )}
    </>
  )
}

function ImagePreview(props: { url: string; title: string; onPreviewClose: () => void }) {
  const { t } = useTranslation()
  const { url, title, onPreviewClose } = props
  return (
    <div className='w-full h-[800px]'>
      <div className='w-full h-[600px] absolute left-0 top-0 rounded-2xl bg-[#06070A] p-6'>
        <div className='flex flex-row mb-6 justify-between'>
          <span className='text-base/6 font-medium'>
            {t(`${identityUploadLangPrefix}.${title}`)}
          </span>
          <LazyImage
            onClick={onPreviewClose}
            className='w-4 h-4 cursor-pointer rounded-lg'
            src={'/images/icons/identity/close.png'}
          />
        </div>
        <LazyImage src={url} className='w-full h-full contain' />
      </div>
    </div>
  )
}

function UploadStatus(props: { icon: string; text: string }) {
  const { t } = useTranslation()
  const { icon, text } = props
  return (
    <div className='flex flex-row gap-2'>
      <span className='w-5 h-5 p-[1.5px]'>
        <LazyImage src={icon} />
      </span>
      <span className='text-60 text-sm/5.5 font-normal'>
        {t(`${identityUploadLangPrefix}.${text}`)}
      </span>
    </div>
  )
}

function IdentityUploadRequireInfo() {
  const { t } = useTranslation()
  return (
    <div className='w-full flex flex-col gap-8 mb-8'>
      <div className='text-lg/7 font-normal'>{t(`${identityUploadLangPrefix}.tips`)}</div>
      <div>
        <LazyImage
          className='w-[303px] h-[195px] m-auto'
          src='/images/icons/identity/upload-example.png'
          alt=''
        />
        <div className='text-base/6 font-normal text-center mt-2'>
          {t(`${identityUploadLangPrefix}.clearExample`)}
        </div>
        <div>
          <LazyImage
            className='w-6 h-6 p-[4.5px] m-auto mt-1'
            src='/images/icons/identity/check-right.png'
            alt=''
          />
        </div>
      </div>
      <div className='flex flex-row justify-between px-4'>
        {[
          {
            icon: '/images/icons/identity/glare.png',
            text: 'glare',
          },
          {
            icon: '/images/icons/identity/blur.png',
            text: 'blur',
          },
          {
            icon: '/images/icons/identity/overcropped.png',
            text: 'overcropped',
          },
        ].map(({ icon, text }) => (
          <div key={text}>
            <LazyImage className={'w-[132px] h-[85px]'} src={icon} alt='' />
            <div className='text-base/6 font-normal text-center mt-2'>
              {t(`${identityUploadLangPrefix}.${text}`)}
            </div>
            <div>
              <LazyImage
                className='w-6 h-6 p-[4.5px] m-auto mt-1'
                src='/images/icons/identity/check-error.png'
                alt=''
              />
            </div>
          </div>
        ))}
      </div>
      <div>
        <ul className='list-disc list-inside text-sm/5 font-normal bg-[rgba(243,155,0,0.2)] rounded-lg px-4 py-2.5'>
          <li>{t(`${identityUploadLangPrefix}.require1`)}</li>
          <li>{t(`${identityUploadLangPrefix}.require2`)}</li>
        </ul>
      </div>
    </div>
  )
}
