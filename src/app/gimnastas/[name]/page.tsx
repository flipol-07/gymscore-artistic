'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ChevronLeft, Calendar, Trophy, ChevronRight, Activity } from 'lucide-react'
import { Navbar } from '@/shared/components/navbar'
import { Footer } from '@/shared/components/footer'
import { getGymnastHistory } from '@/features/competitions/data/demo-data'
import { cn } from '@/shared/lib/utils'

export default function GymnastProfilePage() {
  const params = useParams()
  const name = decodeURIComponent(params.name as string)
  const history = getGymnastHistory(name)

  if (!history || history.length === 0) {
    return (
      <div className="min-h-screen bg-[#fbf9f5] flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-12">
           <h1 className="font-serif text-5xl italic font-black text-[#1b1c1a]/15">Gimnasta no encontrada</h1>
           <Link href="/competiciones" className="mt-8 atelier-button-secondary">Volver a Competiciones</Link>
        </main>
        <Footer />
      </div>
    )
  }

  const latest = history[0]

  return (
    <div className="min-h-screen bg-[#fbf9f5] flex flex-col">
      <Navbar />

      <main className="flex-1 pb-32">
        {/* Profile Hero */}
        <section className="pt-24 pb-32 px-6 md:px-12 bg-white border-b border-[#d0c5af]/10">
          <div className="mx-auto max-w-[1400px]">
            <Link 
              href="/competiciones" 
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-[#1b1c1a]/60 hover:text-[#8c4b55] transition-colors mb-12"
            >
              <ChevronLeft size={14} /> Volver
            </Link>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-12">
              <div className="space-y-6">
                 <div className="atelier-subtitle">Perfi de Élite</div>
                 <h1 className="atelier-title leading-[0.8]">
                   {name}
                 </h1>
                 <p className="text-xl font-serif italic text-[#1b1c1a]/80">
                   Representando a <span className="text-[#8c4b55] font-black">{latest.clubName}</span>
                 </p>
              </div>

              <div className="flex items-center gap-12 pt-12 border-t border-[#d0c5af]/10 md:border-none">
                 <div className="text-right">
                    <p className="text-4xl font-black italic tracking-tighter text-[#1b1c1a]">{history.length}</p>
                    <p className="text-[10px] uppercase font-bold text-[#1b1c1a]/60 tracking-widest mt-1">Eventos</p>
                 </div>
                 <div className="text-right">
                    <p className="text-4xl font-black italic tracking-tighter text-[#8c4b55]">{history.reduce((max, h) => Math.max(max, h.totalScore), 0).toFixed(3)}</p>
                    <p className="text-[10px] uppercase font-bold text-[#1b1c1a]/60 tracking-widest mt-1">Personal Best</p>
                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* History Timeline */}
        <section className="mx-auto max-w-[1400px] px-6 md:px-12 py-32">
          <div className="flex items-center gap-6 mb-16">
             <div className="h-px w-12 bg-[#8c4b55]" />
             <h2 className="text-sm font-black uppercase tracking-[0.4em] text-[#1b1c1a]">Historial de Competición</h2>
          </div>

          <div className="space-y-12">
            {history.map((item, idx) => (
              <motion.div
                key={`${item.categoryId}-${idx}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="group relative bg-white p-12 border border-[#d0c5af]/10 hover:border-[#8c4b55] transition-all"
              >
                <div className="grid md:grid-cols-12 gap-12 items-center">
                  <div className="md:col-span-3 space-y-2">
                    <div className="flex items-center gap-2 text-[10px] font-black text-[#735c00] uppercase tracking-widest italic">
                       <Calendar size={12} />
                       {new Date(item.date).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }).toUpperCase()}
                    </div>
                    <h3 className="text-2xl font-black italic tracking-tighter text-[#1b1c1a] group-hover:text-[#8c4b55] transition-colors leading-tight">
                      {item.competitionName}
                    </h3>
                  </div>

                  <div className="md:col-span-3">
                    <span className="text-[10px] font-black uppercase text-[#1b1c1a]/60 tracking-widest block mb-1">Categoría</span>
                    <span className="text-sm font-bold text-[#1b1c1a] italic uppercase">{item.categoryName}</span>
                  </div>

                  <div className="md:col-span-4 grid grid-cols-4 gap-4">
                     {[['V', item.vaultScore], ['B', item.barsScore], ['B', item.beamScore], ['S', item.floorScore]].map(([label, score], i) => (
                       <div key={i} className="text-center">
                         <span className="text-[8px] block font-black text-[#1b1c1a]/40 mb-1">{label}</span>
                         <span className="text-xs font-bold tabular-nums italic text-[#1b1c1a]/80">{Number(score).toFixed(3)}</span>
                       </div>
                     ))}
                  </div>

                  <div className="md:col-span-2 flex items-center justify-end gap-6">
                    <div className="text-right">
                       <span className="text-[10px] block font-black text-[#8c4b55] uppercase tracking-widest mb-1">Total</span>
                       <span className="text-3xl font-black italic tracking-tighter text-[#1b1c1a]">{item.totalScore.toFixed(3)}</span>
                    </div>
                    <Link href={`/competiciones/${item.competitionSlug}/${item.categoryId}`} className="w-10 h-10 flex items-center justify-center border border-[#d0c5af]/20 hover:border-[#8c4b55] hover:bg-[#8c4b55] hover:text-white transition-all">
                       <ChevronRight size={18} />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
