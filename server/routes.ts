import type { Express } from "express";
import { type Server } from "http";

export async function registerRoutes(
  httpServer: Server,
  _app: Express
): Promise<Server> {
  // No hay rutas personalizadas de Express. Todo el enrutamiento es frontend (Wouter).
  return httpServer;
}
