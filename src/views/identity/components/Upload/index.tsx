import { LazyImage } from '@/components/image/LazyImage'
import { useTranslation } from '@/hooks/useTranslation'
import { useCallback, useEffect, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { SpinLoading, CircularProgress } from '@/components/loading'
import { cn, mergeImagesFromUrls } from '@/utils'
import { AcceptedFiles, uploadFile } from './utils'

function AddressUpload() {
    const [uploadedRes, setUploadedRes] = useState<IUploadedRes | null>(null)

    return (
        <div className='w-[600px] relative'>
            <Title desc={'uploadAddress'} />
            <SubTitle desc={'uploadAddressDesc1'} />
            <ul className='list-disc pl-5'>
                {Array.from({ length: 5 }).map((_, index) => (
                    <li key={index} className='text-lg/7 font-normal text-60'>
                        <SubTitle className='mt-0' desc={`uploadAddressDesc${index + 2}`} />
                    </li>
                ))}
            </ul>
            <SubTitle className='mt-0' desc={'uploadAddressDesc7'} />
            <div className='mt-10'>
                <UploadCard title={'addrProof'} uploadedRes={uploadedRes} onUploaded={setUploadedRes} />
            </div>
            <SupportedFiles />
            <div className='mt-10'>
                <ContinueBtn disabled={false} handleClick={() => { }} />
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

interface IUploadedRes {
    success: boolean
    url?: string
}

// 需要根据身份证还是护照来区别展示
function IdentityUpload(props: {}) {
    const [requirementReaded, setRequirementReaded] = useState(false)

    const [uploadedRes, setUploadedRes] = useState<Array<IUploadedRes | null>>([null, null])

    const [mergedFileUrl, setMergedFileUrl] = useState('')

    useEffect(() => {
        const uploadedSuccessCount = uploadedRes.filter((res) => res?.success).length
        if (uploadedSuccessCount === 2) {
            mergeImagesFromUrls(uploadedRes[0]?.url!, uploadedRes[1]?.url!).then(file => {
                const url = URL.createObjectURL(file)
                setMergedFileUrl(url)
            }).catch(error => {
                console.log('merged file error', error)
            })
        }
    }, [uploadedRes])

    const onUploaded = (index: number) => {
        return (res: IUploadedRes | null) => {
            setUploadedRes((prev) => {
                const newUploadedRes = [...prev]
                newUploadedRes[index] = res
                return newUploadedRes
            })
        }
    }

    const handleClick = () => {
        if (!requirementReaded) {
            setRequirementReaded(true)
            return
        }
    }

    return (
        <div className='w-[600px] relative'>
            {!requirementReaded ? (
                <RequiredInfo />
            ) : (
                <div className='mb-10'>
                    <Title desc={'uploadYourDoc'} />
                    <SubTitle desc={'uploadYourDocDesc'} />
                    <div className='mt-10 flex flex-col gap-6'>
                        <UploadCard title='frontSide' onUploaded={onUploaded(0)} uploadedRes={uploadedRes[0]} />
                        <UploadCard title='backSide' onUploaded={onUploaded(1)} uploadedRes={uploadedRes[1]} />
                    </div>
                    <SupportedFiles />
                    {mergedFileUrl && <div><LazyImage src={mergedFileUrl} alt='merged file' /></div>}
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

function Title({ desc }: { desc: string }) {
    const { t } = useTranslation()
    return <div className='text-2xl/9 font-normal'>{t(`${langPrefix}.${desc}`)}</div>
}

function SubTitle({ desc, className }: { desc: string; className?: string }) {
    const { t } = useTranslation()
    return (
        <div className={cn('text-lg/7 font-normal text-60 mt-2', className)}>
            {t(`${langPrefix}.${desc}`)}
        </div>
    )
}

function SupportedFiles() {
    const { t } = useTranslation()
    return (
        <div className='text-base/6 font-normal text-60 mt-6 text-center'>
            {t(`${langPrefix}.supportedFileDesc`)}
        </div>
    )
}

const langPrefix = 'identity.identityUpload'





function UploadCard(props: { title: string, uploadedRes: IUploadedRes | null, onUploaded: (res: IUploadedRes | null) => void }) {
    const { title, onUploaded, uploadedRes } = props
    const { t } = useTranslation()

    const [uploadProgress, setUploadProgress] = useState(0)
    const [isUploading, setIsUploading] = useState(false)

    const [previewUrl, setPreviewUrl] = useState<string | undefined>(undefined)

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
                            if (uploadedRes?.success) {
                                event.stopPropagation()
                                setPreviewUrl(uploadedRes.url)
                            }
                        }}
                        className='w-20 h-20 rounded-lg bg-white/10 flex flex-row items-center justify-center'
                    >
                        {uploadedRes?.success ? (
                            <LazyImage className='w-[68px] h-[68px]' src={uploadedRes.url || ''} />
                        ) : isUploading ? (
                            <CircularProgress className='text-[rgba(26,133,255,1)]' progress={uploadProgress} />
                        ) : (
                            <LazyImage className='w-4' src='/images/icons/identity/file.png' />
                        )}
                    </div>
                    <div>
                        <div className='text-base/6 font-medium mb-2'>
                            {t(`${langPrefix}.${title}`)}
                        </div>
                        {uploadedRes ? (
                            uploadedRes.success ? (
                                <UploadStatus icon='/images/icons/identity/check-right.png' text='uploaded' />
                            ) : (
                                <UploadStatus icon='/images/icons/identity/error-circle.png' text='failed' />
                            )
                        ) : isUploading ? (
                            <div className='flex flex-row items-center gap-2'>
                                <SpinLoading className='w-5 h-5' />
                                <span className='text-60 text-sm/5.5 font-normal'>
                                    {t(`${langPrefix}.uploading`)}
                                </span>
                            </div>
                        ) : (
                            <div className='mt-2 text-base/5.5 font-normal text-60'>
                                <span className='mr-1 text-[rgba(26,133,255,1)]'>
                                    {t(`${langPrefix}.upload`)}
                                </span>
                                <span>{t(`${langPrefix}.uploadDesc`)}</span>
                            </div>
                        )}
                    </div>
                    {uploadedRes?.success && (
                        <div className='ml-auto'>
                            <LazyImage
                                onClick={event => {
                                    event.stopPropagation()
                                    onUploaded(null)
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
                        {t(`${langPrefix}.${title}`)}
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
                {t(`${langPrefix}.${text}`)}
            </span>
        </div>
    )
}

// 上传要求组件
function RequiredInfo() {
    const { t } = useTranslation()
    return (
        <div className='w-full flex flex-col gap-8 mb-8'>
            <div className='text-lg/7 font-normal'>{t(`${langPrefix}.tips`)}</div>
            <div>
                <LazyImage
                    className='w-[303px] h-[195px] m-auto'
                    src='/images/icons/identity/upload-example.png'
                    alt=''
                />
                <div className='text-base/6 font-normal text-center mt-2'>
                    {t(`${langPrefix}.clearExample`)}
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
                            {t(`${langPrefix}.${text}`)}
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
                    <li>{t(`${langPrefix}.require1`)}</li>
                    <li>{t(`${langPrefix}.require2`)}</li>
                </ul>
            </div>
        </div>
    )
}
