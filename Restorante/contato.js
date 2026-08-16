// ============================================
// HEADER SCROLL
// ============================================
const header = document.getElementById("header");

function handleHeaderScroll() {
  if (window.scrollY > 80) {
    header.classList.add("scrolled");
  } else {
    header.classList.remove("scrolled");
  }
}

window.addEventListener("scroll", handleHeaderScroll, { passive: true });

// ============================================
// MOBILE MENU
// ============================================
const menuToggle = document.getElementById("menuToggle");
const nav = document.getElementById("nav");

menuToggle.addEventListener("click", () => {
  menuToggle.classList.toggle("active");
  nav.classList.toggle("open");
});

nav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    menuToggle.classList.remove("active");
    nav.classList.remove("open");
  });
});

document.addEventListener("click", (e) => {
  if (!nav.contains(e.target) && !menuToggle.contains(e.target)) {
    menuToggle.classList.remove("active");
    nav.classList.remove("open");
  }
});

// ============================================
// SCROLL REVEAL
// ============================================
const revealElements = document.querySelectorAll(".reveal");

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("revealed");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

revealElements.forEach((el) => revealObserver.observe(el));

// ============================================
// FORMULÁRIO
// ============================================
const form = document.getElementById("contactForm");
const formSuccess = document.getElementById("formSuccess");

const fields = {
  nome: document.getElementById("nome"),
  email: document.getElementById("email"),
  mensagem: document.getElementById("mensagem"),
};

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function setError(field) {
  field.closest(".form-group").classList.add("error");
}

function clearError(field) {
  field.closest(".form-group").classList.remove("error");
}

// Limpar erro ao digitar
Object.values(fields).forEach((field) => {
  field.addEventListener("input", () => clearError(field));
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  let valid = true;

  // Nome
  if (!fields.nome.value.trim()) {
    setError(fields.nome);
    valid = false;
  }

  // Email
  if (!fields.email.value.trim() || !validateEmail(fields.email.value)) {
    setError(fields.email);
    valid = false;
  }

  // Mensagem
  if (!fields.mensagem.value.trim()) {
    setError(fields.mensagem);
    valid = false;
  }

  if (valid) {
    form.style.display = "none";
    formSuccess.classList.add("visible");
  }
});

// Máscara de telefone
const telefoneInput = document.getElementById("telefone");
telefoneInput.addEventListener("input", (e) => {
  let value = e.target.value.replace(/\D/g, "");
  if (value.length > 11) value = value.slice(0, 11);

  if (value.length > 6) {
    value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
  } else if (value.length > 2) {
    value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
  } else if (value.length > 0) {
    value = `(${value}`;
  }

  e.target.value = value;
});

// ============================================
// SPLASH SCREEN
// ============================================
document.addEventListener("DOMContentLoaded", () => {
  const splash = document.getElementById("splash");

  if (splash) {
    document.body.style.overflow = "hidden";
    setTimeout(() => {
      splash.classList.add("hidden");
      document.body.style.overflow = "";
    }, 2200);
  }
});
