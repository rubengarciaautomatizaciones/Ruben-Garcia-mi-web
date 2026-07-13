import React, { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence, useInView, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import * as THREE from "three";

// ============================================================================
// SHADERS ORIGINALES DE NEW.STUDIO (Fluid Solver, Plasma Shader & Transition Paint)
// ============================================================================
const vertexShaderSource = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

// Shader 1 (sj): Fluid Physics Solver
const fluidShaderSource = `
  uniform float iTime;
  uniform vec2 iResolution;
  uniform vec4 iMouse;
  uniform int iFrame;
  uniform sampler2D iPreviousFrame;
  uniform float uBrushSize;
  uniform float uBrushStrength;
  uniform float uFluidDecay;
  uniform float uTrailLength;
  uniform float uStopDecay;
  varying vec2 vUv;

  vec2 ur, U;

  float ln(vec2 p, vec2 a, vec2 b) {
    return length(p-a-(b-a)*clamp(dot(p-a,b-a)/dot(b-a,b-a),0.,1.));
  }
  
  vec4 t(vec2 v, int a, int b) {
    return texture2D(iPreviousFrame, fract((v+vec2(float(a),float(b)))/ur));
  }
  
  vec4 t(vec2 v) {
    return texture2D(iPreviousFrame, fract(v/ur));
  }

  float area(vec2 a, vec2 b, vec2 c) {
    float A = length(b-c), B = length(c-a), C = length(a-b), s = 0.5*(A+B+C);
    return sqrt(s*(s-A)*(s-B)*(s-C));
  }
  
  void main() {
    U = vUv * iResolution;
    ur = iResolution.xy;

    if(iFrame < 1) {
      float w = 0.5+sin(0.2*U.x)*0.5;
      float q = length(U-0.5*ur);
      gl_FragColor = vec4(0.1*exp(-0.001*q*q),0,0,w);
    } else {
      vec2 v = U,
        A = v + vec2( 1, 1),
        B = v + vec2( 1,-1),
        C = v + vec2(-1, 1),
        D = v + vec2(-1,-1);
      
      for (int i = 0; i < 5; i++) {
        v -= t(v).xy;
        A -= t(A).xy;
        B -= t(B).xy;
        C -= t(C).xy;
        D -= t(D).xy;
      }
      
      vec4 me = t(v);
      vec4 n = t(v, 0, 1),
        e = t(v, 1, 0),
        s = t(v, 0, -1),
        w = t(v, -1, 0);
      vec4 ne = .25*(n+e+s+w);
      me = mix(t(v), ne, vec4(0.15,0.15,0.95,0.));
      me.z = me.z - 0.01*((area(A,B,C) + area(B,C,D))-4.);

      vec4 pr = vec4(e.z,w.z,n.z,s.z);
      me.xy = me.xy + 100.*vec2(pr.x-pr.y, pr.z-pr.w)/ur;

      me.xy *= uFluidDecay;
      me.z *= uTrailLength;

      if (iMouse.z > 0.0) {
        vec2 mousePos = iMouse.xy;
        vec2 mousePrev = iMouse.zw;
        vec2 mouseVel = mousePos - mousePrev;
        float valMagnitude = length(mouseVel);
        float q = ln(U, mousePos, mousePrev);
        vec2 m = mousePos - mousePrev;
        float l = length(m);
        if(l > 0.0) m = min(1.0, 10.0) * m/l;

        float brushSizeFactor = 1e-4 / uBrushSize;
        float strengthFactor = 0.03 * uBrushStrength;

        float falloff = exp(-brushSizeFactor*q*q*q);
        falloff = pow(falloff, 0.5);

        me.xyw += strengthFactor * falloff * vec3(m, 10.);

        if (valMagnitude < 2.0) {
          float distToCursor = length(U - mousePos);
          float influence = exp(-distToCursor * 0.01);
          float cursorDecay = mix(1.0, uStopDecay, influence);
          me.xy *= cursorDecay;
          me.z *= cursorDecay;
        }
      }

      gl_FragColor = clamp(me, -0.4, 0.4);
    }
  }
`;

// Shader 2 (sq): Plasma Color distortion driven by fluid velocities
const colorShaderSource = `
  uniform float iTime;
  uniform vec2 iResolution;
  uniform sampler2D iFluid;
  uniform float uDistortionAmount;
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform vec3 uColor3;
  uniform vec3 uColor4;
  uniform float uColorIntensity;
  uniform float uSoftness;
  varying vec2 vUv;

  float noise(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  void main() {
    vec2 fragCoord = vUv * iResolution;

    vec4 fluid = texture2D(iFluid, vUv);
    vec2 fluidVel = fluid.xy;

    float mr = min(iResolution.x, iResolution.y);
    vec2 uv = (fragCoord * 2.0 - iResolution.xy) / mr;

    uv += fluidVel * (1.2 * uDistortionAmount);

    float d = -iTime * 0.1;
    float a = 0.0;
    for (float i = 0.0; i < 8.0; i++) {
      a += cos(i - d - a * uv.x);
      d += sin(uv.y * i + a);
    }
    d += iTime * 0.1;

    float mixer1 = cos(uv.x * d) * 0.5 + 0.5;
    float mixer2 = cos(uv.y * a) * 0.5 + 0.5;
    float mixer3 = sin(d + a) * 0.5 + 0.5;

    // Aumentar el contraste del plasma (bordes más duros y definidos)
    mixer1 = smoothstep(0.2, 0.8, mixer1);
    mixer2 = smoothstep(0.2, 0.8, mixer2);
    mixer3 = smoothstep(0.2, 0.8, mixer3);

    vec3 col = mix(uColor1, uColor2, mixer1);
    col = mix(col, uColor3, mixer2);
    col = mix(col, uColor4, mixer3 * 0.4);
    
    col *= uColorIntensity;


    gl_FragColor = vec4(col, 1.0);
  }
`;

// Shader 3 (sK): Transition Paint Dissolve (Noise splatter)
const transitionShaderSource = `
  uniform float uProgress;
  uniform vec2 uResolution;
  uniform vec3 uColor;
  uniform float uSpread;
  varying vec2 vUv;

  float Hash(vec2 p) {
    vec3 p2 = vec3(p.xy, 1.0);
    return fract(sin(dot(p2, vec3(37.1, 61.7, 12.4))) * 3758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f *= f * (3.0 - 2.0 * f);
    return mix(
      mix(Hash(i + vec2(0.0, 0.0)), Hash(i + vec2(1.0, 0.0)), f.x),
      mix(Hash(i + vec2(0.0, 1.0)), Hash(i + vec2(1.0, 1.0)), f.x),
      f.y
    );
  }

  float fbm(vec2 p) {
    float v = 0.0;
    v += noise(p * 1.0) * 0.5;
    v += noise(p * 2.0) * 0.25;
    v += noise(p * 4.0) * 0.125;
    return v;
  }

  void main() {
    vec2 uv = vUv;
    float aspect = uResolution.x / uResolution.y;
    vec2 centeredUv = (uv - 0.5) * vec2(aspect, 1.0);

    // Wipes from bottom to top
    float dissolveEdge = uv.y - uProgress * 1.25;
    float noiseValue = fbm(centeredUv * 15.0);
    float d = dissolveEdge + noiseValue * uSpread;

    float pixelSize = 1.0 / uResolution.y;
    float alpha = 1.0 - smoothstep(-pixelSize, pixelSize, d);

    gl_FragColor = vec4(uColor, alpha);
  }
`;

function WebGLOriginalFluid() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const sceneA = new THREE.Scene();
    const sceneB = new THREE.Scene();
    const sceneC = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: true,
      powerPreference: "high-performance",
      stencil: false,
      depth: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.autoClear = false;
    container.appendChild(renderer.domElement);

    // Ping Pong Render Targets
    let targetA = new THREE.WebGLRenderTarget(width, height, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      type: THREE.HalfFloatType,
    });

    let targetB = new THREE.WebGLRenderTarget(width, height, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      type: THREE.HalfFloatType,
    });

    const geometry = new THREE.PlaneGeometry(2, 2);

    // 1. Fluid Material (Solves fluid forces)
    const fluidMaterial = new THREE.ShaderMaterial({
      vertexShader: vertexShaderSource,
      fragmentShader: fluidShaderSource,
      uniforms: {
        iTime: { value: 0 },
        iResolution: { value: new THREE.Vector2(width, height) },
        iMouse: { value: new THREE.Vector4(0, 0, 0, 0) },
        iFrame: { value: 0 },
        iPreviousFrame: { value: null },
        uBrushSize: { value: 30 },
        uBrushStrength: { value: 2 },
        uFluidDecay: { value: 0.98 },
        uTrailLength: { value: 0.8 },
        uStopDecay: { value: 0.85 },
      },
      depthWrite: false,
      depthTest: false,
    });

    // 2. Color/Plasma Material (Renders final plasma deformed by fluid)
    // BAJAMOS EL BRILLO significativamente (negro absoluto + grises muy oscuros) para resaltar la tipografía
    const colorMaterial = new THREE.ShaderMaterial({
      vertexShader: vertexShaderSource,
      fragmentShader: colorShaderSource,
      uniforms: {
        iTime: { value: 0 },
        iResolution: { value: new THREE.Vector2(width, height) },
        iFluid: { value: null },
        uDistortionAmount: { value: 1.2 },
        uColor1: { value: new THREE.Color("#000000") }, // Fondo negro puro
        uColor2: { value: new THREE.Color("#050505") }, // Gris de transición
        uColor3: { value: new THREE.Color("#cccccc") }, // Gris plateado para que se vean las formas abstractas
        uColor4: { value: new THREE.Color("#0e0e0e") }, // Gris de soporte
        uColorIntensity: { value: 0.9 }, // Intensidad suficiente para ver las formas
        uSoftness: { value: 0.2 }, // Menor suavidad para mayor nitidez
      },
      depthWrite: false,
      depthTest: false,
    });

    // 3. Transition Material (The Paint Wiping dissolve)
    const transitionMaterial = new THREE.ShaderMaterial({
      vertexShader: vertexShaderSource,
      fragmentShader: transitionShaderSource,
      uniforms: {
        uProgress: { value: 0.0 },
        uResolution: { value: new THREE.Vector2(width, height) },
        uColor: { value: new THREE.Color("#ffffff") }, // Blanco puro para la transición
        uSpread: { value: 0.5 }
      },
      transparent: true,
      depthWrite: false,
      depthTest: false,
    });

    const meshA = new THREE.Mesh(geometry, fluidMaterial);
    sceneA.add(meshA);

    const meshB = new THREE.Mesh(geometry, colorMaterial);
    sceneB.add(meshB);

    const meshC = new THREE.Mesh(geometry, transitionMaterial);
    sceneC.add(meshC);

    // Mouse Tracking Logic
    let currentX = 0, currentY = 0, prevX = 0, prevY = 0;
    let lastMoveTime = 0;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = e.clientX;
      const mouseY = e.clientY;

      if (mouseX >= rect.left && mouseX <= rect.right && mouseY >= rect.top && mouseY <= rect.bottom) {
        prevX = currentX;
        prevY = currentY;
        currentX = mouseX - rect.left;
        currentY = rect.height - (mouseY - rect.top);
        lastMoveTime = performance.now();
        fluidMaterial.uniforms.iMouse.value.set(currentX, currentY, prevX, prevY);
      } else {
        fluidMaterial.uniforms.iMouse.value.set(0, 0, 0, 0);
      }
    };

    const handleMouseLeave = () => {
      fluidMaterial.uniforms.iMouse.value.set(0, 0, 0, 0);
    };

    const handleScroll = () => {
      // Sincronizar el progreso de la transición de pintura líquida con el scroll real
      const scrollY = window.scrollY;
      const progress = Math.min(scrollY / window.innerHeight * 1.0, 1.15);
      transitionMaterial.uniforms.uProgress.value = progress;
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("scroll", handleScroll);

    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      renderer.setSize(w, h);
      fluidMaterial.uniforms.iResolution.value.set(w, h);
      colorMaterial.uniforms.iResolution.value.set(w, h);
      transitionMaterial.uniforms.iResolution?.value?.set?.(w, h); // Si se agregara
      targetA.setSize(w, h);
      targetB.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    let frameId: number;
    let frameIndex = 0;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const time = 0.001 * performance.now();

      fluidMaterial.uniforms.iTime.value = time;
      colorMaterial.uniforms.iTime.value = time;
      fluidMaterial.uniforms.iFrame.value = frameIndex;

      // Desvanecer el input del ratón si se queda quieto
      if (performance.now() - lastMoveTime > 100) {
        fluidMaterial.uniforms.iMouse.value.set(0, 0, 0, 0);
      }

      // Render a targetA leyendo el frame previo desde targetB
      fluidMaterial.uniforms.iPreviousFrame.value = targetB.texture;
      renderer.setRenderTarget(targetA);
      renderer.render(sceneA, camera);

      // Render final a la pantalla: Primero el fondo de plasma distorsionado
      renderer.setRenderTarget(null);
      renderer.clear();
      colorMaterial.uniforms.iFluid.value = targetA.texture;
      renderer.render(sceneB, camera);

      // Dibujar la máscara de pintura por encima
      renderer.render(sceneC, camera);

      // Swap targets
      const temp = targetA;
      targetA = targetB;
      targetB = temp;

      frameIndex++;
    };
    animate();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(frameId);
      if (container && renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      targetA.dispose();
      targetB.dispose();
      geometry.dispose();
      fluidMaterial.dispose();
      colorMaterial.dispose();
      transitionMaterial.dispose();
    };
  }, []);

  return <div ref={containerRef} className="absolute inset-0 w-full h-full z-0 pointer-events-none" />;
}

// ============================================================================
// COMPONENTE SPLIT WORD REVEAL (Estilo new.studio)
// ============================================================================
interface SplitWordRevealProps {
  children: string;
  className?: string;
  style?: React.CSSProperties;
  delay?: number;
}

function SplitWordReveal({ children, className, style, delay = 0 }: SplitWordRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-10% 0px -10% 0px" });

  // Divide el texto por palabras
  const words = children.split(" ");

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.04,
        delayChildren: delay,
      },
    },
  };

  const wordVariants = {
    hidden: {
      y: "115%",
      opacity: 0,
      filter: "blur(6px)",
    },
    visible: {
      y: 0,
      opacity: 1,
      filter: "blur(0px)",
      transition: {
        duration: 0.9,
        ease: [0.16, 1, 0.3, 1], // easeOutExpo
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className={`${className} flex flex-wrap`}
      style={style}
    >
      {words.map((word, idx) => {
        if (word === "") return <span key={idx}>&nbsp;</span>;

        // Soporte para saltos de línea explícitos
        if (word === "\\n" || word === "<br>" || word === "<br/>") {
          return <div key={idx} className="w-full h-0" />;
        }

        const isItalic = word.includes("*");
        const cleanWord = word.replace(/\*/g, "");

        return (
          <span key={idx} className="inline-block overflow-hidden mr-[0.22em] py-[0.1em] -my-[0.1em]">
            <motion.span
              variants={wordVariants}
              className="inline-block"
              style={{
                transformOrigin: "bottom center",
                fontStyle: "normal"
              }}
            >
              {cleanWord}
            </motion.span>
          </span>
        );
      })}
    </motion.div>
  );
}

// ============================================================================
// COMPONENTE BLUR REVEAL EN SCROLL (Identico a useBlurReveal de new.studio)
// Configurado con once: true para que NO desaparezca al hacer scroll dentro.
// ============================================================================
function ScrollBlurReveal({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-10% 0px -10% 0px" });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ filter: "blur(12px)", opacity: 0, y: 35 }}
      animate={isInView ? { filter: "blur(0px)", opacity: 1, y: 0 } : { filter: "blur(12px)", opacity: 0, y: 35 }}
      transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

// ============================================================================
// HOME PAGE PRINCIPAL
// ============================================================================
// ============================================================================
// COMPONENTE STATEMENT DE SCROLL (Estilo montone.studio)
// ============================================================================
function ScrollStatementSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  // Obtener scroll ligado sin provocar re-renders de React
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"]
  });

  const lines = [
    { text: "La mayoría de las empresas de servicios", bold: false },
    { text: "gastan el 40% de su tiempo en tareas que un software hace gratis.", bold: true },
    { text: "Operaciones lentas. Procesos manuales. Pérdida silenciosa de márgenes.", bold: false },
    { text: "No instalamos parches. Estructuramos infraestructuras", bold: false },
    { text: "que captan clientes y automatizan operaciones de forma autónoma.", bold: true }
  ];

  // Calculamos el índice global de cada palabra para repartir el scroll
  let wordCounter = 0;
  const parsedLines = lines.map((line) => {
    const words = line.text.split(" ");
    const startIndex = wordCounter;
    wordCounter += words.length;
    return { ...line, words, startIndex };
  });

  const totalWords = wordCounter;
  const TEXT_END = 0.9; // El texto se ilumina completamente al llegar al 90% del scroll de la sección

  return (
    <div ref={sectionRef} className="relative h-[450vh] bg-white z-20">
      <div className="sticky top-0 h-screen w-full flex flex-col justify-center px-6 sm:px-16 md:px-24">
        <p className="flex flex-col gap-2 sm:gap-4 m-0 max-w-7xl w-full mx-auto">
          {parsedLines.map((line, lineIdx) => (
            <span
              key={lineIdx}
              className="block text-xl sm:text-3xl md:text-4xl tracking-tight leading-tight select-none"
            >
              {line.words.map((word, wordIdx) => {
                const globalIdx = line.startIndex + wordIdx;
                // Calculamos el rango de scroll exacto para esta palabra
                const start = (globalIdx / totalWords) * TEXT_END;
                const end = ((globalIdx + 0.8) / totalWords) * TEXT_END;

                // Ligamos el color de Framer Motion directamente al scroll
                const color = useTransform(
                  scrollYProgress,
                  [start, end],
                  ["rgba(0, 0, 20, 0.12)", "rgba(0, 0, 20, 1.0)"]
                );

                return (
                  <motion.span
                    key={wordIdx}
                    style={{
                      color,
                      fontWeight: line.bold ? 700 : 300,
                      display: "inline-block"
                    }}
                    className="mr-[0.25em]"
                  >
                    {word}
                  </motion.span>
                );
              })}
            </span>
          ))}
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENTE CARPETA INTERACTIVA MACOS 3D
// ============================================================================
interface MacOsFolderProps {
  title: string;
  label: string;
  href: string;
  items: string[];
}

function MacOsFolder({ title, label, href, items }: MacOsFolderProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Física de muelle unificada para todos los movimientos concurrentes
  const springTransition = { type: "spring", stiffness: 140, damping: 18 };

  return (
    <Link href={href}>
      <a
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="w-full max-w-[280px] xs:max-w-[320px] md:max-w-[400px] min-w-0 md:min-w-[320px] flex-shrink-0 flex flex-col justify-center items-center cursor-pointer select-none relative group py-6 md:py-8"
        style={{ perspective: 1200 }}
      >
        <div className="w-full aspect-[1004/841] relative flex flex-col items-center justify-end">

          {/* DEFINICIONES DE GRADIENTES LOCALES */}
          <svg className="absolute w-0 h-0" aria-hidden="true">
            <defs>
              <linearGradient id={`paint0_${title}`} x1="502" y1="32" x2="502" y2="818" gradientUnits="userSpaceOnUse">
                <stop stopColor="#505054" />
                <stop offset="0.0384615" stopColor="#3B3B3D" />
              </linearGradient>
              <linearGradient id={`paint2_${title}`} x1="502" y1="182" x2="502" y2="790" gradientUnits="userSpaceOnUse">
                <stop stopColor="#5E5E62" />
                <stop offset="0.5" stopColor="#444447" />
                <stop offset="1" stopColor="#444447" />
              </linearGradient>
              <linearGradient id={`paint1_${title}`} x1="502" y1="151.323" x2="502" y2="214.488" gradientUnits="userSpaceOnUse">
                <stop stopColor="#003C5C" />
                <stop offset="1" stopColor="#003C5C" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>

          {/* 1. CUBIERTA TRASERA SVG (Con pestaña macOS) */}
          <div className="absolute inset-0 z-0 drop-shadow-2xl">
            <svg viewBox="0 0 1004 841" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M147.2 792.062H856.8C897.124 792.062 917.286 792.062 932.687 784.552C946.235 777.945 957.25 767.404 964.152 754.438C972 739.698 972 720.403 972 681.811V217.072C972 178.481 972 159.185 964.152 144.445C957.25 131.479 946.235 120.938 932.687 114.331C917.286 106.821 897.124 106.821 856.8 106.821H411.34C395.813 106.821 380.981 100.384 370.375 89.0432L337.991 54.412C324.919 40.4339 306.638 32.5001 287.5 32.5H170H97C61.1015 32.5 32 61.6015 32 97.5V174.5V681.811C32 720.403 32 739.698 39.8475 754.438C46.7504 767.404 57.765 777.945 71.3127 784.552C86.7143 792.062 106.876 792.062 147.2 792.062Z" fill={`url(#paint0_${title})`} />
              <path d="M97 35.5H287.5C305.807 35.5001 323.296 43.0894 335.8 56.4609L368.185 91.0918C379.357 103.039 394.982 109.821 411.34 109.821H856.8C877.009 109.821 891.993 109.823 903.855 110.751C915.686 111.676 924.153 113.508 931.372 117.028C944.367 123.365 954.907 133.463 961.504 145.854C965.159 152.72 967.066 160.775 968.03 172.069C968.998 183.403 969 197.725 969 217.072V681.812C969 701.159 968.998 715.48 968.03 726.813C967.066 738.108 965.159 746.163 961.504 753.028C954.907 765.42 944.367 775.519 931.372 781.855C924.153 785.376 915.686 787.208 903.855 788.133C891.993 789.06 877.009 789.062 856.8 789.062H147.2C126.991 789.062 112.007 789.06 100.145 788.133C88.314 787.208 79.8471 785.376 72.6279 781.855C59.6334 775.519 49.0933 765.42 42.4961 753.028C38.8411 746.163 36.9339 738.108 35.9697 726.813C35.0022 715.48 35 701.159 35 681.812V97.5C35 63.2584 62.7583 35.5 97 35.5Z" stroke={`url(#paint1_${title})`} strokeOpacity="0.07" strokeWidth="6" />
            </svg>
          </div>

          {/* 2. FOLIOS DE PAPEL HTML (Mapeados Dinámicamente) */}
          {items.map((item, idx) => {
            // El primer elemento de la lista (idx = 0) queda al frente (zIndex más alto) y se desplaza menos.
            const zIndex = 10 + (items.length - 1 - idx);
            const yHover = -40 * (idx + 1);
            const yRest = -15 * (idx + 1);

            // Ángulo de inclinación sutil en hover
            const rotations = [-0.5, 1.5, -2.5, 2.0];
            const rot = rotations[idx % rotations.length];

            // Degradado cromático suave de adelante hacia atrás
            const bgColors = ["#ffffff", "#f9f9fb", "#f5f5f7", "#efeff1"];
            const bgColor = bgColors[idx] || "#ffffff";

            return (
              <motion.div
                key={idx}
                animate={{
                  y: isHovered ? yHover : yRest,
                  scale: isHovered ? (0.96 - idx * 0.01) : (0.92 - idx * 0.01),
                  rotate: isHovered ? rot : 0,
                }}
                transition={springTransition}
                className="absolute left-[7.5%] right-[7.5%] bottom-[8%] border border-black/10 rounded-xl p-4 pt-3.5 shadow-md flex flex-col justify-start h-[72%] pointer-events-none origin-bottom"
                style={{ zIndex, backgroundColor: bgColor }}
              >
                <div className="w-6 h-0.5 bg-black/10 rounded-full mb-2" />
                <span className="text-[9.5px] xs:text-[11px] md:text-[11.5px] font-bold text-black tracking-tight leading-none font-sans">
                  {item}
                </span>
              </motion.div>
            );
          })}

          {/* 3. CUBIERTA DELANTERA (Front Cover 3D simplificada) */}
          <motion.div
            animate={{
              rotateX: isHovered ? -22 : 0,
              y: isHovered ? 12 : 0,
              z: isHovered ? 15 : 0,
            }}
            transition={springTransition}
            className="absolute inset-x-0 bottom-0 h-[77.8%] origin-bottom cursor-pointer"
            style={{ transformStyle: "preserve-3d", zIndex: 20 }}
          >
            <svg viewBox="32 182 940 608" className="w-full h-full drop-shadow-xl" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="32" y="182" width="940" height="608" rx="72" fill={`url(#paint2_${title})`} />
              <rect x="32" y="182" width="940" height="608" rx="72" fill="white" fillOpacity="0.2" style={{ mixBlendMode: "multiply" }} />
            </svg>

            {/* Contenido Grabado sobre la Tapa */}
            <div
              className="absolute inset-0 flex flex-col justify-center items-center p-6 select-none pointer-events-none"
              style={{ transform: "translateZ(12px)" }}
            >
              {/* Título Grabado en Blanco */}
              <h3 className="text-lg sm:text-xl font-bold tracking-widest text-white text-center font-sans">
                {title}
              </h3>
            </div>
          </motion.div>
        </div>
      </a>
    </Link>
  );
}

// ============================================================================
// COMPONENTE BIFURCACIÓN CON ESCALADO EN SCROLL (The Black Box grow transition)
// ============================================================================
function BifurcacionSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Vinculamos la escala y bordes al scroll de Lenis/Ventana
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end end"]
  });

  const scale = useTransform(scrollYProgress, [0, 1.0], [0.88, 1]);
  const borderRadius = useTransform(scrollYProgress, [0, 1.0], ["32px", "0px"]);
  const padding = useTransform(scrollYProgress, [0, 1.0], ["24px", "0px"]);

  return (
    <div ref={containerRef} className="relative min-h-screen md:h-screen bg-white z-20 overflow-visible md:overflow-hidden">
      <motion.div
        style={{
          scale,
          borderRadius,
          paddingLeft: padding,
          paddingRight: padding,
          width: "100%",
          height: "100%"
        }}
        className="bg-black text-white flex flex-col justify-between py-12 md:py-0 pb-12 pt-6 px-6 sm:px-12 w-full h-auto md:h-full relative"
      >
        {/* Cabecera de la Sección (pt-36 en desktop para aire, pt-16 en móvil) */}
        <div className="w-full flex flex-col items-center mt-6 md:mt-12 pt-16 md:pt-36">
          <h2
            className="text-white text-center text-xl sm:text-2xl font-bold  tracking-wider"
          >
            Dirección de operaciones.
          </h2>
        </div>

        {/* Contenedor de Carpetas brutalistas compactas estilo macOS */}
        <div className="flex-1 w-full max-w-5xl mx-auto mt-6 mb-4 flex flex-col md:flex-row gap-8 md:gap-16 items-center justify-center relative z-20 my-auto py-8 md:py-0">
          <MacOsFolder
            title="Empresas"
            label="B2B Systems"
            href="/empresas"
            items={[
              "Arquitectura de Sistemas",
              "Sistema Nexus",
              "Consultoría Estratégica",
              "Desarrollo Web"
            ]}
          />
          <MacOsFolder
            title="Profesionales"
            label="B2C Arsenal"
            href="/arsenal"
            items={[
              "IA Sin Paja",
              "Expertos hiper-especializados",
              "Bóveda operativa"
            ]}
          />
        </div>

      </motion.div>
    </div>
  );
}

// ============================================================================
// HOME PAGE PRINCIPAL
// ============================================================================
export function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isShrunk, setIsShrunk] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsShrunk(true);
      } else {
        setIsShrunk(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!isShrunk) {
      setIsMobileMenuOpen(false);
    }
  }, [isShrunk]);

  return (
    <div className="bg-[#f7f7f7] text-[#000014] min-h-screen relative select-none overflow-x-clip font-sans">

      {/* NAVBAR DE ANCHO COMPLETO QUE SE ENCOGE AL HACER SCROLL (Igual que new.studio) */}
      <header
        className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-full px-6 sm:px-12 transition-all duration-500 ease-out"
        style={{
          maxWidth: isShrunk ? "440px" : "1400px" // Ancho exacto de new.studio contraído
        }}
      >
        <motion.nav
          onClick={(e) => {
            if (isShrunk) {
              const target = e.target as HTMLElement;
              if (target.closest('a')) return;
              setIsMobileMenuOpen(!isMobileMenuOpen);
            }
          }}
          className="relative backdrop-blur-lg bg-[#e3e3e5]/60 ring-2 ring-white/30 w-full origin-center cursor-pointer"
          style={{
            borderRadius: "16px",
            boxShadow: "inset 0 0 60px 0 rgba(255,255,255,0.3), inset 0 0 60px 0 rgba(255,255,255,0.3), 0 4px 20px 0 rgba(0,0,20,0.2)",
          }}
          // Efecto elástico táctil de new.studio (solo si está contraído)
          whileHover={isShrunk ? {
            scale: 1.03,
            transition: { duration: 0.2, ease: "easeOut" }
          } : {}}
          whileTap={isShrunk ? {
            scale: 0.99,
            transition: { duration: 0.15, ease: "easeOut" }
          } : {}}
        >
          <div className="flex h-14 items-center justify-between px-6 sm:px-8">
            <Link href="/">
              <a className="text-[14px] font-semibold  text-black hover:opacity-50 transition-opacity">
                RUBÉN GARCÍA
              </a>
            </Link>

            {/* Links visibles en Desktop (se ocultan suavemente cuando se encoge) */}
            <div
              className={`hidden sm:flex items-center gap-8 text-[12px] font-semibold  text-black ml-auto mr-4 transition-all duration-300 ${isShrunk ? "opacity-0 scale-95 pointer-events-none w-0 overflow-hidden" : "opacity-100 scale-100"
                }`}
            >
              <Link href="/empresas"><a onClick={(e) => e.stopPropagation()} className="hover:opacity-60 transition-opacity">Empresas</a></Link>
              <Link href="/arsenal"><a onClick={(e) => e.stopPropagation()} className="hover:opacity-60 transition-opacity">Profesionales</a></Link>
              <Link href="/contacto"><a onClick={(e) => e.stopPropagation()} className="hover:opacity-60 transition-opacity">Contacto</a></Link>
            </div>

            {/* Hamburger interactivo minimalista de 2 líneas (X animada) */}
            {/* Es visible siempre en móvil, y en desktop se muestra SOLO cuando se encoge la navbar */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`flex flex-col justify-center items-center gap-1.5 w-7 h-7 cursor-pointer focus:outline-none relative transition-all duration-300 ${isShrunk || isMobileMenuOpen ? "opacity-100 scale-100" : "sm:opacity-0 sm:scale-0 pointer-events-none sm:w-0 sm:h-0"
                }`}
            >
              <span className={`bg-[#000014] block h-0.5 w-full transition-all duration-300 ease-in-out ${isMobileMenuOpen ? "translate-y-1 rotate-45" : ""}`} />
              <span className={`bg-[#000014] block h-0.5 w-full transition-all duration-300 ease-in-out ${isMobileMenuOpen ? "-translate-y-1 -rotate-45" : ""}`} />
            </button>
          </div>

          {/* Tarjeta de Menú Desplegable Translúcida Integrada (Estilo new.studio sin saltos de altura) */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden border-t border-[#000014]/5"
              >
                {/* Los paddings verticales y horizontales se aplican únicamente dentro del contenedor animado */}
                <motion.div
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={{
                    hidden: {},
                    visible: {
                      transition: {
                        staggerChildren: 0.05,
                      }
                    }
                  }}
                  className="flex flex-col gap-4 px-8 pt-4 pb-8 text-left"
                >
                  {/* Links en tamaño compacto (text-3xl) estilo new.studio */}
                  <div className="flex flex-col gap-1 mt-1">
                    {[
                      { name: "Empresas", path: "/empresas" },
                      { name: "Profesionales", path: "/arsenal" },
                      { name: "Contacto", path: "/contacto" }
                    ].map((item, idx) => (
                      <motion.div
                        key={idx}
                        variants={{
                          hidden: { opacity: 0, filter: "blur(10px)", y: 15 },
                          visible: {
                            opacity: 1,
                            filter: "blur(0px)",
                            y: 0,
                            transition: {
                              duration: 0.6,
                              ease: [0.16, 1, 0.3, 1]
                            }
                          }
                        }}
                        className="overflow-hidden py-1"
                      >
                        <Link href={item.path}>
                          <a
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="text-black hover:opacity-50 transition-opacity block w-fit text-3xl font-light tracking-tight"
                            style={{
                              letterSpacing: "-0.02em"
                            }}
                          >
                            {item.name}
                          </a>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.nav>
      </header>

      {/* ========================================= */}
      {/* 1. HERO SECTION                           */}
      {/* ========================================= */}
      <section className="h-screen w-full relative overflow-hidden bg-black flex flex-col justify-between">

        {/* Canvas de Fluido Interactivo + Transición de Pintura líquida */}
        <WebGLOriginalFluid />

        {/* Vacío superior */}
        <div></div>

        {/* Copy Centrado con Revelación Palabra por Palabra */}
        <div className="relative z-10 text-center px-5 flex justify-center items-center">
          <SplitWordReveal
            className="text-white select-none pointer-events-none text-center justify-center w-full max-w-6xl mx-auto"
            style={{
              fontSize: "var(--font-size-h1)",
              lineHeight: "var(--font-leading-h1)",
              fontWeight: "bold",
            }}
          >
            {"Optimizando empresas, <br/> construyendo sistemas."}
          </SplitWordReveal>
        </div>

        {/* Subtítulo Inferior */}
        <div className="relative z-10 w-full px-5 pb-12 text-center text-white">
          <p
            className="tracking-wide"
            style={{
              fontSize: "12px",
              fontWeight: 500,
            }}
          >
            Infraestructuras de automatización e Inteligencia Artificial para negocios de servicios que no quieren gastar nóminas en tareas repetitivas.
          </p>
        </div>

      </section>

      {/* ========================================= */}
      {/* 2. SECCIÓN DESCRIPCIÓN (Statement montone)*/}
      {/* ========================================= */}
      <ScrollStatementSection />

      {/* ========================================= */}
      {/* 3. SECCIÓN BIFURCACIÓN (The Black Box Reveal)*/}
      {/* ========================================= */}
      <BifurcacionSection />

    </div>
  );
}
