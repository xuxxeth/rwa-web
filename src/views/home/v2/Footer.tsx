import React from 'react'
import { useTranslation } from '@/hooks/useTranslation'

export const Footer: React.FC = () => {
  const { t } = useTranslation('home')

  return (
    <footer className='relative bg-[#131416] border-t border-white/10 pt-12 pb-8 text-white overflow-hidden'>
      {/* Ambient Glow */}
      <div className='absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-[#9CFF3A] opacity-[0.03] blur-[150px] rounded-full pointer-events-none -translate-y-1/2 z-0' />

      <div className='max-w-7xl mx-auto px-6 md:px-12 relative z-10 flex flex-col'>
        {/* Top Section: Brand/Email & Socials */}
        <div className='flex flex-col md:flex-row justify-between items-start md:items-start gap-10 mb-8'>
          {/* Left: Logo & Email */}
          <div className='flex flex-col items-start gap-6'>
            <svg
              width='56'
              height='21'
              viewBox='0 0 56 21'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
              className='h-7 w-auto'
            >
              <path
                d='M47.8124 3.375C51.851 3.375 55.1249 6.64893 55.1249 10.6875C55.1249 14.7261 51.851 18 47.8124 18C43.7738 18 40.4999 14.7261 40.4999 10.6875C40.4999 6.64894 43.7738 3.37501 47.8124 3.375ZM47.8124 7.875C46.2591 7.875 44.9999 9.1342 44.9999 10.6875C44.9999 12.2408 46.2591 13.5 47.8124 13.5C49.3656 13.4999 50.6249 12.2407 50.6249 10.6875C50.6249 9.13425 49.3656 7.87508 47.8124 7.875Z'
                fill='#9CFF3A'
              />
              <path d='M14.625 6.75H10.125V18H4.5V6.75H0V2.25H14.625V6.75Z' fill='white' />
              <path
                d='M30.3749 8.25L34.8749 3.375H40.4999L33.7499 10.6875L40.4999 18H34.8749L30.3749 13.125V18H24.7499V1.125H30.3749V8.25Z'
                fill='white'
              />
              <rect
                x='22.4999'
                y='7.875'
                width='10.125'
                height='5.62501'
                transform='rotate(90 22.4999 7.875)'
                fill='white'
              />
              <path
                d='M19.6875 0C21.5515 0 23.0624 1.51103 23.0625 3.375C23.0625 5.23902 21.5515 6.75 19.6875 6.75C17.8235 6.74994 16.3125 5.23898 16.3125 3.375C16.3126 1.51107 17.8236 6.42939e-05 19.6875 0ZM17.6611 1.35059V2.65723H19.5137L17.6621 4.50879L18.5859 5.43262L20.4043 3.61426V5.40039H21.7109V1.35059H17.6611Z'
                fill='#9CFF3A'
              />
            </svg>

            <a
              href='mailto:contract@tiko.cc'
              className='text-gray-400 hover:text-[#9CFF3A] transition-colors text-sm font-medium'
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
          <div className='text-xs text-gray-500 font-light text-center md:text-left'>
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
          </div>
        </div>
      </div>
    </footer>
  )
}
