"use client"

import esLocale from "@fullcalendar/core/locales/es"
import dayGridPlugin from "@fullcalendar/daygrid"
import interactionPlugin from "@fullcalendar/interaction"
import listPlugin from "@fullcalendar/list"
import FullCalendar from "@fullcalendar/react"
import timeGridPlugin from "@fullcalendar/timegrid"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import api from "../../api/axios"

export default function BookingsCalendar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const businessId = searchParams.get("businessId")
  const [business, setBusiness] = useState(null)
  const [bookings, setBookings] = useState([])
  const [events, setEvents] = useState([])
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const initialView = "timeGridDay"

  useEffect(() => {
    fetchData()
  }, [businessId])

  const fetchData = async () => {
    try {
      const [businessRes, bookingsRes] = await Promise.all([
        api.get(`/businesses/${businessId}`),
        api.get(`/businesses/${businessId}/bookings`),
      ])
      setBusiness(businessRes.data)
      setBookings(bookingsRes.data)

      const calendarEvents = bookingsRes.data
        .filter((booking) => booking.status !== "cancelled")
        .map((booking) => ({
          id: booking.id,
          title: `${booking.service.name} - ${booking.customer_name}`,
          start: booking.start_at,
          end: booking.end_at,
          backgroundColor: booking.status === "confirmed" ? "#06b6d4" : "#10b981",
          borderColor: booking.status === "confirmed" ? "#0891b2" : "#059669",
          extendedProps: {
            booking: booking,
          },
        }))

      setEvents(calendarEvents)
    } catch (error) {
      console.error("Error al cargar datos:", error.message || error)
    } finally {
      setLoading(false)
    }
  }

  const handleEventClick = (info) => {
    setSelectedBooking(info.event.extendedProps.booking)
  }

  const handleCancelBooking = async () => {
    if (!confirm("¿Eliminar esta reserva?")) return

    try {
      await api.delete(`/businesses/${businessId}/bookings/${selectedBooking.id}`)
      setSelectedBooking(null)
      fetchData()
      alert("Reserva eliminada exitosamente")
    } catch (error) {
      console.error("Error al eliminar reserva:", error)
      alert(`Error al eliminar reserva: ${error.message || error}`)
    }
  }

  const handleCompleteBooking = async () => {
    try {
      await api.put(`/businesses/${businessId}/bookings/${selectedBooking.id}`, {
        status: "completed",
      })
      setSelectedBooking(null)
      fetchData()
      alert("Reserva marcada como completada")
    } catch (error) {
      console.error("Error al actualizar reserva:", error)
      alert("Error al actualizar reserva")
    }
  }

  const getTodayBookings = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    return bookings.filter((booking) => {
      const bookingDate = new Date(booking.start_at)
      return bookingDate >= today && bookingDate < tomorrow && booking.status !== "cancelled"
    })
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#1e293b] text-slate-300">Cargando...</div>
  }

  const todayBookings = getTodayBookings()

  return (
    <div className="min-h-screen bg-[#1e293b]">
      <nav className="bg-[#2d3748] shadow-sm border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <button
              onClick={() => router.push(`/admin/business/${businessId}/services`)}
              className="text-cyan-400 hover:text-cyan-300 text-sm font-medium"
            >
              ← Dashboard
            </button>
            <h1 className="text-2xl font-bold mt-1 text-white">{business?.name}</h1>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-cyan-400 text-slate-900 rounded-md font-semibold hover:bg-cyan-300 transition-colors">
              📅 Agenda
            </button>
            <button
              onClick={() => router.push(`/admin/business/${businessId}/services`)}
              className="px-4 py-2 bg-slate-700 text-slate-200 rounded-md font-medium hover:bg-slate-600 transition-colors"
            >
              Horarios
            </button>
            <button className="px-4 py-2 bg-slate-700 text-slate-200 rounded-md font-medium hover:bg-slate-600 transition-colors">
              Editar Landing
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-[#334155] rounded-lg shadow-lg p-6 border border-slate-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-300 text-sm font-medium">Reservas Hoy</p>
                <p className="text-3xl font-bold text-cyan-400">{todayBookings.length}</p>
              </div>
              <div className="text-4xl">📅</div>
            </div>
          </div>
          <div className="bg-[#334155] rounded-lg shadow-lg p-6 border border-slate-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-300 text-sm font-medium">Total Reservas</p>
                <p className="text-3xl font-bold text-white">
                  {bookings.filter((b) => b.status !== "cancelled").length}
                </p>
              </div>
              <div className="text-4xl">📊</div>
            </div>
          </div>
          <div className="bg-[#334155] rounded-lg shadow-lg p-6 border border-slate-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-300 text-sm font-medium">Canceladas</p>
                <p className="text-3xl font-bold text-red-400">
                  {bookings.filter((b) => b.status === "cancelled").length}
                </p>
              </div>
              <div className="text-4xl">❌</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-[#334155] rounded-lg shadow-lg p-6 border border-slate-600">
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
              initialView={initialView}
              locale={esLocale}
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "timeGridDay,timeGridWeek,dayGridMonth,listWeek",
              }}
              buttonText={{
                today: "Hoy",
                month: "Mes",
                week: "Semana",
                day: "Día",
                list: "Lista",
              }}
              events={events}
              eventClick={handleEventClick}
              height="auto"
              slotMinTime="08:00:00"
              slotMaxTime="21:00:00"
              allDaySlot={false}
              nowIndicator={true}
              eventTimeFormat={{
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              }}
            />
          </div>

          <div className="bg-[#334155] rounded-lg shadow-lg p-6 border border-slate-600">
            <h3 className="text-lg font-bold mb-4 text-white">Reservas de Hoy</h3>

            {todayBookings.length === 0 ? (
              <p className="text-slate-300 text-center py-8">No hay reservas para hoy</p>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {todayBookings
                  .sort((a, b) => new Date(a.start_at) - new Date(b.start_at))
                  .map((booking) => (
                    <div
                      key={booking.id}
                      onClick={() => setSelectedBooking(booking)}
                      className="border-l-4 border-cyan-400 bg-[#475569] p-3 rounded cursor-pointer hover:bg-[#5a6b84] transition-colors"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-semibold text-sm text-white">
                          {new Date(booking.start_at).toLocaleTimeString("es-ES", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded font-medium ${
                            booking.status === "confirmed"
                              ? "bg-cyan-400 text-slate-900"
                              : booking.status === "completed"
                                ? "bg-green-500 text-white"
                                : "bg-slate-600 text-slate-200"
                          }`}
                        >
                          {booking.status === "confirmed"
                            ? "Confirmada"
                            : booking.status === "completed"
                              ? "Completada"
                              : "Pendiente"}
                        </span>
                      </div>
                      <p className="font-medium text-sm text-white">{booking.customer_name}</p>
                      <p className="text-xs text-slate-300">{booking.service.name}</p>
                      <p className="text-xs text-slate-400">{booking.service.duration_minutes} min</p>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        {selectedBooking && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-[#334155] rounded-lg max-w-md w-full p-6 border border-slate-600 shadow-2xl">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-white">Detalles de la Reserva</h2>
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="text-slate-300 hover:text-white text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              <div className="space-y-3 mb-6">
                <div>
                  <p className="text-sm text-slate-300 font-medium">Cliente</p>
                  <p className="font-semibold text-white">{selectedBooking.customer_name}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-300 font-medium">Email</p>
                  <p className="font-semibold text-white">{selectedBooking.customer_email}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-300 font-medium">Servicio</p>
                  <p className="font-semibold text-white">{selectedBooking.service.name}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-300 font-medium">Fecha y Hora</p>
                  <p className="font-semibold text-white">
                    {new Date(selectedBooking.start_at).toLocaleDateString("es-ES", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  <p className="text-sm text-slate-200">
                    {new Date(selectedBooking.start_at).toLocaleTimeString("es-ES", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    -{" "}
                    {new Date(selectedBooking.end_at).toLocaleTimeString("es-ES", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-300 font-medium">Duración</p>
                  <p className="font-semibold text-white">{selectedBooking.service.duration_minutes} minutos</p>
                </div>
                <div>
                  <p className="text-sm text-slate-300 font-medium">Precio</p>
                  <p className="font-semibold text-lg text-cyan-400">
                    ${Number.parseFloat(selectedBooking.service.price).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-300 font-medium">Estado</p>
                  <span
                    className={`inline-block px-3 py-1 rounded text-sm font-semibold ${
                      selectedBooking.status === "confirmed"
                        ? "bg-cyan-400 text-slate-900"
                        : selectedBooking.status === "completed"
                          ? "bg-green-500 text-white"
                          : "bg-slate-600 text-slate-200"
                    }`}
                  >
                    {selectedBooking.status === "confirmed"
                      ? "Confirmada"
                      : selectedBooking.status === "completed"
                        ? "Completada"
                        : "Pendiente"}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                {selectedBooking.status === "confirmed" && (
                  <>
                    <button
                      onClick={handleCompleteBooking}
                      className="flex-1 px-4 py-2 bg-cyan-400 text-slate-900 rounded-md font-semibold hover:bg-cyan-300 transition-colors"
                    >
                      ✓ Completar
                    </button>
                    <button
                      onClick={handleCancelBooking}
                      className="flex-1 px-4 py-2 bg-[#9f1239] text-white rounded-md font-semibold hover:bg-[#881337] transition-colors"
                    >
                      Eliminar
                    </button>
                  </>
                )}
                {selectedBooking.status === "completed" && (
                  <button
                    onClick={() => setSelectedBooking(null)}
                    className="w-full px-4 py-2 bg-slate-600 text-white rounded-md font-medium hover:bg-slate-500 transition-colors"
                  >
                    Cerrar
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
