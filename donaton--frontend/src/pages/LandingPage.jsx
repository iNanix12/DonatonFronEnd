import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import QuienesSomos from '../components/QuienesSomos'
import Noticias from '../components/Noticias'
import Footer from '../components/Footer'

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <QuienesSomos />
        <Noticias />
      </main>
      <Footer />
    </>
  )
}