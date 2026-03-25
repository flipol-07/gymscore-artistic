'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import { getCompetition, getCategories, getRankings } from '@/features/competitions/data/demo-data'
import { FEMALE_APPARATUS, APPARATUS_NAMES, type Apparatus } from '@/features/competitions/types'

export default function AdminCompeticionPage() {
  const params = useParams()
  const slug = params.id as string
  const competition = getCompetition(slug)
  const categories = competition ? getCategories(slug) : []
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [editingScore, setEditingScore] = useState<string | null>(null)
  const [scores, setScores] = useState<Record<string, Record<string, number>>>({})

  if (!competition) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500">Competición no encontrada</p>
      </div>
    )
  }

  const selectedCat = categories.find(c => c.id === selectedCategory)
  const rankings = selectedCategory ? getRankings(selectedCategory) : []
  const apparatus: Apparatus[] = selectedCat?.gender === 'female'
    ? FEMALE_APPARATUS
    : ['floor', 'pommel', 'rings', 'vault', 'p_bars', 'h_bar']

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Admin header */}
      <header className="bg-slate-900 border-b border-slate-700">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-white font-bold text-lg">GymScore</Link>
            <span className="px-2 py-0.5 bg-purple-600 text-white text-xs font-semibold rounded-full">Admin</span>
          </div>
          <Link href="/admin" className="text-sm text-slate-400 hover:text-white transition-colors">
            ← Volver
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-2xl font-black text-slate-900">{competition.name}</h1>
        <p className="text-slate-500 mt-1">{competition.location} · {competition.date}</p>

        {/* Category selector */}
        <div className="mt-6">
          <h2 className="text-lg font-bold text-slate-900 mb-3">Selecciona una categoría</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`p-3 rounded-lg text-left text-sm border transition-all ${
                  selectedCategory === cat.id
                    ? 'border-purple-500 bg-purple-50 text-purple-700 shadow-sm'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-purple-300'
                }`}
              >
                <span className="font-semibold">{cat.name}</span>
                <br />
                <span className="text-xs opacity-70">
                  {cat.gender === 'female' ? 'Femenino' : 'Masculino'} · {cat.gymnastCount} gimnastas
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Scores editor */}
        {selectedCategory && rankings.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">
                Puntuaciones: {selectedCat?.name}
              </h2>
              <span className="text-xs text-slate-400">
                Haz clic en una nota para editarla
              </span>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-3 py-3 text-left font-semibold text-slate-600 w-10">#</th>
                      <th className="px-3 py-3 text-left font-semibold text-slate-600">Gimnasta</th>
                      <th className="px-3 py-3 text-left font-semibold text-slate-600">Club</th>
                      {apparatus.map((app) => (
                        <th key={app} className="px-3 py-3 text-center font-semibold text-slate-600 whitespace-nowrap">
                          {APPARATUS_NAMES[app]}
                        </th>
                      ))}
                      <th className="px-3 py-3 text-center font-bold text-slate-700">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rankings.map((entry) => {
                      const key = entry.inscriptionId
                      return (
                        <tr key={key} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                          <td className="px-3 py-3 font-bold text-slate-700">{entry.position}</td>
                          <td className="px-3 py-3 font-medium text-slate-900">{entry.gymnastName}</td>
                          <td className="px-3 py-3 text-slate-600">{entry.clubName}</td>
                          {apparatus.map((app) => {
                            const scoreKey = `${key}-${app}`
                            const original = getScore(entry, app)
                            const current = scores[key]?.[app] ?? original
                            const isEditing = editingScore === scoreKey

                            return (
                              <td key={app} className="px-2 py-2 text-center">
                                {isEditing ? (
                                  <input
                                    type="number"
                                    step="0.05"
                                    min="0"
                                    max="20"
                                    defaultValue={current}
                                    autoFocus
                                    className="w-16 px-1 py-1 text-center text-sm border border-purple-400 rounded bg-purple-50 focus:outline-none focus:ring-1 focus:ring-purple-500"
                                    onBlur={(e) => {
                                      const val = parseFloat(e.target.value)
                                      if (!isNaN(val)) {
                                        setScores(prev => ({
                                          ...prev,
                                          [key]: { ...prev[key], [app]: val }
                                        }))
                                      }
                                      setEditingScore(null)
                                    }}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
                                    }}
                                  />
                                ) : (
                                  <button
                                    onClick={() => setEditingScore(scoreKey)}
                                    className="w-16 px-1 py-1 text-center text-sm tabular-nums rounded hover:bg-purple-50 hover:text-purple-700 transition-colors cursor-pointer"
                                  >
                                    {current.toFixed(2)}
                                  </button>
                                )}
                              </td>
                            )
                          })}
                          <td className="px-3 py-3 text-center font-bold tabular-nums text-slate-900">
                            {computeTotal(entry, apparatus, scores[key] || {}).toFixed(2)}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-4 flex gap-3">
              <button className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-500 transition-colors">
                💾 Guardar cambios
              </button>
              <button
                onClick={() => setScores({})}
                className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-300 transition-colors"
              >
                Descartar
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

function getScore(entry: { vaultScore: number; barsScore: number; beamScore: number; floorScore: number }, apparatus: string): number {
  switch (apparatus) {
    case 'vault': return entry.vaultScore
    case 'bars': return entry.barsScore
    case 'beam': return entry.beamScore
    case 'floor': return entry.floorScore
    default: return 0
  }
}

function computeTotal(
  entry: { vaultScore: number; barsScore: number; beamScore: number; floorScore: number },
  apparatus: string[],
  overrides: Record<string, number>
): number {
  return apparatus.reduce((sum, app) => {
    return sum + (overrides[app] ?? getScore(entry, app))
  }, 0)
}
