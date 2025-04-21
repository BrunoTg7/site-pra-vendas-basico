let logoutTimer;

// Quando o DOM estiver carregado
document.addEventListener("DOMContentLoaded", () => {
  verificarTempoDeSessao();
  document.getElementById("cadastro").addEventListener("click", cadastroSalvo);
  document.getElementById("logar").addEventListener("click", loginSalvo);
});

// Função para realizar o cadastro
function cadastroSalvo() {
  const senha = document.getElementById("senha1").value;
  const email = document.getElementById("email1").value;

  const cadastro = {
    senha: senha,
    email: email,
  };
  localStorage.setItem("5s51d2a30as5f", btoa(JSON.stringify(cadastro)));
  alert("Cadastro realizado com sucesso!");
  document.querySelector(".cadastro").style.display = "none";
  document.querySelector(".login").style.display = "none";
  verificarTempoDeSessao();
}

function loginSalvo() {
  const senha = document.getElementById("senha").value;
  const email = document.getElementById("email").value;

  let login;
  try {
    login = JSON.parse(atob(localStorage.getItem("5s51d2a30as5f"))) || {};
  } catch {
    console.error("Erro ao decodificar os dados do login:", e);
    login = {};
  }

  if (login.email === email && login.senha === senha) {
    const now = new Date();
    localStorage.setItem("loginTime", now.toISOString());

    alert("Login realizado com sucesso!");
    document.querySelector(".login").style.display = "none";
    document.querySelector(".cadastro").style.display = "none";
    verificarTempoDeSessao();
  } else {
    alert("Credenciais inválidas. Tente novamente.");
  }
}

// Função para verificar se a sessão está válida
function verificarTempoDeSessao() {
  const loginTime = localStorage.getItem("loginTime");
  const login = localStorage.getItem("5s51d2a30as5f");

  if (login && loginTime) {
    const loginDate = new Date(loginTime);
    const now = new Date();
    const diff = now - loginDate;
    const timeout = 30 * 60 * 1000; // 30 minutos

    if (diff > timeout) {
      alert("Sessão expirada! Por favor, faça login novamente.");
      deslogarUsuario();
    } else {
      iniciarTimerDeLogout(timeout - diff);

      document.querySelector(".login").style.display = "none";
      document.querySelector(".cadastro").style.display = "none";
      tarefa();
    }
  } else {
    deslogarUsuario();
  }
}

// Função para iniciar o timer de logout
function iniciarTimerDeLogout(tempoRestante) {
  clearTimeout(logoutTimer);

  logoutTimer = setTimeout(() => {
    alert("Sessão expirada! Você será deslogado.");
    deslogarUsuario();
  }, tempoRestante);
}

// Função para deslogar o usuário
function deslogarUsuario() {
  localStorage.removeItem("loginTime");

  document.querySelector(".login").style.display = "flex";
  document.querySelector(".cadastro").style.display = "flex";
  document.querySelector(".tarefa").style.display = "none";
}

const tarefa = () => {
  const tarefas = document.querySelector(".tarefa");
  tarefas.style.display = "flex";
  tarefas.innerHTML = `
        <button id="gerarList" type="button">Adicionar Tarefa</button>
        <button id="limparLista" type="button" style="display: none;">Limpar Lista</button>
        <div class="lista" style="display: none"></div>
        <div class="toDoList"></div>
      `;
  // Evento para adicionar tarefa
  document.getElementById("gerarList").addEventListener("click", () => {
    const lista = document.querySelector(".lista");
    const limparListaButton = document.getElementById("limparLista");
    lista.style.display = "flex"; // Mostra a div lista
    limparListaButton.style.display = "inline-block"; // Mostra o botão de limpar

    const idCounter = new Date().getTime(); // Gera IDs únicos baseados no timestamp

    const dateInput = document.createElement("input");
    dateInput.type = "date"; // Alterado para exibir um calendário
    dateInput.placeholder = "Selecione a data";
    dateInput.id = `date-${idCounter}`;

    // Input para adicionar a tarefa
    const taskInput = document.createElement("input");
    taskInput.type = "text";
    taskInput.placeholder = "Digite a Tarefa...";
    taskInput.id = `task-${idCounter}`;

    // Botão para salvar a tarefa
    const saveButton = document.createElement("button");
    saveButton.textContent = "Salvar";
    saveButton.type = "button";
    saveButton.id = `save-${idCounter}`;

    dateInput.addEventListener("change", () => {
      const fullDate = new Date(dateInput.value);
      const formattedDate = `${fullDate
        .getDate()
        .toString()
        .padStart(2, "0")}/${(fullDate.getMonth() + 1)
        .toString()
        .padStart(2, "0")}`;

      console.log("Data formatada:", formattedDate); // Exemplo: "21/04"
    });
    saveButton.addEventListener("click", () => {
      const dateInput = document.getElementById(`date-${idCounter}`);
      const taskInput = document.getElementById(`task-${idCounter}`);

      if (!dateInput || !taskInput) {
        alert("Erro: Campos de data ou tarefa não encontrados.");
        return;
      }

      const dateValue = dateInput.value;
      const taskValue = taskInput.value;

      // Validação: verifica se a data está no formato correto DD/MM
      const dateRegex = /^\d{2}\/\d{2}$/;
      if (!dateValue || !dateRegex.test(dateValue) || dateValue.length !== 5) {
        alert(
          "Por favor, insira uma data válida no formato DD/MM (Ex: 01/01)."
        );
        return;
      }

      // Verifica se a tarefa foi preenchida
      if (!taskValue) {
        alert("Por favor, preencha a tarefa antes de salvar.");
        return;
      }

      const loginDataString = localStorage.getItem("5s51d2a30as5f");
      if (!loginDataString) {
        alert("Erro: Usuário não encontrado!");
        return;
      }

      const loginData = JSON.parse(atob(loginDataString)) || {};
      const email = loginData.email;

      if (!email) {
        console.warn("Erro: Nenhum email encontrado no login.");
        return;
      }

      // Obtendo e validando armazenamento de tarefas
      let rawDataString =
        localStorage.getItem("gjs5s4c1a24ss4d") || btoa(JSON.stringify({}));
      let storage = JSON.parse(atob(rawDataString)) || {};

      // Garante que existe um espaço reservado para este usuário
      if (!storage[email]) {
        storage[email] = {};
      }

      // Garante que existe um espaço para a data
      if (!storage[email][dateValue]) {
        storage[email][dateValue] = [];
      }

      // Adiciona a nova tarefa
      storage[email][dateValue].push({
        lista: taskValue,
        selecao: false,
        data: dateValue,
      });

      // Salva no localStorage
      localStorage.setItem("gjs5s4c1a24ss4d", btoa(JSON.stringify(storage)));

      console.log(`Tarefa salva com sucesso para ${email} no dia ${dateValue}`);

      alert(`Tarefa salva para ${dateValue}: ${taskValue}`);
      atualizarLista();

      // Remove os inputs e o botão após salvar
      dateInput.remove();
      taskInput.remove();
      saveButton.remove();

      verificarListaVazia();
    });
    lista.appendChild(dateInput);
    lista.appendChild(taskInput);
    lista.appendChild(saveButton);
    lista.appendChild(document.createElement("br"));
  });

  // Evento para limpar todos os elementos da lista
  document.getElementById("limparLista").addEventListener("click", () => {
    const lista = document.querySelector(".lista");
    lista.innerHTML = ""; // Remove todos os filhos da div .lista
    lista.style.display = "none"; // Oculta a div .lista
    document.getElementById("limparLista").style.display = "none"; // Oculta o botão de limpar
  });

  atualizarLista();
};

function verificarListaVazia() {
  const lista = document.querySelector(".lista");
  const limparListaButton = document.getElementById("limparLista");
  // Verifica se há algum elemento filho do tipo "input" ou outros
  const hasInputs = lista.querySelectorAll("input").length > 0;

  // Se não houver elementos (inputs ou botões), esconde a div
  if (!hasInputs) {
    lista.style.display = "none";
    limparListaButton.style.display = "none";
  }
}

function atualizarLista() {
  const toDoList = document.querySelector(".toDoList");
  toDoList.innerHTML = ""; // Limpa a área de botões de datas

  let storage = {};
  const rawDataString = localStorage.getItem("gjs5s4c1a24ss4d");
  const loginDataString = localStorage.getItem("5s51d2a30as5f");

  if (rawDataString && loginDataString) {
    try {
      const rawData = JSON.parse(atob(rawDataString)) || {};
      const loginData = JSON.parse(atob(loginDataString)) || {};

      if (loginData.email) {
        if (rawData[loginData.email]) {
          storage = rawData[loginData.email];
        } else {
          console.warn(
            `O email "${loginData.email}" não tem tarefas associadas.`
          );
        }
      } else {
        console.warn("O login não contém um email válido.");
      }
    } catch (e) {
      console.error("Erro ao interpretar os dados do armazenamento local.", e);
    }
  } else {
    console.warn("Nenhum dado encontrado no localStorage.");
  }

  // **Verifique se há tarefas para evitar erro ao iterar**
  if (Object.keys(storage).length === 0) {
    console.warn("Nenhuma tarefa para exibir.");
    return;
  }

  // Cria botões para cada dia/mês
  for (const date in storage) {
    if (storage.hasOwnProperty(date)) {
      const dateButton = document.createElement("button");
      dateButton.textContent = `Tarefas de ${date}`;
      dateButton.className = "dateButton";

      // Evento para exibir as tarefas associadas à data
      dateButton.addEventListener("click", () => {
        const tasks = storage[date];
        exibirTarefasDoDia(date, tasks); // Exibe as tarefas da data clicada
      });

      toDoList.appendChild(dateButton);
    }
  }
}
function exibirTarefasDoDia(date, tasks) {
  const toDoList = document.querySelector(".toDoList");

  const previousTasks = toDoList.querySelectorAll(".toDoItem, .dateHeader");
  previousTasks.forEach((task) => task.remove());

  const allDateButtons = toDoList.querySelectorAll(".dateButton");
  allDateButtons.forEach((button) => {
    if (button.style.display === "none") {
      button.style.display = "inline-block"; // Torna visível novamente
    }
  });

  // Oculta o botão clicado
  const currentButton = Array.from(allDateButtons).find((button) =>
    button.textContent.includes(date)
  );
  if (currentButton) {
    currentButton.style.display = "none"; // Esconde o botão da data clicada
  }

  // Adiciona o cabeçalho para a data selecionada
  const dateHeader = document.createElement("h3");
  dateHeader.textContent = `Tarefas para ${date}:`;
  dateHeader.className = "dateHeader";
  toDoList.appendChild(dateHeader);

  // Exibe as tarefas daquela data
  tasks.forEach((task, index) => {
    const { lista, selecao } = task;

    const item = document.createElement("div");
    item.className = "toDoItem";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = selecao;
    checkbox.addEventListener("change", () => {
      task.selecao = checkbox.checked; // Atualiza o estado
      salvarTarefasNoLocalStorage(date, tasks); // Passa os argumentos corretos
    });

    const span = document.createElement("span");
    span.textContent = lista;

    const removerButton = document.createElement("button");
    removerButton.textContent = "Remover";
    removerButton.addEventListener("click", () => {
      tasks.splice(index, 1); // Remove a tarefa da lista
      if (tasks.length === 0) {
        removerData(date); // Remove a data se não houver mais tarefas
      } else {
        salvarTarefasNoLocalStorage(date, tasks); // Atualiza o localStorage
        exibirTarefasDoDia(date, tasks); // Atualiza a interface
      }
    });

    item.appendChild(checkbox);
    item.appendChild(span);
    item.appendChild(removerButton);

    toDoList.appendChild(item);
  });
}

function removerData(date) {
  let storage = {};
  try {
    storage = JSON.parse(atob(localStorage.getItem("gjs5s4c1a24ss4d"))) || {};
  } catch {
    console.error("Erro ao carregar as tarefas:", e);
  }

  // Remove a data do storage
  delete storage[date];
  localStorage.setItem("gjs5s4c1a24ss4d", btoa(JSON.stringify(storage)));

  // Atualiza a interface
  atualizarLista();
}

function salvarTarefasNoLocalStorage(date, tasks) {
  const rawDataString = localStorage.getItem("gjs5s4c1a24ss4d");
  if (!rawDataString) {
    console.warn("Nenhum dado encontrado no localStorage.");
    return;
  }

  try {
    let storage = JSON.parse(atob(rawDataString)) || {};
    const loginData =
      JSON.parse(atob(localStorage.getItem("5s51d2a30as5f"))) || {};
    const email = loginData.email;

    if (email && storage[email]) {
      storage[email][date] = tasks; // Atualiza as tarefas daquela data
      localStorage.setItem("gjs5s4c1a24ss4d", btoa(JSON.stringify(storage)));
      console.log(`Tarefas do dia ${date} foram atualizadas para ${email}`);
    } else {
      console.warn(`Nenhum espaço encontrado para o email ${email}`);
    }
  } catch (e) {
    console.error("Erro ao interpretar os dados do armazenamento local:", e);
  }
}

document.getElementById("sair").addEventListener("click", () => {
  deslogarUsuario();
});
