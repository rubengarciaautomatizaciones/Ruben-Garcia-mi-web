import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

export function Contacto() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="bg-black text-white min-h-screen flex flex-col justify-start items-center pt-28 pb-12 px-6 relative font-sans">
      
      {/* Botón Volver Atrás Minimalista */}
      <div className="w-full max-w-2xl mb-8 text-left">
        <Link href="/">
          <a className="inline-flex items-center gap-2 text-[10px] uppercase font-bold tracking-[0.15em] text-white/50 hover:text-white transition-colors duration-300">
            <ArrowLeft size={12} />
            <span>Volver al inicio</span>
          </a>
        </Link>
      </div>

      {/* Cabecera Brutalista */}
      <div className="w-full max-w-2xl text-left mb-10">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-3 font-sans">
          CONTACTO
        </h1>
        <p className="text-[13px] text-white/50 leading-relaxed font-light font-sans">
          Cuéntame en qué consiste tu negocio, qué buscas optimizar o cuál es el motivo de tu consulta. Responderé personalmente en un plazo de 24/48 horas laborables.
        </p>
      </div>

      {/* Contenedor del Formulario Tally con cargador integrado */}
      <div className="w-full max-w-2xl relative border border-white/10 rounded-2xl bg-[#0c0c0e] overflow-hidden p-4 sm:p-6 min-h-[500px] flex items-center justify-center">
        
        {/* Spinner Monocromático de Carga */}
        {isLoading && (
          <div className="absolute inset-0 flex flex-col gap-4 justify-center items-center bg-[#0c0c0e] z-10">
            <div className="w-8 h-8 border-2 border-white/10 border-t-white rounded-full animate-spin" />
            <span className="text-[10px] tracking-[0.15em] uppercase text-white/40">Cargando formulario...</span>
          </div>
        )}

        {/* Iframe de Tally */}
        <iframe
          src="https://tally.so/embed/ODdx68?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1"
          width="100%"
          height="550"
          title="Formulario de Contacto General"
          onLoad={() => setIsLoading(false)}
          className="border-0 w-full relative z-0 transition-opacity duration-300"
          style={{ opacity: isLoading ? 0 : 1 }}
        />
      </div>

      {/* Footer Fino */}
      <div className="w-full max-w-2xl text-center text-[9px] text-white/20 tracking-[0.2em] uppercase mt-12">
        Rubén García - Eficiencia e IA de Alto Impacto
      </div>
    </div>
  );
}
