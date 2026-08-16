// ============================================
// DADOS DOS PRATOS
// ============================================
const pratos = [
  {
    id: 1,
    url: "./img/fotos/images.webp",
    nome: "Bolo de Cenoura",
    categoria: "Sobremesas",
    descricao: "Um delicioso bolo de cenoura coberto com calda de chocolate belga. Fofo, úmido e perfeito para acompanhar um café ou chá da tarde.",
    valor: "R$ 20,00",
  },
  {
    id: 2,
    url: "./img/fotos/images (1).webp",
    nome: "Brigadeiro Gourmet",
    categoria: "Sobremesas",
    descricao: "Docinho brasileiro feito com chocolate premium, leite condensado e manteiga. Polvilhado com granulado belga. Perfeito para festas e celebrações.",
    valor: "R$ 25,00",
  },
  {
    id: 3,
    url: "./img/fotos/feiju.jpg",
    nome: "Feijoada Completa",
    categoria: "Pratos Principais",
    descricao: "Prato típico brasileiro feito com feijão preto e uma variedade de carnes selecionadas. Acompanhado de arroz soltinho, farofa crocante, couve refogada e laranja fatiada.",
    valor: "R$ 30,00",
  },
  {
    id: 4,
    url: "./img/fotos/moqueca-baiana-de-peixe-com-camarao-4.webp",
    nome: "Moqueca Baiana",
    categoria: "Pratos Principais",
    descricao: "Ensopado de peixe fresco preparado com leite de coco, azeite de dendê e pimentões coloridos. Um sabor exótico e inesquecível do litoral brasileiro.",
    valor: "R$ 35,00",
  },
  {
    id: 5,
    url: "./img/fotos/KF-Pao-de-Queijorex-jumbo-v2.webp",
    nome: "Pão de Queijo Artesanal",
    categoria: "Entradas",
    descricao: "Tradicional pãozinho brasileiro feito à mão com polvilho azedo e queijo minas curado. Crocante por fora, macio e puxa por dentro. Servido quentinho.",
    valor: "R$ 40,00",
  },
  {
    id: 6,
    url: "./img/fotos/32-6-1024x788.webp",
    nome: "Salmão ao Molho de Maracujá",
    categoria: "Pratos Principais",
    descricao: "Salmão grelhado na perfeição, servido com um delicado molho de maracujá fresco. Acompanha legumes assados e arroz de coco. Uma combinação tropical irresistível.",
    valor: "R$ 50,00",
  },
  {
    id: 7,
    url: "./img/fotos/istock-480262842-1.webp",
    nome: "Filé Mignon ao Molho Madeira",
    categoria: "Pratos Principais",
    descricao: "Filé mignon suculento e macio, servido com molho madeira preparado com vinho tinto e cogumelos frescos. Acompanha batatas sautées e legumes da estação.",
    valor: "R$ 70,00",
  },
];

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
// FILTROS
// ============================================
const filterBtns = document.querySelectorAll(".filter-btn");
const menuGrid = document.getElementById("menuGrid");
let filtroAtual = "todos";

filterBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    filtroAtual = btn.dataset.filter;
    filtrarPratos();
  });
});

function filtrarPratos() {
  const itens = menuGrid.querySelectorAll(".menu-item");
  itens.forEach((item, index) => {
    const categoria = item.dataset.categoria;
    const deveMostrar = filtroAtual === "todos" || categoria === filtroAtual;

    if (deveMostrar) {
      item.classList.remove("hidden");
      item.style.animation = `fadeInUp 0.4s ease forwards ${index * 0.05}s`;
    } else {
      item.classList.add("hidden");
    }
  });
}

// ============================================
// GRID CARDÁPIO
// ============================================
function criarItensCardapio() {
  pratos.forEach((prato, index) => {
    const item = document.createElement("div");
    item.classList.add("menu-item");
    item.setAttribute("data-categoria", prato.categoria);
    item.style.opacity = "0";
    item.style.animation = `fadeInUp 0.5s ease forwards ${index * 0.08}s`;

    item.innerHTML = `
      <div class="menu-item__img-wrapper">
        <img class="menu-item__img" src="${prato.url}" alt="${prato.nome}" loading="lazy" />
        <div class="menu-item__img-overlay"></div>
        <span class="menu-item__badge">${prato.categoria}</span>
        <div class="menu-item__eye"><span>+</span></div>
      </div>
      <div class="menu-item__info">
        <h3 class="menu-item__name">${prato.nome}</h3>
        <p class="menu-item__desc">${prato.descricao}</p>
        <div class="menu-item__footer">
          <span class="menu-item__price">${prato.valor}</span>
          <span class="menu-item__cta">Ver detalhes <span class="menu-item__cta-arrow">→</span></span>
        </div>
      </div>
    `;

    item.addEventListener("click", () => abrirModal(prato));
    menuGrid.appendChild(item);
  });
}

// ============================================
// MODAL
// ============================================
const modalOverlay = document.getElementById("modalOverlay");
const modalImg = document.getElementById("modalImg");
const modalCategory = document.getElementById("modalCategory");
const modalName = document.getElementById("modalName");
const modalDesc = document.getElementById("modalDesc");
const modalPrice = document.getElementById("modalPrice");
const modalClose = document.getElementById("modalClose");

function abrirModal(prato) {
  modalImg.src = prato.url;
  modalImg.alt = prato.nome;
  modalCategory.textContent = prato.categoria;
  modalName.textContent = prato.nome;
  modalDesc.textContent = prato.descricao;
  modalPrice.textContent = prato.valor;
  modalOverlay.classList.add("active");
  document.body.style.overflow = "hidden";
}

function fecharModal() {
  modalOverlay.classList.remove("active");
  document.body.style.overflow = "";
}

modalClose.addEventListener("click", fecharModal);
modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) fecharModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") fecharModal();
});

// ============================================
// ANIMAÇÕES
// ============================================
const style = document.createElement("style");
style.textContent = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;
document.head.appendChild(style);

// ============================================
// INICIALIZAÇÃO
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

  criarItensCardapio();
});
