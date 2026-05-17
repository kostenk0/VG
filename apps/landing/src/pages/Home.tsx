import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Hero } from '@/components/sections/Hero'
import { Problem } from '@/components/sections/Problem'
import { HowItWorks } from '@/components/sections/HowItWorks'
import { VisaTypes } from '@/components/sections/VisaTypes'
import { PricingTeaser } from '@/components/sections/PricingTeaser'
import { FAQ } from '@/components/sections/FAQ'
import { FinalCTA } from '@/components/sections/FinalCTA'

export default function HomePage() {
  return (
    <>
      <Header />
      <Hero />
      <Problem />
      <HowItWorks />
      <VisaTypes />
      <PricingTeaser />
      <FAQ />
      <FinalCTA />
      <Footer />
    </>
  )
}
