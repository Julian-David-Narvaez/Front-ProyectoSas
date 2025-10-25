import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import api from '../../api/axios';

export default function BookingFlow() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const serviceId = searchParams.get('service');

  const [business, setBusiness] = useState(null);
  const [service, setService] = useState(null);
  const [step, setStep] = useState(1); // 1: Fecha, 2: Hora, 3: Datos, 4: Confirmación
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedTime, setSelectedTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
  });
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBusiness();
  }, [slug]);

  const fetchBusiness = async () => {
    try {
      const response = await api.get(`/businesses/slug/${slug}`);
      setBusiness(response.data);
      
      if (serviceId) {
        const selectedService = response.data.services.find(s => s.id === parseInt(serviceId));
        setService(selectedService);
      }
    } catch (error) {
      console.error('Error al cargar negocio:', error);
    }
  };

  const handleDateChange = async (date) => {
    setSelectedDate(date);
    setSelectedTime('');
    setError('');
    setLoading(true);

    try {
      const response = await api.get(`/businesses/${business.id}/availability`, {
        params: {
          service_id: service.id,
          date: date
        }
      });
      setAvailableSlots(response.data.available_slots);
      if (response.data.available_slots.length > 0) {
        setStep(2);
      } else {
        setError('No hay horarios disponibles para esta fecha');
      }
    } catch (error) {
      console.error('Error al cargar disponibilidad:', error);
      setError('Error al cargar disponibilidad');
    } finally {
      setLoading(false);
    }
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
    setStep(3);
  };

  const isValidEmail = (email) => {
    // Regex simple y suficiente para validación cliente
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const extractApiError = (err) => {
    if (!navigator.onLine) return 'Sin conexión. Revisa tu conexión a internet.';
    if (err.response) {
      const { status, data } = err.response;
      // 409 conflicto (horario reservado)
      if (status === 409) {
        // Si la API devuelve detalle más específico, mostrarlo
        return data?.message || 'Lo sentimos, este horario ya fue reservado. Por favor elige otro.';
      }
      // 422 validación (Laravel/JSON:API style)
      if (status === 422) {
        const errors = data?.errors || data;
        if (errors && typeof errors === 'object') {
          const first = Object.values(errors).flat?.()[0] || Object.values(errors)[0][0];
          return first || data?.message || 'Datos inválidos. Revisa el formulario.';
        }
        return data?.message || 'Datos inválidos. Revisa el formulario.';
      }
      // Otros errores con mensaje
      if (data?.message) return data.message;
      return `Error del servidor (${status}). Intenta de nuevo más tarde.`;
    }
    if (err.request) {
      // La petición se envió pero no hubo respuesta
      return 'No se obtuvo respuesta del servidor. Intenta de nuevo más tarde.';
    }
    // Errores en cliente / network
    return err.message || 'Error desconocido. Intenta de nuevo.';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validaciones del lado del cliente
    if (formData.customer_name.trim().length < 3) {
      setError('El nombre debe tener al menos 3 caracteres');
      setLoading(false);
      return;
    }

    if (!isValidEmail(formData.customer_email)) {
      setError('Introduce un correo electrónico válido');
      setLoading(false);
      return;
    }

    if (!selectedDate) {
      setError('Selecciona una fecha');
      setLoading(false);
      return;
    }

    if (!selectedTime) {
      setError('Selecciona una hora');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        business_id: business.id,
        service_id: service.id,
        customer_name: formData.customer_name.trim(),
        customer_email: formData.customer_email.trim().toLowerCase(),
        date: selectedDate,
        time: selectedTime,
      };

      const response = await api.post('/bookings', payload);

      setBooking(response.data.booking);
      setStep(4);
    } catch (err) {
      const message = extractApiError(err);
      setError(message);
      // Logueo para depuración; remover en producción si es necesario
      console.error('Booking error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  if (!business || !service) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <a href={`/${slug}`} className="text-blue-600 hover:text-blue-700 mb-2 inline-block">
            ← Volver a {business.name}
          </a>
          <h1 className="text-3xl font-bold">{service.name}</h1>
          <div className="flex items-center gap-4 mt-2 text-gray-600">
            <span>⏱️ {service.duration_minutes} min</span>
            <span>💰 ${parseFloat(service.price).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-8">
          {['Fecha', 'Hora', 'Datos', 'Confirmación'].map((label, index) => (
            <div key={index} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                step > index + 1 ? 'bg-green-500 text-white' :
                step === index + 1 ? 'bg-blue-600 text-white' :
                'bg-gray-300 text-gray-600'
              }`}>
                {step > index + 1 ? '✓' : index + 1}
              </div>
              <span className="ml-2 hidden sm:inline">{label}</span>
              {index < 3 && <div className="w-12 sm:w-24 h-1 bg-gray-300 mx-2"></div>}
            </div>
          ))}
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Step 1: Seleccionar Fecha */}
        {step === 1 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-4">Selecciona una fecha</h2>
            <input
              type="date"
              min={getMinDate()}
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg"
            />
          </div>
        )}

        {/* Step 2: Seleccionar Hora */}
        {step === 2 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-4">Selecciona un horario</h2>
            <p className="text-gray-600 mb-4">
              Fecha: <strong>{new Date(selectedDate + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong>
            </p>
            {loading ? (
              <p>Cargando horarios...</p>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {availableSlots.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => handleTimeSelect(slot)}
                    className="px-4 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition font-semibold"
                  >
                    {slot}
                  </button>
                ))}
              </div>
            )}
            <button
              onClick={() => setStep(1)}
              className="mt-6 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
            >
              ← Cambiar fecha
            </button>
          </div>
        )}

        {/* Step 3: Datos del Cliente */}
        {step === 3 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-4">Tus datos</h2>
            <div className="mb-4 p-4 bg-blue-50 rounded">
              <p><strong>Servicio:</strong> {service.name}</p>
              <p><strong>Fecha:</strong> {new Date(selectedDate + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <p><strong>Hora:</strong> {selectedTime}</p>
              <p><strong>Duración:</strong> {service.duration_minutes} minutos</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre completo *
                </label>
                <input
                  type="text"
                  value={formData.customer_name}
                  onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.customer_email}
                  onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  ← Atrás
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold"
                >
                  {loading ? 'Reservando...' : 'Confirmar Reserva'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Step 4: Confirmación */}
        {step === 4 && booking && (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-3xl font-bold mb-4 text-green-600">¡Reserva Confirmada!</h2>
            <div className="max-w-md mx-auto text-left bg-gray-50 p-6 rounded-lg mb-6">
              <p className="mb-2"><strong>Servicio:</strong> {booking.service.name}</p>
              <p className="mb-2"><strong>Fecha:</strong> {new Date(booking.start_at).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <p className="mb-2"><strong>Hora:</strong> {new Date(booking.start_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</p>
              <p className="mb-2"><strong>Duración:</strong> {booking.service.duration_minutes} minutos</p>
              <p className="mb-2"><strong>Cliente:</strong> {booking.customer_name}</p>
              <p className="mb-2"><strong>Email:</strong> {booking.customer_email}</p>
            </div>
            <p className="text-gray-600 mb-6">
              Hemos enviado un correo de confirmación a {booking.customer_email}
            </p>
            <a
              href={`/${slug}`}
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
            >
              Volver a {business.name}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}