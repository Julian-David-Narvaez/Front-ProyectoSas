import { useEffect, useState } from 'react'
import api from '../../api/axios'
import SuperAdminLayout from '../../components/SuperAdminLayout'
import { useAuth } from '../../context/AuthContext'

export default function SuperAdmin() {
  const { user } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ name: '', email: '', password: '', page_limit: 1 })
  const [unlimitedCreate, setUnlimitedCreate] = useState(false)
  const [query, setQuery] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await api.get('/superadmin/users')
      // backend returns array
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
    <SuperAdminLayout> 
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-1/3 bg-slate-800/60 p-6 rounded-lg border border-slate-700">
          <h2 className="text-xl font-semibold mb-4">Crear usuario</h2>
          <form onSubmit={handleCreate} className="space-y-3">
            <input required placeholder="Nombre" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 rounded bg-slate-900/60 border border-slate-700" />
            <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2 rounded bg-slate-900/60 border border-slate-700" />
            <input required type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full px-3 py-2 rounded bg-slate-900/60 border border-slate-700" />

            <div className="flex items-center gap-3">
              <input
                required
                type="number"
                placeholder="page_limit"
                value={form.page_limit}
                onChange={(e) => setForm({ ...form, page_limit: Number(e.target.value) })}
                className="w-32 px-3 py-2 rounded bg-slate-900/60 border border-slate-700"
              />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={unlimitedCreate} onChange={(e) => {
                  const checked = e.target.checked
                  setUnlimitedCreate(checked)
                  setForm({ ...form, page_limit: checked ? -1 : 1 })
                }} />
                Ilimitado
              </label>
            </div>

            <div className="flex justify-end">
              <button type="submit" className="px-4 py-2 bg-cyan-500 rounded font-medium">Crear usuario</button>
            </div>
          </form>
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Usuarios registrados</h2>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por nombre o email" className="px-3 py-2 rounded bg-slate-800 border border-slate-700 w-64" />
          </div>

          <div className="bg-slate-800/60 rounded-lg border border-slate-700 p-4">
            {loading ? (
              <div>Cargando...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full table-auto text-sm">
                  <thead>
                    <tr className="text-left text-slate-300">
                      <th className="pb-2">ID</th>
                      <th className="pb-2">Nombre</th>
                      <th className="pb-2">Email</th>
                      <th className="pb-2">Rol</th>
                      <th className="pb-2">Límite</th>
                      <th className="pb-2">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.filter(u => !query || u.name.toLowerCase().includes(query.toLowerCase()) || u.email.toLowerCase().includes(query.toLowerCase())).map((u) => (
                      <tr key={u.id} className="border-t border-slate-700">
                        <td className="py-2">{u.id}</td>
                        <td className="py-2">{u.name}</td>
                        <td className="py-2">{u.email}</td>
                        <td className="py-2"><span className="text-xs px-2 py-1 rounded bg-slate-700">{u.role}</span></td>
                        <td className="py-2">
                          {u.page_limit < 0 ? (
                            <span className="px-2 py-1 rounded bg-emerald-600 text-black">Ilimitado</span>
                          ) : (
                            <input
                              type="number"
                              value={u.page_limit ?? 0}
                              onChange={(e) => handleUpdateLimit(u.id, e.target.value)}
                              className="w-20 px-2 py-1 rounded bg-slate-700 text-black"
                            />
                          )}
                        </td>
                        <td className="py-2">
                          <div className="flex gap-2">
                            {u.id !== user.id && (
                              <button onClick={() => handleDelete(u.id)} className="px-3 py-1 bg-rose-600 rounded text-sm">Eliminar</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </SuperAdminLayout>
  )
}
