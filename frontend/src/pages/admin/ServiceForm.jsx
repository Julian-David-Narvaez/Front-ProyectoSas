"use client"

import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import api from "../../api/axios"

export default function ServiceForm() {
  const { businessId, serviceId } = useParams()
  const navigate = useNavigate()
  const isEdit = !!serviceId

  const [formData, setFormData] = useState({
    name: "",
    duration_minutes: 30,
    price: "",
    image_url: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isEdit) {
      fetchService()
    }
  }, [serviceId])

  const fetchService = async () => {
    try {
      const response = await api.get(`/businesses/${businessId}/services`)
      const service = response.data.find((s) => s.id === Number.parseInt(serviceId))
      if (service) {
        setFormData({
          name: service.name,
          duration_minutes: service.duration_minutes,
          price: service.price,
          image_url: service.image_url || "",
        })
      }
    } catch (error) {
      console.error("Error al cargar servicio:", error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      if (isEdit) {
        await api.put(`/businesses/${businessId}/services/${serviceId}`, formData)
      } else {
        await api.post(`/businesses/${businessId}/services`, formData)
      }
      navigate(`/admin/business/${businessId}/services`)
    } catch (err) {
      setError(err.response?.data?.message || "Error al guardar servicio")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <nav className="bg-slate-900 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate(`/admin/business/${businessId}/services`)}
            className="text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            ← Volver a Servicios
          </button>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-white">{isEdit ? "Editar Servicio" : "Crear Servicio"}</h1>

        {error && (
          <div className="bg-red-900/20 border border-red-700 text-red-300 px-4 py-3 rounded mb-4">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="bg-slate-800 rounded-lg border border-slate-700 p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Nombre del Servicio *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Duración (minutos) *</label>
              <input
                type="number"
                min="1"
                value={formData.duration_minutes}
                onChange={(e) => setFormData({ ...formData, duration_minutes: Number.parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Precio *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">URL de Imagen (opcional)</label>
            <input
              type="url"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              placeholder="https://ejemplo.com/imagen.jpg"
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
            {formData.image_url && (
              <img
                src={formData.image_url || "/placeholder.svg"}
                alt="Preview"
                className="mt-2 w-full h-48 object-cover rounded-md"
                onError={(e) => (e.target.style.display = "none")}
              />
            )}
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate(`/admin/business/${businessId}/services`)}
              className="flex-1 px-4 py-2 border border-slate-600 rounded-md text-slate-300 hover:bg-slate-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-cyan-500 text-slate-950 font-medium rounded-md hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Guardando..." : isEdit ? "Actualizar" : "Crear"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
