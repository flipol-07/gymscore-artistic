import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Navbar } from '@/shared/components/navbar'
import { Footer } from '@/shared/components/footer'
import { getCategory, getRankings } from '@/features/competitions/data/demo-data'
import { FEMALE_APPARATUS, MALE_APPARATUS, type Apparatus } from '@/features/competitions/types'
import { Podium } from '@/features/competitions/components/podium'
import { RankingsTable } from '@/features/competitions/components/rankings-table'
import { ChevronRight, Home, Activity } from 'lucide-react'

interface Props {
  params: Promise<{ slug: string; categoryId: string }>
}

export default async function ResultadosPage({ params }: Props) {
  const { slug, categoryId } = await params
  const category = getCategory(categoryId)
  if (!category) notFound()

  const rankings = getRankings(categoryId)
  const apparatus: Apparatus[] = category.gender === 'female'
    ? FEMALE_APPARATUS
    : MALE_APPARATUS

  const podiumEntries = rankings.slice(0, 3)

  return (
    <div className="min-h-screen bg-[#fbf9f5] flex flex-col">
      <Navbar competitionName={category.competitionName} />

      <main className="flex-1 pb-32">
        {/* Editorial Header */}
        <section className="pt-24 pb-32 px-6 md:px-12 bg-white border-b border-[#d0c5af]/10">
          <div className="mx-auto max-w-[1400px]">
            {/* Breadcrumb */}
            <nav className="mb-12 flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-[#1b1c1a]/60 italic">
               <Link href="/" className="hover:text-[#8c4b55] transition-colors flex items-center gap-2">
                 <Home size={12} />
                 Atelier
               </Link>
               <ChevronRight size={10} />
               <Link href={`/competiciones/${slug}`} className="hover:text-[#8c4b55] transition-colors">
                 {category.competitionName}
               </Link>
               <ChevronRight size={10} />
               <span className="text-[#1b1c1a] font-black underline decoration-[#d4af37] underline-offset-4">{category.name}</span>
            </nav>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-12">
              <div className="space-y-4">
                 <div className="atelier-subtitle">
                   Clasificación · {category.gender === 'female' ? 'GAF' : 'GAM'}
                 </div>
                 <h1 className="atelier-title">
                   Ranking <br />
                   <span className="text-[#8c4b55]">General.</span>
                 </h1>
              </div>

              <div className="flex flex-col items-start md:items-end gap-3">
                <div className="flex items-center gap-3 px-6 py-2 bg-[#f5f3ef] border border-[#d4af37]/20">
                   <Activity size={18} className="text-[#8c4b55]" />
                   <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#1b1c1a]">Resultados en Vivo</span>
                </div>
                <p className="text-[10px] text-[#1b1c1a]/60 font-bold uppercase tracking-[0.2em]">Validadas por jurado oficial</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1400px] px-6 md:px-12 py-32 space-y-32">
          {/* Podium (Modern Editorial) */}
          {podiumEntries.length > 0 && (
            <div className="space-y-12">
               <div className="flex items-center gap-6">
                 <div className="h-px w-12 bg-[#8c4b55]" />
                 <h2 className="text-sm font-black uppercase tracking-[0.4em] text-[#1b1c1a]">El Podio</h2>
               </div>
               <Podium entries={podiumEntries} />
            </div>
          )}

          {/* Full Table */}
          <div className="space-y-12">
             <div className="flex items-center justify-between">
               <div className="flex items-center gap-6">
                 <div className="h-px w-12 bg-[#8c4b55]" />
                 <h2 className="text-sm font-black uppercase tracking-[0.4em] text-[#1b1c1a]">Clasificación General ({rankings.length})</h2>
               </div>
               <div className="hidden lg:flex items-center gap-3 text-[10px] font-bold text-[#1b1c1a]/60 uppercase tracking-[0.2em]">
                  <Activity size={14} />
                  Pulsa iconos para notas detalladas
               </div>
             </div>
             
             <div className="atelier-table-container">
               <RankingsTable 
                  rankings={rankings} 
                  apparatus={apparatus} 
                  slug={slug} 
                  categoryId={categoryId} 
                />
             </div>
          </div>
        </section>
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
  }).toUpperCase()
}
