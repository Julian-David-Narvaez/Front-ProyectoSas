"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../api/axios"
import { useAuth } from "../context/AuthContext"

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [businesses, setBusinesses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBusinesses()
  }, [])

  const fetchBusinesses = async () => {
    try {
      const response = await api.get("/businesses")
      // Backend puede devolver { data: [...], permissions: {...} } o directamente el array
      const payload = response.data && response.data.data ? response.data.data : response.data
      setBusinesses(payload)
    } catch (error) {
      console.error("Error al cargar negocios:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate("/login")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-cyan-500/10 rounded-full animate-pulse"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black">
      <nav className="bg-gray-900/50 backdrop-blur-xl border-b border-cyan-500/20 shadow-lg shadow-cyan-500/5">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
            Dashboard
          </h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500/10 text-red-400 rounded-lg border border-red-500/30 hover:bg-red-500/20 hover:border-red-500/50 transition-all duration-300 font-medium shadow-lg shadow-red-500/10"
          >
            Cerrar Sesión
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8 p-6 bg-gray-900/30 backdrop-blur-sm rounded-xl border border-cyan-500/20 shadow-xl shadow-cyan-500/5">
          <h2 className="text-3xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500">
            Bienvenido, {user?.name}!
          </h2>
          <p className="text-gray-400 flex items-center gap-2">
            <span className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></span>
            {user?.email}
          </p>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-semibold text-gray-100">Mis Negocios</h3>
          <div className="flex items-center gap-3">
            {user?.role === 'superadmin' && (
              <button
                onClick={() => navigate('/admin/superadmin')}
                className="px-4 py-2 bg-amber-500 text-black rounded-lg font-semibold shadow hover:opacity-90 transition"
              >
                Panel Superadmin
              </button>
            )}

            <button
              onClick={() => navigate('/admin/business/new')}
              className="group relative px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all duration-300 overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                <span className="text-xl">+</span>
                Crear Negocio
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </div>
        </div>

        {businesses.length === 0 ? (
          <div className="bg-gray-900/30 backdrop-blur-sm rounded-xl border border-cyan-500/20 shadow-xl shadow-cyan-500/5 p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center">
              <svg className="w-10 h-10 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <p className="text-gray-400 mb-6 text-lg">No tienes negocios creados</p>
            <button
              onClick={() => navigate("/admin/business/new")}
              className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all duration-300"
            >
              Crear tu primer negocio
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {businesses.map((business) => (
              <div
                key={business.id}
                className="group bg-gray-900/30 backdrop-blur-sm rounded-xl border border-cyan-500/20 hover:border-cyan-500/40 shadow-xl shadow-cyan-500/5 hover:shadow-cyan-500/20 transition-all duration-300 p-6"
              >
                <h4 className="text-xl font-semibold mb-2 text-gray-100 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-cyan-400 group-hover:to-blue-500 transition-all duration-300">
                  {business.name}
                </h4>
                <p className="text-gray-400 text-sm mb-6 line-clamp-2">{business.description}</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => navigate(`/admin/business/${business.id}/services`)}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm rounded-lg font-medium shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all duration-300"
                  >
                    Gestionar
                  </button>
                  <button
                    onClick={async () => {
                      if (!window.confirm('¿Estás seguro de eliminar este negocio y todos sus datos? Esta acción no se puede deshacer.')) return
                      try {
                        await api.delete(`/businesses/${business.id}`)
                        setBusinesses((prev) => prev.filter((b) => b.id !== business.id))
                      } catch (error) {
                        console.error('Error al eliminar negocio:', error)
                        window.alert('No se pudo eliminar el negocio')
                      }
                    }}
                    className="px-4 py-2.5 bg-red-700 text-white text-sm rounded-lg font-medium hover:bg-red-600 transition-all duration-200"
                  >
                    Eliminar
                  </button>
                  <a
                    href={`/${business.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-4 py-2.5 bg-gray-800/50 text-gray-300 text-sm rounded-lg font-medium border border-gray-700/50 hover:bg-gray-800 hover:border-gray-600 transition-all duration-300 text-center"
                  >
                    Ver Landing
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
