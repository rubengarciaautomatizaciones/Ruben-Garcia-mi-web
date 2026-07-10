# ROADMAP — rubengarcia.tech

## Resumen Ejecutivo

Reconstrucción completa de rubengarcia.tech para alojar dos universos de negocio (B2B High-Ticket y B2C Formación) bajo una misma marca personal, sin contaminación cruzada. La Home actúa como bifurcación de alto estatus donde el visitante se auto-segmenta inmediatamente.

La estrategia será un **Rebuild desde cero del Frontend dentro del repositorio actual de Replit** para asegurar un código 100% limpio y modular, desactivando el backend no utilizado y centralizando todas las configuraciones.

---

## 1. DECISIÓN TÉCNICA: ¿Refactorizar o Empezar de Cero?

### Veredicto: EMPEZAR DE CERO (el frontend, sobre tu repo actual)

**Justificación cruda:**

| Problema actual | Impacto |
|---|---|
| 4 navbars diferentes (`Navbar`, `Navbar2`, `Navbar3`, `NavbarNexus`) | Imposible unificar la navegación sin reescribirlas todas |
| Código duplicado (datos GEMS en `arsenal.tsx` y `arsenal/expertos.tsx`) | Mantener = doble trabajo en cada cambio |
| Colores de marca anulados (`brand-blue` y `brand-orange` = `#000000`) | El design system está roto desde la raíz |
| Landing.tsx = 762 líneas monolíticas | No es modular. Refactorizar = reescribir igualmente |
| Backend completo (Express + Drizzle + PG) sin usar ni 1 línea | Peso muerto en deps y config. No necesitas backend |
| La arquitectura actual (una sola landing) es incompatible con la bifurcación Home que necesitas | Cambio estructural, no cosmético |
| Naming inconsistente (`arsenalLinksPage` vs `ReunionPreFrame`) | Deuda técnica acumulada |

**Tiempo estimado de refactorización:** 60-70% del tiempo de hacerlo desde cero, pero con el riesgo constante de romper cosas y con un código final que seguirá arrastrando deuda técnica.

**Tiempo estimado desde cero:** 100% limpio, modular, y alineado con la nueva arquitectura. Sin sorpresas.

### ¿Qué conservamos del proyecto actual?

| Se conserva ✅ | Se descarta ❌ |
|---|---|
| `package.json` (con limpieza de deps) | Todas las páginas actuales |
| `vite.config.ts` (ajustes menores) | Todos los componentes custom (Navbars, Animations) |
| `tsconfig.json` | Backend completo (Express, Drizzle, PG) |
| `tailwind.config.ts` (ajustes para monocromático) | `index.css` (rebuild) |
| `components.json` (shadcn config) | `App.tsx` (nueva estructura de rutas) |
| Componentes `ui/` de shadcn (estándar) | Server (`routes.ts`, `storage.ts`, `db.ts`) |
| URLs de Tally.so, Stripe, Make.com, GA4 | Schema y shared routes vacíos |
| `vercel.json` | |
| `.replit` (ajustado) | |

---

## 2. ARQUITECTURA DE LA WEB (Sitemap Definitivo)

```
rubengarcia.tech
│
├── / ─────────────────────── HOME (Bifurcación)
│   │                         Hero + 2 caminos claros (Empresas vs. Profesionales)
│   │
│   ├── UNIVERSO B2B ──────── /empresas (Landing principal de servicios corporativos)
│   │   │
│   │   ├── /empresas/automatizacion ── "Arquitectura de Sistemas" (DFY) -> Formulario Tally
│   │   ├── /empresas/consultoria ───── "Consultoría Estratégica" (DWY) -> Formulario Tally
│   │   │
│   │   ├── /sistema-nexus ──────────── Funnel B2B: Lead Gen con IA (Consultoras)
│   │   │   └── /sistema-nexus/form ── Formulario Tally
│   │   │
│   │   ├── /sistema-nexus-industrial ─ Funnel B2B: Lead Gen con IA (Industrial)
│   │   │   └── /sistema-nexus-industrial/form ── Formulario Tally
│   │   │
│   │   └── /diseñoweb ──────────────── Funnel B2B: Desarrollo Web High-Ticket -> Formulario Tally
│   │
│   ├── UNIVERSO B2C ──────── /arsenal (Hub / Escaparate principal B2C)
│   │   │                     Captura MiniCurso lead magnet (Make.com webhook)
│   │   │
│   │   ├── /arsenal/iasinpaja ──────── Landing "IA Sin Paja" (Notion md copy) -> Stripe
│   │   ├── /arsenal/expertos ───────── Gemas de Gemini (Suscripción Stripe)
│   │   └── /arsenal/prompts ────────── Bóveda de Prompts (Pago único Stripe)
│   │
│   └── UTILIDAD
│       ├── /confirmacionminicurso ──── Thank-You Page del MiniCurso
│       ├── /success ────────────────── Success post-compra B2C (Stripe redirect) / Formulario
│       └── /* ──────────────────────── 404
```

### Lógica de navegación

| Desde | Navbar muestra | Comportamiento |
|---|---|---|
| `/` (Home) | Logo + "Empresas" + "Arsenal" | Bifurcación limpia |
| `/empresas` (y subpáginas) | Logo + "Servicios" + "Contacto" | Navbar B2B (oscura, premium) |
| `/arsenal` (y subpáginas) | Logo + "Recursos" + "← Inicio B2B" | Navbar B2C (oscura, premium) |
| `/sistema-nexus*` | Solo Logo | Página de funnel, sin distracciones |
| `/diseñoweb` | Solo Logo | Página de funnel, sin distracciones |

---

## 3. ESTRUCTURA DE LA HOME (Wireframe Textual)

### Sección 1: HERO (100vh)
- **Fondo:** Negro absoluto (`#000000`)
- **Contenido:** Logo "RUBÉN GARCÍA" centrado + tagline corto
- **Tagline:** _"Sistemas que eliminan el trabajo que no aporta valor."_
- **Objetivo psicológico:** Impacto inmediato. Posicionamiento de alto nivel.
- **Animación:** Fade-in de texto con delay escalonado. Scroll indicator discreto.

### Sección 2: BIFURCACIÓN (100vh)
- **Layout:** Dos bloques verticales a pantalla completa (50/50 en desktop, stacked en mobile)
- **Bloque izquierdo — EMPRESAS:**
  - Headline: _"Tu empresa pierde dinero cada día que no automatiza."_
  - Sub: _"Sistemas de IA para empresas que facturan +500K€/año"_
  - CTA: "Ver servicios →" (redirige a `/empresas`)
  - Visual: Líneas geométricas y estética técnica premium
- **Bloque derecho — PROFESIONALES (Arsenal):**
  - Headline: _"Aprende IA sin humo ni relleno."_
  - Sub: _"Herramientas, guías y atajos para profesionales."_
  - CTA: "Entrar al Arsenal →" (redirige a `/arsenal`)
  - Visual: Elementos de UI abstractos de código/procesos
- **Objetivo psicológico:** Auto-segmentación instantánea.
- **Interacción:** Hover expand sutil (la columna activa crece al 55% de ancho, la otra se reduce al 45% y disminuye su opacidad).

### Sección 3: FOOTER
- **Mínimo:** Logo + LinkedIn + Email + © 2025

---

## 4. ROADMAP DE EJECUCIÓN

### FASE 0 — Preparación y Setup (Día 1)
- [x] Crear el PRD y definir la nueva estructura del Sitemap en `docs/prd.md`
- [x] Guardar el Roadmap definitivo en `docs/roadmap.md`
- [ ] Configurar el archivo de constantes centralizado `client/src/lib/constants.ts` para agrupar todas las URLs (Make, Tally, Stripe)
- [ ] Retirar dependencias innecesarias del `package.json` (Drizzle, PG, Passport, etc.)
- [ ] Limpiar y respaldar vistas antiguas del frontend para empezar el rebuild limpio

### FASE 1 — Infraestructura y Design System (Día 1-2)
- [ ] Configurar `tailwind.config.ts` con la paleta de colores **100% Monocromática**
- [ ] Reescribir `client/src/index.css` con las variables globales correctas (sin colores de acento)
- [ ] Crear componente `Navbar` dinámico y `Footer`
- [ ] Configurar el enrutador Wouter en `client/src/App.tsx` para reflejar todas las nuevas rutas

### FASE 2 — Home de Bifurcación (Día 2-3)
- [ ] Programar la página `/` con la Hero animada y el SplitLayout de bifurcación
- [ ] Implementar animaciones de hover en la bifurcación
- [ ] Validar responsiveness total en móvil

### FASE 3 — Universo B2B (Día 3-5)
- [ ] Desarrollar la landing principal `/empresas` (Secciones: Hero, Servicios, Autoridad)
- [ ] Desarrollar la página dedicada a Arquitectura de Sistemas (`/empresas/automatizacion`) + CTA Tally
- [ ] Desarrollar la página dedicada a Consultoría Estratégica (`/empresas/consultoria`) + CTA Tally
- [ ] Reconstruir la landing de Diseño Web B2B (`/diseñoweb`) usando formulario de cualificación Tally como CTA
- [ ] Reconstruir `/sistema-nexus` y `/sistema-nexus-industrial` integrando la animación `<NexusAnimation />` monocromática y formularios de Tally independientes en sus subrutas `/form`

### FASE 4 — Universo B2C (El Arsenal) (Día 5-7)
- [ ] Desarrollar el Hub `/arsenal` con el formulario de MiniCurso conectado a Make
- [ ] Desarrollar la landing de la Guía "IA Sin Paja" (`/arsenal/iasinpaja`) usando acordeones de Shadcn interactivos monocromáticos para los módulos 1-10 e integrar el checkout de Stripe
- [ ] Desarrollar la página de Gemas de Gemini (`/arsenal/expertos`) e integrar las suscripciones Stripe
- [ ] Desarrollar la página de la Bóveda de Prompts (`/arsenal/prompts`) e integrar la pasarela Stripe
- [ ] Crear las páginas `/confirmacionminicurso` y `/success` (página de éxito de cobros y conversión B2C)

### FASE 5 — Polish y Deploy (Día 7-8)
- [ ] Añadir animaciones Framer Motion de scroll y transiciones entre páginas
- [ ] Configurar los metadatos SEO específicos de cada página (Titles, Descriptions, OG Tags)
- [ ] Testear integraciones de Stripe y envío de correos desde Make.com
- [ ] Deploy final en Vercel y comprobación de rutas en producción
