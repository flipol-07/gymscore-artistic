'use client'

import Link from 'next/link'
import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, MapPin, Calendar as CalendarIcon, ChevronRight } from 'lucide-react'
import { Navbar } from '@/shared/components/navbar'
import { Footer } from '@/shared/components/footer'
import { getCompetitions } from '@/features/competitions/data/demo-data'
import { cn } from '@/shared/lib/utils'

export default function CompeticionesPage() {
  const [query, setQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'finished'>('all')
  
  const allCompetitions = getCompetitions()
  
  const filteredCompetitions = useMemo(() => {
    return allCompetitions.filter(comp => {
      const matchesQuery = comp.name.toLowerCase().includes(query.toLowerCase()) || 
                           comp.location.toLowerCase().includes(query.toLowerCase())
      const matchesTab = activeTab === 'all' || comp.status === activeTab
      return matchesQuery && matchesTab
    })
  }, [allCompetitions, query, activeTab])

  return (
    <div className="min-h-screen bg-[#fbf9f5] flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Artistic Header */}
        <section className="pt-24 pb-32 px-6 md:px-12 border-b border-[#d0c5af]/10 bg-white">
          <div className="mx-auto max-w-[1400px]">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="atelier-subtitle mb-6"
            >
              Archivo Atelier · 2026
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="atelier-title mb-12"
            >
              Explora las <br />
              <span className="text-[#8c4b55]">competiciones.</span>
            </motion.h1>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col md:flex-row items-end gap-12"
            >
              <div className="relative flex-1 group">
                <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-[#1b1c1a]/80 group-hover:text-[#8c4b55] transition-colors" size={24} />
                <input
                  type="text"
                  placeholder="BUSCAR EVENTO O CIUDAD..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-6 bg-transparent border-b border-[#d0c5af]/50 text-2xl font-black italic tracking-tighter text-[#1b1c1a] placeholder-[#1b1c1a]/30 focus:border-[#8c4b55] transition-all outline-none uppercase"
                />
              </div>
              <div className="flex gap-8 border-b border-[#d0c5af]/30 pb-4">
                <TabButton name="Todas" active={activeTab === 'all'} onClick={() => setActiveTab('all')} />
                <TabButton name="Activas" active={activeTab === 'active'} onClick={() => setActiveTab('active')} />
                <TabButton name="Archivo" active={activeTab === 'finished'} onClick={() => setActiveTab('finished')} />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Competition Grid (Asymmetric Editorial Style) */}
        <section className="mx-auto max-w-[1400px] px-6 md:px-12 py-32">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
            <AnimatePresence mode="popLayout">
              {filteredCompetitions.map((comp, idx) => (
                <motion.div
                  key={comp.id}
                  layout
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.8, delay: idx * 0.1 }}
                  className={cn(idx % 2 === 0 ? "md:mt-0" : "md:mt-12")}
                >
                  <Link
                    href={`/competiciones/${comp.slug}`}
                    className="group block relative"
                  >
                    {/* Emblem & status indicator */}
                    <div className="flex items-center justify-between mb-10">
                       <div className="w-16 h-16 rounded-full border border-[#d0c5af]/30 flex items-center justify-center p-1 bg-white group-hover:border-[#8c4b55]/50 transition-all">
                          <div className="w-full h-full rounded-full bg-[#1b1c1a] flex items-center justify-center text-white font-serif italic text-xl font-black tracking-tighter group-hover:bg-[#8c4b55] transition-colors">
                             {comp.name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase()}
                          </div>
                       </div>
                       <div className="flex items-center gap-2">
                          <div className={cn(
                           "h-1.5 w-1.5",
                           comp.status === 'active' ? "bg-[#8c4b55] animate-pulse" : "bg-[#1b1c1a]/10"
                          )} />
                          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#1b1c1a]/70">
                            {comp.status === 'active' ? 'EN DIRECTO' : 'Finalizado'}
                          </span>
                       </div>
                    </div>

                    <div className="border-l border-[#d0c5af]/20 pl-8 transition-all group-hover:border-[#8c4b55]">
                      <h3 className="text-4xl font-black italic tracking-tighter text-[#1b1c1a] mb-6 leading-tight group-hover:text-[#8c4b55] transition-colors">
                        {comp.name}
                      </h3>
                      
                      <div className="space-y-4 mb-12">
                        <div className="flex items-center gap-3 text-[#1b1c1a]/70 text-xs font-bold uppercase tracking-widest">
                          <MapPin size={14} className="text-[#d4af37]" />
                          {comp.location}
                        </div>
                        <div className="flex items-center gap-3 text-[#1b1c1a]/70 text-xs font-bold uppercase tracking-widest">
                          <CalendarIcon size={14} className="text-[#d4af37]" />
                          {formatDate(comp.date)}
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-auto pt-8 border-t border-[#d0c5af]/10">
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#735c00]">
                          {comp.categoryCount} Categorías
                        </span>
                        <div className="w-12 h-px bg-[#d0c5af]/30 group-hover:w-24 group-hover:bg-[#8c4b55] transition-all" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          
          {filteredCompetitions.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-48"
            >
              <h3 className="font-serif text-5xl italic font-black text-[#1b1c1a]/70 uppercase tracking-tighter">Sin resultados</h3>
              <p className="text-[#1b1c1a]/70 mt-4 font-bold uppercase tracking-widest text-xs">Ajusta los filtros de búsqueda</p>
            </motion.div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  )
}

function TabButton({ name, active, onClick }: { name: string, active: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "text-[10px] font-black uppercase tracking-[0.3em] transition-all relative pb-2",
        active 
          ? "text-[#1b1c1a]" 
          : "text-[#1b1c1a]/80 hover:text-[#1b1c1a]/70"
      )}
    >
      {name}
      {active && (
        <motion.div 
          layoutId="tab"
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#8c4b55]"
        />
      )}
    </button>
  )
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).toUpperCase()
}
