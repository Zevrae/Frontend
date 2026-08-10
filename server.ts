// Dev/production host for the SPA only. All API logic lives in Backend-main —
// this used to also run a second, duplicate Express+SQLite+Mongoose API
// (products, orders, uploads, Razorpay) that competed with it; that's been
// removed in favor of a single backend as the source of truth.
//
// The frontend talks to the real API directly via VITE_API_URL (see
// src/api/api.ts), so no proxy is required here.
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import https from "https";
import http from "http";
import dotenv from "dotenv";

dotenv.config();

// ── Local development API proxy ───────────────────────────────────────────────
// Forwards /api/* → https://api.zevrae.com/api/* server-side so the browser
// never makes a cross-origin request (no CORS errors on localhost).
const BACKEND_HOST = "api.zevrae.com";

function apiProxy(
  req: express.Request,
  res: express.Response
) {
  const targetPath = "/api" + req.url;

  // Build headers, replacing host with the backend host
  const headers: Record<string, string | string[]> = {};
  for (const [k, v] of Object.entries(req.headers)) {
    if (v !== undefined) headers[k] = v as string | string[];
  }
  headers["host"] = BACKEND_HOST;

  const options: https.RequestOptions = {
    hostname: BACKEND_HOST,
    path: targetPath,
    method: req.method,
    headers,
  };

  const proxyReq = https.request(options, (proxyRes) => {
    // Forward status + all response headers
    res.writeHead(proxyRes.statusCode!, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });

  proxyReq.on("error", (err) => {
    console.error("[proxy error]", err.message);
    if (!res.headersSent) res.status(502).json({ error: "Proxy error", detail: err.message });
  });

  // For requests that have a body (POST, PUT, PATCH), pipe it through
  if (req.method !== "GET" && req.method !== "HEAD" && req.method !== "DELETE") {
    req.pipe(proxyReq, { end: true });
  } else {
    proxyReq.end();
  }
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // ── Security headers ──────────────────────────────────────────────────
  // same-origin-allow-popups keeps this page isolated from other origins
  // while still allowing window.open()'d popups (e.g. the Google Identity
  // Services sign-in popup) to communicate back via postMessage.
  app.use((req, res, next) => {
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
    next();
  });

  // ── Dev: proxy /api/* before Vite middleware ──
  if (process.env.NODE_ENV !== "production") {
    app.use("/api", (req, res) => {
      // Rewrite req.url so the proxy sees the path relative to /api
      // e.g. /api/products → req.url = "/products"
      apiProxy(req, res);
    });
  }

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Frontend server running on http://localhost:${PORT}`);
  });
}

startServer();