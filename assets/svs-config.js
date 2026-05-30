/* Simply Vending Solutions — site config & routing (single source of truth) */
window.SITE = {
  name: "Simply Vending Solutions",
  legalName: "Simply Vending Solutions LLC",
  domain: "https://simplyvendingsolutionsllc.com",
  phone: "+1-703-626-2258",
  phoneDisplay: "(703) 626-2258",
  email: "Jonathan@simplyvendingsolutionsllc.com",
  instagram: "https://www.instagram.com/simplyvendingsolutionsllc/",
  ga4: "G-VSLWJH6SY0"
};
window.SVS = (function(){
  var FILE = {
    "/": "index.html",
    "/about": "about.html",
    "/contact": "contact.html",
    "/services/draft": "services/draft-beverages.html",
    "/services/micromarts": "services/micro-markets.html",
    "/services/coffee": "services/coffee-service.html",
    "/services/events": "services/events-catering.html"
  };
  function fileFor(route){ return Object.prototype.hasOwnProperty.call(FILE, route) ? FILE[route] : null; }
  function href(h){
    if(!h) return h;
    if(/^(https?:|tel:|mailto:|data:)/i.test(h)) return h;
    var r = h.charAt(0) === '#' ? h.slice(1) : h;
    var f = fileFor(r);
    if(f == null) return h;
    var base = (typeof window !== "undefined" && window.__ASSET_BASE) || "";
    var qs = (typeof window !== "undefined" && window.location && window.location.search) || "";
    return base + f + qs;
  }
  function cityHref(slug){
    var base = (typeof window !== "undefined" && window.__ASSET_BASE) || "";
    var qs = (typeof window !== "undefined" && window.location && window.location.search) || "";
    return base + "vending/" + slug + ".html" + qs;
  }
  return { fileFor: fileFor, href: href, cityHref: cityHref };
})();
window.SVS.CITIES = [
  { name: "Washington, DC", slug: "washington-dc", short: "Washington DC" },
  { name: "Arlington, VA",  slug: "arlington-va",  short: "Arlington" },
  { name: "Alexandria, VA", slug: "alexandria-va", short: "Alexandria" },
  { name: "Fairfax, VA",    slug: "fairfax-va",    short: "Fairfax" },
  { name: "Reston, VA",     slug: "reston-va",     short: "Reston" },
  { name: "McLean, VA",     slug: "mclean-va",     short: "McLean" },
  { name: "Annandale, VA",  slug: "annandale-va",  short: "Annandale" },
  { name: "Centreville, VA",slug: "centreville-va",short: "Centreville" }
];
