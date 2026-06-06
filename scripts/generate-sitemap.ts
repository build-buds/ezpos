// Generates public/sitemap.xml from app routes + blog posts.
// Runs before `vite dev` and `vite build` via predev/prebuild hooks.

import { writeFileSync } from "fs";
import { resolve } from "path";
import blogPosts from "../src/data/blog-posts";

const BASE_URL = "https://ezpos.id";
const today = new Date().toISOString().slice(0, 10);

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

// Hanya halaman publik & indexable. Halaman privat/aplikasi diblok via robots.txt + noindex.
const staticEntries: SitemapEntry[] = [
  { path: "/", lastmod: today, changefreq: "weekly", priority: "1.0" },
  { path: "/blog", lastmod: today, changefreq: "weekly", priority: "0.8" },
  { path: "/contact", lastmod: today, changefreq: "monthly", priority: "0.7" },
  { path: "/terms", lastmod: today, changefreq: "yearly", priority: "0.3" },
  { path: "/privacy", lastmod: today, changefreq: "yearly", priority: "0.3" },
];

const blogEntries: SitemapEntry[] = blogPosts.map((p) => ({
  path: `/blog/${p.slug}`,
  lastmod: p.date,
  changefreq: "monthly",
  priority: "0.7",
}));

const entries = [...staticEntries, ...blogEntries];

function generateSitemap(entries: SitemapEntry[]) {
  const urls = entries.map((e) =>
    [
      `  <url>`,
      `    <loc>${BASE_URL}${e.path}</loc>`,
      e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
      e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
      e.priority ? `    <priority>${e.priority}</priority>` : null,
      `  </url>`,
    ]
      .filter(Boolean)
      .join("\n"),
  );
  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...urls,
    `</urlset>`,
  ].join("\n");
}

writeFileSync(resolve("public/sitemap.xml"), generateSitemap(entries));
console.log(`sitemap.xml written (${entries.length} entries)`);
