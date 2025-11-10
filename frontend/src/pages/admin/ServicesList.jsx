"use client"

import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import api from "../../api/axios"

export default function ServicesList() {
  const { businessId } = useParams()
  const navigate = useNavigate()
  const [services, setServices] = useState([])
  const [business, setBusiness] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [businessRes, servicesRes] = await Promise.all([
          api.get(`/businesses/${businessId}`),
          api.get(`/businesses/${businessId}/services`),
        ])
        setBusiness(businessRes.data)
        setServices(servicesRes.data)
      } catch (error) {
        console.error("Error al cargar datos:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [businessId])

  const handleDelete = async (serviceId) => {
    if (!window.confirm("¿Estás seguro de eliminar este servicio?")) return
    try {
      await api.delete(`/businesses/${businessId}/services/${serviceId}`)
      setServices(services.filter((s) => s.id !== serviceId))
    } catch (error) {
      console.error("Error al eliminar servicio:", error)
      window.alert("Error al eliminar servicio")
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">Cargando...</div>
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <nav className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <button onClick={() => navigate("/dashboard")} className="text-cyan-400 hover:text-cyan-300 text-sm">
              ← Dashboard
            </button>
            <h1 className="text-xl font-bold mt-1 text-white">{business?.name}</h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate(`/admin/business/${businessId}/bookings`)}
              className="px-4 py-2 bg-cyan-500 text-slate-950 rounded hover:bg-cyan-400 font-medium"
            >
              📅 Agenda
            </button>
            <button
              onClick={() => navigate(`/admin/business/${businessId}/schedules`)}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded hover:bg-slate-700"
            >
              Horarios
            </button>
            <button
              onClick={() => navigate(`/admin/business/${businessId}/page`)}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded hover:bg-slate-700"
            >
              Editar Landing
            </button>
          </div>
        </div>
      </nav>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Servicios</h2>
          <button
            onClick={() => navigate(`/admin/business/${businessId}/services/new`)}
            className="px-4 py-2 bg-cyan-500 text-slate-950 rounded hover:bg-cyan-400 font-medium"
          >
            + Agregar Servicio
          </button>
        </div>

        {services.length === 0 ? (
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-8 text-center">
            <p className="text-slate-400 mb-4">No tienes servicios creados</p>
            <button
              onClick={() => navigate(`/admin/business/${businessId}/services/new`)}
              className="flex-1 px-6 py-2 bg-cyan-500 text-slate-950 rounded-md hover:bg-cyan-400 disabled:opacity-50 font-medium"
            >
              Crear primer servicio
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div
                key={service.id}
                className="bg-slate-800 rounded-lg border border-slate-700 hover:border-slate-600 transition overflow-hidden"
              >
                {service.image_url && (
                  <img
                    src={service.image_url || "/placeholder.svg"}
                    alt={service.name}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-2 text-white">{service.name}</h3>
                  <div className="flex justify-between items-center text-sm text-slate-400 mb-4">
                    <span>{service.duration_minutes} min</span>
                    <span className="text-cyan-400 font-semibold">${Number.parseFloat(service.price).toFixed(2)}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/admin/business/${businessId}/services/${service.id}/edit`)}
                      className="flex-1 px-6 py-2 bg-cyan-500 text-slate-950 rounded-md hover:bg-cyan-400 disabled:opacity-50 font-medium"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(service.id)}
                      className="px-4 py-2 bg-red-900 text-red-100 text-sm rounded hover:bg-red-800"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
