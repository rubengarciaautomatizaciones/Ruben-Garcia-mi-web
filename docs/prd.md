# PRODUCT REQUIREMENTS DOCUMENT (PRD) — rubengarcia.tech

## 1. VISIÓN GENERAL Y OBJETIVOS

### El Reto
Alojar dos modelos de negocio con audiencias opuestas bajo el mismo dominio de marca personal (`rubengarcia.tech`) sin diluir el estatus corporativo B2B High-Ticket (SISTEMIA, Sistema Nexus, Consultoría) por la venta directa de infoproductos B2C (IA Sin Paja, Gemas, Prompts).

### La Solución
1.  **Home de Bifurcación Limpia:** Una Home binaria que obliga a la auto-segmentación del tráfico en menos de 3 segundos (Empresas vs. Profesionales).
2.  **Consistencia Estética:** Estilo visual unificado "Dark Minimal Brutalist" y **100% Monocromático** en toda la web. Sin colores de acento (no azul, no naranja). Todo en escala de negros, blancos y grises de alto contraste.
3.  **Arquitectura Modular:** Cada servicio B2B y producto B2C cuenta con su propia landing ultra-optimizada con CTAs directos y específicos.
4.  **Desacoplamiento Tecnológico:** Frontend 100% estático en React + Vite + TypeScript. Toda la lógica de formularios, cobros y captura de leads se delega en servicios de primer nivel (Tally, Stripe, Make).

---

## 2. ARQUITECTURA DE INFORMACIÓN Y SITEMAP

La web se estructurará bajo las siguientes rutas gestionadas mediante **Wouter**:

```
rubengarcia.tech
│
├── / (Home) ──────────────── Bifurcación limpia: Empresas vs. Profesionales/Arsenal
│
├── /empresas ─────────────── Ecosistema B2B (Landing de servicios, enfoque SISTEMIA)
│   ├── /empresas/automatizacion ── "Arquitectura de Sistemas" (DFY) -> Formulario Tally
│   ├── /empresas/consultoria ───── "Consultoría Estratégica" (DWY) -> Formulario Tally
│   ├── /empresas/sistema-nexus ─── Lead Gen con IA (Consultoras) -> Formulario Tally
│   ├── /empresas/sistema-nexus-industrial ─ Lead Gen con IA (Sector Industrial) -> Formulario Tally
│   └── /empresas/diseno-web ────── Desarrollo Web High-Ticket -> Formulario Tally
│
├── /arsenal ──────────────── Ecosistema B2C (Hub/Escaparate principal + Lead Magnet MiniCurso)
│   ├── /arsenal/iasinpaja ── Guía / Curso de Notion "IA Sin Paja" -> Pago Stripe
│   ├── /arsenal/expertos ── Suscripción "Gemas de Gemini" -> Pago Stripe
│   └── /arsenal/prompts ──── Pago único "Bóveda de Prompts" -> Pago Stripe
│
├── /confirmacionminicurso ── Thank-You Page post-registro del MiniCurso
├── /success ──────────────── Page de destino tras compra de cualquier producto B2C (Stripe redirect)
└── /contacto ─────────────── Formulario General Tally de contacto y cualificación
```

---

## 3. ESPECIFICACIÓN DETALLADA PÁGINA POR PÁGINA

### 3.1. HOME (`/`) - La Puerta de Entrada
*   **Fondo:** Negro absoluto (`#000000`).
*   **Sección 1 (Hero - 100vh):** Logo minimalista de "RUBÉN GARCÍA" en tipografía sans-serif geométrica gruesa (Space Grotesk). Animación suave de aparición. Tagline centrado: _"Sistemas que eliminan el trabajo que no aporta valor."_
*   **Sección 2 (Bifurcación - 100vh):** Pantalla dividida en 2 mitades verticales (Desktop) o 2 bloques (Móvil).
    *   **Lado Izquierdo (Empresas):**
        *   Headline: _"Tu empresa pierde dinero cada día que no automatiza."_
        *   Sub: _"Sistemas de Inteligencia Artificial para empresas que facturan +500K€/año."_
        *   CTA: Botón blanco con texto negro. Redirige a `/empresas`.
    *   **Lado Derecho (Profesionales):**
        *   Headline: _"Aprende IA sin humo ni relleno."_
        *   Sub: _"Herramientas, guías y atajos para profesionales sin tiempo."_
        *   CTA: Botón blanco con texto negro. Redirige a `/arsenal`.
*   **Interacción:** Al hacer hover sobre una mitad, el ancho de esa columna se expande ligeramente (ej. de 50% a 55%) y la otra se atenúa a un 40% de opacidad.

---

### 3.2. UNIVERSO B2B

#### A. Portal de Empresas (`/empresas`)
*   **Propósito:** Presentar el ecosistema B2B de SISTEMIA y redirigir a servicios específicos.
*   **Secciones:**
    1.  **Hero:** H1 en mayúsculas: _"NO VENDO CÓDIGO. VENDO EFICIENCIA."_ Subtítulo: _"Diseño e instalo la infraestructura de automatización de tu negocio para que dejes de gastar nóminas en tareas repetitivas."_
    2.  **Sección de Servicios (Grid):**
        *   **Card 1 (Arquitectura de Sistemas):** Explicación del servicio DFY. Link a `/empresas/automatizacion`.
        *   **Card 2 (Consultoría Estratégica):** Sesiones 1-on-1. Link a `/empresas/consultoria`.
        *   **Card 3 (Sistema Nexus / Nexus Industrial):** Lead Gen outbound automatizado. Link a `/empresas/sistema-nexus`.
        *   **Card 4 (Diseño Web High-Ticket):** Rediseño brutalista enfocado en estatus y conversión. Link a `/empresas/diseno-web`.
    3.  **Sección de Autoridad:** "No soy una agencia. Soy Rubén." Copy anti-humo enfocado en que no hay fruta fresca ni futbolín; hay lógica de ingeniería.
    4.  **CTA General:** Enlace a formulario general de Tally.

#### B. Arquitectura de Sistemas (`/empresas/automatizacion`)
*   **CTA:** Formulario Tally incrustado (iframe transparente) para cualificar si la empresa tiene volumen suficiente.

#### C. Consultoría Estratégica (`/empresas/consultoria`)
*   **CTA:** Formulario Tally para agendar (o pasarela previa).

#### D. Sistema Nexus (`/empresas/sistema-nexus` y `/empresas/sistema-nexus-industrial`)
*   **Diseño:** Tema oscuro absoluto. Componente interactivo animado (`<NexusAnimation />` monocromático) mostrando las fases de la prospección automatizada.
*   **CTA:** Redirección a formularios específicos de Tally en `/empresas/sistema-nexus/form` y `/empresas/sistema-nexus-industrial/form`.

#### E. Desarrollo Web (`/empresas/diseno-web`)
*   **Propósito:** Convertir leads conseguidos mediante llamadas en frío (Cold Calls) que necesitan rediseñar su web.
*   **CTA:** Botón hacia formulario Tally de cualificación específico para diseño web.

---

### 3.3. UNIVERSO B2C (El Arsenal)

#### A. Hub Central (`/arsenal`)
*   **Propósito:** Centralizar la venta de infoproductos y captar leads para email marketing.
*   **Secciones:**
    1.  **Hero B2C:** _"Sistemas y atajos para profesionales sin tiempo."_
    2.  **Lead Magnet (MiniCurso):** Formulario de captura de email nativo monocromático con validación regex que envía los datos mediante `POST` al webhook de Make.com. Al tener éxito, redirige a `/confirmacionminicurso`.
    3.  **Catálogo de Productos (3 Cards Modernas):**
        *   **Guía "IA Sin Paja":** Enlace a `/arsenal/iasinpaja`.
        *   **Gemas de Gemini:** Enlace a `/arsenal/expertos`.
        *   **Bóveda de Prompts:** Enlace a `/arsenal/prompts`.

#### B. Landing "IA Sin Paja" (`/arsenal/iasinpaja`)
*   **Propósito:** Carta de ventas directa basada en el Notion MD.
*   **Estructura y Componentes:**
    *   **Hero:** _"Si quieres hacer pan, no necesitas un máster sobre la temperatura de germinación del trigo."_
    *   **Sección del Problema:** Agitación sobre la infoxicación en LinkedIn y cursos vacíos de 4.000€.
    *   **Sección interactiva "El Sistema" (Triangulitos):** Acordeones colapsables de Shadcn (`<Accordion>`) detallando Módulo por Módulo (del 1 al 10) el temario. Estilo monocromático estricto.
    *   **Sección "Esto es/no es para ti":** Dos listas contrastadas para segmentar al comprador.
    *   **Sección Oferta y Precio:** Bloque con precio de 97€ (IVA incluido) en pago único.
    *   **Garantía Estricta:** Copy visceral explicando el por qué de "NO HAY DEVOLUCIONES".
    *   **Prueba Social:** Embeber carrusel de capturas de testimonios de Notion en escala de grises.
    *   **CTA principal:** Botón blanco con texto negro a Stripe Checkout link (abre en la misma pestaña).

#### C. Gemas de Gemini (`/arsenal/expertos`)
*   **Propósito:** Venta de las 5 suscripciones recurrentes de IA (17€/mes cada una).
*   **Layout:** Grid interactivo o lista de acordeones donde se detallan las 5 gemas y sus links específicos de suscripción a Stripe.

#### D. Bóveda de Prompts (`/arsenal/prompts`)
*   **Propósito:** Venta de la base de datos Notion con +50 casos de uso (27€ pago único).
*   **Layout:** Carta de ventas en acordeón + carrusel de capturas y botón Stripe.

#### E. Página de Éxito de Compra (`/success`)
*   **Propósito:** Redirección automática desde Stripe después de que un usuario compra con éxito cualquier producto B2C.
*   **Diseño:** Centrado, limpio, con mensaje claro de éxito de pago, instrucciones de acceso y un botón para volver al `/arsenal` o al inicio.

#### F. Contacto (`/contacto`)
*   **Propósito:** Ofrecer un canal de comunicación directo y centralizado para propuestas, consultas generales o cualificación preliminar.
*   **CTA:** Formulario Tally general embebido directamente en la página de forma responsiva y con estilo transparente.

---

## 4. DISEÑO Y GUÍAS DE ESTILO (DESIGN SYSTEM 100% MONOCROMÁTICO)

### Colores (Sin excepciones)
No se usará ningún color que no sea blanco, negro o escala de grises.

```ts
// En la raíz de tailwind.config.ts
colors: {
  brand: {
    dark: '#000000',       // Fondo principal de la web
    cardDark: '#0A0A0A',   // Fondo de tarjetas, menús e interactivos (gris ultra oscuro)
    borderDark: '#262626', // Borde sutil por defecto (gris intermedio-oscuro)
    borderFocus: '#404040',// Borde en foco o hover
    accentWhite: '#FFFFFF',// Usado para textos primarios y botones principales (High Contrast)
    textLight: '#F5F5F5',  // Texto de lectura principal
    textMuted: '#A3A3A3',  // Texto secundario, descripciones y placeholders
    grayDark: '#171717',   // Fondos alternativos
  }
}
```

### Tipografía
*   **Headings (H1, H2, H3):** `Space Grotesk`, sans-serif. Mayúsculas, tracking-tight.
*   **Body:** `Inter`, sans-serif.

---

## 5. CENTRALIZACIÓN DE INTEGRACIONES

Todos los enlaces externos, formularios e identificadores se extraerán a un archivo de configuración único para evitar duplicados en el código:

*   **Ruta propuesta:** `client/src/lib/constants.ts`

```typescript
export const CONSTANTS = {
  // Webhooks
  MAKE_MINICURSO_WEBHOOK: "https://hook.eu2.make.com/fo787sqveqf669tuymgmgduu623fpmnj",
  
  // Tally Embed URLs
  TALLY_FORMS: {
    NEXUS_GENERIC: "https://tally.so/embed/ODdx68",
    NEXUS_INDUSTRIAL: "https://tally.so/embed/Bz5QKe",
    AUTOMATIZACION: "https://tally.so/embed/PLACEHOLDER_AUTO",
    CONSULTORIA: "https://tally.so/embed/PLACEHOLDER_CONSULT",
    DISEÑO_WEB: "https://tally.so/embed/PLACEHOLDER_WEB",
  },
  
  // Stripe Checkout Links
  STRIPE_LINKS: {
    IA_SIN_PAJA: "https://html.cafe/xd3385945", // Reemplazar por real
    BOVEDA_PROMPTS: "https://html.cafe/x21642b95", // Reemplazar por real
    GEMS: {
      MARKETING: "https://stripe.com/...placeholder",
      VENTAS: "https://stripe.com/...placeholder",
      // Resto de gemas...
    }
  },
  
  // Analítica
  GA4_ID: "G-M5ND49BWE7"
};
```

---

## 6. ESTRATEGIA DE RECONSTRUCCIÓN (CÓMO LO HAREMOS)

### ¿Editar la actual o empezar desde cero?
La estrategia ganadora es un **Rebuild desde Cero del Frontend dentro de tu propio repositorio de Replit**. 
Esto significa que:
1. No creamos un repositorio nuevo, sino que editamos tu proyecto existente.
2. Limpiamos las carpetas de vistas y componentes antiguos y estructuramos las nuevas páginas sobre un lienzo limpio.
3. El backend actual se simplifica (eliminando Drizzle, esquemas de base de datos vacíos y lógica de base de datos local), dejándolo únicamente como un servidor de Express súper ligero cuya única función es servir la aplicación web estática compilada de React en producción (Vercel).
