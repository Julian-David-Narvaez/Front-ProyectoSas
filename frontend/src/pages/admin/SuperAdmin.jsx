import { useEffect, useState } from 'react'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'

export default function SuperAdmin() {
  const { user } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ name: '', email: '', password: '', page_limit: 1 })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await api.get('/superadmin/users')
      setUsers(res.data)
    } catch (err) {
      console.error(err)
      alert('Error cargando usuarios')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      await api.post('/superadmin/users', form)
      setForm({ name: '', email: '', password: '', page_limit: 1 })
      fetchUsers()
    } catch (err) {
      console.error(err)
      alert('Error al crear usuario')
    }
  }

  const handleUpdateLimit = async (id, newLimit) => {
    try {
      await api.put(`/superadmin/users/${id}/page_limit`, { page_limit: Number(newLimit) })
      fetchUsers()
    } catch (err) {
      console.error(err)
      alert('Error al actualizar límite')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar usuario y todos sus recursos?')) return
    try {
      await api.delete(`/superadmin/users/${id}`)
      fetchUsers()
    } catch (err) {
      console.error(err)
      alert('Error al eliminar usuario')
    }
  }

  if (!user) return <div className="p-6">Debe iniciar sesión</div>
  if (user.role !== 'superadmin') return <div className="p-6">No autorizado</div>

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <h1 className="text-2xl font-bold mb-4">Panel Superadmin</h1>

      <section className="mb-6">
        <h2 className="font-semibold mb-2">Crear usuario</h2>
        <form onSubmit={handleCreate} className="flex gap-2 flex-wrap">
          <input required placeholder="Nombre" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="px-3 py-2 rounded bg-slate-800" />
          <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="px-3 py-2 rounded bg-slate-800" />
          <input required type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="px-3 py-2 rounded bg-slate-800" />
          <input required type="number" min="0" placeholder="page_limit" value={form.page_limit} onChange={(e) => setForm({ ...form, page_limit: e.target.value })} className="w-28 px-3 py-2 rounded bg-slate-800" />
          <button type="submit" className="px-4 py-2 bg-cyan-500 rounded">Crear</button>
        </form>
      </section>

      <section>
        <h2 className="font-semibold mb-2">Usuarios</h2>
        {loading ? (
          <div>Cargando...</div>
        ) : (
          <div className="overflow-x-auto bg-slate-800 rounded p-4">
            <table className="w-full table-auto text-sm">
              <thead>
                <tr className="text-left text-slate-300">
                  <th className="pb-2">ID</th>
                  <th className="pb-2">Nombre</th>
                  <th className="pb-2">Email</th>
                  <th className="pb-2">Rol</th>
                  <th className="pb-2">page_limit</th>
                  <th className="pb-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t border-slate-700">
                    <td className="py-2">{u.id}</td>
                    <td className="py-2">{u.name}</td>
                    <td className="py-2">{u.email}</td>
                    <td className="py-2">{u.role}</td>
                    <td className="py-2">
                      <input
                        type="number"
                        min="0"
                        value={u.page_limit ?? 0}
                        onChange={(e) => handleUpdateLimit(u.id, e.target.value)}
                        className="w-20 px-2 py-1 rounded bg-slate-700 text-black"
                      />
                    </td>
                    <td className="py-2">
                      {u.id !== user.id && (
                        <button onClick={() => handleDelete(u.id)} className="px-3 py-1 bg-red-600 rounded">Eliminar</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
