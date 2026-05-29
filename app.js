/* =========================================================================
   DRAGON HOUSE - shared behavior for all 5 pages (Forge, NeonFrame Web Design)
   - Bilingual EN/ES toggle (default EN, persist in localStorage "lang"),
     reused verbatim from the proven Margaritas Terraza Bar pattern.
   - Loader, mobile nav panel, reveal-on-scroll, gallery/menu lightbox, footer year.
   - All motion gated behind prefers-reduced-motion.
   No build step. No em-dashes anywhere.
   ========================================================================= */
(function(){
  "use strict";
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Loader ---------- */
  (function(){
    var loader = document.getElementById("loader");
    if(!loader) return;
    if(reduceMotion){ loader.classList.add("gone"); return; }
    function hide(){ loader.classList.add("gone"); }
    window.addEventListener("load", function(){ setTimeout(hide, 350); });
    setTimeout(hide, 1500); // hard cap 1.5s
  })();

  /* ---------- Bilingual EN/ES toggle ----------
     Swaps text via innerHTML (so accent entities render), input placeholders via
     data-*-ph, aria-labels via data-*-label, iframe titles via data-*-title, sets
     document.documentElement.lang, persists in localStorage "lang", default EN.
     The key is read on every page load, so the choice persists across navigation. */
  var STORAGE_KEY = "lang";
  function applyLang(lang){
    document.documentElement.lang = lang;
    Array.prototype.forEach.call(document.querySelectorAll("[data-en],[data-es]"), function(el){
      var v = el.getAttribute("data-"+lang);
      if(v === null) return;
      if(el.tagName === "IMG"){ el.setAttribute("alt", v); }
      else { el.innerHTML = v; }
    });
    Array.prototype.forEach.call(document.querySelectorAll("[data-en-ph],[data-es-ph]"), function(el){
      var v = el.getAttribute("data-"+lang+"-ph");
      if(v !== null) el.setAttribute("placeholder", v);
    });
    Array.prototype.forEach.call(document.querySelectorAll("[data-en-label],[data-es-label]"), function(el){
      var v = el.getAttribute("data-"+lang+"-label");
      if(v !== null) el.setAttribute("aria-label", v);
    });
    Array.prototype.forEach.call(document.querySelectorAll("[data-en-title],[data-es-title]"), function(el){
      var v = el.getAttribute("data-"+lang+"-title");
      if(v !== null) el.setAttribute("title", v);
    });
    Array.prototype.forEach.call(document.querySelectorAll(".lang-toggle"), function(t){
      Array.prototype.forEach.call(t.querySelectorAll(".lt-code"), function(c){
        c.classList.toggle("is-active", c.getAttribute("data-code") === lang);
      });
      t.setAttribute("aria-label", lang === "en" ? "Switch language to Spanish" : "Cambiar idioma a ingles");
    });
    try{ localStorage.setItem(STORAGE_KEY, lang); }catch(e){}
  }
  var saved = "en";
  try{ saved = localStorage.getItem(STORAGE_KEY) || "en"; }catch(e){}
  if(saved !== "en" && saved !== "es") saved = "en";
  applyLang(saved);

  function toggleLang(){ applyLang(document.documentElement.lang === "en" ? "es" : "en"); }
  Array.prototype.forEach.call(document.querySelectorAll("#langToggle, #langTogglePanel"), function(b){
    b.addEventListener("click", toggleLang);
  });

  /* ---------- Nav scroll shadow ---------- */
  (function(){
    var nav = document.getElementById("nav");
    if(!nav) return;
    function setNav(){ nav.classList.toggle("is-scrolled", window.scrollY > 16); }
    setNav();
    window.addEventListener("scroll", setNav, { passive:true });
  })();

  /* ---------- Mobile nav panel ---------- */
  (function(){
    var btn = document.getElementById("navToggle");
    var panel = document.getElementById("navPanel");
    if(!btn || !panel) return;
    function close(){ panel.classList.remove("open"); btn.setAttribute("aria-expanded","false"); }
    btn.addEventListener("click", function(){
      var open = panel.classList.toggle("open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    Array.prototype.forEach.call(panel.querySelectorAll("a.np-link"), function(a){ a.addEventListener("click", close); });
    document.addEventListener("keydown", function(e){ if(e.key === "Escape") close(); });
  })();

  /* ---------- Reveal on scroll ---------- */
  (function(){
    var els = document.querySelectorAll(".reveal");
    if(reduceMotion || !("IntersectionObserver" in window)){
      Array.prototype.forEach.call(els, function(el){ el.classList.add("in"); });
      return;
    }
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if(en.isIntersecting){ en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    Array.prototype.forEach.call(els, function(el){ io.observe(el); });
  })();

  /* ---------- Smooth-scroll for in-page menu chips (auto under reduced motion) ---------- */
  (function(){
    Array.prototype.forEach.call(document.querySelectorAll('a[href^="#"]'), function(a){
      var id = a.getAttribute("href");
      if(id === "#" || id.length < 2) return;
      a.addEventListener("click", function(e){
        var target = document.getElementById(id.slice(1));
        if(!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block:"start" });
      });
    });
  })();

  /* ---------- Lightbox (Gallery + printed-menu photos) ----------
     Any element with [data-lightbox] participates. data-full = full image src,
     data-cap = caption. Keyboard accessible, Escape closes, arrows navigate. */
  (function(){
    var triggers = Array.prototype.slice.call(document.querySelectorAll("[data-lightbox]"));
    var box = document.getElementById("lightbox");
    if(!triggers.length || !box) return;
    var imgEl = box.querySelector(".lb-img");
    var capEl = box.querySelector(".lightbox-cap");
    var current = -1;

    function show(i){
      if(i < 0) i = triggers.length - 1;
      if(i >= triggers.length) i = 0;
      current = i;
      var t = triggers[i];
      var src = t.getAttribute("data-full") || (t.querySelector("img") && t.querySelector("img").getAttribute("src"));
      var cap = t.getAttribute("data-cap") || "";
      imgEl.setAttribute("src", src);
      imgEl.setAttribute("alt", cap);
      capEl.innerHTML = cap;
      box.classList.add("open");
      document.body.style.overflow = "hidden";
      var closeBtn = box.querySelector(".lightbox-close");
      if(closeBtn) closeBtn.focus();
    }
    function close(){
      box.classList.remove("open");
      document.body.style.overflow = "";
      if(current > -1 && triggers[current]) triggers[current].focus();
    }
    triggers.forEach(function(t, i){
      t.addEventListener("click", function(){ show(i); });
      t.addEventListener("keydown", function(e){
        if(e.key === "Enter" || e.key === " "){ e.preventDefault(); show(i); }
      });
    });
    box.addEventListener("click", function(e){
      if(e.target === box) close();
    });
    Array.prototype.forEach.call(box.querySelectorAll("[data-lb-close]"), function(b){ b.addEventListener("click", close); });
    var prev = box.querySelector("[data-lb-prev]");
    var next = box.querySelector("[data-lb-next]");
    if(prev) prev.addEventListener("click", function(){ show(current - 1); });
    if(next) next.addEventListener("click", function(){ show(current + 1); });
    document.addEventListener("keydown", function(e){
      if(!box.classList.contains("open")) return;
      if(e.key === "Escape") close();
      else if(e.key === "ArrowLeft") show(current - 1);
      else if(e.key === "ArrowRight") show(current + 1);
    });
  })();

  /* ---------- Contact form: friendly inline confirmation (no backend, spec demo) ---------- */
  (function(){
    var form = document.getElementById("contactForm");
    var confirmEl = document.getElementById("formConfirm");
    if(!form || !confirmEl) return;
    form.addEventListener("submit", function(e){
      e.preventDefault();
      confirmEl.classList.add("show");
      form.reset();
      confirmEl.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block:"nearest" });
    });
  })();

  /* ---------- Footer year (all pages) ---------- */
  Array.prototype.forEach.call(document.querySelectorAll("#year"), function(y){
    y.textContent = new Date().getFullYear();
  });
})();
