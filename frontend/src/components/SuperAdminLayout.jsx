import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function SuperAdminLayout({ children }) {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logout()
    } catch {
      // ignore
    } finally {
      navigate('/login')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 text-white">
      <div className="flex">
        <aside className="w-72 bg-slate-900/60 backdrop-blur p-6 border-r border-slate-800 min-h-screen flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-black font-bold">SA</div>
              <div>
                <div className="text-sm font-semibold">Superadmin</div>
                <div className="text-xs text-slate-400">Panel de administración</div>
              </div>
            </div>

            <nav className="flex flex-col gap-2">
              <Link to="/admin/superadmin" className="px-3 py-2 rounded bg-slate-800 hover:bg-slate-700">Usuarios</Link>
              <Link to="/admin/superadmin" className="px-3 py-2 rounded bg-slate-800 hover:bg-slate-700">Crear usuario</Link>
              <Link to="/dashboard" className="px-3 py-2 rounded bg-slate-800 hover:bg-slate-700">Volver al dashboard</Link>
            </nav>

            <div className="mt-6 text-sm text-slate-400">Acciones rápidas</div>
            <ul className="mt-2 text-sm text-slate-300 space-y-2">
              <li className="flex items-center gap-2"><span className="inline-block w-2 h-2 bg-cyan-400 rounded-full"/> Ajustar límites</li>
              <li className="flex items-center gap-2"><span className="inline-block w-2 h-2 bg-rose-400 rounded-full"/> Eliminar cuentas</li>
              <li className="flex items-center gap-2"><span className="inline-block w-2 h-2 bg-amber-400 rounded-full"/> Ver actividad</li>
            </ul>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-800 text-xs text-slate-500">
            <div className="mb-3">Versión 1.0 • Herramientas internas</div>
            <button onClick={handleLogout} className="w-full px-3 py-2 rounded bg-rose-600 hover:bg-rose-500 text-white font-medium">Cerrar sesión</button>
          </div>
        </aside>

        <main className="flex-1 p-8 max-w-full">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  )
}
