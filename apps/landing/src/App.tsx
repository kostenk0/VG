import { BrowserRouter, Route, Routes } from 'react-router-dom'
import HomePage from '@/pages/Home'
import DisclaimerPage from '@/pages/Disclaimer'
import NotFoundPage from '@/pages/NotFound'

const BASE_PATH = import.meta.env.BASE_URL.replace(/\/$/, '')

export default function App() {
  return (
    <BrowserRouter basename={BASE_PATH}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/disclaimer" element={<DisclaimerPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}
