import { useEffect, useRef, useState, useCallback, useLayoutEffect } from 'react'
import {
  Text,
  UploadCardAdd,
  UploadCard,
  type IUploadedResV2,
  uploadFile,
  getUploadedFileUrl,
} from './shared'
import { mergeTwoImageFromUrls, cn } from '@/utils'
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
      <IdentityUpload
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

function IdentityUpload({
  keys,
  mode,
  onChanged,
}: {
  keys?: string[]
  mode?: 'edit' | 'view'
  onChanged: (keys: string[]) => void
}) {
  const keyToBlobUrlMap = useRef<{ [key: string]: string }>({})

  const [isDirty, setIsDirty] = useState(false)

  // 因为不确定上传合成照片的时候，这个临时性的 url 是否还在有效期内，
  // 安全起见，在上传的时候，需要重新获取一次 url
  const handleMergeImage = async (key1: string, key2: string) => {
    try {
      const map: { [key: string]: string } = {}
      const keysToGetUrl = []
      map[key1] = keyToBlobUrlMap.current[key1]
      map[key2] = keyToBlobUrlMap.current[key2]

      if (!map[key1]) keysToGetUrl.push(key1)
      if (!map[key2]) keysToGetUrl.push(key2)

      if (keysToGetUrl.length > 0) {
        const urls = await getUploadedFileUrl(keysToGetUrl)
        urls.map(item => {
          map[item.key] = item.url
        })
      }

      const mergedFile = await mergeTwoImageFromUrls(map[key1], map[key2])
      const mergedRes = await uploadFile(mergedFile, () => {})

      return mergedRes?.key ?? ''
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

  const onFrontUploaded = (res: IUploadedResV2) => {
    if (res && res.key) {
      keyToBlobUrlMap.current[res.key] = res?.blobUrl ?? ''
      onChangedInternal(0, res.key)
      setIsDirty(true)
    }
  }

  const onBackUploaded = (res: IUploadedResV2) => {
    if (res && res.key) {
      keyToBlobUrlMap.current[res.key] = res?.blobUrl ?? ''
      onChangedInternal(1, res?.key ?? '')
      setIsDirty(true)
    }
  }

  useEffect(() => {
    if (!isDirty) return
    if (!keys?.[0] || !keys?.[1]) return
    handleMergeImage(keys[0], keys[1]).then(mergedKey => {
      onChangedInternal(2, mergedKey)
    })
  }, [keys?.[0], keys?.[1]])

  return (
    <div>
      <div className='flex flex-row gap-5 my-5'>
        <UploadCard fileType='idFront' onUploaded={onFrontUploaded} s3Key={keys?.[0]} mode={mode} />
        <UploadCard fileType='idBack' onUploaded={onBackUploaded} s3Key={keys?.[1]} mode={mode} />
      </div>
      <Text text='tips' className='text-sm mt-2' />
    </div>
  )
}

function AddressUpload({
  keys,
  mode,
  onChanged,
}: {
  keys?: string
  mode?: 'edit' | 'view'
  onChanged: (key: string) => void
}) {
  const onAddrUploaded = (res: IUploadedResV2) => {
    onChanged(res?.key ?? '')
  }

  return (
    <div>
      <div className='flex items-center mb-5'>
        <Text text='uploadAddr' className='text-[18px] font-normal text-white' />
        <span className='text-[#CA3F64] ml-1 flex items-center'>*</span>
      </div>
      <div className='flex flex-row gap-5 my-5'>
        <UploadCard
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
  const onPassportUploaded = (uploadedRes: IUploadedResV2) => {
    onChanged(uploadedRes?.key ?? '')
  }

  return (
    <div>
      <div className='flex flex-row gap-5'>
        <UploadCard fileType='passport' onUploaded={onPassportUploaded} s3Key={keys} mode={mode} />
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
  const curkeys = useRef(keys)

  useLayoutEffect(() => {
    curkeys.current = keys
  }, [keys])

  const atLeastOneKey = !keys || keys.length === 0 ? [''] : keys

  const getNewKeys = () => {
    const newKeys = curkeys.current ? [...curkeys.current] : ['']
    return newKeys
  }

  const onUploaded = (uploadedRes: IUploadedResV2, idx: number) => {
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
              <UploadCard
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
