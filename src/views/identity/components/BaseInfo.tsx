import { CheckBox, CheckBoxBySVG } from '@/components/check-box'
import { CountrySelect } from '@/components/country-select'
import { DatePicker, FormatStr } from '@/components/date-range-picker'
import { DoctypeSelect } from '@/components/doctype-select'
import { LazyImage } from '@/components/image/LazyImage'
import { KycInput } from '@/components/input/KycInput'
import { Select } from '@/components/select'
import { Button } from '@/components/ui/button'
import { usePersistentForm } from '@/hooks/usePersistentForm'
import { useTranslation } from '@/hooks/useTranslation'
import { memo, useEffect, useMemo, useRef, useState } from 'react'
import { Upload } from './Upload'
import { cn } from '@/utils/tw'
import { EmploymentSelect } from '@/components/employment-select'
import { IncomeSelect } from '@/components/income-select'
import { format } from 'date-fns/format'
import storage from '@/utils/storage'
import { KYC_UPLOAD_STORAGE_KEY } from './Upload/shared'
import { useToast } from '@/hooks/useToast'
import { kycApi } from '@/service/kyc/api'
import type { IKycDetail, IKycSubmitData } from '@/service/kyc/types'
import { RESPONSE_CODE } from '@/config/constants'
import type { ApiResponse } from '@/service/client'
import { WarningInfo } from './WarningInfo'
import { useActiveWeb3 } from '@/hooks/useActiveWe3'
import useDebouncedUnmount from '@/hooks/useDebouncedUnmount'

export async function retryRefresh(
  refresh: () => Promise<ApiResponse<IKycDetail>>,
  maxRetries = 5,
  interval = 3000
): Promise<any> {
  let attempt = 1
  return new Promise(resolve => {
    const query = async () => {
      const result = await refresh()
      if (result.code === RESPONSE_CODE.SUCCESS && result.data?.account) {
        return resolve(result)
      }
      if (attempt < maxRetries) {
        setTimeout(() => {
          attempt += 1
          query()
        }, interval)
      } else {
        resolve(result)
      }
    }
    query()
  })
}

export const SectionTitle = ({ children }: { children: React.ReactNode }) => {
  return <div className='text-[18px] font-normal leading-[100%]'>{children}</div>
}

export const SectionBox = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => {
  return <div className={cn('p-5 bg-[#0E0E0E] rounded-[4px] pb-0 mb-2', className)}>{children}</div>
}
export const FormItemBox = ({ children }: { children: React.ReactNode }) => {
  return <div className='my-5'>{children}</div>
}
export const FormItemLabel = ({
  children,
  title,
}: {
  children?: React.ReactNode
  title?: string
}) => {
  return (
    <div className='flex items-center text-[#909090] text-[16px] font-normal'>
      {children || title} <span className='text-[#CA3F64] ml-1 flex items-center'>*</span>
    </div>
  )
}

export const InputBox = ({ children }: { children: React.ReactNode }) => {
  return <div className=' mt-2'>{children}</div>
}
export const ErrorBox = ({ children, error }: { children?: React.ReactNode; error?: string }) => {
  if (!error && !children) return null
  return (
    <div className='text-[#CA3F64] text-[12px] font-normal mt-2 flex items-center'>
      <LazyImage src='/images/kyc/error.png' className='w-[14px] h-[14px] mr-1' />
      {children || error}
    </div>
  )
}

export const calcYearDate = function () {
  const now = new Date()

  // 计算最小日期（65岁 —— 最早生日）
  const minDate = new Date(now.getFullYear() - 65, now.getMonth(), now.getDate()).getTime()

  // 计算最大日期（18岁 —— 最晚生日）
  const maxDate = new Date(now.getFullYear() - 18, now.getMonth(), now.getDate()).getTime()

  return {
    minDate,
    maxDate,
    defaultDate: maxDate,
  }
}

interface FormData {
  // 基础信息
  firstName: string
  lastName: string
  fullName: string
  gendar: number // 0女，1男
  dob: string // 出生日期
  email: string
  // 证件信息
  type: number // 0身份证, 1护照
  issueCountry: string
  no: string
  residentAddress: string
  useCertificateAddress?: boolean // 是否使用证件地址
  // 工作信息
  employment: number // 就业情况
  description: string // 就业 时 必填
  // 收信息
  source: number
  approvedProtocols: string[]
  idCardFront?: string
  idCardBack?: string
  idCard?: string
  passport?: string
  addressCertification?: string
  incomeCertifications?: string[]
}

const BaseInfo = memo(
  ({
    rejectReason,
    userInfo,
    refresh,
    onResetRetry,
  }: {
    rejectReason?: string
    userInfo?: IKycSubmitData
    refresh?: () => Promise<ApiResponse<IKycDetail>>
    onResetRetry?: () => void
  }) => {
    const { t } = useTranslation()
    const { account } = useActiveWeb3()
    const { toastSuccess, toastError } = useToast()
    const [dateOptions, setDateOptions] = useState({
      minDate: 0,
      maxDate: 0,
      defaultDate: 0,
    })
    const genderList = [
      { value: '1', label: t('gender.male') },
      { value: '0', label: t('gender.female') },
    ]
    const {
      register,
      handleSubmit,
      watch,
      setValue,
      reset,
      clear,
      formState: { errors },
    } = usePersistentForm<FormData>('kycBaseInfo', {
      firstName: userInfo?.basicInfo.firstName,
      lastName: '',
      fullName: '',
      gendar: 1,
      email: '',
      type: 0,
      employment: 1,
      source: 1,
      issueCountry: 'CHN',
      residentAddress: '',
      useCertificateAddress: false,
      description: '',
      approvedProtocols: [],
      idCardFront: '',
      idCardBack: '',
      idCard: '',
      passport: '',
      addressCertification: '',
      incomeCertifications: [],
    })
    const type = watch('type')
    const gendar = watch('gendar')
    const useCertificateAddress = watch('useCertificateAddress')
    const employment = watch('employment')
    const idCardFront = watch('idCardFront')
    const idCardBack = watch('idCardBack')
    const idCard = watch('idCard')
    const passport = watch('passport')
    const addressCertification = watch('addressCertification')
    const incomeCertifications = watch('incomeCertifications')
    const source = watch('source')

    const preAccount = useRef<string | undefined>(undefined)

    const [submiting, setSubmiting] = useState(false)

    const onSubmit = async (data: FormData) => {
      if (type === 0) {
        // 身份证，正反面都要传
        if (!data.idCardFront) {
          toastError({ title: '请上傳人像頁' })
          return
        }
        if (!data.idCardBack) {
          toastError({ title: '请上傳國徽面' })
          return
        }
      }
      if (type === 1) {
        // 只判断护照
        if (!data.passport) {
          toastError({ title: '请上傳护照' })
          return
        }
      }
      // 无地址证明
      if (!data.addressCertification) {
        toastError({title: t('identity.upload.uploadIncome')})
        return
      }
      const params: IKycSubmitData = {
        basicInfo: {
          firstName: data.firstName,
          lastName: data.lastName,
          fullName: data.fullName,
          gender: data.gendar,
          dob: data.dob,
          email: data.email,
        },
        idInfo: {
          type: data.type,
          issueCountry: data.issueCountry,
          no: data.no,
          residentAddress: data.useCertificateAddress ? '' : data.residentAddress,
          useCertificateAddress: data.useCertificateAddress,
          files: {
            idCardFront: data.type === 0 ? data.idCardFront || '' : '',
            idCardBack: data.type === 0 ? data.idCardBack || '' : '',
            idCard: data.type === 0 ? data.idCard || '' : '',
            passport: data.type === 0 ? '' : data.passport || '',
            addressCertification: data.addressCertification || '',
          },
        },
        workInfo: {
          employment: data.employment,
          description: data.employment === 4 ? data.description : '',
        },
        incomeInfo: {
          source: data.source || 1,
        },
        extraInfo: {
          incomeCertifications: (data.incomeCertifications || []).filter(key => key),
        },
        // approvedProtocols: [
        //   "AML-Policy-v3.0",
        //   "Privacy-Agreement-v2.1"
        // ]
      }
      console.log(data)
      console.log(params)

      if (submiting) return
      setSubmiting(true)
      const res = await kycApi.submitKyc(params)

      if (res?.code === RESPONSE_CODE.SUCCESS) {
        if (refresh) {
          const detailRes = await retryRefresh(refresh)
          setSubmiting(false)
          if (detailRes.code === RESPONSE_CODE.SUCCESS && detailRes.data?.overallStatus) {
            // toastSuccess({ title: '提交成功' })
            clear()
          }
        } else {
          // toastSuccess({ title: '提交成功' })
          clear()
          setSubmiting(false)
        }
      } else {
        toastError({ title: res?.message || 'Error' })
        setSubmiting(false)
      }
    }

    useEffect(() => {
      const dateOptions = calcYearDate()
      setDateOptions(dateOptions)
      setValue('dob', format(dateOptions.maxDate, FormatStr))
    }, [])

    useEffect(() => {
      console.log('userInfo changed:', userInfo)
      if (userInfo && userInfo.basicInfo.firstName) {
        reset({
          ...userInfo.basicInfo,
          ...userInfo.idInfo,
          ...userInfo.workInfo,
          ...userInfo.incomeInfo,
          ...userInfo.extraInfo,
          ...userInfo.idInfo.files,
          gendar: userInfo.basicInfo.gender,
        })
      }
    }, [userInfo])

    useEffect(() => {
      if (account && preAccount.current && account !== preAccount.current) {
        clear()
        storage.removeItem(KYC_UPLOAD_STORAGE_KEY)
        storage.removeItem('kycBaseInfo')
      }
      preAccount.current = account
    }, [account])

    // 组件卸载时重置重试状态，使用防抖避免 StrictMode 下的重复执行
    useDebouncedUnmount(onResetRetry)

    return (
      <>
        {
          rejectReason && <WarningInfo text={rejectReason} />
        }
        <form onSubmit={handleSubmit(onSubmit)} className='w-full mt-2'>
          <SectionBox>
            <SectionTitle>{t('kyc.t2')}</SectionTitle>
            <div className=' grid grid-cols-4 font-normal gap-x-6'>
              <FormItemBox>
                <FormItemLabel title={t('kyc.t3')} />
                <InputBox>
                  <KycInput
                    className=''
                    placeholder={t('kyc.t4')}
                    error={errors.firstName?.message}
                    {...register('firstName', {
                      required: t('kyc.t54', {num: 30}),
                      maxLength: {
                        value: 30,
                        message: t('kyc.t54', {num: 30}),
                      },
                      pattern: {
                        value: /^[a-zA-Z\u4e00-\u9fa5]+$/,
                        message: '只支持中文和英文字母',
                      },
                      onChange: e => {
                        console.log(e.target.value)
                        // 实时限制输入长度
                        if (e.target.value.length > 30) {
                          e.target.value = e.target.value.slice(0, 30)
                        }
                      },
                    })}
                  />
                  <ErrorBox error={errors.firstName?.message} />
                </InputBox>
              </FormItemBox>
              <FormItemBox>
                <FormItemLabel title={t('kyc.t5')} />
                <InputBox>
                  <KycInput
                    className=''
                    placeholder={t('kyc.t4')}
                    error={errors.lastName?.message}
                    {...register('lastName', {
                      required: t('kyc.t54', {num: 30}),
                      maxLength: {
                        value: 30,
                        message: t('kyc.t54', {num: 30}),
                      },
                      pattern: {
                        value: /^[a-zA-Z\u4e00-\u9fa5]+$/,
                        message: '只支持中文和英文字母',
                      },
                      onChange: e => {
                        // 实时限制输入长度
                        if (e.target.value.length > 30) {
                          e.target.value = e.target.value.slice(0, 30)
                        }
                      },
                    })}
                  />
                  <ErrorBox error={errors.lastName?.message} />
                </InputBox>
              </FormItemBox>
              <div className=' col-span-2'>
                <FormItemBox>
                  <FormItemLabel title={t('kyc.t6')} />
                  <InputBox>
                    <KycInput
                      className=''
                      placeholder={t('kyc.t4')}
                      error={errors.fullName?.message}
                      {...register('fullName', {
                        required: t('kyc.t54', {num: 30}),
                        maxLength: {
                          value: 30,
                          message: t('kyc.t54', {num: 30}),
                        },
                        pattern: {
                          value: /^[a-zA-Z\u4e00-\u9fa5·\s_-]+$/,
                          message: '只支持中文和英文字母',
                        },
                        onChange: e => {
                          // 实时限制输入长度
                          if (e.target.value.length > 30) {
                            e.target.value = e.target.value.slice(0, 30)
                          }
                        },
                      })}
                    />
                    <ErrorBox error={errors.fullName?.message} />
                  </InputBox>
                </FormItemBox>
              </div>
            </div>
            <div className=' grid grid-cols-3 font-normal gap-x-6'>
              {/* 性别 */}
              <FormItemBox>
                <FormItemLabel title={t('kyc.t7')} />
                <InputBox>
                  <Select
                    activeColor='#FFFFFF'
                    className='h-[44px] rounded-[6px]'
                    placeholder={t('identity.select')}
                    data={genderList}
                    defaultValue={String(gendar)}
                    onChange={data => {
                      data && data.value && setValue('gendar', Number(data.value))
                    }}
                  />
                </InputBox>
              </FormItemBox>
              {/* 出生日期 */}
              <FormItemBox>
                <FormItemLabel title={t('kyc.t8')} />
                <InputBox>
                  <div className='bg-[rgba(255,255,255,0.08)] rounded-[6px]'>
                    <DatePicker
                      captionLayout='dropdown'
                      minDate={dateOptions.minDate}
                      maxDate={dateOptions.maxDate}
                      activeColor='#FFFFFF'
                      className='h-[44px]'
                      placeholder={t('identity.selectDate')}
                      userSelectedDate={dateOptions.defaultDate}
                      onUserSelectedDateChanged={value => {
                        if (value) {
                          setValue('dob', format(value, FormatStr))
                        }
                      }}
                    />
                  </div>
                </InputBox>
              </FormItemBox>
              {/* 邮箱 */}
              <FormItemBox>
                <FormItemLabel title={t('kyc.t9')} />
                <InputBox>
                  <KycInput
                    className=''
                    placeholder={t('kyc.t4')}
                    error={errors.email?.message}
                    {...register('email', {
                      required: t('kyc.t55'),
                      maxLength: {
                        value: 50,
                        message: t('kyc.t54', {num: 50}),
                      },
                      pattern: {
                        value:
                          /^(?=[^@]{1,64}@[^@]{1,255}$)(?=.{1,50}$)[a-zA-Z0-9]+(?:[._-][a-zA-Z0-9]+)*@[a-zA-Z0-9]+(?:[.-][a-zA-Z0-9]+)*(?:\.[a-zA-Z]{2,})+$/,
                        message: t('kyc.t55'),
                      },
                      onChange: e => {
                        // 实时限制输入长度
                        if (e.target.value.length > 30) {
                          e.target.value = e.target.value.slice(0, 30)
                        }
                      },
                    })}
                  />
                  <ErrorBox error={errors.email?.message} />
                </InputBox>
              </FormItemBox>
            </div>
          </SectionBox>
          <SectionBox>
            <SectionTitle>{t('kyc.t10')}</SectionTitle>
            <div className=' grid grid-cols-3 font-normal gap-x-6'>
              {/* 证件类型 */}
              <FormItemBox>
                <FormItemLabel title={t('kyc.t11')} />

                <InputBox>
                  <DoctypeSelect
                    defaultValue={String(type)}
                    onChange={data => {
                      setValue('type', Number(data.code))
                    }}
                  />
                </InputBox>
              </FormItemBox>
              <FormItemBox>
                <FormItemLabel title={t('kyc.t12')} />
                {/* 证件签发国 */}
                <InputBox>
                  <CountrySelect
                    placeHolder={t('kyc.t28')}
                    onChange={data => {
                      setValue('issueCountry', data.key)
                    }}
                  />
                </InputBox>
              </FormItemBox>
              <FormItemBox>
                <FormItemLabel title={t('kyc.t13')} />
                {/* 证件号码 */}
                <InputBox>
                  <KycInput
                    className=''
                    placeholder={t('kyc.t4')}
                    error={errors.no?.message}
                    {...register('no', {
                      required: t('kyc.t4'),
                      maxLength: {
                        value: 30,
                        message: t('kyc.t54'),
                      },
                      pattern: {
                        value: /^[A-Za-z0-9]+$/,
                        message: '仅支持数字字母输入',
                      },
                      onChange: e => {
                        // 实时限制输入长度
                        if (e.target.value.length > 30) {
                          e.target.value = e.target.value.slice(0, 30)
                        }
                      },
                    })}
                  />
                  <ErrorBox error={errors.no?.message} />
                </InputBox>
              </FormItemBox>
            </div>

            <div className=' grid grid-cols-1 font-normal'>
              <FormItemBox>
                <FormItemLabel title={t('kyc.t14')} />
                {type === 0 && (
                  <div className='mt-3 flex gap-x-2 items-center mb-3'>
                    <CheckBox
                      checked={useCertificateAddress}
                      onChange={v => {
                        setValue('useCertificateAddress', v)
                      }}
                    />
                    <div className='text-[rgba(255,255,255,0.6)] text-[16px]'>{t('kyc.t15')}</div>
                  </div>
                )}

                {(!useCertificateAddress || type === 1) && (
                  <InputBox>
                    <KycInput
                      className=''
                      placeholder={t('kyc.t4')}
                      error={errors.residentAddress?.message}
                      {...register('residentAddress', {
                        required: t('kyc.t4'),
                        maxLength: {
                          value: 40,
                          message: t('kyc.t54', {num: 40}),
                        },
                        pattern: {
                          value: /^[\u4e00-\u9fa5a-zA-Z0-9]{1,40}$/,
                          message: '只支持中文和英文字母',
                        },
                        onChange: e => {
                          // 实时限制输入长度
                          if (e.target.value.length > 40) {
                            e.target.value = e.target.value.slice(0, 40)
                          }
                        },
                      })}
                    />
                    <ErrorBox error={errors.residentAddress?.message} />
                  </InputBox>
                )}
              </FormItemBox>
            </div>
          </SectionBox>

          <SectionBox className='pb-5'>
            <div className=' flex items-center mb-5'>
              <SectionTitle>{t('identity.upload.uploadId')}</SectionTitle>
              <span className='text-[#CA3F64] ml-1 flex items-center'>*</span>
            </div>

            {/* 上传证件 */}
            <Upload
              type={type === 1 ? 'passport' : 'identity'}
              keys={type === 1 ? passport : [idCardFront || '', idCardBack || '', idCard || '']}
              onChanged={keys => {
                if (type === 1) {
                  keys[0] && setValue('passport', keys as string)
                } else {
                  keys[0] && setValue('idCardFront', keys[0])
                  keys[1] && setValue('idCardBack', keys[1])
                  keys[2] && setValue('idCard', keys[2])
                }
              }}
            />
          </SectionBox>
          <SectionBox className='pb-5'>
            {/* 上传地址证明 */}
            <div className=' flex items-center mb-5'>
              <SectionTitle>{t('identity.upload.uploadAddr')}</SectionTitle>
              <span className='text-[#CA3F64] ml-1 flex items-center'>*</span>
            </div>
            <Upload
              type='address'
              keys={addressCertification}
              onChanged={keys => {
                setValue('addressCertification', keys as string)
              }}
            />
          </SectionBox>
          <SectionBox>
            <SectionTitle>{t('kyc.t16')}</SectionTitle>
            <div className=' grid grid-cols-3 font-normal gap-x-6'>
              {/* 就业状况 */}
              <FormItemBox>
                <FormItemLabel title={t('kyc.t17')} />
                <InputBox>
                  <EmploymentSelect
                    defaultValue={String(employment)}
                    onChange={data => {
                      setValue('employment', Number(data.code))
                    }}
                  />
                </InputBox>
              </FormItemBox>
              <div className=' col-span-2'>
                {employment === 4 && (
                  <FormItemBox>
                    <FormItemLabel title={t('kyc.t23')} />
                    <InputBox>
                      <KycInput
                        className=''
                        placeholder={t('kyc.t38')}
                        error={errors.description?.message}
                        {...register('description', {
                          required: t('kyc.t4'),
                          maxLength: {
                            value: 30,
                            message: t('kyc.t54', {num: 40}),
                          },
                          pattern: {
                            value: /^[\u4e00-\u9fa5a-zA-Z0-9]{1,40}$/,
                            message: '只支持中文、英文字母和数字',
                          },
                          onChange: e => {
                            // 实时限制输入长度
                            if (e.target.value.length > 40) {
                              e.target.value = e.target.value.slice(0, 40)
                            }
                          },
                        })}
                      />
                      <ErrorBox error={errors.description?.message} />
                    </InputBox>
                  </FormItemBox>
                )}
              </div>
            </div>
          </SectionBox>
          <SectionBox>
            <SectionTitle>{t('kyc.t21')}</SectionTitle>
            <div className=' grid grid-cols-2 font-normal gap-x-6'>
              {/* 收入类型 */}
              <FormItemBox>
                <FormItemLabel title={t('kyc.t22')} />
                <InputBox>
                  <IncomeSelect
                    defaultValue={String(source)}
                    onChange={data => {
                      setValue('source', Number(data.code))
                    }}
                  />
                </InputBox>
              </FormItemBox>
            </div>
          </SectionBox>
          <SectionBox>
            <SectionTitle>{t('kyc.t19')}</SectionTitle>
            <div className='h-5'></div>
            <Upload
              type='extra'
              keys={incomeCertifications}
              onChanged={keys => {
                // const _keys = (keys as string[]).filter(key => key)
                keys.length > 0 && setValue('incomeCertifications', keys as string[])
              }}
            />
            <div className='flex items-center text-base text-[#909090] py-3'>
              <span className='text-[#CA3F64] mr-1 flex items-center'>*</span>
              {t('kyc.t20')}
            </div>
          </SectionBox>

          {/* <div className='mt-8 flex gap-x-2 items-start'>
            <div className=' shrink-0 relative top-[2px]'>
              <CheckBox />
            </div>
            <div className='text-[rgba(255,255,255,0.6)] text-[16px]'>
              {t('identity.aggree1')}
              <a href='' target='_blank' className='text-[rgba(26,133,255,1)]'>
                {t('identity.aggree3')}
              </a>
              {t('identity.aggree2')}
            </div>
          </div> */}
          <div className='flex justify-center mt-8'>
            <Button
              disabled={submiting}
              loading={submiting}
              type='submit'
              className='bg-white text-black w-full lg:w-[400px] rounded-[8px]'
            >
              {t('identity.continue')}
            </Button>
          </div>
        </form>
      </>
    )
  }
)

export { BaseInfo }
