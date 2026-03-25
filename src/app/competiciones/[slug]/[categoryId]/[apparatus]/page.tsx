import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronRight, Home, Activity, Info, Zap, Layers, Shield, Music, CircleDashed, Circle, Columns, Maximize2 } from 'lucide-react'
import { Navbar } from '@/shared/components/navbar'
import { Footer } from '@/shared/components/footer'
import { getCategory, getApparatusRankings } from '@/features/competitions/data/demo-data'
import { APPARATUS_NAMES, APPARATUS_ICONS, type Apparatus } from '@/features/competitions/types'
import { cn } from '@/shared/lib/utils'

const IconMap: Record<string, any> = {
  Zap,
  Layers,
  Shield,
  Music,
  CircleDashed,
  Circle,
  Columns,
  Maximize2
}

interface Props {
  params: Promise<{ slug: string; categoryId: string; apparatus: string }>
}

export default async function AparatoPage({ params }: Props) {
  const { slug, categoryId, apparatus } = await params
  const category = getCategory(categoryId)
  if (!category) notFound()

  const apparatusKey = apparatus as Apparatus
  const apparatusName = APPARATUS_NAMES[apparatusKey]
  const apparatusIconName = APPARATUS_ICONS[apparatusKey]
  if (!apparatusName) notFound()

  const IconComponent = IconMap[apparatusIconName] || Activity

  const scores = getApparatusRankings(categoryId, apparatusKey)

  return (
    <div className="min-h-screen bg-[#fbf9f5] flex flex-col">
      <Navbar competitionName={category.competitionName} />

      <main className="flex-1 pb-32">
        {/* Editorial Header */}
        <section className="pt-24 pb-32 px-6 md:px-12 bg-white border-b border-[#d0c5af]/10">
          <div className="mx-auto max-w-[1400px]">
            {/* Breadcrumb */}
            <nav className="mb-12 flex flex-wrap items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-[#1b1c1a]/60 italic">
               <Link href="/" className="hover:text-[#8c4b55] transition-colors flex items-center gap-2">
                 <Home size={12} />
                 Atelier
               </Link>
               <ChevronRight size={10} />
               <Link href={`/competiciones/${slug}`} className="hover:text-[#8c4b55] transition-colors">
                 {category.competitionName}
               </Link>
               <ChevronRight size={10} />
               <Link href={`/competiciones/${slug}/${categoryId}`} className="hover:text-[#8c4b55] transition-colors">
                 {category.name}
               </Link>
               <ChevronRight size={10} />
               <span className="text-[#1b1c1a] font-black underline decoration-[#d4af37] underline-offset-4">{apparatusName}</span>
            </nav>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-12">
              <div className="space-y-4">
                 <div className="atelier-subtitle flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#8c4b55]/5 flex items-center justify-center text-[#8c4b55]">
                      <IconComponent size={14} strokeWidth={3} />
                    </div>
                    {apparatusName} · Performance
                 </div>
                 <h1 className="atelier-title">
                   Detalle Técnica <br />
                   <span className="text-[#8c4b55]">Ejecución.</span>
                 </h1>
              </div>

              <div className="flex items-center gap-12 border-l border-[#d0c5af]/30 pl-12 h-24">
                <div className="text-right">
                  <p className="text-4xl font-black italic tracking-tighter text-[#1b1c1a]">{scores.length}</p>
                  <p className="text-[10px] uppercase font-bold text-[#1b1c1a]/60 tracking-widest mt-1">Participantes</p>
                </div>
                <div className="text-right">
                  <p className="text-4xl font-black italic tracking-tighter text-[#8c4b55]">{scores[0]?.finalScore.toFixed(3) || '0.000'}</p>
                  <p className="text-[10px] uppercase font-bold text-[#1b1c1a]/60 tracking-widest mt-1">Máxima Puntuación</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1400px] px-6 md:px-12 py-32 space-y-12">
          <div className="flex items-center gap-6">
             <div className="h-px w-12 bg-[#8c4b55]" />
             <h2 className="text-sm font-black uppercase tracking-[0.4em] text-[#1b1c1a]">Ficha Técnica por Aparato</h2>
          </div>
          
          <div className="atelier-table-container">
            <table className="atelier-table">
              <thead>
                <tr>
                  <th className="w-16 text-center"># Pos</th>
                  <th>Gimnasta / Club</th>
                  <th className="text-center">Dif (D)</th>
                  <th className="text-center">Ejec (E)</th>
                  <th className="text-center">Penal (P)</th>
                  <th className="text-right text-[#8c4b55]">Nota Final</th>
                </tr>
              </thead>
              <tbody>
                {scores.map((score, i) => (
                  <tr key={i} className="group">
                    <td className="font-serif italic font-black text-xl text-[#1b1c1a]/80 group-hover:text-[#8c4b55] transition-all text-center">
                      {score.position}
                    </td>
                    <td>
                      <div className="flex flex-col">
                        <span className="text-base font-black italic tracking-tighter text-[#1b1c1a] group-hover:text-[#8c4b55] transition-colors">
                          {score.gymnastName}
                        </span>
                        <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-[#1b1c1a]/60 mt-1">{score.clubName}</span>
                      </div>
                    </td>
                    <td className="text-center tabular-nums text-sm font-bold text-[#1b1c1a]/80 italic">
                      {score.dScore.toFixed(3)}
                    </td>
                    <td className="text-center tabular-nums text-sm font-bold text-[#1b1c1a]/80 italic">
                      {score.eScore.toFixed(3)}
                    </td>
                    <td className="text-center tabular-nums text-sm font-bold text-[#8c4b55]">
                      {score.penalty > 0 ? `-${score.penalty.toFixed(1)}` : '0.0'}
                    </td>
                    <td className="text-right">
                      <span className="font-serif text-2xl font-black italic tracking-tighter text-[#1b1c1a]">
                        {score.finalScore.toFixed(3)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-16 flex items-start gap-8 p-12 bg-white border border-[#d0c5af]/10 border-l-4 border-l-[#d4af37]">
            <Info className="text-[#d4af37] shrink-0" size={24} />
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#1b1c1a]">Algoritmo de Calificación</h4>
              <p className="text-sm text-[#1b1c1a]/80 leading-relaxed font-bold italic">
                La puntuación final es el resultado de la Dificultad (D) sumada a la Ejecución (E), restando cualquier Penalización técnica (P). 
                En el Atelier, premiamos la precisión técnica sobre el volumen de dificultad en caso de empate absoluto.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
