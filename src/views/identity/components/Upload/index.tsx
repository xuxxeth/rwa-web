import { useEffect, useRef, useState, useCallback, useLayoutEffect } from 'react'
import {
  type IUploadedRes,
  checkImgUploaded,
  useUploadedRes,
  uploadFile,
  uploadFileV2,
  Text,
  UploadCardAdd,
  useUploadedArrRes,
  IsKeyEqual,
  UploadCardV2,
  type IUploadedResV2,
} from './shared'
import { mergeImagesFromUrls, cn } from '@/utils'
import { LazyImage } from '@/components/image/LazyImage'

export const useUpdateEffect = (effect: React.EffectCallback, deps?: React.DependencyList) => {
  const isMounted = useRef(false)

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true
    } else {
      return effect()
    }
  }, deps)
}

// identity 身份证
// passport 护照
// address 地址
// extra 补充信息
export function Upload({
  type,
  keys,
  mode = 'edit',
  onChanged = (keys: string | string[]) => ({}),
}: {
  type: 'identity' | 'passport' | 'address' | 'extra'
  keys?: string[] | string
  mode?: 'edit' | 'view'
  onChanged?: (keys: string | string[]) => void
}) {
  // identity keys 是数组，0 是正面，1 是反面
  if (type === 'identity') {
    return (
      <IdentityUploadV2
        keys={keys as string[]}
        mode={mode}
        onChanged={onChanged as (keys: string[]) => void}
      />
    )
  }
  if (type === 'passport') {
    return (
      <PassportUpload
        keys={keys as string}
        mode={mode}
        onChanged={onChanged as (keys: string) => void}
      />
    )
  }
  if (type === 'address') {
    return (
      <AddressUpload
        keys={keys as string}
        mode={mode}
        onChanged={onChanged as (keys: string) => void}
      />
    )
  }
  if (type === 'extra') {
    return (
      <ExtraInfoUpload
        keys={keys as string[]}
        mode={mode}
        onChanged={onChanged as (keys: string[]) => void}
      />
    )
  }
  return null
}

function IdentityUploadV2({
  keys,
  mode,
  onChanged,
}: {
  keys?: string[]
  mode?: 'edit' | 'view'
  onChanged: (keys: string[]) => void
}) {
  console.log('===>props.keys', keys, mode)
  const [frontRes, saveFrontRes] = useState<{ key: string; url: string } | null>(null)
  const [backRes, saveBackRes] = useState<{ key: string; url: string } | null>(null)
  const [isDirty, setIsDirty] = useState(false)

  const handleMergedImage = async (frontUrl: string | undefined, backUrl: string | undefined) => {
    try {
      if (frontUrl && backUrl) {
        const mergedFile = await mergeImagesFromUrls(frontUrl, backUrl)
        const mergedRes = await uploadFileV2(mergedFile, () => {})
        return mergedRes?.key ?? ''
      }
      return ''
    } catch (error) {
      return ''
    }
  }

  const curKeys = useRef<string[] | undefined>(undefined)

  useLayoutEffect(() => {
    curKeys.current = keys
  }, [keys])

  const onChangedInternal = (idx: number, value: string) => {
    const newKeys = curKeys.current ? [...curKeys.current] : Array.from({ length: 3 }, () => '')
    newKeys[idx] = value
    onChanged(newKeys)
  }

  const onFrontUploaded = (res: IUploadedResV2 | null) => {
    onChangedInternal(0, res?.key ?? '')
    setIsDirty(true)
  }

  const onBackUploaded = (res: IUploadedResV2 | null) => {
    onChangedInternal(1, res?.key ?? '')
    setIsDirty(true)
  }

  useEffect(() => {
    if (!isDirty) return
    handleMergedImage(frontRes?.url, backRes?.url).then(mergedKey => {
      onChangedInternal(2, mergedKey)
    })
  }, [isDirty, frontRes, backRes])

  return (
    <div>
      <div className='flex flex-row gap-5 my-5'>
        <UploadCardV2
          fileType='idFront'
          onUploaded={onFrontUploaded}
          onS3KeyLoaded={(key: string, url: string) => saveFrontRes({ key, url })}
          s3Key={keys?.[0]}
          mode={mode}
        />
        <UploadCardV2
          fileType='idBack'
          onS3KeyLoaded={(key: string, url: string) => saveBackRes({ key, url })}
          onUploaded={onBackUploaded}
          s3Key={keys?.[1]}
          mode={mode}
        />
      </div>
      <Text text='tips' className='text-sm mt-2' />
    </div>
  )
}

// function IdentityUpload({
//   keys,
//   mode,
//   onChanged,
// }: {
//   keys?: string[]
//   mode?: 'edit' | 'view'
//   onChanged: (keys: string[]) => void
// }) {
//   const [frontRes, onFrontUploaded] = useUploadedRes('idFront', keys?.[0])
//   const [backRes, onBackUploaded] = useUploadedRes('idBack', keys?.[1])

//   const handleMergedImage = async (frontRes: IUploadedRes | null, backRes: IUploadedRes | null) => {
//     try {
//       if (checkImgUploaded(frontRes) && checkImgUploaded(backRes)) {
//         const mergedFile = await mergeImagesFromUrls(frontRes?.url!, backRes?.url!)
//         const mergedRes = await uploadFile(mergedFile, () => {})
//         // saveUploadKey('idMerged', mergedRes?.key)
//         return mergedRes?.key
//       } else {
//         // saveUploadKey('idMerged', undefined)
//         return undefined
//       }
//     } catch (error) {}
//   }

//   // 挂载那次不执行，之后变化了执行
//   useUpdateEffect(() => {
//     handleMergedImage(frontRes, backRes).then(mergedKey => {
//       onChanged([frontRes?.key ?? '', backRes?.key ?? '', mergedKey ?? ''])
//     })
//   }, [frontRes?.key, backRes?.key])

//   return (
//     <div>
//       <div className='flex flex-row gap-5 my-5'>
//         <UploadCard
//           fileType='idFront'
//           onUploaded={onFrontUploaded}
//           uploadedRes={frontRes}
//           mode={mode}
//         />
//         <UploadCard
//           fileType='idBack'
//           onUploaded={onBackUploaded}
//           uploadedRes={backRes}
//           mode={mode}
//         />
//       </div>
//       <Text text='tips' className='text-sm' />
//     </div>
//   )
// }

function AddressUpload({
  keys,
  mode,
  onChanged,
}: {
  keys?: string
  mode?: 'edit' | 'view'
  onChanged: (key: string) => void
}) {
  console.log('===>AddressUpload', keys)
  // const [addrRes, onAddrUploaded] = useUploadedRes('addressCertificates', keys)

  // useUpdateEffect(() => {
  //   onChanged(addrRes?.key ?? '')
  // }, [addrRes?.key])

  const onAddrUploaded = (res: IUploadedResV2 | null) => {
    onChanged(res?.key ?? '')
  }

  return (
    <div>
      <div className='flex items-center mb-5'>
        <Text text='uploadAddr' className='text-[18px] font-normal text-white' />
        <span className='text-[#CA3F64] ml-1 flex items-center'>*</span>
      </div>
      <div className='flex flex-row gap-5 my-5'>
        <UploadCardV2
          fileType='addressCertificates'
          onUploaded={onAddrUploaded}
          s3Key={keys}
          mode={mode}
        />
        <div className='flex flex-col flex-1 justify-center'>
          <div>
            <Text text='validAddrInc' className='mb-5' />
            <ul className='list-disc pl-3.5'>
              {['addr1', 'addr2', 'addr3', 'addr4', 'addr5', 'addr6', 'addr7'].map(item => (
                <li key={item}>
                  <Text text={item} className='text-sm/[17px]' />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <div className='flex flex-row gap-5 mt-5'>
        <div className='flex-1'>
          <Text text='addrEnsure' className='text-base mb-5' />
          <ul className='list-disc pl-3.5'>
            {['ensure1', 'ensure2', 'ensure3', 'ensure4', 'ensure5'].map(item => (
              <li key={item}>
                <Text text={item} className='text-sm/[17px]' />
              </li>
            ))}
          </ul>
        </div>
        <div className='flex-1'>
          <Text text='addrNote' className='text-base mb-5' />
          <ul className='list-disc pl-3.5'>
            {['note1', 'note2'].map(item => (
              <li key={item}>
                <Text text={item} className='text-sm/[17px]' />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

function PassportUpload({
  keys,
  mode,
  onChanged,
}: {
  keys?: string
  mode?: 'edit' | 'view'
  onChanged: (keys: string) => void
}) {
  // const [passportRes, onPassportUploaded] = useUploadedRes('passport', keys)

  // useUpdateEffect(() => {
  //   onChanged(passportRes?.url ?? '')
  // }, [passportRes])

  const onPassportUploaded = (uploadedRes: IUploadedResV2 | null) => {
    onChanged(uploadedRes?.key ?? '')
  }

  return (
    <div>
      <Text text='uploadId' className='text-lg my-5 text-white' />
      <div className='flex flex-row gap-5'>
        <UploadCardV2
          fileType='passport'
          onUploaded={onPassportUploaded}
          s3Key={keys}
          mode={mode}
        />
        <div className='flex-1 flex flex-row items-center justify-center'>
          <Text text='passportTips' className='text-base' />
        </div>
      </div>
    </div>
  )
}

function ExtraInfoUpload({
  keys,
  mode,
  onChanged,
}: {
  keys?: string[]
  mode?: 'edit' | 'view'
  onChanged: (keys: string[]) => void
}) {
  console.log('===>extra keys', keys)
  // const [uploadedRes, onUploaded, onAdd, onDelete] = useUploadedArrRes({
  //   fileType: 'incomeCertificates',
  //   keys,
  // })

  // const uploadedKeys = useMemo(() => uploadedRes.map(item => item?.key ?? ''), [uploadedRes])

  // useUpdateEffect(() => {
  //   onChanged(uploadedKeys)
  // }, [uploadedKeys])

  const curkeys = useRef(keys)

  useLayoutEffect(() => {
    curkeys.current = keys
  }, [keys])

  const atLeastOneKey = keys ?? ['']

  // const onChangedInternal = (idx: number, value: string) => {
  //   const newKeys = curkeys.current ? [...curkeys.current] : ['']
  //   newKeys[idx] = value
  //   onChanged(newKeys)
  // }
  const getNewKeys = () => {
    const newKeys = curkeys.current ? [...curkeys.current] : ['']
    return newKeys
  }

  const onUploaded = (uploadedRes: IUploadedResV2 | null, idx: number) => {
    const newKeys = getNewKeys()
    newKeys[idx] = uploadedRes?.key ?? ''
    onChanged(newKeys)
  }

  const onAdd = () => {
    const newKeys = getNewKeys()
    newKeys.push('')
    onChanged(newKeys)
  }

  const onDelete = (idx: number) => {
    const newKeys = getNewKeys()
    newKeys.splice(idx, 1)
    onChanged(newKeys)
  }

  return (
    <div>
      <div className='grid grid-cols-2 gap-x-6 gap-y-5'>
        {atLeastOneKey.map((s3Key, index) => {
          return (
            <div className='relative' key={atLeastOneKey.length + '' + index}>
              <UploadCardV2
                fileType='incomeCertificates'
                onUploaded={uploadedRes => onUploaded(uploadedRes, index)}
                s3Key={s3Key}
                mode={mode}
              />
              {index > 0 && (
                <button
                  type='button'
                  disabled={mode === 'view'}
                  onClick={event => {
                    if (mode === 'view') return
                    onDelete(index)
                  }}
                  className={cn(
                    'absolute top-0 right-0 py-3 px-4 w-[45px] h-[39px] bg-black rounded-tr-lg rounded-bl-2xl',
                    mode === 'view' ? 'cursor-not-allowed disabled' : 'cursor-pointer'
                  )}
                >
                  <LazyImage src='/images/icons/identity/trash.png' />
                </button>
              )}
            </div>
          )
        })}
        {atLeastOneKey.length < 4 && <UploadCardAdd onClick={onAdd} mode={mode} />}
      </div>
    </div>
  )
}
