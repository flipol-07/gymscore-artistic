'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowRight, Star, Shield, Zap } from 'lucide-react'
import { Navbar } from '@/shared/components/navbar'
import { Footer } from '@/shared/components/footer'

export default function Home() {
  return (
    <div className="min-h-screen bg-[#fbf9f5] selection:bg-[#8c4b55]/10 overflow-x-hidden">
      <Navbar />
      
      <main>
        {/* HERO SECTION - Editorial High-End */}
        <section className="relative min-h-[90vh] flex items-center pt-24 pb-32">
          <div className="absolute inset-0 z-0 overflow-hidden">
            <Image
              src="/images/hero-artistic.png"
              alt="Artistic Gymnastics Excellence"
              fill
              className="object-cover object-center opacity-40 grayscale-[20%] transition-transform duration-[10000ms] scale-100 hover:scale-105"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#fbf9f5]/80 via-transparent to-[#fbf9f5]" />
          </div>

          <div className="relative z-10 mx-auto max-w-[1400px] px-6 md:px-12 w-full">
            <div className="max-w-4xl">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="atelier-subtitle mb-8"
              >
                Atelier GymScore · Kinetic Excellence
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.2 }}
                className="atelier-title mb-12"
              >
                Artistry <br />
                <span className="text-[#8c4b55]">in Motion.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.4 }}
                className="max-w-xl text-lg md:text-xl text-[#1b1c1a]/80 leading-[1.6] mb-16 font-medium italic"
              >
                Gimnasia artística reimaginada. Una experiencia visual pura para el seguimiento de resultados en tiempo real, diseñada para la élite.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.6 }}
                className="flex flex-col sm:flex-row items-stretch sm:items-center gap-6"
              >
                <Link
                  href="/competiciones"
                  className="atelier-button-primary"
                >
                  Explorar Competiciones
                  <ArrowRight size={16} />
                </Link>
                <Link
                  href="/admin"
                  className="atelier-button-secondary"
                >
                  Acceso Jueces
                </Link>
              </motion.div>
            </div>
          </div>
          
          {/* Scroll Indicator */}
          <motion.div 
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute bottom-12 left-12 hidden lg:flex flex-col items-center gap-4"
          >
            <div className="h-16 w-[1px] bg-gradient-to-b from-transparent to-[#d4af37]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] transform rotate-90 origin-left mt-8 text-[#735c00]">Scroll</span>
          </motion.div>
        </section>

        {/* ARTISTIC PHILOSOPHY SECTION */}
        <section className="py-48 atelier-section relative">
          <div className="absolute top-0 right-0 w-1/3 h-full opacity-5 pointer-events-none">
             <Image src="/images/silk-texture.png" alt="silk" fill className="object-cover" />
          </div>
          
          <div className="mx-auto max-w-[1400px] px-6 md:px-12">
            <div className="grid lg:grid-cols-2 gap-24 items-center">
              <div>
                 <div className="atelier-subtitle mb-6">Filosofía Atelier</div>
                 <h2 className="text-6xl md:text-7xl font-black italic tracking-tighter mb-12 leading-[0.9]">
                   Precisión que inspira <br /> <span className="text-[#8c4b55]">belleza.</span>
                 </h2>
                 <p className="text-xl text-[#1b1c1a]/80 leading-relaxed mb-12">
                   GymScore no es solo una base de datos; es un tributo visual a cada gimnasta. Hemos eliminado la fricción para que la única protagonista sea la nota perfecta.
                 </p>
                 
                 <div className="grid sm:grid-cols-2 gap-12">
                   <div className="space-y-4">
                     <div className="h-px w-8 bg-[#8c4b55]" />
                     <h3 className="font-serif text-2xl font-black italic">Resultados en Vivo</h3>
                     <p className="text-sm text-[#1b1c1a]/70 leading-relaxed">Puntuaciones validadas al instante con una interfaz de lectura clarividente.</p>
                   </div>
                   <div className="space-y-4">
                     <div className="h-px w-8 bg-[#8c4b55]" />
                     <h3 className="font-serif text-2xl font-black italic">Diseño de Élite</h3>
                     <p className="text-sm text-[#1b1c1a]/70 leading-relaxed">Diseñado con la estética de las grandes galas y eventos olímpicos.</p>
                   </div>
                 </div>
              </div>
              
              <motion.div 
                whileHover={{ scale: 0.98 }}
                className="relative aspect-[4/5] overflow-hidden"
              >
                 <Image src="/images/silk-texture.png" alt="Artistic Detail" fill className="object-cover" />
                 <div className="absolute inset-0 flex items-center justify-center p-12">
                   <div className="border border-[#1b1c1a]/10 w-full h-full flex flex-col items-center justify-center text-center p-12 bg-white/10 backdrop-blur-xl">
                      <Star className="text-[#d4af37] w-12 h-12 mb-8" />
                      <p className="font-serif text-3xl italic font-medium text-[#1b1c1a]">"La excelencia es un arte que se vive en cada movimiento."</p>
                   </div>
                 </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* TRUST SECTION */}
        <section className="py-48 bg-white">
          <div className="mx-auto max-w-[1400px] px-6 md:px-12 text-center">
             <div className="atelier-subtitle mb-12">The Standard of the Industry</div>
             <div className="flex flex-wrap justify-center gap-12 md:gap-32 opacity-50 grayscale saturate-0">
                <span className="text-3xl font-black italic tracking-tighter">ELITE GAF</span>
                <span className="text-3xl font-black italic tracking-tighter">OLYMPIC WAY</span>
                <span className="text-3xl font-black italic tracking-tighter">ARTISTIC HUB</span>
                <span className="text-3xl font-black italic tracking-tighter">JUDGE PRO</span>
             </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
