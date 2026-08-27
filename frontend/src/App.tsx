import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '@/context'
import { AppRoutes } from '@/routes/AppRoutes'
import { Toaster } from '@/components/ui/sonner'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster position="top-right" richColors />
      </AuthProvider>
    </BrowserRouter>
  )
}

