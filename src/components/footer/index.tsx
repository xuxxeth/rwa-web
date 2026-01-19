import { DISCORD_URL, GITBOOK_URL, TG_URL, X_URL } from '@/config/constants'
import { useTranslation } from '@/hooks/useTranslation'
import { MainLayout } from '@/layouts/main'
import { openUrlInNewWindow } from '@/utils/index'
import { LazyImage } from '../image/LazyImage'

export function XFooter({
  from
}: {
  from?: string
}) {
  const { t } = useTranslation()
  return (
    <div className='border-t border-[rgba(255,255,255,0.1)] pt-[40px] pb-[40px] md:mt-[130px] font-normal'>

    <MainLayout>
      <div className='md:flex justify-between px-5 font-normal'>
        <div>
          {/* <LazyImage src={from === 'home' ? '/images/home/new/logo.png' : '/images/logo_text.png'} className='w-[182px]' alt='' /> */}
          <LazyImage src={'/images/logo_dark_v2.svg'} className='w-[55px]' alt='' />
          <div className=' hidden md:block'>
            <a href='mailto:contact@tiko.cc'>
              <div className='flex items-center my-4'>
                <img src='/images/icons/e_mail.png' className='w-6' alt='' />
                <div className='text-80 ml-2'>contact@tiko.cc</div>
              </div>
            </a>
            <div className=' text-base text-80'>
              @ 2025 Cyber Alpha. {t('footer.text1')}
            </div>
          </div>
        </div>
        <div className='flex flex-col md:flex-row text-base text-white gap-x-[100px] mt-5 md:mt-0'>
          <div>
            <div className=' font-semibold'>{t('footer.text5')}</div>
            <a href={X_URL} target='_blank'>
              <div className='flex items-center mt-4'>
                <img src='/images/icons/x.png' className='w-6' alt='' />
                <div className='text-80 ml-2'>X Official</div>
              </div>
            </a>
            <a href={TG_URL} target='_blank'>
              <div className='flex items-center mt-4'>
                <img src='/images/icons/tg.png' className='w-6' alt='' />
                <div className='text-80 ml-2'>Telegram</div>
              </div>
            </a>
            <a href={DISCORD_URL} target='_blank'>
              <div className='flex items-center mt-4'>
                <img src='/images/icons/discord.png' className='w-6' alt='' />
                <div className='text-80 ml-2'>Discord</div>
              </div>
            </a>
          </div>
          <div className='mt-10 md:mt-0'>
            <div className=' font-semibold'>{t('About')}</div>
            
            <div className='flex items-center mt-4'>
              <div
                className='text-80 cursor-pointer'
                onClick={() => openUrlInNewWindow('/documents/cyberalpha-privacy-policy.pdf')}
              >
                {t('footer.text2')}
              </div>
            </div>
            <div className='flex items-center mt-4'>
              <div
                className='text-80 cursor-pointer'
                onClick={() => openUrlInNewWindow('/documents/cyberalpha-terms-of-service.pdf')}
              >
                {t('footer.text3')}
              </div>
            </div>
            <a href={GITBOOK_URL} target='_blank'>
              <div className='flex items-center mt-4'>
                <div className='text-80'>{t('footer.text6')}</div>
              </div>
            </a>
          </div>
         
        </div>
        <div className='  md:hidden mt-8'>
          <a href='mailto:contact@cyberalpha.cc'>
            <div className='flex items-center my-4'>
              <img src='/images/icons/e_mail.png' className='w-6' alt='' />
              <div className='text-80 ml-2'>contact@cyberalpha.cc</div>
            </div>
          </a>
          <div className=' text-base text-80'>
            @ 2025 Cyber Alpha. {t('footer.text1')}
          </div>
        </div>
      </div>
    </MainLayout>
    </div>
    
  )
}
