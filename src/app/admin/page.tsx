'use client'

import Link from 'next/link'
import { useState } from 'react'
import { getCompetitions } from '@/features/competitions/data/demo-data'

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const competitions = getCompetitions()

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white">GymScore Admin</h1>
            <p className="mt-2 text-slate-400 text-sm">Panel de administración para jueces</p>
          </div>
          <form
            className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-4"
            onSubmit={(e) => {
              e.preventDefault()
              if (email === 'admin@gymscore.app' && password === 'admin123') {
                setIsLoggedIn(true)
                setError('')
              } else {
                setError('Credenciales incorrectas. Usa admin@gymscore.app / admin123')
              }
            }}
          >
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="admin@gymscore.app"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="••••••••"
              />
            </div>
            {error && <p className="text-rose-400 text-sm">{error}</p>}
            <button
              type="submit"
              className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-lg transition-colors"
            >
              Iniciar sesión
            </button>
          </form>
          <p className="mt-4 text-center text-xs text-slate-500">
            Demo: admin@gymscore.app / admin123
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Admin header */}
      <header className="bg-slate-900 border-b border-slate-700">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-white font-bold text-lg">GymScore</Link>
            <span className="px-2 py-0.5 bg-purple-600 text-white text-xs font-semibold rounded-full">Admin</span>
          </div>
          <button
            onClick={() => setIsLoggedIn(false)}
            className="text-sm text-slate-400 hover:text-white transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-2xl font-black text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1">Gestión de competiciones y puntuaciones</p>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <p className="text-3xl font-bold text-slate-900">{competitions.length}</p>
            <p className="text-sm text-slate-500 mt-1">Competiciones</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <p className="text-3xl font-bold text-slate-900">
              {competitions.reduce((sum, c) => sum + (c.categoryCount || 0), 0)}
            </p>
            <p className="text-sm text-slate-500 mt-1">Categorías</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <p className="text-3xl font-bold text-purple-600">En directo</p>
            <p className="text-sm text-slate-500 mt-1">Estado</p>
          </div>
        </div>

        {/* Competition list */}
        <h2 className="mt-8 text-lg font-bold text-slate-900">Competiciones</h2>
        <div className="mt-4 space-y-3">
          {competitions.map((comp) => (
            <Link
              key={comp.id}
              href={`/admin/competiciones/${comp.slug}`}
              className="block bg-white border border-slate-200 rounded-xl p-4 hover:border-purple-300 hover:shadow-sm transition-all group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900 group-hover:text-purple-600 transition-colors">
                    {comp.name}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {comp.location} · {comp.date} · {comp.categoryCount} categorías
                  </p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  comp.status === 'active' ? 'bg-green-100 text-green-700' :
                  comp.status === 'finished' ? 'bg-slate-100 text-slate-600' :
                  'bg-amber-100 text-amber-700'
                }`}>
                  {comp.status === 'active' ? 'Activa' : comp.status === 'finished' ? 'Finalizada' : 'Borrador'}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
