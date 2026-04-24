import React from 'react'
import { Outlet } from 'react-router-dom'
import Header from '../components/Header'

function Layout() {
  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      <Header />

      <main className="flex-1 w-full p-6">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout