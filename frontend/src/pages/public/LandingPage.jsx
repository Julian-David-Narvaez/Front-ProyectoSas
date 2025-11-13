"use client"

import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import api from "../../api/axios"

function HeroBlock({ content }) {
  return (
    <div
      className="relative text-white py-40 px-4 overflow-hidden"
      style={
        content.image_url
          ? {
              backgroundImage: `url(${content.image_url})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
          : {
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            }
      }
    >
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 via-purple-900/30 to-pink-900/40"></div>
      <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-400/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-400/10 rounded-full blur-3xl animate-pulse delay-700"></div>
      <div className="absolute top-1/2 left-1/4 w-2 h-32 bg-gradient-to-b from-cyan-400/50 to-transparent rotate-12 blur-sm"></div>
      <div className="absolute top-1/3 right-1/3 w-2 h-40 bg-gradient-to-b from-pink-400/50 to-transparent -rotate-12 blur-sm"></div>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>

      <div className="max-w-6xl mx-auto text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full mb-8 shadow-lg">
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-white/90">Reserva en línea disponible</span>
        </div>

        <h1 className="text-7xl md:text-8xl font-black mb-8 leading-tight">
          <span className="inline-block bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-200 to-white drop-shadow-2xl animate-[gradient_8s_ease_infinite]">
            {content.title}
          </span>
        </h1>

        <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed font-light backdrop-blur-sm bg-black/10 py-4 px-6 rounded-2xl border border-white/10">
          {content.subtitle}
        </p>

        <div className="mt-16 flex flex-col items-center gap-2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/40 rounded-full flex items-start justify-center p-2">
            <div className="w-1.5 h-3 bg-white/60 rounded-full"></div>
          </div>
          <span className="text-xs text-white/60 font-medium">Desliza para ver más</span>
        </div>
      </div>
    </div>
  )
}

function ServicesBlock({ content, services, businessSlug }) {
  return (
    <div className="py-24 px-4 bg-gradient-to-b from-gray-950 via-gray-900 to-black relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-20">
          <div className="inline-block mb-4">
            <span className="text-sm font-bold text-cyan-400 tracking-widest uppercase">Nuestros Servicios</span>
          </div>
          <h2 className="text-6xl md:text-7xl font-black mb-6">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400">
              {content.title}
            </span>
          </h2>
          <div className="flex items-center justify-center gap-2">
            <div className="w-20 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent rounded-full"></div>
            <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
            <div className="w-20 h-1 bg-gradient-to-r from-transparent via-pink-400 to-transparent rounded-full"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
          {services.map((service, index) => (
            <div
              key={service.id}
              className={`group relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-3xl overflow-hidden border border-gray-700/50 hover:border-cyan-400/50 transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_0_50px_rgba(34,211,238,0.3)] ${
                index === 0 ? "md:col-span-2 lg:col-span-1" : ""
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/0 via-purple-400/0 to-pink-400/0 group-hover:from-cyan-400/10 group-hover:via-purple-400/5 group-hover:to-pink-400/10 transition-all duration-500"></div>

              {service.image_url && (
                <div className="relative overflow-hidden h-64">
                  <img
                    src={service.image_url || "/placeholder.svg"}
                    alt={service.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent"></div>

                  <div className="absolute top-4 right-4 px-4 py-2 bg-black/60 backdrop-blur-md border border-cyan-400/30 rounded-full">
                    <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-pink-400">
                      ${Number.parseFloat(service.price).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              <div className="p-8 relative z-10">
                <h3 className="text-2xl font-black mb-4 text-white group-hover:text-cyan-400 transition-colors duration-300">
                  {service.name}
                </h3>

                <div className="flex items-center gap-3 mb-6 text-gray-400">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800/50 rounded-full border border-gray-700/50">
                    <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="font-semibold text-sm">{service.duration_minutes} min</span>
                  </div>
                </div>

                <a
                  href={`/${businessSlug}/reservar?service=${service.id}`}
                  className="group/btn relative block text-center w-full py-4 px-6 bg-gradient-to-r from-cyan-500 to-pink-500 text-white font-bold rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-[0_0_30px_rgba(34,211,238,0.5)]"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    Reservar Ahora
                    <svg
                      className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-cyan-500 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                </a>
              </div>
            </div>
          ))}
        </div>

        {services.length === 0 && (
          <div className="text-center py-16">
            <div className="inline-block p-8 bg-gray-800/50 backdrop-blur-xl rounded-3xl border border-gray-700/50">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-cyan-500/20 to-pink-500/20 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 00-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
              </div>
              <p className="text-gray-400 text-lg font-medium">No hay servicios disponibles en este momento.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function AboutBlock({ content }) {
  return (
    <div className="py-24 px-4 bg-gradient-to-b from-black via-gray-900 to-gray-950 relative overflow-hidden">
      <div className="absolute top-1/2 left-0 w-1 h-64 bg-gradient-to-b from-transparent via-cyan-400/50 to-transparent blur-sm"></div>
      <div className="absolute top-1/2 right-0 w-1 h-64 bg-gradient-to-b from-transparent via-pink-400/50 to-transparent blur-sm"></div>

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <span className="text-sm font-bold text-pink-400 tracking-widest uppercase">Conócenos</span>
          </div>
          <h2 className="text-6xl md:text-7xl font-black mb-6">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400">
              {content.title}
            </span>
          </h2>
          <div className="flex items-center justify-center gap-2">
            <div className="w-20 h-1 bg-gradient-to-r from-transparent via-pink-400 to-transparent rounded-full"></div>
            <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
            <div className="w-20 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent rounded-full"></div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 rounded-3xl blur-xl opacity-20"></div>

          <div className="relative bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-2xl rounded-3xl p-12 border border-gray-700/50 shadow-2xl">
            <div className="absolute top-6 left-6 w-20 h-20 border-t-2 border-l-2 border-cyan-400/30 rounded-tl-3xl"></div>
            <div className="absolute bottom-6 right-6 w-20 h-20 border-b-2 border-r-2 border-pink-400/30 rounded-br-3xl"></div>

            <p className="text-lg text-gray-300 leading-relaxed whitespace-pre-line relative z-10">{content.text}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function ContactBlock({ content }) {
  return (
    <div className="py-24 px-4 bg-gradient-to-b from-gray-950 via-gray-900 to-black relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-cyan-500/5 via-purple-500/5 to-pink-500/5 rounded-full blur-3xl"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-20">
          <div className="inline-block mb-4">
            <span className="text-sm font-bold text-purple-400 tracking-widest uppercase">Contáctanos</span>
          </div>
          <h2 className="text-6xl md:text-7xl font-black mb-6">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400">
              {content.title}
            </span>
          </h2>
          <div className="flex items-center justify-center gap-2">
            <div className="w-20 h-1 bg-gradient-to-r from-transparent via-purple-400 to-transparent rounded-full"></div>
            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
            <div className="w-20 h-1 bg-gradient-to-r from-transparent via-purple-400 to-transparent rounded-full"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {content.phone && (
            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-3xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>

              <div className="relative p-10 bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl rounded-3xl border border-gray-700/50 hover:border-cyan-400/50 transition-all duration-500 h-full">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg shadow-cyan-500/50">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                </div>
                <h3 className="font-black text-2xl mb-4 text-white text-center">Teléfono</h3>
                <p className="text-gray-300 text-lg font-semibold text-center">{content.phone}</p>
              </div>
            </div>
          )}

          {content.email && (
            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-400 to-pink-500 rounded-3xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>

              <div className="relative p-10 bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl rounded-3xl border border-gray-700/50 hover:border-purple-400/50 transition-all duration-500 h-full">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg shadow-purple-500/50">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="font-black text-2xl mb-4 text-white text-center">Email</h3>
                <p className="text-gray-300 text-lg font-semibold text-center break-all">{content.email}</p>
              </div>
            </div>
          )}

          {content.address && (
            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-400 to-orange-500 rounded-3xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>

              <div className="relative p-10 bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl rounded-3xl border border-gray-700/50 hover:border-pink-400/50 transition-all duration-500 h-full">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-pink-500 to-orange-600 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg shadow-pink-500/50">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                <h3 className="font-black text-2xl mb-4 text-white text-center">Dirección</h3>
                <p className="text-gray-300 text-lg font-semibold text-center">{content.address}</p>
              </div>
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
        // Verificar si es un error 403 (página deshabilitada)
        if (err?.response?.status === 403) {
          setError(err?.response?.data?.message || "Esta página no está disponible en este momento")
        } else {
          setError(err?.response?.data?.message || "Negocio no encontrado")
        }
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-black">
        <div className="text-center p-8 bg-gray-900/50 backdrop-blur-xl rounded-2xl shadow-xl max-w-md border border-rose-500/30">
          <div className="w-16 h-16 bg-rose-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-500/30">
            <svg className="w-8 h-8 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div className="text-xl font-semibold text-rose-400 mb-2">{error}</div>
          <p className="text-gray-400 text-sm">
            Esta página puede estar temporalmente deshabilitada o no existir.
          </p>
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
