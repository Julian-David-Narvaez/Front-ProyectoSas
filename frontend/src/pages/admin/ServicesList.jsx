import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';

export default function ServicesList() {
  const { businessId } = useParams();
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [businessRes, servicesRes] = await Promise.all([
          api.get(`/businesses/${businessId}`),
          api.get(`/businesses/${businessId}/services`)
        ]);
        setBusiness(businessRes.data);
        setServices(servicesRes.data);
      } catch (error) {
        console.error('Error al cargar datos:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [businessId]);

  const handleDelete = async (serviceId) => {
    if (!window.confirm('¿Estás seguro de eliminar este servicio?')) return;
    try {
      await api.delete(`/businesses/${businessId}/services/${serviceId}`);
      setServices(services.filter(s => s.id !== serviceId));
    } catch (error) {
      console.error('Error al eliminar servicio:', error);
      window.alert('Error al eliminar servicio');
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <button
              onClick={() => navigate('/dashboard')}
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              ← Dashboard
            </button>
            <h1 className="text-xl font-bold mt-1">{business?.name}</h1>
          </div>
          <div className="flex gap-2">
             <button
                onClick={() => navigate(`/admin/business/${businessId}/bookings`)}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
                📅 Agenda
            </button>
            <button
              onClick={() => navigate(`/admin/business/${businessId}/schedules`)}
              className="px-4 py-2 bg-secondary-200 text-secondary-800 rounded hover:bg-secondary-300"
            >
              Horarios
            </button>
            <button
              onClick={() => navigate(`/admin/business/${businessId}/page`)}
              className="px-4 py-2 bg-secondary-200 text-secondary-800 rounded hover:bg-secondary-300"
            >
              Editar Landing
            </button>
          </div>
        </div>
      </nav>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Servicios</h2>
          <button
            onClick={() => navigate(`/admin/business/${businessId}/services/new`)}
             className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            + Agregar Servicio
          </button>
        </div>

        {services.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600 mb-4">No tienes servicios creados</p>
            <button
              onClick={() => navigate(`/admin/business/${businessId}/services/new`)}
              className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 font-medium"
            >
              Crear primer servicio
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div key={service.id} className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden">
                {service.image_url && (
                  <img
                    src={service.image_url}
                    alt={service.name}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-2">{service.name}</h3>
                  <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
                    <span>{service.duration_minutes} min</span>
                    <span className="text-blue-600 font-semibold">
                      ${parseFloat(service.price).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/admin/business/${businessId}/services/${service.id}/edit`)}
                      className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 font-medium"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(service.id)}
                      className="px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700"
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
  );
}