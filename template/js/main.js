(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var HEADER_OFFSET = 64; /* keep in sync with .header-inner height in style.css */

  /* ---------------------------------------------------------------------
     Anchor links — native smooth scroll, offset for the sticky header,
     + close mobile nav
  --------------------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (e) {
      var id = link.getAttribute("href");
      if (id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var top = target.getBoundingClientRect().top + window.pageYOffset - HEADER_OFFSET;
      window.scrollTo({ top: top, behavior: reduceMotion ? "auto" : "smooth" });
      closeNav();
    });
  });

  /* ---------------------------------------------------------------------
     Sticky header border on scroll
  --------------------------------------------------------------------- */
  var header = document.querySelector(".site-header");
  function onScroll() {
    if (!header) return;
    if (window.scrollY > 8) header.classList.add("scrolled");
    else header.classList.remove("scrolled");
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------------------------------------------------------------------
     Mobile nav toggle
  --------------------------------------------------------------------- */
  var toggle = document.getElementById("nav-toggle");
  var nav = document.getElementById("main-nav");
  function closeNav() {
    if (!nav || !toggle) return;
    nav.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  }
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var isOpen = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });
  }

  /* ---------------------------------------------------------------------
     Scroll reveal + count-up stats via IntersectionObserver
  --------------------------------------------------------------------- */
  var revealEls = document.querySelectorAll(".reveal-up");
  var countEls = document.querySelectorAll("[data-count]");

  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          if (entry.target.hasAttribute("data-count")) animateCount(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    revealEls.forEach(function (el) { io.observe(el); });
    countEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
    countEls.forEach(function (el) { animateCount(el); });
  }

  function animateCount(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var suffix = el.getAttribute("data-suffix") || "";
    var prefix = el.getAttribute("data-prefix") || "";
    var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
    var duration = 1200;
    var start = null;

    function step(ts) {
      if (!start) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var value = target * eased;
      el.textContent = prefix + value.toFixed(decimals) + suffix;
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = prefix + target.toFixed(decimals) + suffix;
    }
    requestAnimationFrame(step);
  }

  /* ---------------------------------------------------------------------
     Contact form — client-side only (no backend wired up yet)
  --------------------------------------------------------------------- */
  var form = document.getElementById("growth-form");
  var success = document.getElementById("form-success");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      form.classList.add("submitted");
      if (success) success.classList.add("visible");
    });
  }
})();
