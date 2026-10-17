import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import ModalHost from '../modals/ModalHost'


export default function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="flex min-h-screen">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <main className="flex min-w-0 flex-1 flex-col lg:ml-66">
        <Header onMenu={() => setMenuOpen(true)} />
        <div className="flex-1 px-4 pt-7 pb-12 sm:px-8">
          <Outlet />
        </div>
      </main>
      <ModalHost />
    </div>
  )
}
