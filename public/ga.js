/* Google Analytics 4 for aceshoops.com.
 *
 * The Measurement ID below sends data to Google Analytics. Set it to "" to
 * turn Analytics off. The ID is not a secret; it is visible in every
 * page's source once Analytics is on.
 *
 * Privacy, on purpose:
 *  - Only the page address is sent, never the part after "?" or "#", so codes,
 *    receipt numbers and unsubscribe links in a URL never reach Google.
 *  - Google signals and ad personalization are off.
 *  - Coach and admin tools never load this file (the main site skips them too).
 *  - Only www.aceshoops.com (and the old aces-basketball.vercel.app address)
 *    is counted; tests on a laptop or a preview copy send nothing.
 *
 * The main site (index.html) loads this with data-spa and reports each page
 * change itself through window.acesTrack. Standalone pages (donate, register,
 * policies) load it without data-spa and their single page view is sent here.
 */
(function () {
  var GA_ID = "G-3BSYNRJHXZ"; // the aceshoops.com property
  // Only the real site counts. Local tests, the coding preview and Vercel
  // preview copies never send anything, so they can't pad the numbers.
  if (!/^(www\.)?aceshoops\.com$|^aces-basketball\.vercel\.app$/.test(location.hostname)) GA_ID = "";

  var cur = document.currentScript;
  var spa = !!(cur && cur.hasAttribute("data-spa"));
  var clean = function (path) { return location.origin + (path || location.pathname); };

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  // Called by the main site on every page change. Coach and admin tools pass
  // isPrivate=true, which switches Google Analytics off (Google's documented
  // ga-disable flag) until the next public page, so not even scrolls or
  // outbound clicks are recorded there.
  window.acesTrack = function (path, title, isPrivate) {
    if (!GA_ID) return;
    window["ga-disable-" + GA_ID] = !!isPrivate;
    if (isPrivate) return;
    window.gtag("set", { page_location: clean(path), page_path: path });
    window.gtag("event", "page_view", { page_location: clean(path), page_title: title || document.title });
  };
  if (!GA_ID) return;

  var s = document.createElement("script");
  s.async = true;
  s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(GA_ID);
  document.head.appendChild(s);

  // The page we came from is cleaned the same way, so a receipt or pledge
  // number in the previous address never reaches Google either.
  var ref = "";
  try { if (document.referrer) { var r = new URL(document.referrer); ref = r.origin + r.pathname; } } catch (e) { ref = ""; }

  window.gtag("js", new Date());
  window.gtag("set", { page_location: clean(), page_referrer: ref });
  // In Google Analytics (Admin > Data streams > aceshoops.com > Enhanced
  // measurement > Page views > advanced) "Page changes based on browser
  // history events" must stay UNTICKED: the site sends its own page views, so
  // leaving it on would count every page change twice.
  window.gtag("config", GA_ID, {
    send_page_view: false,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
  });
  if (!spa) window.acesTrack(location.pathname, document.title);
})();
