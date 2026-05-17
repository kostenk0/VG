import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Hero } from '@/components/sections/Hero'
import { Problem } from '@/components/sections/Problem'
import { HowItWorks } from '@/components/sections/HowItWorks'

export default function HomePage() {
  return (
    <>
      <Header />
      <Hero />
      <Problem />
      <HowItWorks />
      <Footer />
    </>
  )
}
