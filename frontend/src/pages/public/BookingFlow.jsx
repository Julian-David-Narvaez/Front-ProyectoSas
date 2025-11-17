"use client"

import { useEffect, useState } from "react"
import { useParams, useSearchParams } from "react-router-dom"
import api from "../../api/axios"

export default function BookingFlow() {
  const { slug } = useParams()
  const [searchParams] = useSearchParams()
  const serviceId = searchParams.get("service")

  const [business, setBusiness] = useState(null)
  const [service, setService] = useState(null)
  const [employees, setEmployees] = useState([])
  const [activeEmployees, setActiveEmployees] = useState([])
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [step, setStep] = useState(1)
  const [selectedDate, setSelectedDate] = useState("")
  const [availableSlots, setAvailableSlots] = useState([])
  const [selectedTime, setSelectedTime] = useState("")
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_email: "",
  })
  const [booking, setBooking] = useState(null)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchBusiness()
    fetchEmployees()
  }, [slug])

  const fetchBusiness = async () => {
    try {
      const response = await api.get(`/businesses/slug/${slug}`)
      setBusiness(response.data)

      if (serviceId) {
        const selectedService = response.data.services.find((s) => s.id === Number.parseInt(serviceId))
        setService(selectedService)
      }
    } catch (error) {
      console.error("Error al cargar negocio:", error)
    }
  }

  const fetchEmployees = async () => {
    try {
      const response = await api.get(`/businesses/slug/${slug}`)
      const businessData = response.data
      const employeesResponse = await api.get(`/businesses/${businessData.id}/employees`)
      setEmployees(employeesResponse.data)
      // Filtrar empleados activos (asumiendo propiedad 'active')
      const activos = employeesResponse.data.filter(e => e.active !== false)
      setActiveEmployees(activos)
      // Si no hay empleados activos, avanzar automáticamente al paso de fecha
      if (activos.length === 0) {
        setStep(2)
      }
    } catch (error) {
      console.error("Error al cargar empleados:", error)
    }
  }

  const handleEmployeeSelect = (employee) => {
    setSelectedEmployee(employee)
    setStep(2)
  }

  const handleDateChange = async (date) => {
    setSelectedDate(date)
    setSelectedTime("")
    setError("")
    setLoading(true)

    try {
      const params = {
        service_id: service.id,
        date: date,
      }
      
      if (selectedEmployee) {
        params.employee_id = selectedEmployee.id
      }

      const response = await api.get(`/businesses/${business.id}/availability`, { params })
      setAvailableSlots(response.data.available_slots)
      if (response.data.available_slots.length > 0) {
        setStep(3)
      } else {
        setError("No hay horarios disponibles para esta fecha")
      }
    } catch (error) {
      console.error("Error al cargar disponibilidad:", error)
      setError("Error al cargar disponibilidad")
    } finally {
      setLoading(false)
    }
  }

  const handleTimeSelect = (time) => {
    setSelectedTime(time)
    setStep(4)
  }

  const isValidEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(String(email).toLowerCase())
  }

  const extractApiError = (err) => {
    if (!navigator.onLine) return "Sin conexión. Revisa tu conexión a internet."
    if (err.response) {
      const { status, data } = err.response
      if (status === 409) {
        return data?.message || "Lo sentimos, este horario ya fue reservado. Por favor elige otro."
      }
      if (status === 422) {
        const errors = data?.errors || data
        if (errors && typeof errors === "object") {
          const first = Object.values(errors).flat?.()[0] || Object.values(errors)[0][0]
          return first || data?.message || "Datos inválidos. Revisa el formulario."
        }
        return data?.message || "Datos inválidos. Revisa el formulario."
      }
      if (data?.message) return data.message
      return `Error del servidor (${status}). Intenta de nuevo más tarde.`
    }
    if (err.request) {
      return "No se obtuvo respuesta del servidor. Intenta de nuevo más tarde."
    }
    return err.message || "Error desconocido. Intenta de nuevo."
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (formData.customer_name.trim().length < 3) {
      setError("El nombre debe tener al menos 3 caracteres")
      setLoading(false)
      return
    }

    if (!isValidEmail(formData.customer_email)) {
      setError("Introduce un correo electrónico válido")
      setLoading(false)
      return
    }

    if (!selectedDate) {
      setError("Selecciona una fecha")
      setLoading(false)
      return
    }

    if (!selectedTime) {
      setError("Selecciona una hora")
      setLoading(false)
      return
    }

    try {
      const payload = {
        business_id: business.id,
        service_id: service.id,
        employee_id: selectedEmployee?.id || null,
        customer_name: formData.customer_name.trim(),
        customer_email: formData.customer_email.trim().toLowerCase(),
        date: selectedDate,
        time: selectedTime,
      }

      const response = await api.post("/bookings", payload)

      setBooking(response.data.booking)
      setStep(5)
    } catch (err) {
      const message = extractApiError(err)
      setError(message)
      console.error("Booking error:", err)
    } finally {
      setLoading(false)
    }
  }

  const getMinDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split("T")[0]
  }

  if (!business || !service) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950 to-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-cyan-400 border-t-transparent"></div>
          <p className="mt-4 text-cyan-400 font-semibold">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950 to-gray-950">
      <div className="bg-gray-900/40 backdrop-blur-xl border-b border-cyan-500/20 shadow-lg shadow-cyan-500/10">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <a
            href={`/${slug}`}
            className="text-cyan-400 hover:text-cyan-300 mb-2 inline-flex items-center gap-2 transition-colors group"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span>
            <span>Volver a {business.name}</span>
          </a>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            {service.name}
          </h1>
          <div className="flex items-center gap-4 mt-3">
            <span className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-cyan-400 text-sm font-medium">
              ⏱️ {service.duration_minutes} min
            </span>
            <span className="px-3 py-1 bg-pink-500/10 border border-pink-500/30 rounded-full text-pink-400 text-sm font-medium">
              💰 ${Number.parseFloat(service.price).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          {["Empleado", "Fecha", "Hora", "Datos", "Confirmación"].map((label, index) => (
            <div key={index} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                    step > index + 1
                      ? "bg-gradient-to-br from-green-400 to-emerald-500 text-white shadow-lg shadow-green-500/50"
                      : step === index + 1
                        ? "bg-gradient-to-br from-cyan-400 to-blue-500 text-white shadow-lg shadow-cyan-500/50 scale-110"
                        : "bg-gray-800/50 text-gray-500 border border-gray-700"
                  }`}
                >
                  {step > index + 1 ? "✓" : index + 1}
                </div>
                <span className={`mt-2 text-xs font-medium ${step >= index + 1 ? "text-cyan-400" : "text-gray-600"}`}>
                  {label}
                </span>
              </div>
              {index < 4 && (
                <div className="flex-1 h-1 mx-1 rounded-full overflow-hidden bg-gray-800/50">
                  <div
                    className={`h-full transition-all duration-500 ${
                      step > index + 1 ? "w-full bg-gradient-to-r from-green-400 to-emerald-500" : "w-0"
                    }`}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {error && (
          <div className="bg-red-500/10 backdrop-blur-sm border border-red-500/30 text-red-400 px-6 py-4 rounded-2xl mb-6 shadow-lg shadow-red-500/10">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <p className="flex-1">{error}</p>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="bg-gray-900/40 backdrop-blur-xl border border-cyan-500/20 rounded-3xl shadow-2xl shadow-cyan-500/10 p-8">
            <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Selecciona un empleado
            </h2>
            {activeEmployees.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400 mb-4">No hay empleados activos disponibles. Continuar sin seleccionar empleado.</p>
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/30 transition-all font-bold"
                >
                  Continuar
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {activeEmployees.map((employee) => (
                  <button
                    key={employee.id}
                    onClick={() => handleEmployeeSelect(employee)}
                    className="p-6 bg-gray-800/50 border-2 border-cyan-500/30 rounded-2xl hover:bg-cyan-500/10 hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/20 hover:scale-105 transition-all text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                        {employee.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white">{employee.name}</h3>
                        {employee.email && (
                          <p className="text-sm text-gray-400">{employee.email}</p>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
                <button
                  onClick={() => {
                    setSelectedEmployee(null)
                    setStep(2)
                  }}
                  className="p-6 bg-gray-800/50 border-2 border-gray-600 rounded-2xl hover:bg-gray-700/50 hover:border-gray-500 transition-all text-center"
                >
                  <div className="text-4xl mb-2">👤</div>
                  <p className="text-gray-400 font-medium">Sin preferencia</p>
                </button>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="bg-gray-900/40 backdrop-blur-xl border border-cyan-500/20 rounded-3xl shadow-2xl shadow-cyan-500/10 p-8">
            <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Selecciona una fecha
            </h2>
            {selectedEmployee && (
              <div className="mb-6 p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-2xl">
                <p className="text-gray-300">
                  Empleado seleccionado:{" "}
                  <strong className="text-cyan-400">{selectedEmployee.name}</strong>
                </p>
              </div>
            )}
            <input
              type="date"
              min={getMinDate()}
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="w-full px-6 py-4 bg-gray-800/50 border border-cyan-500/30 rounded-2xl text-lg text-white focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all"
            />
            <button
              onClick={() => setStep(1)}
              className="mt-6 px-6 py-3 bg-gray-800/50 border border-gray-700 text-gray-300 rounded-xl hover:bg-gray-700/50 hover:border-gray-600 transition-all"
            >
              ← Cambiar empleado
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="bg-gray-900/40 backdrop-blur-xl border border-cyan-500/20 rounded-3xl shadow-2xl shadow-cyan-500/10 p-8">
            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Selecciona un horario
            </h2>
            <div className="mb-6 p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-2xl">
              {selectedEmployee && (
                <p className="text-gray-300 mb-1">
                  Empleado:{" "}
                  <strong className="text-cyan-400">{selectedEmployee.name}</strong>
                </p>
              )}
              <p className="text-gray-300">
                Fecha:{" "}
                <strong className="text-cyan-400">
                  {new Date(selectedDate + "T00:00:00").toLocaleDateString("es-ES", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </strong>
              </p>
            </div>
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-cyan-400 border-t-transparent"></div>
                <p className="mt-4 text-cyan-400">Cargando horarios...</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {availableSlots.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => handleTimeSelect(slot)}
                    className="px-4 py-3 bg-gray-800/50 border-2 border-cyan-500/30 text-cyan-400 rounded-xl hover:bg-cyan-500/10 hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/20 hover:scale-105 transition-all font-semibold"
                  >
                    {slot}
                  </button>
                ))}
              </div>
            )}
            <button
              onClick={() => setStep(2)}
              className="mt-6 px-6 py-3 bg-gray-800/50 border border-gray-700 text-gray-300 rounded-xl hover:bg-gray-700/50 hover:border-gray-600 transition-all"
            >
              ← Cambiar fecha
            </button>
          </div>
        )}

        {step === 4 && (
          <div className="bg-gray-900/40 backdrop-blur-xl border border-cyan-500/20 rounded-3xl shadow-2xl shadow-cyan-500/10 p-8">
            <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Tus datos
            </h2>
            <div className="mb-6 p-6 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 border border-cyan-500/20 rounded-2xl space-y-2">
              <p className="text-gray-300">
                <strong className="text-cyan-400">Servicio:</strong> {service.name}
              </p>
              {selectedEmployee && (
                <p className="text-gray-300">
                  <strong className="text-cyan-400">Empleado:</strong> {selectedEmployee.name}
                </p>
              )}
              <p className="text-gray-300">
                <strong className="text-cyan-400">Fecha:</strong>{" "}
                {new Date(selectedDate + "T00:00:00").toLocaleDateString("es-ES", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <p className="text-gray-300">
                <strong className="text-cyan-400">Hora:</strong> {selectedTime}
              </p>
              <p className="text-gray-300">
                <strong className="text-cyan-400">Duración:</strong> {service.duration_minutes} minutos
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-cyan-400 mb-2">Nombre completo *</label>
                <input
                  type="text"
                  value={formData.customer_name}
                  onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                  className="w-full px-6 py-3 bg-gray-800/50 border border-cyan-500/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all"
                  placeholder="Ingresa tu nombre completo"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-cyan-400 mb-2">Email *</label>
                <input
                  type="email"
                  value={formData.customer_email}
                  onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                  className="w-full px-6 py-3 bg-gray-800/50 border border-cyan-500/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all"
                  placeholder="tu@email.com"
                  required
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex-1 px-6 py-3 bg-gray-800/50 border border-gray-700 text-gray-300 rounded-xl hover:bg-gray-700/50 hover:border-gray-600 transition-all font-semibold"
                >
                  ← Atrás
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all font-bold"
                >
                  {loading ? "Reservando..." : "Confirmar Reserva"}
                </button>
              </div>
            </form>
          </div>
        )}

        {step === 5 && booking && (
          <div className="bg-gray-900/40 backdrop-blur-xl border border-green-500/20 rounded-3xl shadow-2xl shadow-green-500/10 p-8 text-center">
            <div className="text-7xl mb-6 animate-bounce">✅</div>
            <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              ¡Reserva Confirmada!
            </h2>
            <div className="max-w-md mx-auto text-left bg-gradient-to-br from-cyan-500/5 to-purple-500/5 border border-cyan-500/20 p-6 rounded-2xl mb-6 space-y-2">
              <p className="text-gray-300">
                <strong className="text-cyan-400">Servicio:</strong> {booking.service.name}
              </p>
              {booking.employee && (
                <p className="text-gray-300">
                  <strong className="text-cyan-400">Empleado:</strong> {booking.employee.name}
                </p>
              )}
              <p className="text-gray-300">
                <strong className="text-cyan-400">Fecha:</strong>{" "}
                {new Date(booking.start_at).toLocaleDateString("es-ES", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <p className="text-gray-300">
                <strong className="text-cyan-400">Hora:</strong>{" "}
                {new Date(booking.start_at).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
              </p>
              <p className="text-gray-300">
                <strong className="text-cyan-400">Duración:</strong> {booking.service.duration_minutes} minutos
              </p>
              <p className="text-gray-300">
                <strong className="text-cyan-400">Cliente:</strong> {booking.customer_name}
              </p>
              <p className="text-gray-300">
                <strong className="text-cyan-400">Email:</strong> {booking.customer_email}
              </p>
            </div>
            <p className="text-gray-400 mb-8">
              Hemos enviado un correo de confirmación a{" "}
              <span className="text-cyan-400 font-semibold">{booking.customer_email}</span>
            </p>
            <a
              href={`/${slug}`}
              className="inline-block px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all font-bold"
            >
              Volver a {business.name}
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
