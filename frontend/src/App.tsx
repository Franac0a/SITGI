import { BrowserRouter } from 'react-router-dom'
import { AuthProvider, NotificationProvider } from '@/context'
import { AppRoutes } from '@/routes/AppRoutes'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <AppRoutes />
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
