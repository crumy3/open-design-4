(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var CANDY_COLORS = ["#FF3EA5", "#8B4FF0", "#17B6E8", "#FFC93C", "#17C97A"];

  /* ---------------------------------------------------------------------
     Smooth scroll (Lenis) — falls back to native smooth-scroll if the
     CDN library fails to load.
  --------------------------------------------------------------------- */
  var lenis = null;
  if (!reduceMotion && window.Lenis) {
    lenis = new Lenis({
      duration: 1.0,
      easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
      smoothWheel: true,
    });
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    if (window.gsap && window.ScrollTrigger) {
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
      gsap.ticker.lagSmoothing(0);
    }
  }

  /* ---------------------------------------------------------------------
     Anchor links — smooth scroll via Lenis (or native) + close mobile nav
  --------------------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (e) {
      var id = link.getAttribute("href");
      if (id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      if (lenis) {
        lenis.scrollTo(target, { offset: -72 });
      } else {
        target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
      }
      closeNav();
    });
  });

  /* ---------------------------------------------------------------------
     Sticky header border on scroll
  --------------------------------------------------------------------- */
  var header = document.querySelector(".site-header");
  function onScroll() {
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
    nav.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  }
  toggle.addEventListener("click", function () {
    var isOpen = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  /* ---------------------------------------------------------------------
     Scroll reveal + count-up stats via GSAP ScrollTrigger
     (falls back to IntersectionObserver if GSAP fails to load)
  --------------------------------------------------------------------- */
  var revealEls = document.querySelectorAll(".reveal-up");

  if (!reduceMotion && window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);

    revealEls.forEach(function (el) {
      ScrollTrigger.create({
        trigger: el,
        start: "top 88%",
        once: true,
        onEnter: function () { el.classList.add("is-visible"); },
      });
    });

    document.querySelectorAll("[data-count]").forEach(function (el) {
      ScrollTrigger.create({
        trigger: el,
        start: "top 90%",
        once: true,
        onEnter: function () { animateCount(el); },
      });
    });
  } else {
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
      document.querySelectorAll("[data-count]").forEach(function (el) { io.observe(el); });
    } else {
      revealEls.forEach(function (el) { el.classList.add("is-visible"); });
      document.querySelectorAll("[data-count]").forEach(function (el) { animateCount(el); });
    }
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
     Ambient bubble parallax — bubbles drift toward the cursor slightly,
     layered by data-depth so nearer bubbles move more.
  --------------------------------------------------------------------- */
  if (!reduceMotion) {
    var bubbleWraps = document.querySelectorAll(".bg-bubble-wrap");
    var rafId = null;
    var mouseX = 0.5, mouseY = 0.5;

    window.addEventListener("mousemove", function (e) {
      mouseX = e.clientX / window.innerWidth;
      mouseY = e.clientY / window.innerHeight;
      if (!rafId) rafId = requestAnimationFrame(applyParallax);
    });

    function applyParallax() {
      rafId = null;
      var dx = (mouseX - 0.5) * 2;
      var dy = (mouseY - 0.5) * 2;
      bubbleWraps.forEach(function (el) {
        var depth = parseFloat(el.getAttribute("data-depth")) || 0.5;
        var moveX = dx * depth * 26;
        var moveY = dy * depth * 26;
        el.style.transform = "translate(" + moveX + "px, " + moveY + "px)";
      });
    }
  }

  /* ---------------------------------------------------------------------
     Confetti burst — small candy-colored pieces radiate from an origin
     element using the Web Animations API. No dependency needed.
  --------------------------------------------------------------------- */
  function burstConfetti(originEl) {
    if (reduceMotion) return;
    var rect = originEl.getBoundingClientRect();
    var originX = rect.left + rect.width / 2;
    var originY = rect.top + rect.height / 2;
    var count = 26;

    for (var i = 0; i < count; i++) {
      var piece = document.createElement("div");
      piece.className = "confetti-piece";
      var size = 5 + Math.random() * 7;
      piece.style.width = size + "px";
      piece.style.height = size + "px";
      piece.style.left = originX + "px";
      piece.style.top = originY + "px";
      piece.style.background = CANDY_COLORS[i % CANDY_COLORS.length];
      piece.style.borderRadius = Math.random() > 0.5 ? "50%" : "3px";
      document.body.appendChild(piece);

      var angle = Math.random() * Math.PI * 2;
      var distance = 90 + Math.random() * 140;
      var endX = Math.cos(angle) * distance;
      var endY = Math.sin(angle) * distance + 60;
      var rotation = (Math.random() - 0.5) * 720;

      var anim = piece.animate([
        { transform: "translate(0, 0) rotate(0deg)", opacity: 1 },
        { transform: "translate(" + endX + "px, " + endY + "px) rotate(" + rotation + "deg)", opacity: 0 }
      ], {
        duration: 900 + Math.random() * 500,
        easing: "cubic-bezier(.2,.7,.3,1)",
      });
      anim.onfinish = function (p) { return function () { p.remove(); }; }(piece);
    }
  }

  /* ---------------------------------------------------------------------
     Contact form — client-side only (no backend wired up yet)
  --------------------------------------------------------------------- */
  var form = document.getElementById("growth-form");
  var success = document.getElementById("form-success");
  var submitBtn = document.getElementById("submit-btn");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      form.classList.add("submitted");
      success.classList.add("visible");
      if (submitBtn) burstConfetti(submitBtn);
    });
  }
})();
