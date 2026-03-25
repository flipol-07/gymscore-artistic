'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Trophy, Star, Medal } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import type { RankingEntry } from '@/features/competitions/types'

interface PodiumProps {
  entries: RankingEntry[]
}

export function Podium({ entries }: PodiumProps) {
  const top3 = entries.slice(0, 3)
  if (top3.length === 0) return null

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-24">
      {top3.map((entry, idx) => {
        const isFirst = entry.position === 1
        const isSecond = entry.position === 2
        const isThird = entry.position === 3

        return (
          <motion.div
            key={entry.inscriptionId}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: idx * 0.2 }}
            className={cn(
              "relative pl-12 border-l border-[#d0c5af]/10 group transition-all duration-700",
              isFirst ? "border-l-2 border-[#d4af37]" : ""
            )}
          >
            {/* Rank Indicator */}
            <div className={cn(
              "absolute left-0 top-0 -translate-x-1/2 font-serif text-6xl md:text-8xl italic font-black tracking-tighter transition-all duration-700",
              isFirst ? "text-[#d4af37] -translate-x-[60%]" : "text-[#1b1c1a]/15"
            )}>
              #{entry.position}
            </div>

            <div className="space-y-6">
              <div className="atelier-subtitle flex items-center gap-3">
                 {isFirst && <Star size={12} className="text-[#d4af37]" />}
                 {isFirst ? 'Puesto de Oro' : isSecond ? 'Puesto de Plata' : 'Puesto de Bronce'}
              </div>

              <div>
                <Link href={`/gimnastas/${encodeURIComponent(entry.gymnastName)}`}>
                  <h3 className="text-4xl lg:text-5xl font-black italic tracking-tighter text-[#1b1c1a] leading-none mb-2 hover:text-[#8c4b55] transition-colors">
                    {entry.gymnastName}
                  </h3>
                </Link>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#735c00]">
                  {entry.clubName}
                </p>
              </div>

              <div className="flex items-end gap-6 pt-12">
                 <div className="flex flex-col">
                    <span className="text-sm font-bold uppercase tracking-widest text-[#1b1c1a]/60 mb-1">Nota Final</span>
                    <span className="text-6xl font-black italic tracking-tighter leading-none text-[#1b1c1a]">
                      {entry.totalScore.toFixed(3)}
                    </span>
                 </div>
                 {isFirst && (
                   <div className="h-10 w-10 border border-[#d4af37]/20 flex items-center justify-center animate-pulse">
                      <Trophy size={20} className="text-[#d4af37]" />
                   </div>
                 )}
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
