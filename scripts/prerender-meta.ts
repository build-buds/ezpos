/**
 * Lightweight "shallow prerender" Vite plugin.
 *
 * For each public route listed below, we copy the built dist/index.html into
 * dist/<route>/index.html and inject route-specific <title>, meta description,
 * canonical, Open Graph, Twitter, and JSON-LD tags into the <head> BEFORE the
 * SPA bundle hydrates.
 *
 * Why not full prerender (Puppeteer / react-snap)?
 *   - Lovable build environment does not guarantee a Chromium binary, and
 *     spinning up a headless browser at build time is slow and fragile.
 *   - Non-JS crawlers (Bing, Twitter/X, WhatsApp, Facebook, LinkedIn) only
 *     need the <head> to be correct for previews and indexing. Modern Google
 *     already executes JS, so the React-rendered body is fine for it.
 *
 * Result: every listed route now serves an HTML file with crawler-correct
 * <head>. Hydration on the client still produces the full interactive SPA.
 */
import type { Plugin } from "vite";
import path from "path";
import fs from "fs";

const SITE_URL = "https://ezpos.id";
const DEFAULT_OG_IMAGE =
  "https://storage.googleapis.com/gpt-engineer-file-uploads/yCTCfbWlevZfUMv1O5L6RempRfG3/social-images/social-1775914779630-Tamnel0.webp";

interface RouteMeta {
  path: string; // url path, e.g. "/contact"
  title: string;
  description: string;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

const ROUTES: RouteMeta[] = [
  {
    path: "/",
    title:
      "EZPOS — Kasir Restoran, QR Ordering & Manajemen F&B #1 di Indonesia",
    description:
      "EZPOS: Solusi lengkap kasir POS, QR ordering, kiosk self-service, dan manajemen antrian untuk restoran, kafe, dan warung makan di Indonesia.",
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "EZPOS",
        url: `${SITE_URL}/`,
        logo: `${SITE_URL}/icon-192.png`,
        description:
          "Platform kasir POS, QR ordering, kiosk self-service, dan manajemen antrian untuk bisnis F&B di Indonesia.",
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer support",
          email: "halo@ezpos.id",
          areaServed: "ID",
          availableLanguage: ["Indonesian", "English"],
        },
      },
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "EZPOS",
        url: `${SITE_URL}/`,
        inLanguage: "id-ID",
      },
    ],
  },
  {
    path: "/contact",
    title: "Hubungi Kami — EZPOS | Konsultasi Kasir POS & F&B",
    description:
      "Hubungi tim EZPOS untuk demo, konsultasi gratis, atau dukungan terkait kasir POS, QR ordering, dan solusi manajemen F&B di Indonesia.",
  },
  {
    path: "/terms",
    title: "Syarat & Ketentuan — EZPOS",
    description:
      "Baca syarat dan ketentuan penggunaan layanan EZPOS, aplikasi kasir POS dan manajemen F&B untuk usaha di Indonesia.",
  },
  {
    path: "/privacy",
    title: "Kebijakan Privasi — EZPOS",
    description:
      "Pelajari bagaimana EZPOS mengumpulkan, menggunakan, dan melindungi data pribadi serta data bisnis Anda sesuai standar privasi yang berlaku.",
  },
];

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const buildHead = (route: RouteMeta) => {
  const url = `${SITE_URL}${route.path}`;
  const tags = [
    `<title>${escapeHtml(route.title)}</title>`,
    `<meta name="description" content="${escapeHtml(route.description)}">`,
    `<link rel="canonical" href="${url}">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:title" content="${escapeHtml(route.title)}">`,
    `<meta property="og:description" content="${escapeHtml(route.description)}">`,
    `<meta property="og:url" content="${url}">`,
    `<meta property="og:image" content="${DEFAULT_OG_IMAGE}">`,
    `<meta property="og:site_name" content="EZPOS">`,
    `<meta property="og:locale" content="id_ID">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${escapeHtml(route.title)}">`,
    `<meta name="twitter:description" content="${escapeHtml(route.description)}">`,
    `<meta name="twitter:image" content="${DEFAULT_OG_IMAGE}">`,
  ];
  if (route.jsonLd) {
    tags.push(
      `<script type="application/ld+json">${JSON.stringify(route.jsonLd)}</script>`
    );
  }
  return tags.join("\n    ");
};

/**
 * Strip the existing default tags that we plan to override
 * so we don't end up with duplicates after injection.
 */
const stripDuplicates = (html: string) =>
  html
    .replace(/<title>[\s\S]*?<\/title>/i, "")
    .replace(/<meta\s+name="description"[^>]*>/gi, "")
    .replace(/<link\s+rel="canonical"[^>]*>/gi, "")
    .replace(/<meta\s+property="og:(?:type|title|description|url|image|site_name|locale)"[^>]*>/gi, "")
    .replace(/<meta\s+name="twitter:(?:card|title|description|image)"[^>]*>/gi, "");

export default function prerenderMeta(): Plugin {
  return {
    name: "ezpos-prerender-meta",
    apply: "build",
    closeBundle() {
      const distDir = path.resolve(process.cwd(), "dist");
      const indexPath = path.join(distDir, "index.html");
      if (!fs.existsSync(indexPath)) return;
      const baseHtml = fs.readFileSync(indexPath, "utf-8");

      for (const route of ROUTES) {
        const cleaned = stripDuplicates(baseHtml);
        const injected = cleaned.replace(
          /<\/head>/i,
          `    ${buildHead(route)}\n  </head>`
        );

        if (route.path === "/") {
          // overwrite root index.html with enriched <head>
          fs.writeFileSync(indexPath, injected, "utf-8");
          // eslint-disable-next-line no-console
          console.log("[prerender-meta] / -> dist/index.html");
          continue;
        }

        const targetDir = path.join(distDir, route.path.replace(/^\//, ""));
        fs.mkdirSync(targetDir, { recursive: true });
        const targetFile = path.join(targetDir, "index.html");
        fs.writeFileSync(targetFile, injected, "utf-8");
        // eslint-disable-next-line no-console
        console.log(
          `[prerender-meta] ${route.path} -> dist${route.path}/index.html`
        );
      }
    },
  };
}