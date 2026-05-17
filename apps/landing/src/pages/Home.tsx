import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Hero } from '@/components/sections/Hero'
import { Problem } from '@/components/sections/Problem'
import { HowItWorks } from '@/components/sections/HowItWorks'
import { VisaTypes } from '@/components/sections/VisaTypes'

export default function HomePage() {
  return (
    <>
      <Header />
      <Hero />
      <Problem />
      <HowItWorks />
      <VisaTypes />
      <Footer />
    </>
  )
}
