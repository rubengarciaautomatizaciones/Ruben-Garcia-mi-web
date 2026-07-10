import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

export function Home() {
  const [hovered, setHovered] = useState<"left" | "right" | null>(null);

  // Animaciones para elementos
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 80, damping: 20 } },
  };

  return (
    <div className="bg-black text-white selection:bg-white selection:text-black min-h-screen overflow-x-hidden">
      
      {/* SECCIÓN 1: HERO (100vh) */}
      <section className="h-screen w-screen flex flex-col justify-between items-center px-6 py-12 relative border-b border-brand-borderDark z-20 brutalist-grid-line">
        {/* Líneas decorativas brutalistas en las esquinas */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-brand-borderDark"></div>
        <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-brand-borderDark"></div>
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-brand-borderDark"></div>
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-brand-borderDark"></div>

        {/* Header superior minimalista */}
        <div className="w-full max-w-7xl flex justify-between items-center font-display text-[10px] tracking-[0.25em] text-brand-textMuted uppercase">
          <span>Rubén García // 2026</span>
          <span>Sistemas IA & Web</span>
        </div>

        {/* Bloque Central */}
        <motion.div 
          className="text-center max-w-4xl"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          <motion.h1 
            variants={itemVariants}
            className="text-5xl md:text-8xl font-display font-bold uppercase tracking-tighter mb-6 leading-none"
          >
            RUBÉN GARCÍA
          </motion.h1>
          <motion.p 
            variants={itemVariants}
            className="text-xs md:text-sm tracking-[0.3em] uppercase text-brand-textMuted max-w-lg mx-auto leading-relaxed"
          >
            Sistemas que eliminan el trabajo que no aporta valor.
          </motion.p>
        </motion.div>

        {/* Indicador de Scroll */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="flex flex-col items-center gap-2 cursor-pointer font-display text-[9px] tracking-[0.3em] uppercase text-brand-textMuted"
          onClick={() => {
            document.getElementById("bifurcacion")?.scrollIntoView({ behavior: "smooth" });
          }}
        >
          <span>Desliza para segmentar</span>
          <div className="w-[1px] h-12 bg-white/40 mt-1"></div>
        </motion.div>
      </section>

      {/* SECCIÓN 2: BIFURCACIÓN (100vh) */}
      <section 
        id="bifurcacion" 
        className="min-h-screen md:h-screen w-screen flex flex-col md:flex-row relative z-10"
      >
        {/* BLOQUE IZQUIERDO: EMPRESAS (B2B) */}
        <div
          onMouseEnter={() => setHovered("left")}
          onMouseLeave={() => setHovered(null)}
          className={`flex-1 flex flex-col justify-between p-8 md:p-16 relative transition-all duration-700 ease-out border-b md:border-b-0 md:border-r border-brand-borderDark bg-black ${
            hovered === "right" ? "opacity-30 scale-[0.98] blur-[1px]" : "opacity-100 scale-100"
          }`}
          style={{ flexGrow: hovered === "left" ? 1.2 : hovered === "right" ? 0.8 : 1 }}
        >
          {/* Tag de Categoría */}
          <div className="font-display text-[10px] tracking-[0.2em] text-brand-textMuted uppercase">
            [ 01 // B2B INFRAESTRUCTURAS ]
          </div>

          {/* Contenido Principal */}
          <div className="max-w-xl my-12 md:my-0">
            <h2 className="text-3xl md:text-5xl font-display uppercase tracking-tight mb-6 leading-none">
              Tu empresa pierde dinero cada día que no automatiza.
            </h2>
            <p className="text-sm text-brand-textMuted leading-relaxed mb-10 max-w-md">
              Lógica de negocio aplicada. Diseño e instalo infraestructuras y sistemas autónomos de IA para empresas que facturan +500K€/año.
            </p>
            <Link href="/empresas">
              <a className="inline-flex items-center gap-3 bg-white text-black hover:bg-black hover:text-white hover:border hover:border-white px-8 py-4 font-display font-medium uppercase text-xs tracking-wider transition-all duration-300">
                Ver servicios B2B
                <ArrowUpRight className="w-4 h-4" />
              </a>
            </Link>
          </div>

          {/* Footer de sección */}
          <div className="font-display text-[9px] tracking-[0.15em] text-brand-textMuted/60 uppercase">
            // Automatización DFY & Consultoría
          </div>
        </div>

        {/* BLOQUE DERECHO: PROFESIONALES (B2C) */}
        <div
          onMouseEnter={() => setHovered("right")}
          onMouseLeave={() => setHovered(null)}
          className={`flex-1 flex flex-col justify-between p-8 md:p-16 relative transition-all duration-700 ease-out bg-brand-cardDark ${
            hovered === "left" ? "opacity-30 scale-[0.98] blur-[1px]" : "opacity-100 scale-100"
          }`}
          style={{ flexGrow: hovered === "right" ? 1.2 : hovered === "left" ? 0.8 : 1 }}
        >
          {/* Tag de Categoría */}
          <div className="font-display text-[10px] tracking-[0.2em] text-brand-textMuted uppercase">
            [ 02 // B2C FORMACIÓN ]
          </div>

          {/* Contenido Principal */}
          <div className="max-w-xl my-12 md:my-0">
            <h2 className="text-3xl md:text-5xl font-display uppercase tracking-tight mb-6 leading-none">
              Aprende Inteligencia Artificial sin paja.
            </h2>
            <p className="text-sm text-brand-textMuted leading-relaxed mb-10 max-w-md">
              El mercado de formación está roto. Te vendo el 5% de oro puro: atajos de Notion, prompts probados y herramientas sin teoría académica.
            </p>
            <Link href="/arsenal">
              <a className="inline-flex items-center gap-3 bg-white text-black hover:bg-black hover:text-white hover:border hover:border-white px-8 py-4 font-display font-medium uppercase text-xs tracking-wider transition-all duration-300">
                Entrar al Arsenal
                <ArrowUpRight className="w-4 h-4" />
              </a>
            </Link>
          </div>

          {/* Footer de sección */}
          <div className="font-display text-[9px] tracking-[0.15em] text-brand-textMuted/60 uppercase">
            // Guías, Bóveda de prompts & Herramientas
          </div>
        </div>
      </section>

      {/* FOOTER GENERAL DE LA HOME */}
      <footer className="py-8 px-6 border-t border-brand-borderDark bg-black flex flex-col md:flex-row justify-between items-center gap-4 text-brand-textMuted text-[10px] font-display tracking-widest uppercase">
        <div>© 2026 Rubén García. Todos los derechos reservados.</div>
        <div className="flex gap-6">
          <a href="https://www.linkedin.com/in/rub%C3%A9n-garc%C3%ADa-769416347" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">LinkedIn</a>
          <a href="mailto:ruben.automatizaciones@gmail.com" className="hover:text-white transition-colors">Email</a>
        </div>
      </footer>
    </div>
  );
}
