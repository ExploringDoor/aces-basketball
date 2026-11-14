/* Aces site menu bar for the standalone pages (Shoot-a-Thon, Team Playbook,
   Attitude Board). Same look and same menu as the main site's top bar in
   src/App.jsx. Keep NAV below in step with NAV there.

   Usage: <script src="/aces-nav.js" defer></script>
   The bar sits in the page flow (not fixed), so each page's own sticky
   header still sticks to the top once the bar scrolls away.
   Skipped when the page runs as an installed home screen app. */
(function () {
  if (window.__acesNav) return;
  window.__acesNav = true;
  try {
    if (window.matchMedia("(display-mode: standalone)").matches || navigator.standalone) return;
  } catch (e) {}

  var NAV = [
    { id: "home", label: "Home" },
    { id: "news", label: "News" },
    { id: "clinics", label: "Clinics" },
    { label: "Season", children: [
      { id: "roster", label: "Roster" },
      { id: "schedule", label: "Schedule" },
      { id: "standings", label: "Standings" },
      { id: "records", label: "Record Book" },
      { id: "story", label: "Story of the Season" }
    ] },
    { label: "History", children: [
      { id: "history", label: "Program History" },
      { id: "championships", label: "Championships" },
      { id: "banners", label: "The Rafters" },
      { id: "seasons", label: "Every Season" },
      { id: "rivalry", label: "Aces vs. Chester" },
      { id: "headtohead", label: "Head to Head" },
      { id: "league", label: "Central League" }
    ] },
    { label: "People", children: [
      { id: "thousand", label: "1,000 Club" },
      { id: "alumni", label: "Alumni" },
      { id: "nextlevel", label: "Next Level" },
      { id: "coaching", label: "Coaching Staff" },
      { id: "hof", label: "Hall of Fame" }
    ] },
    { label: "More", children: [
      { id: "kobe", label: "Kobe" },
      { id: "photos", label: "Photos" },
      { id: "videos", label: "Videos" },
      { id: "social", label: "Follow Us" },
      { id: "shootathon", label: "Shoot-a-Thon" },
      { id: "playbook", label: "Team Playbook" },
      { id: "attitude", label: "Attitude Board" },
      { id: "support", label: "Support the Aces" },
      { id: "sponsors", label: "Sponsors" },
      { id: "store", label: "Team Store", badge: "Soon" }
    ] }
  ];
  var EXTERNAL = { shootathon: "/donate.html", playbook: "/playbook.html", attitude: "/attitude/" };
  function href(id) { return EXTERNAL[id] || (id === "home" ? "/" : "/#" + id); }

  var p = location.pathname;
  var active = /^\/attitude/.test(p) ? "attitude"
    : /^\/playbook/.test(p) ? "playbook"
    : /^\/(donate|shootathon)/.test(p) ? "shootathon" : "";

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  if (!document.querySelector('link[href*="family=Oswald"]')) {
    var f = document.createElement("link");
    f.rel = "stylesheet";
    f.href = "https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&display=swap";
    document.head.appendChild(f);
  }

  var css = [
    ".acesnav{position:relative;z-index:2000;display:flex;align-items:center;height:82px;padding:0 40px;background:#080004;border-bottom:1px solid rgba(132,0,54,.4);box-shadow:0 4px 40px rgba(0,0,0,.5);font-family:'Oswald',sans-serif;-webkit-user-select:none;user-select:none;box-sizing:border-box}",
    ".acesnav *{box-sizing:border-box;margin:0}",
    ".acesnav a{text-decoration:none}",
    ".acesnav .an-brand{display:flex;align-items:center;gap:10px;margin-right:32px;flex-shrink:0}",
    ".acesnav .an-brand img{height:70px;width:auto;filter:drop-shadow(0 0 6px rgba(132,0,54,.6))}",
    ".acesnav .an-t1{font-size:20px;font-weight:700;letter-spacing:5px;color:#fff;line-height:1}",
    ".acesnav .an-t2{font-family:'Source Sans 3',system-ui,sans-serif;font-size:10px;letter-spacing:3px;color:rgba(255,255,255,.35);text-transform:uppercase;margin-top:3px}",
    ".acesnav .an-links{display:flex;align-items:center;height:100%}",
    ".acesnav .an-item{position:relative;height:100%}",
    ".acesnav .an-tab{position:relative;display:flex;align-items:center;gap:6px;height:100%;padding:0 24px;background:none;border:0;color:rgba(255,255,255,.32);font-family:'Oswald',sans-serif;font-size:12px;letter-spacing:2px;text-transform:uppercase;cursor:pointer;transition:color .25s;overflow:hidden}",
    ".acesnav .an-tab:hover,.acesnav .an-item.open>.an-tab{color:rgba(255,255,255,.85)}",
    ".acesnav .an-tab.on{color:#c9a44a;letter-spacing:2.8px;text-shadow:0 0 18px rgba(201,164,74,.7)}",
    ".acesnav .an-tab.on::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at 50% 50%,rgba(200,0,60,.8) 0%,rgba(132,0,54,.5) 40%,transparent 70%);z-index:-1}",
    ".acesnav .an-tab.on::after{content:'';position:absolute;left:12%;right:12%;bottom:-1px;height:3px;border-radius:3px 3px 0 0;background:linear-gradient(90deg,transparent,#c9a44a,transparent);box-shadow:0 0 10px rgba(201,164,74,1),0 0 25px rgba(201,164,74,.8)}",
    ".acesnav .an-car{font-size:7px;opacity:.5;transition:transform .3s}",
    ".acesnav .an-item.open .an-car{transform:rotate(180deg);opacity:1}",
    ".acesnav .an-drop{display:none;position:absolute;top:100%;left:50%;transform:translateX(-50%);padding-top:6px;min-width:190px}",
    ".acesnav .an-item.open .an-drop{display:block}",
    ".acesnav .an-panel{background:rgba(8,0,4,.97);border:1px solid rgba(132,0,54,.5);border-radius:10px;padding:8px 0;box-shadow:0 16px 50px rgba(0,0,0,.7),0 0 30px rgba(132,0,54,.15)}",
    ".acesnav .an-panel a{display:flex;align-items:center;gap:8px;padding:10px 20px;color:rgba(255,255,255,.6);font-size:12px;letter-spacing:1.5px;text-transform:uppercase;white-space:nowrap;transition:all .18s}",
    ".acesnav .an-panel a:hover{color:#c9a44a;padding-left:26px;background:rgba(132,0,54,.2)}",
    ".acesnav .an-panel a.on{color:#c9a44a}",
    ".acesnav .an-badge{font-size:8px;letter-spacing:1px;padding:2px 6px;border-radius:10px;background:rgba(201,164,74,.18);border:1px solid rgba(201,164,74,.4);color:#c9a44a}",
    ".acesnav .an-burger{display:none;margin-left:auto;background:none;border:0;color:#fff;font-size:26px;line-height:1;padding:8px 4px;cursor:pointer}",
    ".acesnav .an-mob{display:none;position:absolute;top:100%;left:0;right:0;background:rgba(8,0,4,.98);border-bottom:1px solid rgba(132,0,54,.3);padding:8px 0;max-height:80vh;overflow-y:auto}",
    ".acesnav.mopen .an-mob{display:block}",
    ".acesnav .an-mob .an-h{padding:10px 5% 4px;font-size:10px;letter-spacing:3px;color:#c9a44a;text-transform:uppercase}",
    ".acesnav .an-mob a{display:block;padding:12px 8%;color:rgba(255,255,255,.65);font-size:14px;letter-spacing:2px;text-transform:uppercase}",
    ".acesnav .an-mob a.top{padding:13px 5%;color:rgba(255,255,255,.7)}",
    ".acesnav .an-mob a.on{color:#c9a44a;background:rgba(132,0,54,.2)}",
    "@media (max-width:768px){.acesnav{height:68px;padding:0 16px}.acesnav .an-brand img{height:54px}.acesnav .an-links{display:none}.acesnav .an-burger{display:block}}",
    "@media print{.acesnav{display:none}}"
  ].join("\n");

  var st = document.createElement("style");
  st.textContent = css;
  document.head.appendChild(st);

  var desk = NAV.map(function (it, i) {
    if (!it.children) {
      return '<div class="an-item"><a class="an-tab' + (it.id === active ? " on" : "") + '" href="' + href(it.id) + '">' + esc(it.label) + "</a></div>";
    }
    var on = it.children.some(function (c) { return c.id === active; });
    return '<div class="an-item" data-i="' + i + '"><button type="button" class="an-tab' + (on ? " on" : "") + '" aria-haspopup="true" aria-expanded="false">' +
      esc(it.label) + ' <span class="an-car">&#9660;</span></button><div class="an-drop"><div class="an-panel">' +
      it.children.map(function (c) {
        return '<a href="' + href(c.id) + '"' + (c.id === active ? ' class="on"' : "") + ">" + esc(c.label) +
          (c.badge ? ' <span class="an-badge">' + esc(c.badge) + "</span>" : "") + "</a>";
      }).join("") + "</div></div></div>";
  }).join("");

  var mob = NAV.map(function (it) {
    if (!it.children) return '<a class="top' + (it.id === active ? " on" : "") + '" href="' + href(it.id) + '">' + esc(it.label) + "</a>";
    return '<div class="an-h">' + esc(it.label) + "</div>" + it.children.map(function (c) {
      return '<a href="' + href(c.id) + '"' + (c.id === active ? ' class="on"' : "") + ">" + esc(c.label) + "</a>";
    }).join("");
  }).join("");

  var bar = document.createElement("nav");
  bar.className = "acesnav";
  bar.setAttribute("aria-label", "Aces site");
  bar.innerHTML =
    '<a class="an-brand" href="/"><img src="/LM_Logo.png" alt="Lower Merion Aces"><div><div class="an-t1">ACES</div><div class="an-t2">Lower Merion</div></div></a>' +
    '<div class="an-links">' + desk + "</div>" +
    '<button type="button" class="an-burger" aria-label="Menu" aria-expanded="false">&#9776;</button>' +
    '<div class="an-mob">' + mob + "</div>";

  function closeAll(except) {
    bar.querySelectorAll(".an-item.open").forEach(function (el) {
      if (el !== except) { el.classList.remove("open"); el.firstChild.setAttribute("aria-expanded", "false"); }
    });
  }
  bar.querySelectorAll(".an-item[data-i]").forEach(function (el) {
    var btn = el.firstChild;
    el.addEventListener("mouseenter", function () { if (matchMedia("(hover:hover)").matches) { closeAll(el); el.classList.add("open"); } });
    el.addEventListener("mouseleave", function () { if (matchMedia("(hover:hover)").matches) el.classList.remove("open"); });
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      var open = !el.classList.contains("open");
      closeAll(el);
      el.classList.toggle("open", open);
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  });
  var burger = bar.querySelector(".an-burger");
  burger.addEventListener("click", function (e) {
    e.stopPropagation();
    var open = !bar.classList.contains("mopen");
    bar.classList.toggle("mopen", open);
    burger.innerHTML = open ? "&#10005;" : "&#9776;";
    burger.setAttribute("aria-expanded", open ? "true" : "false");
  });
  document.addEventListener("click", function (e) {
    if (bar.contains(e.target)) return;
    closeAll(null);
    if (bar.classList.contains("mopen")) { bar.classList.remove("mopen"); burger.innerHTML = "&#9776;"; }
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") { closeAll(null); bar.classList.remove("mopen"); burger.innerHTML = "&#9776;"; } });

  function mount() { document.body.insertBefore(bar, document.body.firstChild); }
  if (document.body) mount(); else document.addEventListener("DOMContentLoaded", mount);
})();
