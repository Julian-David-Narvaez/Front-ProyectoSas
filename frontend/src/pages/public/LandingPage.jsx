"use client"

import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import api from "../../api/axios"

function HeroBlock({ content }) {
  return (
    <div
      className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white py-32 px-4 overflow-hidden"
      style={
        content.image_url
          ? {
              backgroundImage: `linear-gradient(135deg, rgba(59, 130, 246, 0.9), rgba(147, 51, 234, 0.9)), url(${content.image_url})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
          : {}
      }
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.08),transparent_50%)]"></div>

      <div className="max-w-5xl mx-auto text-center relative z-10">
        <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100 drop-shadow-lg">
          {content.title}
        </h1>
        <p className="text-xl md:text-2xl text-blue-50 max-w-3xl mx-auto leading-relaxed">{content.subtitle}</p>
      </div>
    </div>
  )
}

function ServicesBlock({ content, services, businessSlug }) {
  return (
    <div className="py-20 px-4 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            {content.title}
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <div
              key={service.id}
              className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100"
            >
              {service.image_url && (
                <div className="relative overflow-hidden h-56">
                  <img
                    src={service.image_url || "/placeholder.svg"}
                    alt={service.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              )}
              <div className="p-6">
                <h3 className="text-2xl font-bold mb-4 text-gray-800 group-hover:text-blue-600 transition-colors">
                  {service.name}
                </h3>
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-2 text-gray-600">
                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="font-medium">{service.duration_minutes} min</span>
                  </div>
                  <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    ${Number.parseFloat(service.price).toFixed(2)}
                  </span>
                </div>
                <a
                  href={`/${businessSlug}/reservar?service=${service.id}`}
                  className="block text-center w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-xl transform hover:scale-105"
                >
                  Reservar Ahora
                </a>
              </div>
            </div>
          ))}
        </div>
        {services.length === 0 && (
          <div className="text-center py-12">
            <div className="inline-block p-6 bg-blue-50 rounded-2xl">
              <p className="text-gray-600 text-lg">No hay servicios disponibles en este momento.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function AboutBlock({ content }) {
  return (
    <div className="py-20 px-4 bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            {content.title}
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto rounded-full"></div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-10 border border-white">
          <p className="text-lg text-gray-700 leading-relaxed whitespace-pre-line">{content.text}</p>
        </div>
      </div>
    </div>
  )
}

function ContactBlock({ content }) {
  return (
    <div className="py-20 px-4 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            {content.title}
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {content.phone && (
            <div className="group p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
              </div>
              <h3 className="font-bold text-xl mb-3 text-gray-800">Teléfono</h3>
              <p className="text-gray-600 text-lg font-medium">{content.phone}</p>
            </div>
          )}
          {content.email && (
            <div className="group p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="font-bold text-xl mb-3 text-gray-800">Email</h3>
              <p className="text-gray-600 text-lg font-medium break-all">{content.email}</p>
            </div>
          )}
          {content.address && (
            <div className="group p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <h3 className="font-bold text-xl mb-3 text-gray-800">Dirección</h3>
              <p className="text-gray-600 text-lg font-medium">{content.address}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function LandingPage() {
  const { slug } = useParams()
  const [business, setBusiness] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchBusiness = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await api.get(`/businesses/slug/${slug}`)
        setBusiness(response.data)
      } catch (err) {
        setError(err?.response?.data?.message || "Negocio no encontrado")
      } finally {
        setLoading(false)
      }
    }
    fetchBusiness()
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-xl font-semibold text-gray-700">Cargando...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="text-xl font-semibold text-red-600">{error}</div>
        </div>
      </div>
    )
  }

  const blocks = business.page?.blocks || []
  const services = business.services || []

  return (
    <div className="min-h-screen">
      {blocks.map((block, idx) => {
        switch (block.type) {
          case "hero":
            return <HeroBlock key={block.id || idx} content={block.content} />
          case "services":
            return (
              <ServicesBlock
                key={block.id || idx}
                content={block.content}
                services={services}
                businessSlug={business.slug}
              />
            )
          case "about":
            return <AboutBlock key={block.id || idx} content={block.content} />
          case "contact":
            return <ContactBlock key={block.id || idx} content={block.content} />
          default:
            return null
        }
      })}

      {blocks.length === 0 && (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50">
          <div className="text-center p-12 bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl max-w-2xl border border-white">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              {business.name}
            </h1>
            <p className="text-gray-600 text-lg">{business.description}</p>
          </div>
        </div>
      )}
    </div>
  )
}
