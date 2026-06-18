import React from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import { cn } from '@/lib/utils'

export const Footer: React.FC<{ from?: string }> = ({ from }) => {
  const { t } = useTranslation('home')

  return (
    <footer className={cn(
      'relative bg-[#131416] border-t border-white/10 pt-12 pb-8 text-white overflow-hidden',
      from === 'no-account' ? 'border-t-0' : ''
    )}>
      {/* Ambient Glow */}
      {
        from !== 'no-account' && (
          <div className='absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-[#9CFF3A] opacity-[0.03] blur-[150px] rounded-full pointer-events-none -translate-y-1/2 z-0' />
        )
      }
      

      <div className={cn(
        'max-w-7xl mx-auto px-6 md:px-12 relative z-10 flex flex-col',
        from === 'no-account' ? 'max-w-full md:px-0' : ''
      )}>
        {/* Top Section: Brand/Email & Socials */}
        <div className='flex flex-col md:flex-row justify-between items-start md:items-start gap-10 mb-8'>
          {/* Left: Logo & Email */}
          <div className='flex flex-col items-start gap-6'>
            
          <svg width="91" height="30" viewBox="0 0 91 30" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M78.2383 5.625C84.8469 5.625 90.2041 11.0816 90.2041 17.8125C90.2041 24.5434 84.8469 30 78.2383 30C71.6298 29.9998 66.2725 24.5433 66.2725 17.8125C66.2725 11.0817 71.6298 5.62516 78.2383 5.625ZM78.2383 13.125C75.6965 13.125 73.6357 15.2237 73.6357 17.8125C73.6357 20.4013 75.6965 22.5 78.2383 22.5C80.78 22.5 82.8408 20.4013 82.8408 17.8125C82.8408 15.2237 80.7801 13.125 78.2383 13.125Z" fill="#9CFF3A"/>
            <path d="M23.9316 11.25H16.5684V30H7.36328V11.25H0V3.75H23.9316V11.25Z" fill="white"/>
            <path d="M49.7041 13.75L57.0684 5.625H66.2725L55.2275 17.8125L66.2725 30H57.0684L49.7041 21.874V30H40.5V1.875H49.7041V13.75Z" fill="white"/>
            <rect x="36.8184" y="13.125" width="16.875" height="9.20457" transform="rotate(90 36.8184 13.125)" fill="white"/>
            <path d="M32.2158 0C35.266 0 37.7392 2.51838 37.7393 5.625C37.7393 8.7317 35.266 11.25 32.2158 11.25C29.1657 11.2499 26.6934 8.73162 26.6934 5.625C26.6935 2.51847 29.1658 0.000136219 32.2158 0ZM28.9004 2.25098V4.42871H31.9307L28.9023 7.51367L30.4131 9.05371L33.3896 6.02246V9H35.5273V2.25098H28.9004Z" fill="#9CFF3A"/>
          </svg>

            <a
              href='mailto:contract@tiko.cc'
              className='text-[#A5A9B5] hover:text-[#9CFF3A] transition-colors text-[14px] font-normal'
            >
              contact@tiko.cc
            </a>
          </div>

          {/* Right: Socials */}
          <div className='flex items-center gap-3'>
            {/* X (Twitter) */}
            <a
              href='https://x.com/TIKO_RWA'
              target='_blank'
              rel='noopener noreferrer'
              className='w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-[#9CFF3A] hover:text-black transition-all duration-300'
            >
              <svg viewBox='0 0 24 24' fill='currentColor' className='w-5 h-5'>
                <path d='M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' />
              </svg>
            </a>

            {/* Telegram - New Pure Plane Icon */}
            <a
              href='https://t.me/TIKO_RWA'
              target='_blank'
              rel='noopener noreferrer'
              className='w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-[#9CFF3A] hover:text-black transition-all duration-300'
            >
              <svg
                viewBox='0 0 24 24'
                fill='currentColor'
                className='w-5 h-5 translate-x-[-1px] translate-y-[1px]'
              >
                <path d='M20.665 3.717l-17.73 6.837c-1.21.486-1.203 1.161-.222 1.462l4.552 1.42 10.532-6.645c.498-.303.953-.14.579.192l-8.533 7.701h-.002l-.002.001-.314 4.692c.46 0 .663-.211.921-.46l2.211-2.15 4.599 3.397c.848.467 1.457.227 1.668-.785l3.019-14.228c.309-1.239-.473-1.8-1.282-1.432z' />
              </svg>
            </a>

            {/* Discord */}
            <a
              href='https://discord.gg/K9AVrEp8'
              target='_blank'
              rel='noopener noreferrer'
              className='w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-[#9CFF3A] hover:text-black transition-all duration-300'
            >
              <svg viewBox='0 0 24 24' fill='currentColor' className='w-5 h-5'>
                <path d='M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028 14.09 14.09 0 001.226-1.994.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.086 2.157 2.419 0 1.334-.956 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.086 2.157 2.419 0 1.334-.946 2.419-2.157 2.419z' />
              </svg>
            </a>
          </div>
        </div>

        {/* Bottom Section: Copyright & Links on same line */}
        <div className='flex flex-col-reverse md:flex-row justify-between items-center gap-6 border-t border-white/5 pt-8'>
          <div className='text-[13px] text-[#737988] font-normal text-center md:text-left'>
            © 2026 Tiko Inc. All rights reserved.
          </div>

          <div className='flex gap-6 font-normal'>
            <a
              href='https://ca-public-s3.s3.ap-southeast-1.amazonaws.com/web/Privacy+Policy.pdf'
              target='_blank'
              rel='noopener noreferrer'
              className='text-gray-400 hover:text-[#9CFF3A] transition-colors text-xs md:text-sm'
            >
              {t('footer.privacy')}
            </a>
            <a
              href='https://ca-public-s3.s3.ap-southeast-1.amazonaws.com/web/Terms+of+Service.pdf'
              target='_blank'
              rel='noopener noreferrer'
              className='text-gray-400 hover:text-[#9CFF3A] transition-colors text-xs md:text-sm'
            >
              {t('footer.terms')}
            </a>
            <a
              href='https://tiko.gitbook.io/tiko-docs/'
              target='_blank'
              rel='noopener noreferrer'
              className='text-gray-400 hover:text-[#9CFF3A] transition-colors text-xs md:text-sm'
            >
              {t('footer.docs')}
            </a>
            {/* Audit Report Dropdown */}
            <div className='relative group'>
              <span className='text-gray-400 hover:text-[#9CFF3A] transition-colors text-xs md:text-sm cursor-pointer flex items-center gap-1'>
                {t('footer.auditReport')}
                <svg
                  className='w-3 h-3 transition-transform group-hover:rotate-180'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M19 9l-7 7-7-7'
                  />
                </svg>
              </span>
              <div className='absolute bottom-full right-0 mb-2 w-max bg-[#1A1A1A] border border-white/10 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50'>
                <div className='py-2 flex flex-col'>
                  <a
                    href='https://ca-public-s3.s3.ap-southeast-1.amazonaws.com/web/Cyberalpha+Protocol+Phase3+-+SlowMist+Audit+Report+(2).pdf'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='px-4 py-2 text-xs md:text-sm text-gray-400 hover:text-[#9CFF3A] hover:bg-white/5 transition-colors whitespace-nowrap'
                  >
                    {t('footer.auditSlowMist')}
                  </a>
                  <a
                    href='https://ca-public-s3.s3.ap-southeast-1.amazonaws.com/web/Tiko+Digital+IT+Audit+Report+2026+v1.0.pdf'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='px-4 py-2 text-xs md:text-sm text-gray-400 hover:text-[#9CFF3A] hover:bg-white/5 transition-colors whitespace-nowrap'
                  >
                    {t('footer.auditTyler')}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
