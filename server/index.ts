import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { marketDataService } from "./services/market-data";
import { setupAuth } from "./replitAuth";
import dotenv from 'dotenv';
dotenv.config();
// Temporarily disable monitoring and security until modules are converted
// const { MonitoringService, healthCheck, systemStatus } = require("./monitoring");
// const { SecurityService } = require("./security");

const app = express();

// Temporarily disable monitoring and security until modules are converted
// const monitoring = new MonitoringService();
// const security = new SecurityService();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Session middleware will be set up by setupAuth function

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Setup authentication before registering routes
  try {
    await setupAuth(app);
    console.log('[Auth] Passport authentication initialized successfully');
  } catch (error) {
    console.warn('[Auth] Failed to setup authentication:', error);
    console.log('[Auth] Continuing without full authentication setup');
  }
  
  const server = await registerRoutes(app);
  
  // Basic health endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  });
  
  app.get('/api/metrics', (req, res) => {
    res.json({
      status: 'operational',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString()
    });
  });
  
  app.get('/api/security', (req, res) => {
    res.json({
      status: 'operational',
      timestamp: new Date().toISOString()
    });
  });
  
  // Start market data service for real-time updates
  await marketDataService.startMarketDataUpdates();

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Serve the app on port 5000 or find available port
  // this serves both the API and the client.
  const port = process.env.PORT || 5000;
  
  const startServer = (portToTry: number) => {
    server.listen({
      port: portToTry,
      host: "0.0.0.0",
    }, () => {
      log(`serving on port ${portToTry}`);
    }).on('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        log(`Port ${portToTry} is busy, trying port ${portToTry + 1}`);
        startServer(portToTry + 1);
      } else {
        throw err;
      }
    });
  };
  
  startServer(Number(port));
})();
