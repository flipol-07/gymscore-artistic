import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Navbar } from '@/shared/components/navbar'
import { Footer } from '@/shared/components/footer'
import { getGymnastHistory } from '@/features/competitions/data/demo-data'
import { APPARATUS_ICONS } from '@/features/competitions/types'

interface Props {
  params: Promise<{ name: string }>
}

export default async function GimnastaPage({ params }: Props) {
  const { name } = await params
  const gymnastName = decodeURIComponent(name)
  const history = getGymnastHistory(gymnastName)

  if (history.length === 0) notFound()

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-4 py-6">
          <h1 className="text-2xl md:text-3xl font-black text-slate-900">{gymnastName}</h1>
          <p className="mt-1 text-sm text-slate-500">Historial de competiciones</p>

          {/* History table */}
          <div className="mt-6 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-4 py-3 text-left font-semibold text-slate-600">Competición</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600">Club</th>
                    <th className="px-4 py-3 text-center font-semibold text-slate-600" title="Salto">{APPARATUS_ICONS.vault}</th>
                    <th className="px-4 py-3 text-center font-semibold text-slate-600" title="Paralelas">{APPARATUS_ICONS.bars}</th>
                    <th className="px-4 py-3 text-center font-semibold text-slate-600" title="Barra">{APPARATUS_ICONS.beam}</th>
                    <th className="px-4 py-3 text-center font-semibold text-slate-600" title="Suelo">{APPARATUS_ICONS.floor}</th>
                    <th className="px-4 py-3 text-center font-bold text-slate-700">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((entry, i) => (
                    <tr key={i} className="border-b border-slate-100 hover:bg-purple-50/50 transition-colors">
                      <td className="px-4 py-4">
                        <Link
                          href={`/competiciones/${entry.competitionSlug}/${entry.categoryId}`}
                          className="text-purple-600 hover:underline font-medium"
                        >
                          {entry.competitionName}
                        </Link>
                        <br />
                        <span className="text-xs text-slate-400">
                          {entry.categoryName} · {formatDate(entry.date)}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-slate-600">{entry.clubName}</td>
                      <td className="px-4 py-4 text-center tabular-nums text-slate-700">{entry.vaultScore.toFixed(1)}</td>
                      <td className="px-4 py-4 text-center tabular-nums text-slate-700">{entry.barsScore.toFixed(1)}</td>
                      <td className="px-4 py-4 text-center tabular-nums text-slate-700">{entry.beamScore.toFixed(1)}</td>
                      <td className="px-4 py-4 text-center tabular-nums text-slate-700">{entry.floorScore.toFixed(1)}</td>
                      <td className="px-4 py-4 text-center font-bold tabular-nums text-slate-900">{entry.totalScore.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => history.length > 0 && typeof window !== 'undefined' && window.history.back()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-500 transition-colors"
            >
              ← Volver atrás
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
