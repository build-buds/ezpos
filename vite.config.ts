import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";
import vitePrerender from "vite-plugin-prerender";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: "autoUpdate",
      devOptions: { enabled: false },
      workbox: {
        navigateFallbackDenylist: [/^\/~oauth/],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts",
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
        offlineGoogleAnalytics: false,
      },
      manifest: false,
    }),
    // Prerender public routes to static HTML so non-JS crawlers
    // (Bing, WhatsApp, Twitter/X, Facebook, LinkedIn) can read the
    // full <head> (title, meta, JSON-LD) and the visible content.
    // Runs only at production build time. SPA routing still works
    // afterwards because the bundled JS hydrates the page.
    mode !== "development" &&
      vitePrerender({
        staticDir: path.resolve(__dirname, "dist"),
        routes: ["/", "/contact", "/terms", "/privacy"],
        renderer: new vitePrerender.PuppeteerRenderer({
          renderAfterTime: 1500,
          headless: true,
          args: ["--no-sandbox", "--disable-setuid-sandbox"],
        }),
      }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
}));
