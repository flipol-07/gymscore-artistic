export function Footer() {
  return (
    <footer className="py-24 bg-white border-t border-[#d0c5af]/10">
      <div className="mx-auto max-w-7xl px-6 flex flex-col items-center">
        <div className="font-serif text-3xl font-black italic tracking-tighter text-[#1b1c1a] mb-6">
          gym<span className="text-[#8c4b55]">score</span>
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[#735c00] mb-8">
          The Kinetic Atelier
        </p>
        <div className="h-px w-12 bg-[#8c4b55]/30 mb-8" />
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1b1c1a]/60 text-center">
          © {new Date().getFullYear()} · Todos los derechos artísticos reservados.
        </p>
      </div>
    </footer>
  )
}
