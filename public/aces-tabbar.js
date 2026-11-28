/* Aces bottom app bar for the whole site (Adam, 11/28: "I want it on the entire aces hoops website",
   the home screen app opens to the main site). Home, Schedule, Roster, Stats (the Attitude Board),
   More. Same look as the bar the Attitude Board draws for itself (that page skips this script).
   Shown on phones and iPads, and always in the home screen app; a big desktop browser already has
   the menu across the top. Loaded by index.html (the main site) and by aces-nav.js (the standalone
   pages: Shoot-a-Thon, Team Playbook). Inside the main site the links are plain links: the app's own
   click handler turns them into page changes without a reload. */
(function () {
  if (window.__acesTabbar) return;
  window.__acesTabbar = true;
  if (/^\/attitude(\/|$)/.test(location.pathname)) return;   // the board draws its own bar

  var ic = function (d) { return '<svg viewBox="0 0 24 24" aria-hidden="true">' + d + "</svg>"; };
  var I = {
    home: ic('<path d="M3 11 12 4l9 7"/><path d="M5 10v10h5v-6h4v6h5V10"/>'),
    schedule: ic('<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>'),
    roster: ic('<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="9" r="2.6"/><path d="M16 14.2c2.8.3 5 2.6 5 5.8"/>'),
    stats: ic('<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>'),
    more: ic('<circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/>')
  };
  var ITEMS = [["home", "/", "Home"], ["schedule", "/schedule", "Schedule"], ["roster", "/roster", "Roster"], ["stats", "/attitude/", "Stats"]];
  var MORE = [["News", "/news"], ["Standings", "/standings"], ["Record Book", "/records"], ["Story of the Season", "/story"],
    ["Program History", "/history"], ["Championships", "/championships"], ["Every Season", "/seasons"], ["Coaching Staff", "/coaching"],
    ["Alumni", "/alumni"], ["1,000 Club", "/thousand"], ["Kobe", "/kobe"], ["Photos", "/photos"], ["Videos", "/videos"],
    ["Clinics", "/clinics"], ["Shoot-a-Thon", "/donate.html"], ["Team Playbook", "/playbook.html"], ["Support the Aces", "/support"], ["Sponsors", "/sponsors"]];

  var standalone = false;
  try { standalone = window.matchMedia("(display-mode: standalone)").matches || !!navigator.standalone; } catch (e) {}

  var css = [
    "html.aces-tb{background:#080004}",                                   /* any space the screen leaves below the bar is the bar's color */
    "html.aces-tb body{min-height:100vh;padding-bottom:calc(70px + env(safe-area-inset-bottom,0px)) !important}",
    ".aces-tb-bar{position:fixed;left:0;right:0;bottom:0;z-index:950;display:flex;justify-content:space-around;align-items:stretch;background:#080004;border-top:1px solid rgba(132,0,54,.55);box-shadow:0 -6px 24px rgba(0,0,0,.35);padding:6px 4px calc(6px + env(safe-area-inset-bottom,0px))}",
    ".aces-tb-bar::after{content:'';position:absolute;left:0;right:0;top:100%;height:120px;background:#080004}",
    ".aces-tb-bar a,.aces-tb-bar button{flex:1;min-width:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;padding:6px 0;min-height:52px;color:rgba(255,255,255,.6);text-decoration:none;background:none;border:0;cursor:pointer;font-family:'Oswald',system-ui,sans-serif;font-weight:600;font-size:11px;line-height:1;letter-spacing:.12em;text-transform:uppercase}",
    ".aces-tb-bar svg{width:26px;height:26px;fill:none;stroke:currentColor;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}",
    ".aces-tb-bar .on{color:#c9a44a}",
    ".aces-tb-sheet{position:fixed;inset:0;z-index:2100;background:rgba(8,0,4,.98);overflow-y:auto;padding:calc(16px + env(safe-area-inset-top,0px)) 16px calc(90px + env(safe-area-inset-bottom,0px))}",
    ".aces-tb-sheet[hidden]{display:none}",
    ".aces-tb-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;font-family:'Oswald',system-ui,sans-serif;font-weight:700;font-size:22px;letter-spacing:.2em;color:#fff}",
    ".aces-tb-x{background:#1B1016;border:1px solid rgba(132,0,54,.5);color:#fff;border-radius:12px;width:48px;height:48px;font-size:26px;line-height:1;cursor:pointer}",
    ".aces-tb-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:8px}",
    ".aces-tb-grid a{display:block;padding:16px;border-radius:12px;background:#160A10;border:1px solid rgba(132,0,54,.35);color:#fff;text-decoration:none;font-family:'Oswald',system-ui,sans-serif;font-weight:600;font-size:17px;letter-spacing:.06em;text-transform:uppercase}",
    "@media (min-width:1100px){html.aces-tb:not(.aces-tb-app) .aces-tb-bar{display:none}html.aces-tb:not(.aces-tb-app) body{padding-bottom:0 !important}}",
    "@media print{.aces-tb-bar,.aces-tb-sheet{display:none !important}}"
  ].join("\n");

  function activeId() {
    var p = location.pathname.replace(/\/+$/, "") || "/";
    if (p === "/") return "home";
    if (/^\/schedule/.test(p)) return "schedule";
    if (/^\/roster/.test(p)) return "roster";
    return "";
  }

  function mount() {
    if (document.querySelector(".aces-tb-bar")) return;
    var st = document.createElement("style");
    st.textContent = css;
    document.head.appendChild(st);
    document.documentElement.classList.add("aces-tb");
    if (standalone) document.documentElement.classList.add("aces-tb-app");

    var bar = document.createElement("nav");
    bar.className = "aces-tb-bar";
    bar.setAttribute("aria-label", "Aces");
    bar.innerHTML = ITEMS.map(function (it) { return '<a href="' + it[1] + '" data-tb="' + it[0] + '">' + I[it[0]] + "<span>" + it[2] + "</span></a>"; }).join("") +
      '<button type="button" data-tb="more">' + I.more + "<span>More</span></button>";
    document.body.appendChild(bar);

    var sheet = document.createElement("div");
    sheet.className = "aces-tb-sheet";
    sheet.hidden = true;
    sheet.innerHTML = '<div class="aces-tb-top">ACES<button type="button" class="aces-tb-x" aria-label="Close">&times;</button></div>' +
      '<div class="aces-tb-grid">' + MORE.map(function (m) { return '<a href="' + m[1] + '">' + m[0] + "</a>"; }).join("") + "</div>";
    document.body.appendChild(sheet);

    function mark() {
      var cur = activeId();
      bar.querySelectorAll("[data-tb]").forEach(function (a) {
        var on = a.getAttribute("data-tb") === cur;
        a.classList.toggle("on", on);
        if (on) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
      });
    }
    mark();
    bar.querySelector('[data-tb="more"]').addEventListener("click", function () { sheet.hidden = false; });
    sheet.querySelector(".aces-tb-x").addEventListener("click", function () { sheet.hidden = true; });
    sheet.addEventListener("click", function (e) { if (e.target.closest && e.target.closest("a")) sheet.hidden = true; });
    bar.addEventListener("click", function (e) { if (e.target.closest && e.target.closest("a")) setTimeout(mark, 0); });
    // the main site changes pages without reloading: keep the lit tab in step
    window.addEventListener("popstate", function () { setTimeout(mark, 0); });
    ["pushState", "replaceState"].forEach(function (k) {
      var orig = history[k];
      if (typeof orig !== "function") return;
      history[k] = function () { var r = orig.apply(this, arguments); setTimeout(mark, 0); return r; };
    });
  }
  if (document.body) mount(); else document.addEventListener("DOMContentLoaded", mount);
})();
