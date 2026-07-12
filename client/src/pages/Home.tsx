import React, { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDown, Menu, X } from "lucide-react";
import { CONSTANTS } from "@/lib/constants";

// ==========================================
// COMPONENTE: FONDO INTERACTIVO DE REJILLA 3D
// ==========================================
function InteractiveMeshBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0, radius: 180 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Ajustar tamaño del canvas en resize
    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Capturar posición del ratón
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.targetX = e.clientX - rect.left;
      mouseRef.current.targetY = e.clientY - rect.top;
    };
    window.addEventListener("mousemove", handleMouseMove);

    // Parámetros de la rejilla
    const gridSpacing = 45;
    let time = 0;

    // Bucle de animación (60 FPS)
    const render = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 1)";
      ctx.fillRect(0, 0, width, height);

      // Suavizar movimiento del cursor (interpolación lineal)
      const mouse = mouseRef.current;
      mouse.x += (mouse.targetX - mouse.x) * 0.08;
      mouse.y += (mouse.targetY - mouse.y) * 0.08;

      time += 0.008;

      // Dibujar la rejilla matemática deformada por el ratón
      const cols = Math.ceil(width / gridSpacing) + 2;
      const rows = Math.ceil(height / gridSpacing) + 2;

      ctx.strokeStyle = "#171717"; // Gris muy oscuro de rejilla base
      ctx.lineWidth = 1;

      // Almacenamos puntos proyectados para dibujar las líneas
      const projectedPoints: { x: number; y: number; factor: number }[][] = [];

      for (let c = 0; c < cols; c++) {
        projectedPoints[c] = [];
        for (let r = 0; r < rows; r++) {
          const origX = (c - 1) * gridSpacing;
          const origY = (r - 1) * gridSpacing;

          // Distancia al ratón
          const dx = mouse.x - origX;
          const dy = mouse.y - origY;
          const dist = Math.sqrt(dx * dx + dy * dy);

          // Factor de deformación de onda
          let wave = Math.sin(origX * 0.004 + origY * 0.004 + time) * 15;
          
          // Deformación por proximidad del cursor
          let push = 0;
          if (dist < mouse.radius) {
            const power = (mouse.radius - dist) / mouse.radius;
            push = Math.sin(power * Math.PI) * -35; // Hundimiento/Deformación
          }

          const z = wave + push;
          
          // Proyección básica 3D a 2D
          const scale = 500 / (500 + z);
          const projX = mouse.x + (origX - mouse.x) * scale;
          const projY = mouse.y + (origY - mouse.y) * scale;

          projectedPoints[c][r] = {
            x: projX,
            y: projY,
            factor: Math.max(0, 1 - dist / (mouse.radius * 1.5)) // Factor de iluminación
          };
        }
      }

      // Dibujar líneas verticales y horizontales
      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          const pt = projectedPoints[c][r];

          // Línea a la derecha
          if (c < cols - 1) {
            const nextPtX = projectedPoints[c + 1][r];
            const glow = Math.max(pt.factor, nextPtX.factor);
            ctx.strokeStyle = glow > 0.05 
              ? `rgba(255, 255, 255, ${0.05 + glow * 0.25})` // Iluminación blanca en hover
              : "#171717";
            ctx.beginPath();
            ctx.moveTo(pt.x, pt.y);
            ctx.lineTo(nextPtX.x, nextPtX.y);
            ctx.stroke();
          }

          // Línea abajo
          if (r < rows - 1) {
            const nextPtY = projectedPoints[c][r + 1];
            const glow = Math.max(pt.factor, nextPtY.factor);
            ctx.strokeStyle = glow > 0.05 
              ? `rgba(255, 255, 255, ${0.05 + glow * 0.25})` 
              : "#171717";
            ctx.beginPath();
            ctx.moveTo(pt.x, pt.y);
            ctx.lineTo(nextPtY.x, nextPtY.y);
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />;
}

// ==========================================
// COMPONENTE PRINCIPAL: HOME
// ==========================================
export function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Scroll suave al presionar Segmentar/Bifurcación
  const scrollToBifurcation = () => {
    document.getElementById("bifurcacion")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="bg-black text-white min-h-screen relative font-sans select-none overflow-x-hidden">
      
      {/* 1. NAVBAR ESTILO NEW.STUDIO (Monocromático, Minimalista) */}
      <nav className="fixed top-0 left-0 w-full z-50 border-b border-brand-borderDark bg-black/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo Corporativo */}
          <Link href="/">
            <a className="font-display text-base font-bold tracking-[0.2em] text-white hover:text-brand-textMuted transition-colors uppercase">
              RUBÉN GARCÍA //
            </a>
          </Link>

          {/* Enlaces Desktop */}
          <div className="hidden md:flex items-center gap-10 font-display text-[10px] tracking-[0.25em] text-brand-textMuted uppercase">
            <a href="/#ofertas" onClick={scrollToBifurcation} className="hover:text-white transition-colors cursor-pointer">
              [ 01 // SERVICIOS ]
            </a>
            <Link href="/arsenal">
              <a className="hover:text-white transition-colors">
                [ 02 // EL ARSENAL ]
              </a>
            </Link>
            <a href="mailto:ruben.automatizaciones@gmail.com" className="hover:text-white transition-colors">
              [ 03 // CONTACTO ]
            </a>
          </div>

          {/* Menú Móvil Botón */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            className="md:hidden text-white hover:text-brand-textMuted focus:outline-none"
            aria-label="Abrir menú"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Desplegable Móvil */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-20 left-0 w-full bg-black border-b border-brand-borderDark flex flex-col items-center gap-6 py-8 font-display text-[11px] tracking-[0.2em] uppercase z-45"
            >
              <a 
                href="/#ofertas" 
                onClick={(e) => {
                  e.preventDefault();
                  setIsMobileMenuOpen(false);
                  scrollToBifurcation();
                }}
                className="hover:text-white text-brand-textMuted"
              >
                [ 01 // SERVICIOS ]
              </a>
              <Link href="/arsenal">
                <a onClick={() => setIsMobileMenuOpen(false)} className="hover:text-white text-brand-textMuted">
                  [ 02 // EL ARSENAL ]
                </a>
              </Link>
              <a href="mailto:ruben.automatizaciones@gmail.com" className="hover:text-white text-brand-textMuted">
                [ 03 // CONTACTO ]
              </a>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* 2. SECCIÓN 1: EL HERO (100vh) */}
      <section className="h-screen w-screen relative flex flex-col justify-between items-center px-6 pt-32 pb-16 z-10 overflow-hidden">
        
        {/* Renderizado de Rejilla Interactiva 3D */}
        <InteractiveMeshBackground />

        {/* Capa de rejilla estática sutil de diseño brutalista */}
        <div className="absolute inset-0 bg-transparent brutalist-grid-line opacity-20 pointer-events-none z-0"></div>

        {/* Floating Metadata (Brutalist style) */}
        <div className="w-full max-w-7xl flex flex-col md:flex-row justify-between items-start md:items-center font-display text-[9px] tracking-[0.3em] text-brand-textMuted uppercase gap-4 z-10 pointer-events-none">
          <div>[ DESIGN // INFRASTRUCTURE ]</div>
          <div>[ ESTADO: DISPONIBLE // S1 2026 ]</div>
        </div>

        {/* Copy Principal Centrado */}
        <div className="text-center max-w-5xl z-10 pointer-events-none mt-12 md:mt-0">
          <motion.h1 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl md:text-8xl font-display font-bold uppercase tracking-tighter mb-8 leading-[0.9] text-white"
          >
            SISTEMAS QUE ELIMINAN <br />
            EL TRABAJO MANUAL <br />
            QUE QUEMA TU DINERO.
          </motion.h1>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="text-[10px] md:text-xs tracking-[0.25em] uppercase text-brand-textMuted max-w-xl mx-auto leading-relaxed"
          >
            [ ARCHITECT: RUBÉN GARCÍA // OPTIMIZACIÓN IA EN ESTADO CRÍTICO ]
          </motion.div>
        </div>

        {/* Indicador de Deslizamiento (Trigger de Transición) */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ repeat: Infinity, duration: 2.5 }}
          onClick={scrollToBifurcation}
          className="flex flex-col items-center gap-3 cursor-pointer font-display text-[9px] tracking-[0.3em] uppercase text-brand-textMuted z-10"
        >
          <span>SEGMENTAR ACCESO</span>
          <motion.div 
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          >
            <ArrowDown size={14} />
          </motion.div>
        </motion.div>
      </section>

      {/* 3. SECCIÓN 2: LA BIFURCACIÓN (STUB - Se implementará en la siguiente fase) */}
      <section 
        id="bifurcacion" 
        className="h-screen w-screen flex items-center justify-center bg-black border-t border-brand-borderDark z-20 relative text-brand-textMuted font-display tracking-widest text-xs uppercase"
      >
        [ SECCIÓN 2: LA BIFURCACIÓN (STUB) ]
      </section>
      
    </div>
  );
}
