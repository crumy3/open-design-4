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
     Sticky header border on scroll & Scroll Spy
  --------------------------------------------------------------------- */
  var header = document.querySelector(".site-header");
  var sections = document.querySelectorAll("section[id]");
  var navLinks = document.querySelectorAll(".nav-link");

  function onScroll() {
    if (!header) return;
    // Sticky header class
    if (window.scrollY > 8) header.classList.add("scrolled");
    else header.classList.remove("scrolled");

    // Scroll Spy active tracking
    var scrollPos = window.scrollY + HEADER_OFFSET + 40;
    var activeId = "";

    sections.forEach(function (sec) {
      var top = sec.offsetTop;
      var height = sec.offsetHeight;
      var id = sec.getAttribute("id");

      if (scrollPos >= top && scrollPos < top + height) {
        activeId = id;
      }
    });

    // Special case for top of page
    if (window.scrollY < 20) {
      activeId = "";
    }

    navLinks.forEach(function (link) {
      var href = link.getAttribute("href");
      if (href === "#" + activeId) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });
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
  var submitBtn = document.getElementById("submit-btn");

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      // Add loading state to submit button
      if (submitBtn) submitBtn.classList.add("btn-loading");

      // Disable inputs during submission
      var inputs = form.querySelectorAll("input, textarea");
      inputs.forEach(function (input) {
        input.disabled = true;
      });

      // Simulate a premium API request transition (850ms)
      setTimeout(function () {
        if (submitBtn) submitBtn.classList.remove("btn-loading");
        form.classList.add("submitted");
      }, 850);
    });
  }


  /* ---------------------------------------------------------------------
     Expanding Panels — click to activate
  --------------------------------------------------------------------- */
  var options = document.querySelectorAll(".option");
  options.forEach(function (opt) {
    opt.addEventListener("click", function () {
      options.forEach(function (o) { o.classList.remove("active"); });
      opt.classList.add("active");
    });

    /* keyboard: Enter / Space */
    opt.setAttribute("tabindex", "0");
    opt.setAttribute("role", "button");
    opt.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        opt.click();
      }
    });
  });

  /* ---------------------------------------------------------------------
     Magnetic Buttons hover effect
  --------------------------------------------------------------------- */
  var magneticBtns = document.querySelectorAll(".magnetic-btn");
  if (!reduceMotion) {
    magneticBtns.forEach(function (btn) {
      btn.addEventListener("mousemove", function (e) {
        var rect = btn.getBoundingClientRect();
        var x = e.clientX - rect.left - rect.width / 2;
        var y = e.clientY - rect.top - rect.height / 2;

        // Pull strength (multiply by 0.35 to clamp)
        var pullX = x * 0.35;
        var pullY = y * 0.35;

        btn.style.transform = "translate(" + pullX + "px, " + pullY + "px)";
        btn.style.transition = "none";
      });

      btn.addEventListener("mouseleave", function () {
        btn.style.transform = "translate(0px, 0px)";
        btn.style.transition = "transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)";
      });
    });
  }

  /* ---------------------------------------------------------------------
     Hero background video — slowed slightly so the water reads calm
     rather than busy, and paused once the hero scrolls out of view so
     it isn't burning battery decoding video behind opaque sections.
  --------------------------------------------------------------------- */
  var heroVideo = document.querySelector(".hero-bg-video");
  var heroSection = document.getElementById("hero");
  if (heroVideo && !reduceMotion) {
    heroVideo.playbackRate = 0.85;

    if (heroSection && "IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) {
          var p = heroVideo.play();
          if (p && p.catch) { p.catch(function () {}); }
        } else {
          heroVideo.pause();
        }
      }, { threshold: 0 }).observe(heroSection);
    }
  }

})();

