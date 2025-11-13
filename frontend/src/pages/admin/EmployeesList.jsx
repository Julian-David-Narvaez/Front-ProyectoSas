import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../../api/axios';
import { useToast } from '../../context/ToastContext';

const EmployeesList = () => {
  const { businessId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [employees, setEmployees] = useState([]);
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    is_active: true,
    order: 0
  });

  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessId]);

  const fetchData = async () => {
    try {
      const [businessRes, employeesRes] = await Promise.all([
        axios.get(`/businesses/${businessId}`),
        axios.get(`/businesses/${businessId}/employees/admin`)
      ]);
      setBusiness(businessRes.data);
      setEmployees(employeesRes.data);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones
    if (formData.name.trim().length < 3) {
      toast.warning('El nombre debe tener al menos 3 caracteres');
      return;
    }

    if (formData.email && (!formData.email.includes('@') || !formData.email.includes('.'))) {
      toast.warning('Por favor ingresa un email válido');
      return;
    }

    if (formData.phone && formData.phone.trim().length < 7) {
      toast.warning('El teléfono debe tener al menos 7 caracteres');
      return;
    }

    try {
      if (editingEmployee) {
        await axios.put(`/businesses/${businessId}/employees/${editingEmployee.id}`, formData);
      } else {
        await axios.post(`/businesses/${businessId}/employees`, formData);
      }
      fetchData();
      resetForm();
      toast.success(editingEmployee ? 'Empleado actualizado correctamente' : 'Empleado creado exitosamente');
    } catch (error) {
      console.error('Error al guardar empleado:', error);
      toast.error(error.response?.data?.message || 'Error al guardar el empleado');
    }
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setFormData({
      name: employee.name,
      email: employee.email || '',
      phone: employee.phone || '',
      is_active: employee.is_active,
      order: employee.order
    });
    setShowForm(true);
  };

  const handleDelete = async (employeeId) => {
    if (!confirm('¿Estás seguro de eliminar este empleado?')) return;
    
    try {
      await axios.delete(`/businesses/${businessId}/employees/${employeeId}`);
      fetchData();
      toast.success('Empleado eliminado correctamente');
    } catch (error) {
      console.error('Error al eliminar empleado:', error);
      toast.error('Error al eliminar el empleado');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      is_active: true,
      order: 0
    });
    setEditingEmployee(null);
    setShowForm(false);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">Cargando...</div>;

  return (
    <div className="min-h-screen bg-slate-950">
      <nav className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <button onClick={() => navigate(`/admin/business/${businessId}/services`)} className="text-cyan-400 hover:text-cyan-300 text-sm">
              ← Volver a Servicios
            </button>
            <h1 className="text-xl font-bold mt-1 text-white">{business?.name}</h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate(`/admin/business/${businessId}/services`)}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded hover:bg-slate-700"
            >
              Servicios
            </button>
            <button
              onClick={() => navigate(`/admin/business/${businessId}/schedules`)}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded hover:bg-slate-700"
            >
              Horarios
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Empleados / Barberos</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-cyan-500 text-slate-950 px-4 py-2 rounded hover:bg-cyan-400 font-medium"
        >
          {showForm ? 'Cancelar' : '+ Agregar Empleado'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-slate-900 p-6 rounded-lg border border-slate-800 space-y-4">
          <h3 className="text-xl font-semibold text-white">
            {editingEmployee ? 'Editar Empleado' : 'Nuevo Empleado'}
          </h3>
          
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-300">Nombre *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border border-slate-700 bg-slate-800 text-white rounded px-3 py-2 focus:border-cyan-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-slate-300">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full border border-slate-700 bg-slate-800 text-white rounded px-3 py-2 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-slate-300">Teléfono</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full border border-slate-700 bg-slate-800 text-white rounded px-3 py-2 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="mr-2"
            />
            <label className="text-sm text-slate-300">Activo</label>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-slate-300">Orden</label>
            <input
              type="number"
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
              className="w-full border border-slate-700 bg-slate-800 text-white rounded px-3 py-2 focus:border-cyan-500 focus:outline-none"
              step="1"
            />
            <p className="text-xs text-slate-500 mt-1">Orden en el que aparecerá en la lista (números enteros, puede usar negativos)</p>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-cyan-500 text-slate-950 px-4 py-2 rounded hover:bg-cyan-400 font-medium"
            >
              Guardar
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="bg-slate-700 text-slate-300 px-4 py-2 rounded hover:bg-slate-600"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="bg-slate-900 rounded-lg border border-slate-800 overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-slate-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">
                Teléfono
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {employees.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-slate-500">
                  No hay empleados registrados
                </td>
              </tr>
            ) : (
              employees.map((employee) => (
                <tr key={employee.id} className="hover:bg-slate-800/50">
                  <td className="px-6 py-4 text-white">{employee.name}</td>
                  <td className="px-6 py-4 text-slate-400">{employee.email || '-'}</td>
                  <td className="px-6 py-4 text-slate-400">{employee.phone || '-'}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        employee.is_active
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {employee.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 space-x-2">
                    <button
                      onClick={() => handleEdit(employee)}
                      className="text-cyan-400 hover:text-cyan-300"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(employee.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeesList;
