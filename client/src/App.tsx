import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ReactLenis } from "lenis/react";

// Importación de Páginas
import { Home } from "@/pages/Home";
import { EmpresasLanding } from "@/pages/empresas/Landing";
import { Automatizacion } from "@/pages/empresas/Automatizacion";
import { Consultoria } from "@/pages/empresas/Consultoria";
import { DisenoWeb } from "@/pages/empresas/DisenoWeb";
import { Nexus } from "@/pages/empresas/Nexus";
import { NexusIndustrial } from "@/pages/empresas/NexusIndustrial";
import { ArsenalHub } from "@/pages/arsenal/Hub";
import { IASinPaja } from "@/pages/arsenal/IASinPaja";
import { Expertos } from "@/pages/arsenal/Expertos";
import { Prompts } from "@/pages/arsenal/Prompts";
import { ConfirmacionMiniCurso } from "@/pages/arsenal/ConfirmacionMiniCurso";
import { Success } from "@/pages/Success";
import { Contacto } from "@/pages/Contacto";
import { NotFound } from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      {/* Home / Bifurcación */}
      <Route path="/" component={Home} />

      {/* Universo B2B (Empresas) */}
      <Route path="/empresas" component={EmpresasLanding} />
      <Route path="/empresas/automatizacion" component={Automatizacion} />
      <Route path="/empresas/consultoria" component={Consultoria} />
      <Route path="/empresas/sistema-nexus" component={Nexus} />
      <Route path="/empresas/sistema-nexus-industrial" component={NexusIndustrial} />
      <Route path="/empresas/diseno-web" component={DisenoWeb} />

      {/* Universo B2C (Profesionales) */}
      <Route path="/arsenal" component={ArsenalHub} />
      <Route path="/arsenal/iasinpaja" component={IASinPaja} />
      <Route path="/arsenal/expertos" component={Expertos} />
      <Route path="/arsenal/prompts" component={Prompts} />

      {/* Utilidades y Páginas de Éxito */}
      <Route path="/confirmacionminicurso" component={ConfirmacionMiniCurso} />
      <Route path="/success" component={Success} />
      <Route path="/contacto" component={Contacto} />

      {/* 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ReactLenis root>
          <Toaster />
          <Router />
        </ReactLenis>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
