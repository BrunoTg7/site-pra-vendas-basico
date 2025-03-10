const galeria = document.querySelector(".galeria");
const overlay = document.getElementById("overlay");
const fotoGrande = document.getElementById("foto-grande");
const painelInfo = document.getElementById("painel-info");

window.addEventListener("DOMContentLoaded", () => {
  const fotos = [
    {
      id: 1,
      url: "./img/fotos/images.jpg",
      nome: "Bolo de Cenoura",
      descricao:
        "Um delicioso bolo de cenoura coberto com chocolate. Ideal para um lanche da tarde.",
      valor: "R$ 20,00",
    },
    {
      id: 2,
      url: "./img/fotos/images (1).jpg",
      nome: "Brigadeiro",
      descricao:
        "Docinho brasileiro feito de leite condensado, chocolate e manteiga. Perfeito para festas!",
      valor: "R$ 25,00",
    },
    {
      id: 3,
      url: "./img/fotos/feiju.jpg",
      nome: "Feijoada",
      descricao:
        "Prato típico brasileiro feito com feijão preto e uma variedade de carnes. Acompanhado de arroz, farofa e couve.",
      valor: "R$ 30,00",
    },
    {
      id: 4,
      url: "./img/fotos/moqueca-baiana-de-peixe-com-camarao-4.jpg",
      nome: "Moqueca de Peixe",
      descricao:
        "Um ensopado de peixe com leite de coco, dendê e pimentões. Sabor exótico do Brasil.",
      valor: "R$ 35,00",
    },
    {
      id: 5,
      url: "./img/fotos/KF-Pao-de-Queijorex-jumbo-v2.jpg",
      nome: "Pão de Queijo",
      descricao:
        "Tradicional pãozinho brasileiro feito de polvilho e queijo. Crocante por fora e macio por dentro.",
      valor: "R$ 40,00",
    },
    {
      id: 6,
      url: "./img/fotos/32-6-1024x788.webp",
      nome: "Salmão ao Molho de Maracujá",
      descricao:
        "Salmão grelhado acompanhado de um delicioso molho de maracujá.\nUma combinação perfeita de sabores tropicais.",
      valor: "R$ 50,00",
    },
    {
      id: 7,
      url: "./img/fotos/istock-480262842-1.jpg",
      nome: "Filé Mignon ao Molho Madeira",
      descricao:
        "Filé mignon suculento servido com molho madeira e legumes salteados.\nUma experiência gastronômica requintada.",
      valor: "R$ 70,00",
    },
  ];
  criarCard(fotos);
});

function criarCard(fotos) {
  fotos.forEach((foto) => {
    const card = document.createElement("div");
    card.classList.add("card");
    const img = document.createElement("img");
    img.src = foto.url;
    card.appendChild(img);

    card.addEventListener("click", () => {
      abrirOverlay(foto.url, foto.nome, foto.descricao, foto.valor);
    });

    galeria.appendChild(card);
  });
}

function abrirOverlay(url, nome, descricao, valor) {
  fotoGrande.src = url;
  painelInfo.innerHTML = `
    <div style="text-align: center; margin-top: 110px;">
      <h2 style="margin: 0;">${nome}</h2>
    </div>
    <div style="margin-top: 70px;">
      <p>${descricao.replace(/\n/g, "<br>")}</p><br><br><br>
      <p><strong>Valor:</strong> ${valor}</p>
    </div>`;
  overlay.style.display = "flex";
}

function fecharOverlay() {
  overlay.style.display = "none";
}
