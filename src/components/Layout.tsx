import { Outlet } from 'react-router-dom'

export default function Layout() {
  return (
    <div className="flex min-h-screen w-full bg-slate-50 flex-col">
      <Outlet />
    </div>
  )
}
