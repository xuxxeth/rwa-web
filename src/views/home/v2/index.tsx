import { Navbar } from './Navbar'
import { Hero } from './Hero'
import { Compliance } from './Compliance'
import { Process } from './Process'
import { WhyUs } from './WhyUs'
import { Trust } from './Trust'
import { Innovation } from './Innovation'
import { Partners } from './Partners'
import { Footer } from './Footer'

import { useEffect } from 'react'

import './index.css'

function Index() {
  // 进入首页时隐藏滚动条，离开时恢复
  useEffect(() => {
    document.documentElement.classList.add('scrollbar-hide')

    return () => {
      document.documentElement.classList.remove('scrollbar-hide')
    }
  }, [])

  return (
    <div className='bg-[#f8fafc] min-h-screen text-gray-900 selection:bg-brand selection:text-black relative'>
      <Navbar />
      <main className='relative z-10'>
        <Hero />
        <Compliance />
        <Process />
        <WhyUs />
        <Trust />
        <Innovation />
        <Partners />
      </main>
      <Footer />
    </div>
  )
}

export default Index
