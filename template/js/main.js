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
    }, { threshold: 0.15 });
    revealEls.forEach(function (el) { io.observe(el); });
    countEls.forEach(function (el) { io.observe(el); });

    /* Staggered child reveals — when a .reveal-stagger container enters the
       viewport, assign each .reveal-up child a JS-driven transition-delay
       (0 + 60ms * index) then mark it visible so the CSS stagger kicks in.
       This supplements the CSS nth-child approach and handles containers
       with dynamic child counts cleanly. */
    var staggerContainers = document.querySelectorAll(".reveal-stagger");
    var staggerIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var children = entry.target.querySelectorAll(".reveal-up");
        children.forEach(function (child, idx) {
          setTimeout(function () {
            child.classList.add("is-visible");
          }, idx * 60);
        });
        staggerIO.unobserve(entry.target);
      });
    }, { threshold: 0.1 });
    staggerContainers.forEach(function (container) { staggerIO.observe(container); });

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
     Contact form — submits to /api/contact (Vercel serverless function)
  --------------------------------------------------------------------- */
  var form = document.getElementById("growth-form");
  var submitBtn = document.getElementById("submit-btn");
  var formError = document.getElementById("form-error");

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      if (formError) formError.hidden = true;
      if (submitBtn) { submitBtn.classList.add("btn-loading"); submitBtn.disabled = true; }

      var inputs = form.querySelectorAll("input, textarea");
      inputs.forEach(function (input) { input.disabled = true; });

      var data = {
        name: form.name.value,
        email: form.email.value,
        website: form.website.value,
        goal: form.goal.value,
        "company-website": form["company-website"].value
      };

      fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      })
        .then(function (res) { return res.json().then(function (body) { return { ok: res.ok, body: body }; }); })
        .then(function (result) {
          if (!result.ok) throw new Error((result.body && result.body.error) || "Submission failed");
          form.classList.add("submitted");
        })
        .catch(function () {
          inputs.forEach(function (input) { input.disabled = false; });
          if (submitBtn) { submitBtn.classList.remove("btn-loading"); submitBtn.disabled = false; }
          if (formError) formError.hidden = false;
        });
    });
  }


  /* ---------------------------------------------------------------------
     Expanding Panels — click to activate + mobile auto-cycle
  --------------------------------------------------------------------- */
  var options = document.querySelectorAll(".option");
  var panelTimer = null;
  var userInteracted = false;

  function setActivePanel(el) {
    options.forEach(function (o) { o.classList.remove("active"); });
    el.classList.add("active");
  }

  /* Auto-cycle panels on narrow screens every 3s; pauses after any click */
  function startPanelCycle() {
    if (window.innerWidth > 768 || options.length === 0) return;
    clearInterval(panelTimer);
    panelTimer = setInterval(function () {
      if (userInteracted) { clearInterval(panelTimer); return; }
      var activeIdx = 0;
      options.forEach(function (o, i) { if (o.classList.contains("active")) activeIdx = i; });
      var nextIdx = (activeIdx + 1) % options.length;
      setActivePanel(options[nextIdx]);
    }, 3000);
  }

  options.forEach(function (opt) {
    opt.addEventListener("click", function () {
      userInteracted = true;
      clearInterval(panelTimer);
      setActivePanel(opt);
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

  startPanelCycle();
  window.addEventListener("resize", function () {
    if (!userInteracted) startPanelCycle();
  }, { passive: true });

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

  /* ---------------------------------------------------------------------
     ROI Calculator Logic (updates leak values and conic-gradient donut)
  --------------------------------------------------------------------- */
  var spendSlider = document.getElementById("calc-spend");
  var convSlider = document.getElementById("calc-conv");
  var valSlider = document.getElementById("calc-avg-lead-value");

  var spendVal = document.getElementById("calc-spend-val");
  var convVal = document.getElementById("calc-conv-val");
  var leadVal = document.getElementById("calc-lead-val-val");

  var leakDisplay = document.getElementById("calc-total-leak");
  var recoverDisplay = document.getElementById("calc-total-recover");
  var donutLeakAmount = document.getElementById("donut-leak-amount");
  var leakDonut = document.getElementById("leak-donut");

  var p1ValDisplay = document.getElementById("leak-p1-val");
  var p2ValDisplay = document.getElementById("leak-p2-val");
  var p3ValDisplay = document.getElementById("leak-p3-val");

  function updateCalculator() {
    if (!spendSlider || !convSlider || !valSlider) return;

    var spend = parseInt(spendSlider.value, 10);
    var conv = parseFloat(convSlider.value);
    var val = parseInt(valSlider.value, 10);

    // Update value indicators
    if (spendVal) spendVal.textContent = "$" + spend.toLocaleString();
    if (convVal) convVal.textContent = conv.toFixed(1) + "%";
    if (leadVal) leadVal.textContent = "$" + val;

    // totalLeak = Spend * (0.6 - (C / 10)) clamped between 10% and 80%
    var leakFactor = 0.6 - (conv / 10.0);
    if (leakFactor < 0.1) leakFactor = 0.1;
    if (leakFactor > 0.8) leakFactor = 0.8;

    var totalLeak = Math.round(spend * leakFactor);
    var recoverable = Math.round(totalLeak * 0.75); // 75% recoverable by Cascade optimizations

    var leakFormatted = "$" + totalLeak.toLocaleString();
    var recoverFormatted = "$" + recoverable.toLocaleString() + "/mo";

    if (leakDisplay) leakDisplay.textContent = leakFormatted;
    if (recoverDisplay) recoverDisplay.textContent = recoverFormatted;
    if (donutLeakAmount) donutLeakAmount.textContent = leakFormatted;

    // Proportional breakdown (42% pink, 33% teal, 25% lavender)
    var p1Amt = Math.round(totalLeak * 0.42);
    var p2Amt = Math.round(totalLeak * 0.33);
    var p3Amt = totalLeak - p1Amt - p2Amt;

    if (p1ValDisplay) p1ValDisplay.textContent = "$" + p1Amt.toLocaleString() + " (42%)";
    if (p2ValDisplay) p2ValDisplay.textContent = "$" + p2Amt.toLocaleString() + " (33%)";
    if (p3ValDisplay) p3ValDisplay.textContent = "$" + p3Amt.toLocaleString() + " (25%)";

    // Set conic-gradient variables on donut chart (re-paint segments)
    if (leakDonut) {
      leakDonut.style.setProperty("--p1", 42);
      leakDonut.style.setProperty("--p2", 33);
      leakDonut.style.setProperty("--p3", 25);
      leakDonut.style.background = "conic-gradient(var(--brand-pink) 0% 42%, var(--brand-teal) 42% 75%, var(--brand-lavender) 75% 100%)";
    }
  }

  if (spendSlider) {
    spendSlider.addEventListener("input", updateCalculator);
    convSlider.addEventListener("input", updateCalculator);
    valSlider.addEventListener("input", updateCalculator);
    updateCalculator();
  }

  /* ---------------------------------------------------------------------
     Interactive Website Health Score Audit Checklist
  --------------------------------------------------------------------- */
  var auditCheckboxes = document.querySelectorAll(".audit-checkbox");
  var scoreBar = document.getElementById("audit-score-bar");
  var scoreNum = document.getElementById("audit-score-num");
  var teardownCtaBtn = document.getElementById("teardown-cta-btn");

  function calculateHealthScore() {
    var score = 100;
    auditCheckboxes.forEach(function (cb) {
      if (cb.checked) {
        var penalty = parseInt(cb.getAttribute("data-penalty"), 10) || 0;
        score -= penalty;
      }
    });

    if (score < 20) score = 20; // clamp at minimum score

    if (scoreNum) {
      scoreNum.textContent = score + "%";
    }

    if (scoreBar) {
      scoreBar.style.width = score + "%";
      // Dynamic color code
      if (score >= 80) {
        scoreBar.style.backgroundColor = "#1b7a4d"; // Green (Healthy)
        if (scoreNum) scoreNum.style.color = "#1b7a4d";
      } else if (score >= 50) {
        scoreBar.style.backgroundColor = "var(--primary)"; // Amber (Warning)
        if (scoreNum) scoreNum.style.color = "var(--earth-text-accent)";
      } else {
        scoreBar.style.backgroundColor = "#a83232"; // Red (Critical leakage)
        if (scoreNum) scoreNum.style.color = "#a83232";
      }
    }

    if (teardownCtaBtn) {
      if (score < 50) {
        teardownCtaBtn.innerHTML = 'Fix my website leakage <i class="ph ph-arrow-right"></i>';
      } else {
        teardownCtaBtn.innerHTML = 'Get my free teardown <i class="ph ph-arrow-right"></i>';
      }
    }
  }

  auditCheckboxes.forEach(function (cb) {
    cb.addEventListener("change", calculateHealthScore);
  });
  
  calculateHealthScore();

  /* ---------------------------------------------------------------------
     Bento Card Mousemove hover effect (radial gradient cursor follow)
  --------------------------------------------------------------------- */
  var bentoCards = document.querySelectorAll(".bento-card");
  bentoCards.forEach(function (card) {
    card.addEventListener("mousemove", function (e) {
      var rect = card.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var y = e.clientY - rect.top;
      card.style.setProperty("--mouse-x", x + "px");
      card.style.setProperty("--mouse-y", y + "px");
    });
  });

})();

