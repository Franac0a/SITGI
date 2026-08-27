import { useState, type ReactNode } from 'react'
import { Header } from './Header'
import { Sidebar } from './Sidebar'

interface MainLayoutProps {
  children: ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false)

  return (
    <div className="min-h-screen w-full flex flex-col bg-white text-gray-900 font-sans antialiased">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <Header
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
      />

      <main className="flex-1 flex flex-col bg-white p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-7xl mx-auto flex-1 flex flex-col">
          {children}
        </div>
      </main>
    </div>
  )
}
