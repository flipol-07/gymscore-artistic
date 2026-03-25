'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Trophy } from 'lucide-react'
import { APPARATUS_NAMES, type RankingEntry, type Apparatus } from '@/features/competitions/types'
import { cn } from '@/shared/lib/utils'

interface RankingsTableProps {
  rankings: RankingEntry[]
  apparatus: Apparatus[]
  slug: string
  categoryId: string
}

export function RankingsTable({ rankings, apparatus, slug, categoryId }: RankingsTableProps) {
  return (
    <div className="w-full atelier-table-container overflow-x-auto">
      <table className="atelier-table">
        <thead>
          <tr>
            <th className="w-16"># Pos</th>
            <th>Gimnasta</th>
            <th>Club / Atelier</th>
            {apparatus.map((app) => (
              <th key={app} className="text-center">
                 <Link
                    href={`/competiciones/${slug}/${categoryId}/${app}`}
                    className="group flex flex-col items-center gap-1 transition-all"
                  >
                    <span className="text-[10px] font-black uppercase text-[#1b1c1a]/70 group-hover:text-[#8c4b55] transition-colors">{app.substring(0, 3)}</span>
                  </Link>
              </th>
            ))}
            <th className="text-right text-[#8c4b55]">Puntuación Total</th>
          </tr>
        </thead>
        <tbody>
          {rankings.map((entry, idx) => {
            const isFirst = entry.position === 1
            const isTop3 = entry.position <= 3

            return (
              <motion.tr
                key={entry.inscriptionId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                className="group"
              >
                <td className="font-serif italic font-black text-xl text-[#1b1c1a]/80 group-hover:text-[#8c4b55] transition-colors">
                  <div className="flex items-center gap-2">
                    {entry.position}
                    {isTop3 && (
                      <Trophy 
                        size={14} 
                        className={cn(
                          entry.position === 1 ? "text-[#d4af37]" :
                          entry.position === 2 ? "text-[#c0c0c0]" :
                          "text-[#cd7f32]"
                        )} 
                      />
                    )}
                  </div>
                </td>
                <td>
                  <div className="flex flex-col">
                    <Link 
                      href={`/gimnastas/${encodeURIComponent(entry.gymnastName)}`}
                      className={cn(
                        "text-base font-black italic tracking-tighter text-[#1b1c1a] hover:text-[#8c4b55] transition-colors",
                        isFirst ? "decoration-[#d4af37] underline underline-offset-4" : ""
                      )}
                    >
                      {entry.gymnastName}
                    </Link>
                    <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-[#1b1c1a]/60 mt-1">Rendimiento de Élite</span>
                  </div>
                </td>
                <td>
                   <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full border border-[#d0c5af]/30 flex items-center justify-center p-0.5 bg-white shrink-0">
                         <div className="w-full h-full rounded-full bg-[#1b1c1a] flex items-center justify-center text-white text-[8px] font-black italic tracking-tighter">
                            {entry.clubName[0]}
                         </div>
                      </div>
                      <span className="text-xs font-bold uppercase tracking-[0.1em] text-[#1b1c1a]/80">
                        {entry.clubName}
                      </span>
                   </div>
                </td>
                {apparatus.map((app) => (
                  <td key={app} className="text-center tabular-nums text-sm font-bold text-[#1b1c1a]/70">
                    <Link href={`/competiciones/${slug}/${categoryId}/${app}`} className="hover:text-[#8c4b55] transition-colors">
                       {getApparatusScoreFromRanking(entry, app).toFixed(3)}
                    </Link>
                  </td>
                ))}
                <td className="text-right">
                  <span className="font-serif text-2xl font-black italic tracking-tighter text-[#1b1c1a]">
                    {entry.totalScore.toFixed(3)}
                  </span>
                </td>
              </motion.tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function getApparatusScoreFromRanking(entry: any, apparatus: string): number {
  switch (apparatus) {
    case 'vault': return entry.vaultScore
    case 'bars': return entry.barsScore
    case 'beam': return entry.beamScore
    case 'floor': return entry.floorScore
    default: return 0
  }
}
