import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const csp = [
  "default-src 'self'",
  "script-src 'self' 'sha256-Z2/iFzh9VMlVkEOar1f/oSHWwQk3ve1qk/C2WdsC4Xk=' https://pagead2.googlesyndication.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://armsx2.net https://github.com https://avatars.githubusercontent.com https://*.githubusercontent.com https://*.googlesyndication.com https://*.doubleclick.net https://*.google.com",
  "font-src 'self' data:",
  "connect-src 'self' https://api.armsx2.net https://armsx2.net https://api.github.com https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net http://localhost:* http://127.0.0.1:* ws://localhost:* ws://127.0.0.1:*",
  "object-src 'none'",
  "base-uri 'self'",
  "frame-src https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://www.google.com",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "manifest-src 'self'"
].join("; ");

const securityHeaders = {
  "Content-Security-Policy": csp,
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()"
};

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    allowedHosts: [],
    headers: securityHeaders,
  },
  preview: {
    headers: securityHeaders,
  },
});
