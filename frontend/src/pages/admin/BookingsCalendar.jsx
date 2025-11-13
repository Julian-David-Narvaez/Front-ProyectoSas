"use client"

import esLocale from "@fullcalendar/core/locales/es"
import dayGridPlugin from "@fullcalendar/daygrid"
import interactionPlugin from "@fullcalendar/interaction"
import listPlugin from "@fullcalendar/list"
import FullCalendar from "@fullcalendar/react"
import timeGridPlugin from "@fullcalendar/timegrid"
import { useCallback, useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import api from "../../api/axios"

export default function BookingsCalendar() {
  const navigate = useNavigate()
  const { businessId } = useParams()
  const [business, setBusiness] = useState(null)
  const [bookings, setBookings] = useState([])
  const [events, setEvents] = useState([])
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [alertDialog, setAlertDialog] = useState({ show: false, message: "", type: "info" })
  const [confirmDialog, setConfirmDialog] = useState({ show: false, message: "", onConfirm: null })
  const initialView = "timeGridDay"

  const fetchData = useCallback(async () => {
    try {
      const [businessRes, bookingsRes] = await Promise.all([
        api.get(`/businesses/${businessId}`),
        api.get(`/businesses/${businessId}/bookings`),
      ])
      setBusiness(businessRes.data)
      setBookings(bookingsRes.data)

      const calendarEvents = bookingsRes.data
        .filter((booking) => booking.status !== "cancelled")
        .map((booking) => {
          const employeeInfo = booking.employee ? ` - ${booking.employee.name}` : '';
          return {
            id: booking.id,
            title: `${booking.service.name} - ${booking.customer_name}${employeeInfo}`,
            start: booking.start_at,
            end: booking.end_at,
            backgroundColor: booking.status === "confirmed" ? "#06b6d4" : "#10b981",
            borderColor: booking.status === "confirmed" ? "#0891b2" : "#059669",
            extendedProps: {
              booking: booking,
            },
          };
        })

      setEvents(calendarEvents)
    } catch (error) {
      console.error("Error al cargar datos:", error.message || error)
    } finally {
      setLoading(false)
    }
  }, [businessId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleEventClick = (info) => {
    setSelectedBooking(info.event.extendedProps.booking)
  }

  const handleCancelBooking = async () => {
    setConfirmDialog({
      show: true,
      message: "¿Eliminar esta reserva?",
      onConfirm: async () => {
        try {
          await api.delete(`/businesses/${businessId}/bookings/${selectedBooking.id}`)
          setSelectedBooking(null)
          fetchData()
          setAlertDialog({ show: true, message: "Reserva eliminada exitosamente", type: "success" })
        } catch (error) {
          console.error("Error al eliminar reserva:", error)
          setAlertDialog({
            show: true,
            message: `Error al eliminar reserva: ${error.message || error}`,
            type: "error",
          })
        }
        setConfirmDialog({ show: false, message: "", onConfirm: null })
      },
    })
  }

  const handleCompleteBooking = async () => {
    try {
      await api.put(`/businesses/${businessId}/bookings/${selectedBooking.id}`, {
        status: "completed",
      })
      setSelectedBooking(null)
      fetchData()
      setAlertDialog({ show: true, message: "Reserva marcada como completada", type: "success" })
    } catch (error) {
      console.error("Error al actualizar reserva:", error)
      setAlertDialog({ show: true, message: "Error al actualizar reserva", type: "error" })
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
      <nav className="bg-[#334155] shadow-lg border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <button
              onClick={() => navigate(`/admin/business/${businessId}/services`)}
              className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors"
            >
              ← Dashboard
            </button>
            <h1 className="text-2xl font-bold mt-1 text-white">{business?.name}</h1>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-cyan-400 text-slate-900 rounded-md font-semibold flex items-center gap-2 cursor-default" disabled>
              📅 Agenda
            </button>
            <button
              onClick={() => navigate(`/admin/business/${businessId}/schedules`)}
              className="px-4 py-2 bg-slate-700 text-slate-200 rounded-md font-medium hover:bg-slate-600 transition-colors"
            >
              Horarios
            </button>
            
            <button 
              onClick={() => navigate(`/admin/business/${businessId}/page`)}
              className="px-4 py-2 bg-slate-700 text-slate-200 rounded-md font-medium hover:bg-slate-600 transition-colors">
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
            <style jsx global>{`
              .fc {
                --fc-border-color: #475569;
                --fc-button-bg-color: #06b6d4;
                --fc-button-border-color: #06b6d4;
                --fc-button-hover-bg-color: #0891b2;
                --fc-button-hover-border-color: #0891b2;
                --fc-button-active-bg-color: #0e7490;
                --fc-button-active-border-color: #0e7490;
                --fc-today-bg-color: rgba(6, 182, 212, 0.1);
              }
              .fc .fc-button {
                font-weight: 600;
                text-transform: capitalize;
              }
              .fc .fc-button-primary:not(:disabled).fc-button-active,
              .fc .fc-button-primary:not(:disabled):active {
                background-color: #0e7490;
                border-color: #0e7490;
              }
              .fc .fc-toolbar-title {
                color: white;
                font-size: 1.5rem;
                font-weight: bold;
              }
              .fc .fc-col-header-cell {
                background-color: #475569;
                color: white;
                font-weight: 600;
                padding: 10px;
              }
              .fc .fc-daygrid-day-number,
              .fc .fc-timegrid-slot-label,
              .fc .fc-list-day-text,
              .fc .fc-list-day-side-text {
                color: #cbd5e1;
              }
              .fc .fc-timegrid-slot {
                height: 3em;
              }
              .fc .fc-timegrid-now-indicator-line {
                border-color: #06b6d4;
              }
            `}</style>
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
                      {booking.employee && (
                        <p className="text-xs text-cyan-400">👤 {booking.employee.name}</p>
                      )}
                      {!booking.employee && (
                        <p className="text-xs text-slate-500">👤 Sin empleado asignado</p>
                      )}
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
                  className="text-slate-300 hover:text-white text-2xl font-bold transition-colors"
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
                {selectedBooking.employee ? (
                  <div>
                    <p className="text-sm text-slate-300 font-medium">Empleado/Barbero</p>
                    <p className="font-semibold text-cyan-400">👤 {selectedBooking.employee.name}</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-slate-300 font-medium">Empleado/Barbero</p>
                    <p className="font-semibold text-slate-500">Sin empleado específico</p>
                  </div>
                )}
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

        {alertDialog.show && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-[#334155] rounded-lg max-w-sm w-full p-6 border border-slate-600 shadow-2xl">
              <div className="flex items-start gap-4 mb-4">
                <div
                  className={`text-3xl ${
                    alertDialog.type === "success"
                      ? "text-cyan-400"
                      : alertDialog.type === "error"
                        ? "text-red-400"
                        : "text-slate-300"
                  }`}
                >
                  {alertDialog.type === "success" ? "✓" : alertDialog.type === "error" ? "✕" : "ℹ"}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white mb-2">
                    {alertDialog.type === "success" ? "Éxito" : alertDialog.type === "error" ? "Error" : "Información"}
                  </h3>
                  <p className="text-slate-200">{alertDialog.message}</p>
                </div>
              </div>
              <button
                onClick={() => setAlertDialog({ show: false, message: "", type: "info" })}
                className="w-full px-4 py-2 bg-cyan-400 text-slate-900 rounded-md font-semibold hover:bg-cyan-300 transition-colors"
              >
                Aceptar
              </button>
            </div>
          </div>
        )}

        {confirmDialog.show && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-[#334155] rounded-lg max-w-sm w-full p-6 border border-slate-600 shadow-2xl">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-white mb-2">Confirmar Acción</h3>
                <p className="text-slate-200">{confirmDialog.message}</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmDialog({ show: false, message: "", onConfirm: null })}
                  className="flex-1 px-4 py-2 bg-slate-600 text-white rounded-md font-medium hover:bg-slate-500 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDialog.onConfirm}
                  className="flex-1 px-4 py-2 bg-[#9f1239] text-white rounded-md font-semibold hover:bg-[#881337] transition-colors"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
