// Runs at the end of every `vite build` (see vite.config.js).
//
// For every page in src/routes.js it writes dist/<id>.html: the same app, but
// with that page's own <title>, description, canonical address and link
// preview tags, so Google and text/Facebook previews see the right page.
// vercel.json rewrites /<id> to that file. It also writes:
//   dist/404.html     the app with "noindex" (unknown addresses show the
//                     site's own Page Not Found view)
//   dist/sitemap.xml  every public page, for Google
//   dist/robots.txt   points Google at the sitemap, keeps tools out
//
// The build fails if src/routes.js, the PAGES list in src/App.jsx and the
// rewrite in vercel.json ever disagree, so a new page can't be half wired.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { routes, pathFor, fullTitle, isPrivate, isHidden, SITE_ORIGIN, SITE_NAME } from "../src/routes.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function setMeta(html, attr, key, value) {
  const re = new RegExp(`(<meta\\s+${attr}="${key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"\\s+content=")[^"]*(")`);
  if (!re.test(html)) throw new Error(`prerender: index.html has no <meta ${attr}="${key}">`);
  return html.replace(re, `$1${esc(value)}$2`);
}

function pageHtml(base, id, { noindex = false, noAnalytics = false, title, description, url } = {}) {
  const r = routes[id] || {};
  const t = title || fullTitle(id);
  const d = description || r.description;
  const u = url || SITE_ORIGIN + pathFor(id);
  let h = base.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(t)}</title>`);
  h = setMeta(h, "name", "description", d);
  h = setMeta(h, "property", "og:title", t);
  h = setMeta(h, "property", "og:description", d);
  h = setMeta(h, "property", "og:url", u);
  h = setMeta(h, "name", "twitter:title", t);
  h = setMeta(h, "name", "twitter:description", d);
  if (!/<link rel="canonical" href="[^"]*" \/>/.test(h)) throw new Error("prerender: index.html has no canonical link");
  h = h.replace(/<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${esc(u)}" />`);
  if (noindex) h = h.replace("</title>", `</title>\n    <meta name="robots" content="noindex" />`);
  if (noAnalytics) {
    // Coach and admin tools never load Google Analytics.
    const tag = '<script src="/ga.js" data-spa></script>';
    if (!h.includes(tag)) throw new Error("prerender: index.html no longer has the ga.js tag this script removes from private pages");
    h = h.replace(tag, "<!-- no Google Analytics on coach and admin tools -->");
  }
  return h;
}

function checkLists() {
  const app = readFileSync(join(ROOT, "src/App.jsx"), "utf8");
  const block = app.slice(app.indexOf("const PAGES = {") + 15, app.indexOf("};", app.indexOf("const PAGES = {"))).replace(/\/\/.*$/gm, "");
  const pageIds = [...block.matchAll(/(?:^|[\s{,])([a-z][a-z0-9]*)\s*:/g)].map((m) => m[1]);
  const routeIds = Object.keys(routes);
  const missingRoute = pageIds.filter((id) => !routeIds.includes(id));
  const missingPage = routeIds.filter((id) => !pageIds.includes(id));
  const vercel = JSON.parse(readFileSync(join(ROOT, "vercel.json"), "utf8"));
  const rw = (vercel.rewrites || []).find((r) => r.destination === "/:page.html");
  const rwIds = rw ? (rw.source.match(/\(([^)]*)\)/) || [, ""])[1].split("|") : [];
  const missingRewrite = routeIds.filter((id) => id !== "home" && !rwIds.includes(id));
  const extraRewrite = rwIds.filter((id) => !routeIds.includes(id));
  // "/news/" -> "/news" redirect must list the same pages
  const rd = (vercel.redirects || []).find((r) => r.destination === "/:page" && /\/$/.test(r.source));
  const rdIds = rd ? (rd.source.match(/\(([^)]*)\)/) || [, ""])[1].split("|") : [];
  const slashMismatch = rwIds.filter((id) => !rdIds.includes(id)).concat(rdIds.filter((id) => !rwIds.includes(id)));
  const problems = [
    missingRoute.length && `in App.jsx PAGES but not src/routes.js: ${missingRoute.join(", ")}`,
    missingPage.length && `in src/routes.js but not App.jsx PAGES: ${missingPage.join(", ")}`,
    missingRewrite.length && `missing from the vercel.json "/:page.html" rewrite: ${missingRewrite.join(", ")}`,
    extraRewrite.length && `in the vercel.json rewrite but not src/routes.js: ${extraRewrite.join(", ")}`,
    slashMismatch.length && `the vercel.json "/:page(...)/" trailing slash redirect and the rewrite list differ: ${slashMismatch.join(", ")}`,
  ].filter(Boolean);
  // Vercel Web Analytics filter in index.html must skip every private page
  const html = readFileSync(join(ROOT, "index.html"), "utf8");
  const vaLine = (html.match(/window\.va\("beforeSend"[^\n]*/) || [""])[0];
  const notFiltered = routeIds.filter((id) => routes[id].private && !new RegExp(`[(|]${id}[|)]`).test(vaLine));
  if (!vaLine) problems.push('index.html has no window.va("beforeSend") filter for Vercel Web Analytics');
  if (notFiltered.length) problems.push(`private pages missing from the Vercel analytics filter in index.html: ${notFiltered.join(", ")}`);
  if (problems.length) throw new Error("prerender: page lists disagree\n  " + problems.join("\n  "));
}

export function prerender(distDir = join(ROOT, "dist")) {
  checkLists();
  const base = readFileSync(join(distDir, "index.html"), "utf8");
  let n = 0;
  for (const id of Object.keys(routes)) {
    if (id === "home") continue;
    const out = join(distDir, `${id}.html`);
    if (existsSync(join(ROOT, "public", `${id}.html`))) throw new Error(`prerender: public/${id}.html already exists and would be overwritten`);
    writeFileSync(out, pageHtml(base, id, { noindex: isPrivate(id) || isHidden(id), noAnalytics: isPrivate(id) }));
    n++;
  }
  writeFileSync(join(distDir, "index.html"), pageHtml(base, "home"));
  writeFileSync(join(distDir, "404.html"), pageHtml(base, "home", { noindex: true, title: `Page Not Found | ${SITE_NAME}`, url: SITE_ORIGIN + "/" }));

  const today = new Date().toISOString().slice(0, 10);
  const pub = Object.keys(routes).filter((id) => !isPrivate(id) && !isHidden(id));
  writeFileSync(join(distDir, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    pub.map((id) => `  <url><loc>${SITE_ORIGIN}${pathFor(id)}</loc><lastmod>${today}</lastmod></url>`).join("\n") +
    `\n</urlset>\n`);
  const priv = Object.keys(routes).filter((id) => isPrivate(id)); // hidden pages stay crawlable so Google can read their noindex
  writeFileSync(join(distDir, "robots.txt"),
    ["User-agent: *", "Allow: /api/scores", "Disallow: /api/", "Disallow: /admin.html", "Disallow: /playbook", "Disallow: /checkin.html",
      ...priv.map((id) => `Disallow: ${pathFor(id)}`), "", `Sitemap: ${SITE_ORIGIN}/sitemap.xml`, ""].join("\n"));
  return { pages: n, sitemap: pub.length };
}

if (process.argv[1] && process.argv[1].endsWith("prerender.mjs")) {
  const r = prerender();
  console.log(`prerender: ${r.pages} page files, ${r.sitemap} sitemap entries`);
}
