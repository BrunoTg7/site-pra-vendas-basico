let logoutTimer;

// Constants for localStorage keys
const STORAGE_KEYS = {
  USER_CREDENTIALS: "user_credentials_v1",
  USER_TASKS: "user_tasks_v1",
  LOGIN_TIME: "login_time",
  COOKIE_CONSENT: "cookie_consent",
};

// Password hashing utilities using Web Crypto API
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    data,
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );
  const hash = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    256
  );
  const hashArray = new Uint8Array(hash);
  const combined = new Uint8Array(salt.length + hashArray.length);
  combined.set(salt);
  combined.set(hashArray, salt.length);
  return btoa(String.fromCharCode(...combined));
}

async function verifyPassword(password, storedHash) {
  try {
    const combined = new Uint8Array(
      atob(storedHash)
        .split("")
        .map((c) => c.charCodeAt(0))
    );
    const salt = combined.slice(0, 16);
    const storedHashBytes = combined.slice(16);
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      data,
      { name: "PBKDF2" },
      false,
      ["deriveBits"]
    );
    const hash = await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt,
        iterations: 100000,
        hash: "SHA-256",
      },
      keyMaterial,
      256
    );
    const hashArray = new Uint8Array(hash);
    return hashArray.length === storedHashBytes.length &&
      hashArray.every((val, i) => val === storedHashBytes[i]);
  } catch {
    return false;
  }
}

// Password validation
function validatePassword(password) {
  const errors = [];
  if (password.length < 8) errors.push("Mínimo 8 caracteres");
  if (!/[A-Z]/.test(password)) errors.push("Pelo menos 1 maiúscula");
  if (!/[a-z]/.test(password)) errors.push("Pelo menos 1 minúscula");
  if (!/[0-9]/.test(password)) errors.push("Pelo menos 1 número");
  if (!/[^A-Za-z0-9]/.test(password)) errors.push("Pelo menos 1 símbolo");
  return { valid: errors.length === 0, errors };
}

// Quando o DOM estiver carregado
document.addEventListener("DOMContentLoaded", () => {
  verificarTempoDeSessao();
  const cadastroBtn = document.getElementById("cadastro");
  if (cadastroBtn) cadastroBtn.addEventListener("click", cadastroSalvo);
  const logarBtn = document.getElementById("logar");
  if (logarBtn) logarBtn.addEventListener("click", loginSalvo);
});

// Função para realizar o cadastro
async function cadastroSalvo() {
  console.log("Botão cadastro clicado");
  const senha = document.getElementById("senha1").value;
  const confirmarSenha = document.getElementById("confirmarSenha")?.value || "";
  const email = document.getElementById("email1").value;

  const validation = validatePassword(senha);
  if (!validation.valid) {
    alert("Senha fraca:\n- " + validation.errors.join("\n- "));
    return;
  }

  if (senha !== confirmarSenha) {
    alert("As senhas não coincidem");
    return;
  }

  const hashedPassword = await hashPassword(senha);

  const cadastro = {
    senha: hashedPassword,
    email: email,
  };
  localStorage.setItem(STORAGE_KEYS.USER_CREDENTIALS, btoa(JSON.stringify(cadastro)));
  console.log("Dados salvos no localStorage (hashed)");

  alert("Cadastro realizado com sucesso!");

  verificarTempoDeSessao();
  window.location.href = "tarefas.html";
}

async function loginSalvo() {
  console.log("Botão login clicado");
  const senha = document.getElementById("senha").value;
  const email = document.getElementById("email").value;
  console.log("Email digitado:", email);

  let login;
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.USER_CREDENTIALS);
    login = stored ? JSON.parse(atob(stored)) : {};
  } catch (e) {
    console.error("Erro ao decodificar os dados do login:", e);
    login = {};
  }

  const passwordMatch = await verifyPassword(senha, login.senha || "");

  if (login.email === email && passwordMatch) {
    console.log("Login válido, redirecionando...");
    const now = new Date();
    localStorage.setItem(STORAGE_KEYS.LOGIN_TIME, now.toISOString());

    alert("Login realizado com sucesso!");

    verificarTempoDeSessao();
    window.location.href = "tarefas.html";
  } else {
    console.log("Login inválido");
    alert("Credenciais inválidas. Tente novamente.");
  }
}

// Função para verificar se a sessão está válida
function verificarTempoDeSessao() {
  const loginTime = localStorage.getItem(STORAGE_KEYS.LOGIN_TIME);
  const login = localStorage.getItem(STORAGE_KEYS.USER_CREDENTIALS);

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

      if (window.location.pathname.endsWith("tarefas.html")) {
        const loginEl = document.querySelector(".login");
        if (loginEl) loginEl.style.display = "none";
        const cadastroEl = document.querySelector(".cadastro");
        if (cadastroEl) cadastroEl.style.display = "none";
        tarefa();
      } else {
        window.location.href = "tarefas.html";
      }
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
  const tarefaEl = document.querySelector(".tarefa");
  if (tarefaEl) {
    tarefaEl.style.display = "none";
  }

  localStorage.removeItem(STORAGE_KEYS.LOGIN_TIME);

  if (window.location.pathname.endsWith("tarefas.html")) {
    window.location.href = "index.html";
  }
}

const tarefa = () => {
  const tarefas = document.querySelector(".tarefa");
  if (!tarefas) return; // Proteção se não estiver na página certa
  tarefas.style.display = "flex";

  // Evento para adicionar tarefa
  document.getElementById("gerarList").addEventListener("click", () => {
    const lista = document.querySelector(".lista");
    const limparListaButton = document.getElementById("limparLista");
    lista.style.display = "flex";
    limparListaButton.style.display = "inline-block";

    if (lista.querySelector(".task-form")) {
      const firstInput = lista.querySelector(".task-form input[type='text']");
      if (firstInput) firstInput.focus();
      return;
    }

    const idCounter = Date.now();
    const formContainer = document.createElement("div");
    formContainer.className = "task-form";
    formContainer.id = `task-form-${idCounter}`;

    const dateInput = document.createElement("input");
    dateInput.type = "date";
    dateInput.placeholder = "Selecione a data";
    dateInput.id = `date-${idCounter}`;
    dateInput.addEventListener("focus", () => {
      if (typeof dateInput.showPicker === "function") {
        dateInput.showPicker();
      }
    });

    const tasksWrapper = document.createElement("div");
    tasksWrapper.className = "task-inputs";

    const createTaskRow = ({ showAdd = false, allowRemove = false } = {}) => {
      const row = document.createElement("div");
      row.className = "task-input-row";

      const input = document.createElement("input");
      input.type = "text";
      input.placeholder = "Digite a Tarefa...";
      row.appendChild(input);

      if (showAdd) {
        const addButton = document.createElement("button");
        addButton.type = "button";
        addButton.className = "add-task-btn";
        addButton.title = "Adicionar outra tarefa para esta data";
        addButton.textContent = "+";
        addButton.addEventListener("click", () => {
          const newRow = createTaskRow({ allowRemove: true });
          tasksWrapper.appendChild(newRow);
          const newInput = newRow.querySelector("input");
          if (newInput) newInput.focus();
        });
        row.appendChild(addButton);
      }

      if (allowRemove) {
        const removeButton = document.createElement("button");
        removeButton.type = "button";
        removeButton.className = "remove-task-btn";
        removeButton.title = "Remover esta tarefa";
        removeButton.textContent = "\u2212";
        removeButton.addEventListener("click", () => {
          row.remove();
        });
        row.appendChild(removeButton);
      }

      return row;
    };

    tasksWrapper.appendChild(createTaskRow({ showAdd: true }));

    const saveButton = document.createElement("button");
    saveButton.textContent = "Salvar";
    saveButton.type = "button";
    saveButton.id = `save-${idCounter}`;

    saveButton.addEventListener("click", () => {
      if (!dateInput.value) {
        alert("Selecione uma data antes de salvar.");
        dateInput.focus();
        return;
      }

      const taskInputs = Array.from(
        tasksWrapper.querySelectorAll("input[type='text']")
      );
      const taskValues = taskInputs
        .map((input) => input.value.trim())
        .filter((value) => value.length > 0);

      if (taskValues.length === 0) {
        alert("Adicione pelo menos uma tarefa para salvar.");
        const firstInput = taskInputs[0];
        if (firstInput) firstInput.focus();
        return;
      }

      const fullDate = new Date(dateInput.value + "T00:00");
      if (Number.isNaN(fullDate.getTime())) {
        alert("Data inválida. Escolha uma data válida.");
        dateInput.focus();
        return;
      }

      const dateValue = `${fullDate.getDate().toString().padStart(2, "0")}/${(
        fullDate.getMonth() + 1
      )
        .toString()
        .padStart(2, "0")}`;

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

      let rawDataString =
        localStorage.getItem(STORAGE_KEYS.USER_TASKS) || btoa(JSON.stringify({}));
      let storage = JSON.parse(atob(rawDataString)) || {};

      if (!storage[email]) {
        storage[email] = {};
      }

      if (!storage[email][dateValue]) {
        storage[email][dateValue] = [];
      }

      taskValues.forEach((taskValue) => {
        storage[email][dateValue].push({
          lista: taskValue,
          selecao: false,
          data: dateValue,
        });
      });

      localStorage.setItem(STORAGE_KEYS.USER_TASKS, btoa(JSON.stringify(storage)));

      console.log(
        `Tarefas salvas (${taskValues.length}) para ${email} no dia ${dateValue}`
      );

      alert(
        taskValues.length === 1
          ? `Tarefa salva para ${dateValue}: ${taskValues[0]}`
          : `${taskValues.length} tarefas salvas para ${dateValue}.`
      );

      atualizarLista();
      formContainer.remove();
      verificarListaVazia();
    });

    formContainer.appendChild(dateInput);
    formContainer.appendChild(tasksWrapper);
    formContainer.appendChild(saveButton);

    lista.appendChild(formContainer);
    dateInput.focus();
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

function obterContextoDeTarefas() {
  const rawDataString = localStorage.getItem(STORAGE_KEYS.USER_TASKS);
  const loginDataString = localStorage.getItem(STORAGE_KEYS.USER_CREDENTIALS);

  if (!rawDataString || !loginDataString) {
    console.warn("Contexto de tarefas indisponível no localStorage.");
    return null;
  }

  try {
    const rawData = JSON.parse(atob(rawDataString)) || {};
    const loginData = JSON.parse(atob(loginDataString)) || {};

    if (!loginData.email) {
      console.warn("Não foi possível identificar o email do usuário logado.");
      return null;
    }

    if (!rawData[loginData.email]) {
      rawData[loginData.email] = {};
    }

    return {
      rawData,
      email: loginData.email,
      userStorage: rawData[loginData.email],
    };
  } catch (error) {
    console.error(
      "Erro ao interpretar dados de tarefas do localStorage.",
      error
    );
    return null;
  }
}

function atualizarLista() {
  const toDoList = document.querySelector(".toDoList");
  if (!toDoList) return;

  toDoList.innerHTML = "";

  const contexto = obterContextoDeTarefas();

  if (!contexto || !contexto.userStorage) {
    const emptyState = document.createElement("p");
    emptyState.className = "empty-state";
    emptyState.textContent = "Nenhuma tarefa cadastrada ainda.";
    toDoList.appendChild(emptyState);
    return;
  }

  const storage = contexto.userStorage;

  const dates = Object.keys(storage);

  if (dates.length === 0) {
    const emptyState = document.createElement("p");
    emptyState.className = "empty-state";
    emptyState.textContent = "Nenhuma tarefa cadastrada ainda.";
    toDoList.appendChild(emptyState);
    return;
  }

  const orderedDates = dates.sort((a, b) => {
    const [dayA, monthA] = a.split("/").map(Number);
    const [dayB, monthB] = b.split("/").map(Number);
    if (monthA !== monthB) return monthA - monthB;
    return dayA - dayB;
  });

  orderedDates.forEach((date) => {
    const dateButton = document.createElement("button");
    dateButton.textContent = `Tarefas de ${date}`;
    dateButton.className = "dateButton";

    dateButton.addEventListener("click", () => {
      const tasks = storage[date];
      exibirTarefasDoDia(date, tasks);
    });

    toDoList.appendChild(dateButton);
  });
}
function exibirTarefasDoDia(date, tasks) {
  const toDoList = document.querySelector(".toDoList");

  const previousTasks = toDoList.querySelectorAll(
    ".toDoItem, .dateHeader, .task-action-bar, .emptyTasksMessage"
  );
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

  if (!tasks || tasks.length === 0) {
    const emptyState = document.createElement("p");
    emptyState.className = "emptyTasksMessage";
    emptyState.textContent = "Nenhuma tarefa cadastrada para esta data.";
    toDoList.appendChild(emptyState);
    return;
  }

  const actionBar = document.createElement("div");
  actionBar.className = "task-action-bar";

  const actionInfo = document.createElement("span");
  actionInfo.className = "task-action-info";
  actionInfo.textContent = "Selecione tarefas e escolha uma nova data:";

  const moveDateInput = document.createElement("input");
  moveDateInput.type = "date";
  moveDateInput.className = "task-move-date";
  moveDateInput.title = "Nova data para as tarefas selecionadas";
  moveDateInput.placeholder = "dd/mm/aaaa";
  moveDateInput.setAttribute(
    "aria-label",
    "Escolha a nova data para as tarefas"
  );
  moveDateInput.addEventListener("focus", () => {
    if (typeof moveDateInput.showPicker === "function") {
      moveDateInput.showPicker();
    }
  });

  const buttonsGroup = document.createElement("div");
  buttonsGroup.className = "task-action-buttons";

  const moveButton = document.createElement("button");
  moveButton.type = "button";
  moveButton.className = "bulk-action-btn bulk-action-move";
  moveButton.textContent = "Mover selecionadas";

  const copyButton = document.createElement("button");
  copyButton.type = "button";
  copyButton.className = "bulk-action-btn bulk-action-copy";
  copyButton.textContent = "Copiar";

  const clearButton = document.createElement("button");
  clearButton.type = "button";
  clearButton.className = "bulk-action-btn bulk-action-clear";
  clearButton.textContent = "Limpar seleção";

  buttonsGroup.append(moveButton, copyButton, clearButton);
  actionBar.append(actionInfo, moveDateInput, buttonsGroup);
  toDoList.appendChild(actionBar);

  const updateBulkActionState = () => {
    const hasSelection = tasks.some((task) => task.selecao);
    const hasDate = Boolean(moveDateInput.value);
    moveButton.disabled = !hasSelection || !hasDate;
    copyButton.disabled = !hasSelection || !hasDate;
    clearButton.disabled = !hasSelection;
  };

  moveDateInput.addEventListener("input", updateBulkActionState);
  moveDateInput.addEventListener("change", updateBulkActionState);

  moveButton.addEventListener("click", () => {
    const result = moverOuCopiarTarefas(date, moveDateInput.value, {
      copy: false,
    });

    if (!result.success) {
      return;
    }

    const message =
      result.transferredCount === 1
        ? `Tarefa movida para ${result.targetDateValue}.`
        : `${result.transferredCount} tarefas movidas para ${result.targetDateValue}.`;

    moveDateInput.value = "";
    updateBulkActionState();
    atualizarLista();

    const dateToShow = result.removedOrigin ? result.targetDateValue : date;

    const tasksToShow =
      result.userStorage[dateToShow] && result.userStorage[dateToShow].length
        ? result.userStorage[dateToShow]
        : null;

    if (tasksToShow) {
      exibirTarefasDoDia(dateToShow, tasksToShow);
    }

    alert(message);
  });

  copyButton.addEventListener("click", () => {
    const result = moverOuCopiarTarefas(date, moveDateInput.value, {
      copy: true,
    });

    if (!result.success) {
      return;
    }

    const message =
      result.transferredCount === 1
        ? `Tarefa copiada para ${result.targetDateValue}.`
        : `${result.transferredCount} tarefas copiadas para ${result.targetDateValue}.`;

    moveDateInput.value = "";
    atualizarLista();

    const tasksToShow = result.userStorage[date] || [];
    exibirTarefasDoDia(date, tasksToShow);

    alert(message);
  });

  clearButton.addEventListener("click", () => {
    const hasSelection = tasks.some((task) => task.selecao);
    if (!hasSelection) return;
    tasks.forEach((task) => {
      task.selecao = false;
    });
    salvarTarefasNoLocalStorage(date, tasks);
    exibirTarefasDoDia(date, tasks);
  });

  // Exibe as tarefas daquela data
  tasks.forEach((task, index) => {
    const { lista, selecao } = task;

    const item = document.createElement("div");
    item.className = "toDoItem";
    if (selecao) {
      item.classList.add("selected-task");
    }

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = selecao;
    checkbox.addEventListener("change", () => {
      task.selecao = checkbox.checked;
      item.classList.toggle("selected-task", checkbox.checked);
      salvarTarefasNoLocalStorage(date, tasks);
      updateBulkActionState();
    });

    const span = document.createElement("span");
    span.textContent = lista;

    const removerButton = document.createElement("button");
    removerButton.textContent = "Remover";
    removerButton.addEventListener("click", () => {
      tasks.splice(index, 1);
      if (tasks.length === 0) {
        removerData(date);
      } else {
        salvarTarefasNoLocalStorage(date, tasks);
        exibirTarefasDoDia(date, tasks);
      }
    });

    item.appendChild(checkbox);
    item.appendChild(span);
    item.appendChild(removerButton);

    toDoList.appendChild(item);
  });

  updateBulkActionState();
}

function moverOuCopiarTarefas(date, targetISO, { copy = false } = {}) {
  if (!targetISO) {
    alert("Selecione uma data de destino.");
    return { success: false };
  }

  const contexto = obterContextoDeTarefas();
  if (!contexto) {
    alert("Não foi possível acessar as tarefas salvas.");
    return { success: false };
  }

  const { rawData, email, userStorage } = contexto;
  const sourceTasks = userStorage[date];

  if (!sourceTasks || sourceTasks.length === 0) {
    alert("Não há tarefas para mover nesta data.");
    return { success: false };
  }

  const selectedTasks = sourceTasks
    .map((task, index) => ({ task, index }))
    .filter(({ task }) => task.selecao);

  if (selectedTasks.length === 0) {
    alert("Selecione pelo menos uma tarefa.");
    return { success: false };
  }

  const fullDate = new Date(targetISO + "T00:00");
  if (Number.isNaN(fullDate.getTime())) {
    alert("Data de destino inválida.");
    return { success: false };
  }

  const targetDateValue = `${fullDate.getDate().toString().padStart(2, "0")}/${(
    fullDate.getMonth() + 1
  )
    .toString()
    .padStart(2, "0")}`;

  if (!copy && targetDateValue === date) {
    alert("As tarefas já estão cadastradas nesta data.");
    return { success: false };
  }

  if (!userStorage[targetDateValue]) {
    userStorage[targetDateValue] = [];
  }

  const tasksToTransfer = selectedTasks.map(({ task }) => ({
    ...task,
    data: targetDateValue,
    selecao: false,
  }));

  userStorage[targetDateValue].push(...tasksToTransfer);

  let removedOrigin = false;

  if (copy) {
    sourceTasks.forEach((task) => {
      task.selecao = false;
    });
  } else {
    const indexesToRemove = new Set(selectedTasks.map(({ index }) => index));
    userStorage[date] = sourceTasks.filter(
      (_, index) => !indexesToRemove.has(index)
    );

    if (userStorage[date].length === 0) {
      delete userStorage[date];
      removedOrigin = true;
    } else {
      userStorage[date].forEach((task) => {
        task.selecao = false;
      });
    }
  }

  const encoded = btoa(JSON.stringify(rawData));
  localStorage.setItem(STORAGE_KEYS.USER_TASKS, encoded);

  return {
    success: true,
    targetDateValue,
    removedOrigin,
    userStorage,
    transferredCount: tasksToTransfer.length,
  };
}

function removerData(date) {
  let rawDataString = localStorage.getItem(STORAGE_KEYS.USER_TASKS);
  if (!rawDataString) {
    console.warn("Nenhum dado encontrado no localStorage.");
    return;
  }

  try {
    let storage = JSON.parse(atob(rawDataString)) || {};
    const loginData =
      JSON.parse(atob(localStorage.getItem(STORAGE_KEYS.USER_CREDENTIALS))) || {};
    const email = loginData.email;

    if (email && storage[email]) {
      delete storage[email][date]; // Remove todas as tarefas do dia

      // Se não houver mais tarefas para esse usuário, exclui completamente os dados
      if (Object.keys(storage[email]).length === 0) {
        delete storage[email];
      }

      localStorage.setItem(STORAGE_KEYS.USER_TASKS, btoa(JSON.stringify(storage)));
      console.log(`Todas as tarefas de ${date} foram removidas.`);
    } else {
      console.warn(`Nenhuma tarefa encontrada para ${email} na data ${date}.`);
    }

    // Atualiza a interface para remover os elementos visuais da lista
    atualizarLista();
  } catch (e) {
    console.error("Erro ao interpretar os dados do armazenamento local:", e);
  }
}

function salvarTarefasNoLocalStorage(date, tasks) {
  const rawDataString = localStorage.getItem(STORAGE_KEYS.USER_TASKS);
  if (!rawDataString) {
    console.warn("Nenhum dado encontrado no localStorage.");
    return;
  }

  try {
    let storage = JSON.parse(atob(rawDataString)) || {};
    const loginData =
      JSON.parse(atob(localStorage.getItem(STORAGE_KEYS.USER_CREDENTIALS))) || {};
    const email = loginData.email;

    if (email && storage[email]) {
      storage[email][date] = tasks; // Atualiza as tarefas daquela data
      localStorage.setItem(STORAGE_KEYS.USER_TASKS, btoa(JSON.stringify(storage)));
      console.log(`Tarefas do dia ${date} foram atualizadas para ${email}`);
    } else {
      console.warn(`Nenhum espaço encontrado para o email ${email}`);
    }
  } catch (e) {
    console.error("Erro ao interpretar os dados do armazenamento local:", e);
  }
}

const sairBtn = document.getElementById("sair");
if (sairBtn) {
  sairBtn.addEventListener("click", () => {
    deslogarUsuario();
  });
}

var div = document.getElementById("overlay");

function verificarCookies() {
  localStorage.setItem("cookieConsent", "accepted");
  div.classList.remove("amostrar");
}

if (localStorage.getItem("cookieConsent") === "accepted") {
  div.classList.remove("amostrar");
} else {
  div.classList.add("amostrar");
}

document
  .querySelector(".cookies-btn2")
  .addEventListener("click", verificarCookies);
