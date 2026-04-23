const CONFIG = {
  phoneE164: "+919800000000",
  displayPhone: "+91 98XXX XXXXX",
  whatsappNumberE164NoPlus: "919800000000",
  whatsappDefaultText:
    "Hi Study Circle Academy! I'm interested in Maths & Science classes for Class X/XII and want to know about batch timings.",
};

function qs(sel, root = document) {
  return root.querySelector(sel);
}

function qsa(sel, root = document) {
  return Array.from(root.querySelectorAll(sel));
}

function setYear() {
  const el = qs("#year");
  if (el) el.textContent = String(new Date().getFullYear());
}

function toast(message) {
  const el = qs("#toast");
  if (!el) return;

  el.textContent = message;
  el.classList.add("show");
  window.clearTimeout(toast._t);
  toast._t = window.setTimeout(() => el.classList.remove("show"), 2400);
}

function whatsappUrl(text = CONFIG.whatsappDefaultText) {
  const encoded = encodeURIComponent(text);
  return `https://wa.me/${CONFIG.whatsappNumberE164NoPlus}?text=${encoded}`;
}

function wireContactLinks() {
  const phoneLink = qs("#phoneLink");
  const callBtn = qs("#callBtn");
  const waLink = qs("#waLink");
  const waFloat = qs("#waFloat");

  if (phoneLink) {
    phoneLink.textContent = CONFIG.displayPhone;
    phoneLink.href = `tel:${CONFIG.phoneE164}`;
  }
  if (callBtn) {
    callBtn.href = `tel:${CONFIG.phoneE164}`;
    callBtn.addEventListener("click", (e) => {
      if (callBtn.getAttribute("href") === "#") e.preventDefault();
    });
  }
  if (waLink) waLink.href = whatsappUrl();
  if (waFloat) waFloat.href = whatsappUrl();
}

function wireThemeToggle() {
  const btn = qs("#themeToggle");
  if (!btn) return;

  const key = "lec-theme";
  const saved = window.localStorage.getItem(key);
  if (saved === "light") document.body.classList.add("light");

  btn.addEventListener("click", () => {
    document.body.classList.toggle("light");
    window.localStorage.setItem(key, document.body.classList.contains("light") ? "light" : "dark");
  });
}

function wireMobileMenu() {
  const toggle = qs("#menuToggle");
  const mobileNav = qs("#mobileNav");
  if (!toggle || !mobileNav) return;

  const close = () => {
    mobileNav.classList.remove("open");
    toggle.setAttribute("aria-label", "Open menu");
  };

  toggle.addEventListener("click", () => {
    const open = mobileNav.classList.toggle("open");
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });

  qsa("a", mobileNav).forEach((a) => a.addEventListener("click", close));
}

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

function wireTestimonials() {
  const track = qs("#testimonialTrack");
  const dotsWrap = qs("#testimonialDots");
  const prev = qs("#prevTestimonial");
  const next = qs("#nextTestimonial");
  if (!track || !dotsWrap || !prev || !next) return;

  const slides = qsa(".quote", track);
  let index = 0;
  let autoTimer = 0;
  let scrollTimer = 0;

  function renderDots() {
    dotsWrap.innerHTML = "";
    slides.forEach((_, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "dot-btn";
      b.setAttribute("aria-label", `Go to testimonial ${i + 1}`);
      b.setAttribute("aria-current", i === index ? "true" : "false");
      b.addEventListener("click", () => goTo(i));
      dotsWrap.appendChild(b);
    });
  }

  function setActiveDot() {
    qsa(".dot-btn", dotsWrap).forEach((d, i) =>
      d.setAttribute("aria-current", i === index ? "true" : "false"),
    );
  }

  function goTo(i) {
    index = clamp(i, 0, slides.length - 1);
    const target = slides[index];
    if (target) track.scrollTo({ left: target.offsetLeft, behavior: "smooth" });
    setActiveDot();
  }

  prev.addEventListener("click", () => goTo(index - 1));
  next.addEventListener("click", () => goTo(index + 1));

  track.addEventListener("scroll", () => {
    window.clearTimeout(scrollTimer);
    scrollTimer = window.setTimeout(() => {
      const x = track.scrollLeft;
      let best = 0;
      let bestDist = Infinity;
      for (let i = 0; i < slides.length; i++) {
        const dist = Math.abs(slides[i].offsetLeft - x);
        if (dist < bestDist) {
          bestDist = dist;
          best = i;
        }
      }
      index = best;
      setActiveDot();
    }, 60);
  });

  renderDots();
  goTo(0);

  const onResize = () => goTo(index);
  window.addEventListener("resize", onResize);

  autoTimer = window.setInterval(() => {
    const rect = qs("#testimonials")?.getBoundingClientRect();
    const inView = rect ? rect.top < window.innerHeight - 120 && rect.bottom > 120 : false;
    if (inView) goTo((index + 1) % slides.length);
  }, 6000);
}

function wireReveals() {
  const els = qsa("[data-reveal]");
  if (!els.length) return;

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add("revealed");
          io.unobserve(e.target);
        }
      }
    },
    { threshold: 0.15 },
  );

  els.forEach((el, i) => {
    el.style.transitionDelay = `${Math.min(i * 40, 240)}ms`;
    io.observe(el);
  });
}

function validatePhone(raw) {
  const digits = String(raw || "").replace(/[^\d]/g, "");
  if (digits.length < 10) return null;
  return digits.slice(-10);
}

function wireAdmissionForm() {
  const form = qs("#admissionForm");
  if (!form) return;

  const showError = (name, msg) => {
    const field = qs(`[name="${CSS.escape(name)}"]`, form);
    const wrap = field?.closest(".field");
    const err = qs(`[data-error-for="${CSS.escape(name)}"]`, form);
    if (wrap) wrap.classList.toggle("has-error", Boolean(msg));
    if (err) err.textContent = msg || "";
  };

  const clearErrors = () => {
    qsa(".field", form).forEach((f) => f.classList.remove("has-error"));
    qsa("[data-error-for]", form).forEach((p) => (p.textContent = ""));
  };

  const get = (name) => String(new FormData(form).get(name) || "").trim();

  const validate = () => {
    clearErrors();
    let ok = true;

    const studentName = get("studentName");
    const parentName = get("parentName");
    const phone = get("phone");
    const cls = get("class");
    const course = get("course");

    if (studentName.length < 2) {
      showError("studentName", "Please enter student name.");
      ok = false;
    }
    if (parentName.length < 2) {
      showError("parentName", "Please enter parent/guardian name.");
      ok = false;
    }
    if (!validatePhone(phone)) {
      showError("phone", "Enter a valid 10-digit phone number.");
      ok = false;
    }
    if (!cls) {
      showError("class", "Please select class.");
      ok = false;
    }
    if (!course) {
      showError("course", "Please select a course.");
      ok = false;
    }

    return ok;
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!validate()) {
      toast("Please fix the highlighted fields.");
      return;
    }

    const data = Object.fromEntries(new FormData(form).entries());
    const phone10 = validatePhone(data.phone);
    const message = [
      `New admission enquiry`,
      `Student: ${data.studentName}`,
      `Parent: ${data.parentName}`,
      `Phone: ${phone10}`,
      `Class: ${data.class}`,
      `Course: ${data.course}`,
      data.message ? `Message: ${data.message}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    toast("Enquiry submitted. Opening WhatsApp…");
    window.setTimeout(() => window.open(whatsappUrl(message), "_blank", "noopener,noreferrer"), 500);
    form.reset();
    clearErrors();
  });

  form.addEventListener("reset", () => window.setTimeout(clearErrors, 0));
}

function init() {
  setYear();
  wireContactLinks();
  wireThemeToggle();
  wireMobileMenu();
  wireTestimonials();
  wireReveals();
  wireAdmissionForm();
}

document.addEventListener("DOMContentLoaded", init);

