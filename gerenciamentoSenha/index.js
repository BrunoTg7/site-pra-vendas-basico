// Geração de senhas
const gerarSenha = (tamanho) => {
  const caracteres =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()?|/:{}[]=+*-¨`~´";
  let senha = "";
  for (let i = 0; i < tamanho; i++) {
    const indiceAleatorio = Math.floor(Math.random() * caracteres.length);
    senha += caracteres[indiceAleatorio];
  }
  return senha;
};

// Adicionar evento aos botões de geração de senha
document.getElementById("gerar8").addEventListener("click", () => {
  const span = document.querySelector(".mostraSenha span");
  span.textContent = gerarSenha(8); // Gera senha com 8 caracteres
  span.style.display = "inline"; // Mostra o span com a senha
});

document.getElementById("gerar12").addEventListener("click", () => {
  const span = document.querySelector(".mostraSenha span");
  span.textContent = gerarSenha(12); // Gera senha com 12 caracteres
  span.style.display = "inline";
});

document.getElementById("gerar16").addEventListener("click", () => {
  const span = document.querySelector(".mostraSenha span");
  span.textContent = gerarSenha(16); // Gera senha com 16 caracteres
  span.style.display = "inline";
});

// Adicionar inputs dinamicamente para Email/Usuário e Senha
let inputCounter = 1;

document.getElementById("addInputsBtn").addEventListener("click", () => {
  const container = document.getElementById("inputsContainer");

  // Criação dos inputs dinamicamente
  const emailLabel = document.createElement("label");
  emailLabel.setAttribute("for", `emailUser${inputCounter}`);
  emailLabel.innerText = "Email/Usuário:";

  const emailInput = document.createElement("input");
  emailInput.setAttribute("type", "text");
  emailInput.setAttribute("id", `emailUser${inputCounter}`);

  const senhaLabel = document.createElement("label");
  senhaLabel.setAttribute("for", `Senha${inputCounter}`);
  senhaLabel.innerText = "Senha:";

  const senhaInput = document.createElement("input");
  senhaInput.setAttribute("type", "text");
  senhaInput.setAttribute("id", `Senha${inputCounter}`);

  // Adicionando os novos campos ao contêiner
  container.appendChild(emailLabel);
  container.appendChild(emailInput);
  container.appendChild(senhaLabel);
  container.appendChild(senhaInput);

  inputCounter++;
});

// Função para manipular dados no Excel
async function manipularExcelCompartilhado(sharedLink, dados) {
  const tenantId = "f8cdef31-a31e-4b4a-93e4-5f571e91255a";
  const clientId = "c8aa8d75-1943-4d45-b737-b5f9952f8701";
  const clientSecret = "Yvo8Q~ndJ9MulQ5z3CQm6grgqnOsYhWGhG.8Xday";

  try {
    // Obter o Token de Acesso
    const tokenResponse = await fetch(
      `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "client_credentials",
          client_id: clientId,
          client_secret: clientSecret,
          scope: "https://graph.microsoft.com/.default",
        }),
      }
    );

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      throw new Error(
        `Erro ao obter o token: ${tokenResponse.status} - ${errorText}`
      );
    }

    const tokenData = await tokenResponse.json();
    const token = tokenData.access_token;

    // Converter o link compartilhado em shareId
    const shareId = `u!${btoa(sharedLink)}`;
    const fileResponse = await fetch(
      `https://graph.microsoft.com/v1.0/shares/${shareId}/driveItem`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!fileResponse.ok) {
      const errorText = await fileResponse.text();
      throw new Error(
        `Erro ao obter o fileId: ${fileResponse.status} - ${errorText}`
      );
    }

    const fileData = await fileResponse.json();
    const fileId = fileData.id;

    // Salvar os dados no Excel
    const excelResponse = await fetch(
      `https://graph.microsoft.com/v1.0/me/drive/items/${fileId}/workbook/worksheets('Sheet1')/range(address='A1')`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ values: dados }),
      }
    );

    if (!excelResponse.ok) {
      const errorText = await excelResponse.text();
      throw new Error(
        `Erro ao salvar dados no Excel: ${excelResponse.status} - ${errorText}`
      );
    }

    console.log("Dados salvos com sucesso.");
  } catch (error) {
    console.error("Erro:", error.message);
  }
}

// Captura e processa os dados do formulário para salvar no Excel
document.getElementById("excelbtn").addEventListener("click", () => {
  const data = [];
  for (let i = 0; i < inputCounter; i++) {
    const email = document.getElementById(`emailUser${i}`)?.value || "";
    const senha = document.getElementById(`Senha${i}`)?.value || "";
    const date = new Date().toLocaleString(); // Adiciona a data atual

    // Insere os dados em um array
    data.push([email, senha, date]);
  }

  const sharedLink = document.getElementById("sharedLink").value; // Captura o link do Excel
  manipularExcelCompartilhado(sharedLink, data); // Chama a função para salvar os dados
});
