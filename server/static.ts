import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export function serveStatic(app: Express) {
  // Serve static files from the built frontend
  const distPath = path.resolve(import.meta.dirname, "..", "dist", "public");

  if (!fs.existsSync(distPath)) {
    log(`Warning: Build directory not found at ${distPath}. Make sure to build the frontend first with 'npm run build:client'`);
    log(`Serving API only. Frontend will not be available.`);
    return;
  }

  log(`Serving static files from: ${distPath}`);
  
  // Serve static files
  app.use(express.static(distPath));

  // Handle client-side routing - fall through to index.html for any non-API route
  app.use("*", (req, res) => {
    // Don't interfere with API routes
    if (req.path.startsWith("/api")) {
      return res.status(404).json({ message: "API endpoint not found" });
    }
    
    // Serve index.html for all other routes (client-side routing)
    const indexPath = path.resolve(distPath, "index.html");
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).send("Frontend not built. Run 'npm run build:client' first.");
    }
  });
} 