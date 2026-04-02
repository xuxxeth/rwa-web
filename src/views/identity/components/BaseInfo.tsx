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
import { parseISO } from 'date-fns'
import {
  Text,
} from './Upload/shared'

export async function retryRefresh(
  refresh: () => Promise<ApiResponse<IKycDetail>>,
  maxRetries = 3,
  interval = 5000
): Promise<any> {
  let attempt = 1
  return new Promise(resolve => {
    const query = async () => {

      const result = await refresh()
      if (result.code === RESPONSE_CODE.SUCCESS && result.data?.rejectReason) {
        requestAnimationFrame(() => {
          window.scrollTo({ top: 0, behavior: "instant" });
        });
        return resolve(result)
      }
      if (attempt < maxRetries) {
        setTimeout(() => {
          attempt += 1
          query()
        }, interval)
      } else {
        requestAnimationFrame(() => {
          window.scrollTo({ top: 0, behavior: "instant" });
        });
        resolve(result)
      }
    }
    query()
  })
}

export const SectionTitle = ({ children }: { children: React.ReactNode }) => {
  return <div className='text-[16px] font-normal leading-[100%]'>{children}</div>
}

export const SectionBox = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => {
  return <div className={cn('p-5 bg-[#131416] rounded-[4px] pb-0 mb-2', className)}>{children}</div>
}
export const FormItemBox = ({ children }: { children: React.ReactNode }) => {
  return <div className='my-5'>{children}</div>
}
export const FormItemLabel = ({
  children,
  title,
  hide
}: {
  children?: React.ReactNode
  title?: string
  hide?: boolean
}) => {
  return (
    <div className='flex items-center text-[#9DA3AF] text-[14px] font-normal'>
      {children || title} {hide && <span className='text-[#CA3F64] ml-1 flex items-center'>*</span>}
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
  const maxDate = new Date(now.getFullYear() - 18, now.getMonth(), now.getDate() - 1).getTime()

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
      type: 1,
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
    const firstName = watch('firstName')
    const lastName = watch('lastName')
    const fullName = watch('fullName')
    const email = watch('email')
    const no = watch('no')
    const type = watch('type')
    const issueCountry = watch('issueCountry')
    const gendar = watch('gendar')
    const dob = watch('dob')
    const useCertificateAddress = watch('useCertificateAddress')
    const residentAddress = watch('residentAddress')
    const employment = watch('employment')
    const description = watch('description')
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
          toastError({ title: t('kyc.t56') })
          return
        }
        if (!data.idCardBack) {
          toastError({ title: t('kyc.t57') })
          return
        }
        if (!data.idCard) {
          toastError({ title: t('kyc.t59') })
          return
        }
      }
      if (type === 1) {
        // 只判断护照
        if (!data.passport) {
          toastError({ title: t('kyc.t58') })
          return
        }
      }
      // 无地址证明
      if (!useCertificateAddress && !data.addressCertification) {
        toastError({ title: t('kyc.t61') })
        return
      }
      // 这里要再次判断一下dob，防止用户修改系统时间绕过前端校验
      const dobDate = parseISO(data.dob).getTime()
      if (dobDate < dateOptions.minDate || dobDate > dateOptions.maxDate) { 
        toastError({ title: t('kyc.t67') })
        return
      }

      const params: IKycSubmitData = {
        type: 1,
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
    const dobRef = useRef(dob)
    const dobInitRef = useRef(false)

    useEffect(() => {
      dobRef.current = dob // 每次更新时同步
    }, [dob])
    useEffect(() => {
      const dateOptions = calcYearDate()
      setDateOptions(dateOptions)
      if (!dobInitRef.current) {
        dobInitRef.current = true
        setTimeout(() => {
          setValue('dob', dobRef.current || format(dateOptions.maxDate, FormatStr))
        }, 500)
      }
    }, [dob])

    useEffect(() => {
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
        {rejectReason && <WarningInfo text={rejectReason} />}
        <form onSubmit={handleSubmit(onSubmit)} className='w-full mt-2'>
          <SectionBox>
            <SectionTitle>{t('kyc.t2')}</SectionTitle>
            <div className=' grid grid-cols-4 font-normal gap-x-6'>
              <FormItemBox>
                <FormItemLabel title={t('kyc.t3')} hide />
                <InputBox>
                  <KycInput
                    className=''
                    placeholder={t('kyc.t4')}
                    error={errors.firstName?.message}
                    value={firstName}
                    {...register('firstName', {
                      required: t('kyc.t54', { num: 30 }),
                      maxLength: {
                        value: 30,
                        message: t('kyc.t54', { num: 30 }),
                      },
                      pattern: {
                        value: /^[a-zA-Z\u4e00-\u9fa5\s]+$/,
                        message: t('kyc.t64'),
                      },
                    })}
                  />
                  <ErrorBox error={errors.firstName?.message} />
                </InputBox>
              </FormItemBox>
              <FormItemBox>
                <FormItemLabel title={t('kyc.t5')} hide />
                <InputBox>
                  <KycInput
                    className=''
                    placeholder={t('kyc.t4')}
                    error={errors.lastName?.message}
                    value={lastName}
                    {...register('lastName', {
                      required: t('kyc.t54', { num: 30 }),
                      maxLength: {
                        value: 30,
                        message: t('kyc.t54', { num: 30 }),
                      },
                      pattern: {
                        value: /^[a-zA-Z\u4e00-\u9fa5\s]+$/,
                        message: t('kyc.t64'),
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
                  <FormItemLabel title={t('kyc.t6')} hide />
                  <InputBox>
                    <KycInput
                      className=''
                      placeholder={t('kyc.t4')}
                      error={errors.fullName?.message}
                      value={fullName}
                      {...register('fullName', {
                        required: t('kyc.t54', { num: 30 }),
                        maxLength: {
                          value: 30,
                          message: t('kyc.t54', { num: 30 }),
                        },
                        pattern: {
                          value: /^[a-zA-Z\u4e00-\u9fa5·\s_-]+$/,
                          message: t('kyc.t64'),
                        },
                        validate: value => {
                          if (!firstName || !lastName) return true

                          const normalize = (str: string) =>
                            str.replace(/\s+/g, '').toLowerCase()

                          const full = normalize(value)
                          const first = normalize(firstName)
                          const last = normalize(lastName)

                          if (!full.includes(first) || !full.includes(last)) {
                            return t('kyc.t62') || '全名需包含名和姓'
                          }

                          return true
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
                <FormItemLabel title={t('kyc.t7')} hide />
                <InputBox>
                  <Select
                    activeColor='#FFFFFF'
                    className='h-[38px] rounded-[4px]'
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
                <FormItemLabel title={t('kyc.t8')} hide />
                <InputBox>
                  <div className='bg-[rgba(255,255,255,0.08)] rounded-[6px]'>
                    <DatePicker
                      captionLayout='dropdown'
                      minDate={dateOptions.minDate}
                      maxDate={dateOptions.maxDate}
                      activeColor='#FFFFFF'
                      className='h-[38px] bg-[#1A1B1E] text-[14px] rounded-[4px]'
                      placeholder={t('identity.selectDate')}
                      userSelectedDate={dob ? new Date(dob).getTime() : dateOptions.maxDate}
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
                <FormItemLabel title={t('kyc.t9')} hide />
                <InputBox>
                  <KycInput
                    className=''
                    placeholder={t('kyc.t4')}
                    error={errors.email?.message}
                    value={email}
                    {...register('email', {
                      required: t('kyc.t55'),
                      maxLength: {
                        value: 50,
                        message: t('kyc.t54', { num: 50 }),
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
                <FormItemLabel title={t('kyc.t11')} hide />

                <InputBox>
                  <DoctypeSelect
                    countryCode={issueCountry}
                    defaultValue={'1'}
                    onChange={data => {
                      setValue('type', Number(data.code))
                    }}
                  />
                </InputBox>
              </FormItemBox>
              <FormItemBox>
                <FormItemLabel title={t('kyc.t12')} hide />
                {/* 证件签发国 */}
                <InputBox>
                  <CountrySelect
                    placeHolder={t('kyc.t28')}
                    defaultValue={issueCountry}
                    onChange={data => {
                      setValue('issueCountry', data.code)
                      if (data.code !== 'CHN') {
                        setValue('type', 1) // 非中国只能选护照
                      }
                    }}
                  />
                </InputBox>
              </FormItemBox>
              <FormItemBox>
                <FormItemLabel title={t('kyc.t13')} hide />
                {/* 证件号码 */}
                <InputBox>
                  <KycInput
                    className=''
                    placeholder={t('kyc.t4')}
                    error={errors.no?.message}
                    regex='^[A-Za-z0-9]+$'
                    value={no}
                    {...register('no', {
                      required: t('kyc.t54', { num: 30 }),
                      maxLength: {
                        value: 30,
                        message: t('kyc.t54', { num: 30 }),
                      },
                      pattern: {
                        value: /^[A-Za-z0-9]+$/,
                        message: t('kyc.t66'),
                      },
                    })}
                  />
                  <ErrorBox error={errors.no?.message} />
                </InputBox>
              </FormItemBox>
            </div>

            <div className=' grid grid-cols-1 font-normal'>
              <FormItemBox>
                <FormItemLabel title={t('kyc.t14')} hide />
                {/* {type === 0 && (
                  <div className='mt-3 flex gap-x-2 items-center mb-3'>
                    <CheckBox
                      checked={useCertificateAddress}
                      onChange={v => {
                        setValue('useCertificateAddress', v)
                      }}
                    />
                    <div className='text-[rgba(255,255,255,0.6)] text-[14px]'>{t('kyc.t15')}</div>
                  </div>
                )} */}
                <div className='text-[#9DA3AF] text-[14px] mt-2'>
                  {t('kyc.t68')}
                </div>
                {(!useCertificateAddress || type === 1) && (
                  <InputBox>
                    <KycInput
                      className=''
                      placeholder={t('kyc.t4')}
                      error={errors.residentAddress?.message}
                      value={residentAddress}
                      {...register('residentAddress', {
                        required: t('kyc.t4'),
                        maxLength: {
                          value: 160,
                          message: t('kyc.t54', { num: 160 }),
                        },
                        pattern: {
                          value: /^[\u4e00-\u9fa5a-zA-Z0-9 ,，]{1,160}$/,
                          message: t('kyc.t64'),
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
              type={'passport'}
              keys={type === 1 ? passport : [idCardFront || '', idCardBack || '', idCard || '']}

              onChanged={keys => {
                setValue('passport', keys as string)
                // if (type === 1) {
                //   setValue('passport', keys as string)
                // } else {
                //   setValue('idCardFront', keys[0])
                //   setValue('idCardBack', keys[1])
                //   setValue('idCard', keys[2])
                // }
              }}
            />
          </SectionBox>
          <SectionBox className='pb-5'>
            {/* 上传地址证明 */}
            <div className=' flex items-center mb-5'>
              <SectionTitle>{t('identity.upload.uploadAddr')}</SectionTitle>
              {
                !useCertificateAddress && <span className='text-[#CA3F64] ml-1 flex items-center'>*</span>
              }
              
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
                <FormItemLabel title={t('kyc.t17')} hide />
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
                    <FormItemLabel title={t('kyc.t23')} hide />
                    <InputBox>
                      <KycInput
                        className=''
                        placeholder={t('kyc.t38')}
                        error={errors.description?.message}
                        value={description}
                        {...register('description', {
                          required: t('kyc.t4'),
                          maxLength: {
                            value: 30,
                            message: t('kyc.t54', { num: 60 }),
                          },
                          pattern: {
                            value: /^[\u4e00-\u9fa5a-zA-Z0-9 ,，]{1,60}$/,
                            message: t('kyc.t64'),
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
                <FormItemLabel title={t('kyc.t22')} hide />
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
            
            <div className="my-5">
              <Text text='uploadIncome' className=' text-[#9DA3AF]' />
              <Text text='extraTips' className='text-sm mt-2' />
            </div>
            <Upload
              type='extra'
              keys={incomeCertifications}
              onChanged={keys => {
                // const _keys = (keys as string[]).filter(key => key)
                setValue('incomeCertifications', keys as string[])
              }}
            />
            <div className='h-2'></div>
          </SectionBox>
          <div className='flex items-center text-base text-[#909090] py-3'>
            <span className='text-[#CA3F64] mr-1 flex items-center'>*</span>
            {t('kyc.t20')}
          </div>
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
