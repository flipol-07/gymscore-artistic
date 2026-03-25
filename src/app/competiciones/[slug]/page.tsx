import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { MapPin, Calendar, ChevronRight, Info } from 'lucide-react'
import { Navbar } from '@/shared/components/navbar'
import { Footer } from '@/shared/components/footer'
import { getCompetition, getCategories } from '@/features/competitions/data/demo-data'
import { cn } from '@/shared/lib/utils'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function CategoriasPage({ params }: Props) {
  const { slug } = await params
  const competition = getCompetition(slug)
  if (!competition) notFound()

  const categories = getCategories(slug)

  return (
    <div className="min-h-screen bg-[#fbf9f5] flex flex-col">
      <Navbar competitionName={competition.name} />

      <main className="flex-1 pb-32">
        {/* Competition Hero (Luxury Header) */}
        <section className="relative pt-24 pb-48 px-6 md:px-12 border-b border-[#d0c5af]/10 overflow-hidden">
           <Image 
             src="/images/silk-texture.png" 
             alt="Silk Detail" 
             fill
             className="object-cover opacity-10 grayscale"
           />
           
           <div className="mx-auto max-w-[1400px] relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-12">
              <div className="flex-1">
                <MotionDiv 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="atelier-subtitle mb-8"
                >
                  Evento Oficial · {competition.status === 'active' ? 'En Directo' : 'Finalizado'}
                </MotionDiv>
                
                <h1 className="atelier-title mb-12">
                  {competition.name}
                </h1>
                
                <div className="flex flex-wrap items-center gap-12 text-[#1b1c1a]/80 text-xs font-black uppercase tracking-[0.3em]">
                   <div className="flex items-center gap-3">
                     <MapPin size={18} className="text-[#d4af37]" />
                     {competition.location}
                   </div>
                   <div className="flex items-center gap-3">
                     <Calendar size={18} className="text-[#d4af37]" />
                     {formatDate(competition.date)}
                   </div>
                   <div className="w-px h-6 bg-[#d0c5af]/30 hidden md:block" />
                   <div className="text-[#8c4b55]">
                      {categories.length} Categorías
                   </div>
                </div>
              </div>

              <div className="shrink-0 hidden lg:flex items-center justify-center">
                 <div className="w-48 h-48 rounded-full border border-[#d0c5af]/30 p-2 opacity-20 hover:opacity-100 transition-opacity">
                    <div className="w-full h-full rounded-full border-4 border-[#1b1c1a] flex flex-col items-center justify-center text-[#1b1c1a]">
                       <span className="text-6xl font-black italic tracking-tighter -mb-2">
                          {competition.name.split(' ').map((w: string) => w[0]).join('').substring(0, 2).toUpperCase()}
                       </span>
                       <div className="h-px w-8 bg-[#8c4b55] my-2" />
                       <span className="text-[8px] font-black uppercase tracking-[0.5em]">ATELIER</span>
                    </div>
                 </div>
              </div>
           </div>
        </section>

        {/* Info Gala */}
        <div className="mx-auto max-w-[1400px] px-6 md:px-12 -mt-16 relative z-20">
           <div className="bg-[#1b1c1a] p-12 md:p-16 text-white flex flex-col md:flex-row items-center gap-12 group">
              <div className="flex-1">
                <h3 className="text-sm font-black uppercase tracking-[0.4em] text-[#d4af37] mb-4">Resumen</h3>
                <p className="font-serif text-3xl italic font-medium leading-[1.3] text-white/80">
                  Selecciona una categoría para explorar las puntuaciones en tiempo real. Cada nota es una obra de precisión.
                </p>
              </div>
              <div className="shrink-0 flex items-center gap-12">
                 <div className="text-right">
                    <p className="text-5xl font-black italic tracking-tighter text-white mb-2">{competition.categoryCount || '?'}</p>
                    <p className="text-[10px] uppercase font-bold text-white/60 tracking-widest">Gimnastas</p>
                 </div>
                 <div className="w-12 h-12 flex items-center justify-center border border-white/20 group-hover:border-[#d4af37] group-hover:bg-white transition-all">
                    <Info size={24} className="text-[#d4af37]" />
                 </div>
              </div>
           </div>
        </div>

        {/* Categories (Editorial Grid) */}
        <section className="mx-auto max-w-[1400px] px-6 md:px-12 py-32">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
            {categories.map((cat, idx) => (
              <Link
                key={cat.id}
                href={`/competiciones/${slug}/${cat.id}`}
                className="group block"
              >
                <div className="relative aspect-[4/3] bg-[#f5f3ef] overflow-hidden mb-8">
                   <div className="absolute inset-0 bg-gradient-to-br from-[#8c4b55]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                   <div className="absolute inset-0 flex items-center justify-center p-12">
                      <div className="border border-[#1b1c1a]/5 w-full h-full flex items-center justify-center">
                         <span className="text-8xl font-black italic tracking-tighter text-[#1b1c1a]/5 group-hover:text-[#8c4b55]/20 transition-all transform scale-150 rotate-[-15deg]">
                           {cat.name[0]}
                         </span>
                      </div>
                   </div>
                   <div className="absolute bottom-6 left-6 flex items-center gap-3">
                      <div className={cn(
                        "h-1.5 w-1.5",
                        cat.gender === 'female' ? "bg-[#8c4b55]" : "bg-[#1b1c1a]"
                      )} />
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#1b1c1a]">
                        Jornada {cat.session}
                      </span>
                   </div>
                </div>
                
                <h3 className="text-3xl font-black italic tracking-tighter text-[#1b1c1a] group-hover:text-[#8c4b55] transition-colors mb-4">
                  {cat.name}
                </h3>
                
                <div className="flex items-center justify-between pt-6 border-t border-[#d0c5af]/10">
                   <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1b1c1a]/70">
                     {cat.gymnastCount} Participantes
                   </span>
                   <ChevronRight size={18} className="text-[#d0c5af] group-hover:text-[#8c4b55] transform group-hover:translate-x-2 transition-all" />
                </div>
              </Link>
            ))}
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

// Pseudo component for framer-motion in RSC
function MotionDiv({ children, className, ...props }: any) {
  return <div className={className}>{children}</div>
}
