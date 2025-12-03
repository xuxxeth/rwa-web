import { useState, useCallback, useEffect } from 'react'
import {
  type IUploadedRes,
  checkImgUploaded,
  useUploadedRes,
  uploadFile,
  Text,
  saveUploadKey,
  UploadCard,
  UploadCardAdd,
  useUploadedArrRes,
} from './shared'
import { mergeImagesFromUrls } from '@/utils'
import { LazyImage } from '@/components/image/LazyImage'

// identity 身份证
// passport 护照
// address 地址
// extra 补充信息
export function Upload({ type }: { type: 'identity' | 'passport' | 'address' | 'extra' }) {
  if (type === 'identity') {
    return <IdentityUpload />
  }
  if (type === 'passport') {
    return <PassportUpload />
  }
  if (type === 'address') {
    return <AddressUpload />
  }
  if (type === 'extra') {
    return <ExtraInfoUpload />
  }
  return null
}

function IdentityUpload() {
  const [frontRes, onFrontUploaded] = useUploadedRes('idFront')
  const [backRes, onBackUploaded] = useUploadedRes('idBack')

  const handleMergedIamge = async (frontRes: IUploadedRes | null, backRes: IUploadedRes | null) => {
    try {
      if (checkImgUploaded(frontRes) && checkImgUploaded(backRes)) {
        debugger
        const mergedFile = await mergeImagesFromUrls(frontRes?.url!, backRes?.url!)
        const mergedRes = await uploadFile(mergedFile, () => {})
        saveUploadKey('idMerged', mergedRes?.key)
      } else {
        saveUploadKey('idMerged', undefined)
      }
    } catch (error) {}
  }

  useEffect(() => {
    handleMergedIamge(frontRes, backRes)
  }, [frontRes, backRes])

  return (
    <div>
      <Text text='uploadId' className='text-lg my-5 text-white' />
      <div className='flex flex-row gap-5 my-5'>
        <UploadCard fileType='idFront' onUploaded={onFrontUploaded} uploadedRes={frontRes} />
        <UploadCard fileType='idBack' onUploaded={onBackUploaded} uploadedRes={backRes} />
      </div>
      <Text text='tips' className='text-sm' />
    </div>
  )
}

function AddressUpload() {
  const [addrRes, onAddrUploaded] = useUploadedRes('addressCertificates')

  return (
    <div>
      <Text text='uploadAddr' className='text-lg my-5 text-white' />
      <div className='flex flex-row gap-5 my-5'>
        <UploadCard
          fileType='addressCertificates'
          onUploaded={onAddrUploaded}
          uploadedRes={addrRes}
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

function PassportUpload() {
  const [passportRes, onPassportUploaded] = useUploadedRes('passport')

  return (
    <div>
      <Text text='uploadId' className='text-lg my-5 text-white' />
      <div className='flex flex-row gap-5'>
        <UploadCard fileType='passport' onUploaded={onPassportUploaded} uploadedRes={passportRes} />
        <div className='flex-1 flex flex-row items-center justify-center'>
          <Text text='passportTips' className='text-base' />
        </div>
      </div>
    </div>
  )
}

function ExtraInfoUpload() {
  const [uploadedRes, onUploaded, onAdd, onDelete] = useUploadedArrRes({
    fileType: 'incomeCertificates',
  })

  return (
    <div>
      <Text text='extra' className='text-lg my-5 text-white' />
      <Text text='uploadIncome' />
      <Text text='extraTips' className='text-sm mt-2' />
      <div className='grid grid-cols-2 gap-x-6 gap-y-5 my-5'>
        {uploadedRes.map((item, index) => {
          return (
            <div className='relative' key={uploadedRes.length + '' + index}>
              <UploadCard
                fileType='incomeCertificates'
                onUploaded={res => onUploaded(index, res)}
                uploadedRes={item}
              />
              {index > 0 && (
                <div
                  onClick={event => {
                    onDelete(index)
                  }}
                  className='absolute top-0 right-0 py-3 px-4 w-[45px] h-[39px] bg-black rounded-tr-lg rounded-bl-2xl cursor-pointer'
                >
                  <LazyImage src='/images/icons/identity/trash.png' />
                </div>
              )}
            </div>
          )
        })}
        {uploadedRes.length < 4 && <UploadCardAdd onClick={onAdd} />}
      </div>
    </div>
  )
}
