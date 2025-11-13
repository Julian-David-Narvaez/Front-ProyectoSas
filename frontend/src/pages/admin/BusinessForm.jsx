"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../../api/axios"

export default function BusinessForm() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    // Validaciones
    if (formData.name.trim().length < 3) {
      setError("El nombre del negocio debe tener al menos 3 caracteres")
      setLoading(false)
      return
    }

    if (formData.name.trim().length > 100) {
      setError("El nombre del negocio no debe exceder 100 caracteres")
      setLoading(false)
      return
    }

    try {
      const response = await api.post("/businesses", formData)
      navigate(`/admin/business/${response.data.id}/services`)
    } catch (err) {
      setError(err.response?.data?.message || "Error al crear negocio")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <nav className="bg-slate-800 shadow-sm border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button onClick={() => navigate("/dashboard")} className="text-cyan-400 hover:text-cyan-300">
            ← Volver al Dashboard
          </button>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-white">Crear Nuevo Negocio</h1>

        {error && (
          <div className="bg-red-500/10 border-l-4 border-red-500 text-red-400 px-4 py-3 rounded-lg mb-4 flex items-start gap-3 shadow-lg shadow-red-500/10">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="flex-1">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-slate-800 rounded-lg shadow p-6 space-y-6 border border-slate-700">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Nombre del Negocio *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Descripción</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="4"
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="flex-1 px-4 py-2 border border-slate-600 rounded-md hover:bg-slate-700 text-slate-300 hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-cyan-500 text-white rounded-md hover:bg-cyan-600 disabled:opacity-50 font-medium"
            >
              {loading ? "Creando..." : "Crear Negocio"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
