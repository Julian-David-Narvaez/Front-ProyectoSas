import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const fetchBusinesses = async () => {
    try {
      const response = await api.get('/businesses');
      setBusinesses(response.data);
    } catch (error) {
      console.error('Error al cargar negocios:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Dashboard</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Cerrar Sesión
          </button>
        </div>
      </nav>
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Bienvenido, {user?.name}!</h2>
          <p className="text-gray-600">Email: {user?.email}</p>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">Mis Negocios</h3>
          <button
            onClick={() => navigate('/admin/business/new')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow-md transition"
          >
            + Crear Negocio
          </button>
        </div>

        {businesses.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600 mb-4">No tienes negocios creados</p>
            <button
              onClick={() => navigate('/admin/business/new')}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Crear tu primer negocio
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {businesses.map((business) => (
              <div key={business.id} className="bg-white rounded-lg shadow hover:shadow-lg transition p-6">
                <h4 className="text-lg font-semibold mb-2">{business.name}</h4>
                <p className="text-gray-600 text-sm mb-4">{business.description}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/admin/business/${business.id}/services`)}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    Gestionar
                  </button>
                  <a
                    href={`/${business.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 text-sm rounded hover:bg-gray-300 text-center"
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
  );
}