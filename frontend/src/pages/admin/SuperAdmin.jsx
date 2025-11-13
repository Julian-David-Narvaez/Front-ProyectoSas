import { useEffect, useState } from 'react'
import api from '../../api/axios'
import ConfirmDialog from '../../components/ConfirmDialog'
import SuperAdminLayout from '../../components/SuperAdminLayout'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'

export default function SuperAdmin() {
  const { user } = useAuth()
  const toast = useToast()
  const [users, setUsers] = useState([])
  const [pages, setPages] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingPages, setLoadingPages] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', page_limit: 1 })
  const [unlimitedCreate, setUnlimitedCreate] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedPages, setSelectedPages] = useState([])
  const [showPagesSection, setShowPagesSection] = useState(false)
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {}, type: 'warning' })

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
      toast.error('Error cargando usuarios')
    } finally {
      setLoading(false)
    }
  }

  const fetchPages = async () => {
    setLoadingPages(true)
    try {
      const res = await api.get('/superadmin/pages')
      setPages(res.data)
    } catch (err) {
      console.error(err)
      toast.error('Error cargando páginas')
    } finally {
      setLoadingPages(false)
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      await api.post('/superadmin/users', form)
      setForm({ name: '', email: '', password: '', page_limit: 1 })
      fetchUsers()
      toast.success('Usuario creado exitosamente')
    } catch (err) {
      console.error(err)
      toast.error('Error al crear usuario')
    }
  }

  const handleUpdateLimit = async (id, newLimit) => {
    try {
      await api.put(`/superadmin/users/${id}/page_limit`, { page_limit: Number(newLimit) })
      fetchUsers()
      toast.success('Límite actualizado correctamente')
    } catch (err) {
      console.error(err)
      toast.error('Error al actualizar límite')
    }
  }

  const handleDelete = async (id) => {
    setConfirmDialog({
      isOpen: true,
      title: '¿Eliminar usuario?',
      message: 'Esta acción eliminará el usuario y todos sus recursos asociados (negocios, páginas, reservas, etc.). Esta acción no se puede deshacer.',
      type: 'danger',
      onConfirm: async () => {
        try {
          await api.delete(`/superadmin/users/${id}`)
          fetchUsers()
          toast.success('Usuario eliminado correctamente')
        } catch (err) {
          console.error(err)
          toast.error('Error al eliminar usuario')
        }
      }
    })
  }

  const handleTogglePages = async (isActive) => {
    if (selectedPages.length === 0) {
      toast.error('Selecciona al menos una página')
      return
    }
    setConfirmDialog({
      isOpen: true,
      title: isActive ? '¿Habilitar páginas seleccionadas?' : '¿Deshabilitar páginas seleccionadas?',
      message: `Estás a punto de ${isActive ? 'habilitar' : 'deshabilitar'} ${selectedPages.length} página(s). Las páginas ${isActive ? 'volverán a estar activas' : 'dejarán de estar activas'}.`,
      type: isActive ? 'success' : 'warning',
      onConfirm: async () => {
        try {
          await api.post('/superadmin/pages/toggle', {
            page_ids: selectedPages,
            is_active: isActive
          })
          setSelectedPages([])
          fetchPages()
          toast.success(`${selectedPages.length} página(s) ${isActive ? 'habilitada(s)' : 'deshabilitada(s)'}`)
        } catch (err) {
          console.error(err)
          toast.error('Error al actualizar páginas')
        }
      }
    })
  }

  const handleDisableUserPages = async (userId) => {
    const user = users.find(u => u.id === userId)
    setConfirmDialog({
      isOpen: true,
      title: '¿Deshabilitar todas las páginas?',
      message: `Esto deshabilitará todas las páginas del usuario "${user?.name}". Las páginas no se eliminarán, solo quedarán inactivas.`,
      type: 'warning',
      onConfirm: async () => {
        try {
          const res = await api.post(`/superadmin/users/${userId}/pages/disable`)
          fetchPages()
          toast.success(res.data.message)
        } catch (err) {
          console.error(err)
          toast.error('Error al deshabilitar páginas')
        }
      }
    })
  }

  const handleEnableUserPages = async (userId) => {
    const user = users.find(u => u.id === userId)
    setConfirmDialog({
      isOpen: true,
      title: '¿Habilitar todas las páginas?',
      message: `Esto habilitará todas las páginas del usuario "${user?.name}". Las páginas volverán a estar activas.`,
      type: 'success',
      onConfirm: async () => {
        try {
          const res = await api.post(`/superadmin/users/${userId}/pages/enable`)
          fetchPages()
          toast.success(res.data.message)
        } catch (err) {
          console.error(err)
          toast.error('Error al habilitar páginas')
        }
      }
    })
  }

  const togglePageSelection = (pageId) => {
    setSelectedPages(prev => 
      prev.includes(pageId) ? prev.filter(id => id !== pageId) : [...prev, pageId]
    )
  }

  const toggleAllPages = () => {
    if (selectedPages.length === pages.length) {
      setSelectedPages([])
    } else {
      setSelectedPages(pages.map(p => p.id))
    }
  }

  const handleToggleSinglePage = async (pageId, currentStatus) => {
    const page = pages.find(p => p.id === pageId)
    const newStatus = !currentStatus
    setConfirmDialog({
      isOpen: true,
      title: newStatus ? '¿Habilitar página?' : '¿Deshabilitar página?',
      message: `Estás a punto de ${newStatus ? 'habilitar' : 'deshabilitar'} la página del negocio "${page?.business_name}" del usuario "${page?.user_name}".`,
      type: newStatus ? 'success' : 'warning',
      onConfirm: async () => {
        try {
          await api.post('/superadmin/pages/toggle', {
            page_ids: [pageId],
            is_active: newStatus
          })
          fetchPages()
          toast.success(`Página ${newStatus ? 'habilitada' : 'deshabilitada'} correctamente`)
        } catch (err) {
          console.error(err)
          toast.error('Error al actualizar la página')
        }
      }
    })
  }

  if (!user) return <div className="p-6">Debe iniciar sesión</div>
  if (user.role !== 'superadmin') return <div className="p-6">No autorizado</div>

  return (
    <SuperAdminLayout> 
      <div className="space-y-6">
        {/* Botón para mostrar/ocultar sección de páginas */}
        <div className="flex justify-end">
          <button
            onClick={() => {
              setShowPagesSection(!showPagesSection)
              if (!showPagesSection && pages.length === 0) fetchPages()
            }}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded font-medium transition-colors"
          >
            {showPagesSection ? 'Ocultar gestión de páginas' : 'Gestionar páginas'}
          </button>
        </div>

        {/* Sección de gestión de páginas */}
        {showPagesSection && (
          <div className="bg-slate-800/60 p-6 rounded-lg border border-slate-700">
            <h2 className="text-xl font-semibold mb-4">Gestión de Páginas</h2>
            
            {loadingPages ? (
              <div>Cargando páginas...</div>
            ) : (
              <>
                {selectedPages.length > 0 && (
                  <div className="mb-4 flex gap-2">
                    <button
                      onClick={() => handleTogglePages(false)}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 rounded font-medium"
                    >
                      Deshabilitar seleccionadas ({selectedPages.length})
                    </button>
                    <button
                      onClick={() => handleTogglePages(true)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded font-medium"
                    >
                      Habilitar seleccionadas ({selectedPages.length})
                    </button>
                    <button
                      onClick={() => setSelectedPages([])}
                      className="px-4 py-2 bg-slate-600 hover:bg-slate-700 rounded font-medium"
                    >
                      Limpiar selección
                    </button>
                  </div>
                )}

                <div className="overflow-x-auto">
                  <table className="w-full table-auto text-sm">
                    <thead>
                      <tr className="text-left text-slate-300">
                        <th className="pb-2">
                          <input
                            type="checkbox"
                            checked={selectedPages.length === pages.length && pages.length > 0}
                            onChange={toggleAllPages}
                            className="cursor-pointer"
                          />
                        </th>
                        <th className="pb-2">ID</th>
                        <th className="pb-2">Negocio</th>
                        <th className="pb-2">Usuario</th>
                        <th className="pb-2">Email</th>
                        <th className="pb-2">Estado</th>
                        <th className="pb-2">Fecha creación</th>
                        <th className="pb-2">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pages.map((page) => (
                        <tr key={page.id} className="border-t border-slate-700">
                          <td className="py-2">
                            <input
                              type="checkbox"
                              checked={selectedPages.includes(page.id)}
                              onChange={() => togglePageSelection(page.id)}
                              className="cursor-pointer"
                            />
                          </td>
                          <td className="py-2">{page.id}</td>
                          <td className="py-2">{page.business_name}</td>
                          <td className="py-2">{page.user_name}</td>
                          <td className="py-2 text-xs">{page.user_email}</td>
                          <td className="py-2">
                            <span className={`px-2 py-1 rounded text-xs ${page.is_active ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}>
                              {page.is_active ? 'Activa' : 'Inactiva'}
                            </span>
                          </td>
                          <td className="py-2 text-xs">{new Date(page.created_at).toLocaleDateString()}</td>
                          <td className="py-2">
                            <button
                              onClick={() => handleToggleSinglePage(page.id, page.is_active)}
                              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                                page.is_active 
                                  ? 'bg-orange-600 hover:bg-orange-700 text-white' 
                                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              }`}
                            >
                              {page.is_active ? 'Deshabilitar' : 'Habilitar'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {/* Sección original de usuarios */}
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
                              <>
                                <button onClick={() => handleDelete(u.id)} className="px-3 py-1 bg-rose-600 rounded text-sm">Eliminar</button>
                                <button onClick={() => handleDisableUserPages(u.id)} className="px-3 py-1 bg-orange-600 rounded text-sm">Deshab. páginas</button>
                                <button onClick={() => handleEnableUserPages(u.id)} className="px-3 py-1 bg-teal-600 rounded text-sm">Habil. páginas</button>
                              </>
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
      </div>

      {/* Diálogo de confirmación */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
      />
    </SuperAdminLayout>
  )
}
