import { AuthProvider } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import QuienesSomos from '../components/QuienesSomos'
import Noticias from '../components/Noticias'
import Footer from '../components/Footer'

export default function LandingPage() {
  return (
    <AuthProvider>
      <Navbar />
      <main>
        <Hero />
        <QuienesSomos />
        <Noticias />
      </main>
      <Footer />
    </AuthProvider>
  )
}