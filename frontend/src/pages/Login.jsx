"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    // Validaciones
    if (!email.trim()) {
      setError("Por favor ingresa tu email")
      return
    }

    if (!email.includes('@') || !email.includes('.')) {
      setError("Por favor ingresa un email válido")
      return
    }

    if (!password.trim()) {
      setError("Por favor ingresa tu contraseña")
      return
    }

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres")
      return
    }

    try {
      const loggedUser = await login(email, password)
      console.log('Usuario logueado:', loggedUser);
      
      // Redirigir según rol
      if (loggedUser && loggedUser.role === 'superadmin') {
        console.log('Redirigiendo a superadmin');
        navigate('/admin/superadmin')
      } else {
        console.log('Redirigiendo a dashboard');
        navigate('/dashboard')
      }
    } catch (err) {
      console.error('Error de login:', err);
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.errors?.email?.[0] ||
                          err.message ||
                          "Error al iniciar sesión";
      setError(errorMessage);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000" />

      <div className="relative max-w-md w-full mx-4">
        <div className="backdrop-blur-xl bg-slate-900/50 border border-slate-800/50 rounded-2xl shadow-2xl shadow-blue-500/10 p-8 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Iniciar Sesión
            </h2>
            <div className="h-1 w-20 mx-auto bg-gradient-to-r from-transparent via-blue-500 to-transparent rounded-full" />
          </div>

          {error && (
            <div className="relative overflow-hidden rounded-lg border border-red-500/50 bg-red-500/10 backdrop-blur-sm p-4">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/5 to-red-500/0 animate-pulse" />
              <div className="relative flex items-start gap-3">
                <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-sm text-red-300 font-medium">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950/50 border border-slate-700/50 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 backdrop-blur-sm"
                placeholder="tu@email.com"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950/50 border border-slate-700/50 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 backdrop-blur-sm"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              className="relative w-full group overflow-hidden rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 p-[2px] transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/50"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse" />
              <div className="relative bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-3 rounded-[6px] text-white font-semibold transition-all duration-300 group-hover:bg-none">
                Ingresar
              </div>
            </button>
          </form>

          {/* <p className="text-center text-sm text-slate-400">
            ¿No tienes cuenta?{" "}
            <Link
              to="/register"
              className="text-blue-400 hover:text-cyan-400 font-medium transition-colors duration-300 hover:underline underline-offset-4"
            >
              Regístrate
            </Link>
          </p> */}
        </div>
      </div>
    </div>
  )
}
