"use client"

import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import api from "../../api/axios"

function SortableBlock({ block, onEdit, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: block.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const getBlockIcon = (type) => {
    const icons = {
      hero: "🎯",
      services: "💼",
      about: "📖",
      contact: "📞",
    }
    return icons[type] || "📄"
  }

  const getBlockTitle = (type) => {
    const titles = {
      hero: "Hero / Banner Principal",
      services: "Sección de Servicios",
      about: "Sobre Nosotros",
      contact: "Información de Contacto",
    }
    return titles[type] || type
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-slate-800 border-2 border-slate-700 rounded-lg p-4 mb-3 hover:border-cyan-500 transition"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-2xl hover:scale-110 transition text-slate-300"
          >
            ⋮⋮
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{getBlockIcon(block.type)}</span>
              <h3 className="font-semibold text-white">{getBlockTitle(block.type)}</h3>
            </div>
            <p className="text-sm text-slate-400">
              {block.type === "hero" && block.content.title}
              {block.type === "services" && "Muestra tus servicios"}
              {block.type === "about" && block.content.title}
              {block.type === "contact" && "Información de contacto"}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(block)}
            className="px-3 py-1 bg-cyan-500 text-white text-sm rounded hover:bg-cyan-600"
          >
            Editar
          </button>
          <button
            onClick={() => onDelete(block.id)}
            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  )
}

function BlockEditor({ block, onSave, onCancel }) {
  const [content, setContent] = useState(block.content)

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({ ...block, content })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-700">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6 text-white">Editar Bloque</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {block.type === "hero" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Título Principal</label>
                  <input
                    type="text"
                    value={content.title || ""}
                    onChange={(e) => setContent({ ...content, title: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-600 rounded-md bg-slate-700 text-white placeholder-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Subtítulo</label>
                  <input
                    type="text"
                    value={content.subtitle || ""}
                    onChange={(e) => setContent({ ...content, subtitle: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-600 rounded-md bg-slate-700 text-white placeholder-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">URL Imagen de Fondo</label>
                  <input
                    type="url"
                    value={content.image_url || ""}
                    onChange={(e) => setContent({ ...content, image_url: e.target.value })}
                    placeholder="https://ejemplo.com/imagen.jpg"
                    className="w-full px-3 py-2 border border-slate-600 rounded-md bg-slate-700 text-white placeholder-slate-400"
                  />
                </div>
              </>
            )}

            {block.type === "services" && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Título de la Sección</label>
                <input
                  type="text"
                  value={content.title || ""}
                  onChange={(e) => setContent({ ...content, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-600 rounded-md bg-slate-700 text-white placeholder-slate-400"
                />
                <p className="text-sm text-slate-400 mt-2">
                  Los servicios se cargan automáticamente desde tu lista de servicios
                </p>
              </div>
            )}

            {block.type === "about" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Título</label>
                  <input
                    type="text"
                    value={content.title || ""}
                    onChange={(e) => setContent({ ...content, title: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-600 rounded-md bg-slate-700 text-white placeholder-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Texto</label>
                  <textarea
                    value={content.text || ""}
                    onChange={(e) => setContent({ ...content, text: e.target.value })}
                    rows="6"
                    className="w-full px-3 py-2 border border-slate-600 rounded-md bg-slate-700 text-white placeholder-slate-400"
                  />
                </div>
              </>
            )}

            {block.type === "contact" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Título</label>
                  <input
                    type="text"
                    value={content.title || ""}
                    onChange={(e) => setContent({ ...content, title: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-600 rounded-md bg-slate-700 text-white placeholder-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Teléfono</label>
                  <input
                    type="tel"
                    value={content.phone || ""}
                    onChange={(e) => setContent({ ...content, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-600 rounded-md bg-slate-700 text-white placeholder-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                  <input
                    type="email"
                    value={content.email || ""}
                    onChange={(e) => setContent({ ...content, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-600 rounded-md bg-slate-700 text-white placeholder-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Dirección</label>
                  <input
                    type="text"
                    value={content.address || ""}
                    onChange={(e) => setContent({ ...content, address: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-600 rounded-md bg-slate-700 text-white placeholder-slate-400"
                  />
                </div>
              </>
            )}

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-4 py-2 border border-slate-600 rounded-md hover:bg-slate-700 text-slate-300"
              >
                Cancelar
              </button>
              <button type="submit" className="flex-1 px-4 py-2 bg-cyan-500 text-white rounded-md hover:bg-cyan-600">
                Guardar Cambios
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function PageBuilder() {
  const { businessId } = useParams()
  const navigate = useNavigate()
  const [blocks, setBlocks] = useState([])
  const [business, setBusiness] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editingBlock, setEditingBlock] = useState(null)
  const [saving, setSaving] = useState(false)
  const [blockedMessage, setBlockedMessage] = useState(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [businessRes, pageRes] = await Promise.all([
          api.get(`/businesses/${businessId}`),
          api.get(`/businesses/${businessId}/page`),
        ])
        setBusiness(businessRes.data)
        setBlocks(pageRes.data.blocks || [])
      } catch (error) {
        console.error("Error al cargar datos:", error)
        const status = error.response?.status
        const msg = error.response?.data?.message
        if (status === 403 && msg && msg.toLowerCase().includes('acceso bloqueado')) {
          setBlockedMessage(msg)
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [businessId])

  const handleDragEnd = (event) => {
    const { active, over } = event

    if (active.id !== over.id) {
      setBlocks((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const blocksToSave = blocks.map((block, index) => ({
        ...block,
        order: index,
      }))

      await api.put(`/businesses/${businessId}/page/blocks`, {
        blocks: blocksToSave,
      })

      alert("Cambios guardados exitosamente")
    } catch (error) {
      console.error("Error al guardar cambios:", error)
      alert("Error al guardar cambios")
    } finally {
      setSaving(false)
    }
  }

  const handleEditBlock = (updatedBlock) => {
    setBlocks(blocks.map((b) => (b.id === updatedBlock.id ? updatedBlock : b)))
    setEditingBlock(null)
  }

  const handleDeleteBlock = async (blockId) => {
    if (!confirm("¿Eliminar este bloque?")) return

    try {
      await api.delete(`/businesses/${businessId}/page/blocks/${blockId}`)
      setBlocks(blocks.filter((b) => b.id !== blockId))
    } catch (error) {
      console.error("Error al eliminar bloque:", error)
      alert("Error al eliminar bloque")
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">Cargando...</div>
  }
  if (blockedMessage) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
        <div className="max-w-xl w-full bg-slate-800/60 border border-slate-700 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-2">Acceso Bloqueado</h2>
          <p className="text-slate-300 mb-4">{blockedMessage}</p>
          <p className="text-sm text-slate-400">Si crees que esto es un error, contacta al superadmin para que revise tu cuenta.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <nav className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <button
              onClick={() => navigate(`/admin/business/${businessId}/services`)}
              className="text-cyan-500 hover:text-cyan-400 text-sm"
            >
              ← Volver a Servicios
            </button>
            <h1 className="text-xl font-bold mt-1 text-white">{business?.name} - Editor de Landing</h1>
          </div>
          <div className="flex gap-2">
            <a
              href={`/${business?.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-slate-700 text-slate-300 rounded hover:bg-slate-600"
            >
              👁️ Vista Previa
            </a>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 disabled:opacity-50"
            >
              {saving ? "Guardando..." : "💾 Guardar Cambios"}
            </button>
          </div>
        </div>
      </nav>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2 text-white">Organiza tu Landing Page</h2>
          <p className="text-slate-400">
            Arrastra los bloques para reordenarlos. Haz clic en "Editar" para modificar el contenido.
          </p>
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
            {blocks.map((block) => (
              <SortableBlock key={block.id} block={block} onEdit={setEditingBlock} onDelete={handleDeleteBlock} />
            ))}
          </SortableContext>
        </DndContext>

        {blocks.length === 0 && (
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-8 text-center text-slate-400">
            No hay bloques en tu landing page. Contacta al administrador para agregar bloques.
          </div>
        )}
      </div>

      {editingBlock && (
        <BlockEditor block={editingBlock} onSave={handleEditBlock} onCancel={() => setEditingBlock(null)} />
      )}
    </div>
  )
}
