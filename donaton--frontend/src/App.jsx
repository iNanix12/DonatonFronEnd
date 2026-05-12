import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import LandingPage        from './pages/LandingPage'
import AdminPanel         from './pages/AdminPanel'
import PerfilUsuario      from './pages/PerfilUsuario'
import MisDonaciones      from './pages/MisDonaciones'
import ConfirmacionDeposito from './pages/ConfirmacionDeposito'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/"                   element={<LandingPage />} />
          <Route path="/admin"              element={<AdminPanel />} />
          <Route path="/perfil"             element={<PerfilUsuario />} />
          <Route path="/mis-donaciones"     element={<MisDonaciones />} />
          <Route path="/confirmar-deposito" element={<ConfirmacionDeposito />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}