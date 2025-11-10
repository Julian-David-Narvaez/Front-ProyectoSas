"use client"

import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import api from "../../api/axios"

const WEEKDAYS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]

export default function SchedulesList() {
  const { businessId } = useParams()
  const navigate = useNavigate()
  const [schedules, setSchedules] = useState([])
  const [business, setBusiness] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    weekday: 1,
    start_time: "09:00",
    end_time: "18:00",
  })

  useEffect(() => {
    fetchData()
  }, [businessId])

  const fetchData = async () => {
    try {
      const [businessRes, schedulesRes] = await Promise.all([
        api.get(`/businesses/${businessId}`),
        api.get(`/businesses/${businessId}/schedules`),
      ])
      setBusiness(businessRes.data)
      setSchedules(schedulesRes.data)
    } catch (error) {
      console.error("Error al cargar datos:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (formData.end_time <= formData.start_time) {
      alert("La hora de fin debe ser mayor que la hora de inicio")
      return
    }
    setLoading(true)
    try {
      await api.post(`/businesses/${businessId}/schedules`, formData)
      setShowForm(false)
      setFormData({ weekday: 1, start_time: "09:00", end_time: "18:00" })
      await fetchData()
    } catch (error) {
      alert(error.response?.data?.message || "Error al crear horario")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (scheduleId) => {
    if (!confirm("¿Eliminar este horario?")) return
    setLoading(true)
    try {
      await api.delete(`/businesses/${businessId}/schedules/${scheduleId}`)
      setSchedules(schedules.filter((s) => s.id !== scheduleId))
    } catch (error) {
      alert(error.response?.data?.message || "Error al eliminar horario")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">Cargando...</div>
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <nav className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate(`/admin/business/${businessId}/services`)}
            className="text-cyan-400 hover:text-cyan-300"
          >
            ← Volver a Servicios
          </button>
          <h1 className="text-xl font-bold mt-1 text-white">{business?.name} - Horarios</h1>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Horarios de Atención</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded transition"
            aria-label={showForm ? "Cancelar agregar horario" : "Agregar horario"}
          >
            {showForm ? "Cancelar" : "+ Agregar Horario"}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-6">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Día</label>
                <select
                  value={formData.weekday}
                  onChange={(e) => setFormData({ ...formData, weekday: Number.parseInt(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:border-cyan-500"
                >
                  {WEEKDAYS.map((day, index) => (
                    <option key={index} value={index}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Hora Inicio</label>
                <input
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Hora Fin</label>
                <input
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              className="mt-4 w-full px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded transition"
            >
              Guardar Horario
            </button>
          </form>
        )}

        <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
          {schedules.length === 0 ? (
            <div className="p-8 text-center text-slate-400">No hay horarios configurados</div>
          ) : (
            <div className="divide-y divide-slate-700">
              {schedules.map((schedule) => (
                <div
                  key={schedule.id}
                  className="p-4 flex justify-between items-center hover:bg-slate-700/50 transition"
                >
                  <div>
                    <span className="font-semibold text-white">{WEEKDAYS[schedule.weekday]}</span>
                    <span className="text-slate-400 ml-4">
                      {schedule.start_time} - {schedule.end_time}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDelete(schedule.id)}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition"
                    aria-label={`Eliminar horario de ${WEEKDAYS[schedule.weekday]}`}
                  >
                    Eliminar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
