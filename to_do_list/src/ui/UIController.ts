import { AuthService } from "../services/AuthService.js";
import { TaskService } from "../services/TaskService.js";
import { StorageService } from "../services/StorageService.js";
import { ThemeService } from "../services/ThemeService.js";
import { Task } from "../services/StorageService.js";
import { TaskForm, TaskFormData } from "./TaskForm.js";
import { TaskList } from "./TaskList.js";
import { HeaderController } from "./HeaderController.js";

export class UIController {
  private taskForm: TaskForm;
  private taskList: TaskList;
  private logoutTimer: ReturnType<typeof setTimeout> | null = null;
  private headerController!: HeaderController;

  // DOM Elements
  private taskSection: HTMLDivElement | null = null;
  private cookieOverlay: HTMLDivElement | null = null;
  private cookieAcceptBtn: HTMLButtonElement | null = null;

  constructor() {
    const listaContainer = document.querySelector<HTMLDivElement>(".lista");
    const toDoListContainer = document.querySelector<HTMLDivElement>(".toDoList");

    if (!listaContainer || !toDoListContainer) {
      throw new Error("Required DOM elements not found");
    }

    this.taskForm = new TaskForm(
      listaContainer,
      this.handleSaveTasks.bind(this),
      this.handleCancelTaskForm.bind(this)
    );

    this.taskList = new TaskList(toDoListContainer);
    this.taskList.setCallbacks(
      this.handleTaskSelectionChange.bind(this),
      this.handleTaskRemove.bind(this),
      this.handleTaskUpdate.bind(this),
      this.handleTaskToggleComplete.bind(this),
      this.handleBulkAction.bind(this),
      this.handleSearch.bind(this),
      this.handleFilterTag.bind(this),
      this.handleTaskReorder.bind(this),
      this.handleGoBack.bind(this),
      this.handleEditTask.bind(this)
    );

    document.addEventListener("clearSelection", ((e: CustomEvent) => {
      this.handleClearSelection(e.detail.date);
    }) as EventListener);

    this.initDOMReferences();
    this.initHeaderController();
    this.bindEvents();
    this.checkSession();
  }

  private initHeaderController(): void {
    this.headerController = new HeaderController(
      () => this.handleExport(),
      () => this.handleImport(),
      () => this.handleLogout()
    );
  }

  private initDOMReferences(): void {
    this.taskSection = document.querySelector(".tarefa");
    this.cookieOverlay = document.getElementById("overlay") as HTMLDivElement;
    this.cookieAcceptBtn = document.querySelector(".cookies-btn2") as HTMLButtonElement;

    if (this.taskSection) {
      this.taskSection.style.display = "none";
    }
  }

  private bindEvents(): void {
    const addTaskBtn = document.getElementById("gerarList");
    if (addTaskBtn) {
      addTaskBtn.addEventListener("click", () => this.taskForm.show());
    }

    const clearListBtn = document.getElementById("limparLista");
    if (clearListBtn) {
      clearListBtn.addEventListener("click", this.handleClearList.bind(this));
    }

    if (this.cookieAcceptBtn) {
      this.cookieAcceptBtn.addEventListener("click", this.handleCookieAccept.bind(this));
    }

    // Keyboard shortcuts
    document.addEventListener("keydown", (e) => {
      // Don't trigger shortcuts when typing in inputs
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
        if (e.key === "Escape") {
          this.taskForm.remove();
        }
        return;
      }

      switch (e.key) {
        case "Escape":
          this.taskForm.remove();
          break;
        case "n":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            this.taskForm.show();
          }
          break;
        case "/":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            const searchInput = document.querySelector(".task-search-input") as HTMLInputElement;
            if (searchInput) searchInput.focus();
          }
          break;
        case "e":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            ThemeService.toggle();
          }
          break;
        case "s":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            this.handleExport();
          }
          break;
      }
    });
  }

  private checkSession(): void {
    if (AuthService.isSessionValid()) {
      this.showTaskSection();
      this.startLogoutTimer();
      this.loadTaskDates();
    } else {
      AuthService.logout();
      window.location.href = "index.html";
    }
  }

  private handleLogout(): void {
    this.stopLogoutTimer();
    AuthService.logout();
    window.location.href = "index.html";
  }

  private showTaskSection(): void {
    if (this.taskSection) this.taskSection.style.display = "flex";
  }

  private startLogoutTimer(): void {
    this.stopLogoutTimer();
    const remainingTime = AuthService.getRemainingSessionTime();
    if (remainingTime > 0) {
      this.logoutTimer = setTimeout(() => {
        alert("Sessão expirada! Você será deslogado.");
        this.handleLogout();
      }, remainingTime);
    }
  }

  private stopLogoutTimer(): void {
    if (this.logoutTimer) {
      clearTimeout(this.logoutTimer);
      this.logoutTimer = null;
    }
  }

  private loadTaskDates(): void {
    const email = AuthService.getCurrentUserEmail();
    if (!email) return;

    const dates = TaskService.getOrderedDates(email);
    const toDoListContainer = document.querySelector<HTMLDivElement>(".toDoList");
    if (!toDoListContainer) return;

    toDoListContainer.innerHTML = "";

    if (dates.length === 0) {
      const emptyState = document.createElement("p");
      emptyState.className = "empty-state";
      emptyState.textContent = "Nenhuma tarefa cadastrada ainda.";
      toDoListContainer.appendChild(emptyState);
      return;
    }

    const datesList = document.createElement("div");
    datesList.className = "dates-list";

    dates.forEach((date) => {
      const dateButton = document.createElement("button");
      dateButton.textContent = `Tarefas de ${date}`;
      dateButton.className = "dateButton";

      dateButton.addEventListener("click", () => {
        const tasks = TaskService.getTasksForDate(email, date);
        this.taskList.showDateHeader(date);
        this.taskList.renderTasks(tasks);
      });

      datesList.appendChild(dateButton);
    });

    toDoListContainer.appendChild(datesList);
  }

  private handleGoBack(): void {
    this.loadTaskDates();
  }

  private handleEditTask(task: Task): void {
    this.taskForm.showForEdit(task);
  }

  private handleSaveTasks(data: TaskFormData): void {
    const email = AuthService.getCurrentUserEmail();
    if (!email) {
      alert("Erro: Usuário não encontrado!");
      return;
    }

    if (data.editTaskId) {
      const currentDate = this.taskList.getCurrentDate();
      if (currentDate && data.tasks.length > 0) {
        if (data.date !== currentDate) {
          TaskService.moveTaskToDate(
            email,
            currentDate,
            data.editTaskId,
            data.date,
            data.timestamp
          );
        } else {
          TaskService.updateTask(email, currentDate, data.editTaskId, {
            lista: data.tasks[0],
            timestamp: data.timestamp,
            tags: data.tags,
          });
        }
      }

      alert("Tarefa atualizada.");
      this.taskForm.remove();
      this.loadTaskDates();

      if (data.date !== currentDate) {
        const tasks = TaskService.getTasksForDate(email, data.date);
        this.taskList.showDateHeader(data.date);
        this.taskList.renderTasks(tasks);
      }
      this.checkEmptyList();
      return;
    }

    TaskService.saveTasks(email, data.dates, data.tasks, data.timestamp, data.tags);

    const dayCount = data.dates.length;
    if (dayCount === 1) {
      alert(
        data.tasks.length === 1
          ? `Tarefa salva para ${data.date}: ${data.tasks[0]}`
          : `${data.tasks.length} tarefas salvas para ${data.date}.`
      );
    } else {
      alert(
        `${data.tasks.length} tarefa${data.tasks.length > 1 ? "s" : ""} salva${data.tasks.length > 1 ? "s" : ""} para ${dayCount} dias.`
      );
    }

    this.taskForm.remove();
    this.loadTaskDates();
    this.checkEmptyList();
  }

  private handleCancelTaskForm(): void {
    this.taskForm.remove();
    this.checkEmptyList();
  }

  private checkEmptyList(): void {
    const listaContainer = document.querySelector<HTMLDivElement>(".lista");
    const clearListBtn = document.getElementById("limparLista");

    if (listaContainer && clearListBtn) {
      const hasInputs = listaContainer.querySelectorAll("input").length > 0;
      if (!hasInputs) {
        listaContainer.style.display = "none";
        clearListBtn.style.display = "none";
      }
    }
  }

  private handleClearList(): void {
    const listaContainer = document.querySelector<HTMLDivElement>(".lista");
    const clearListBtn = document.getElementById("limparLista");

    if (listaContainer) {
      listaContainer.innerHTML = "";
      listaContainer.style.display = "none";
    }
    if (clearListBtn) {
      clearListBtn.style.display = "none";
    }
  }

  private handleTaskSelectionChange(task: Task, selected: boolean): void {
    const email = AuthService.getCurrentUserEmail();
    const currentDate = this.taskList.getCurrentDate();
    if (!email || !currentDate) return;

    const tasks = TaskService.getTasksForDate(email, currentDate);
    const taskIndex = tasks.findIndex(t => t.id === task.id);
    if (taskIndex >= 0) {
      tasks[taskIndex].selecao = selected;
      TaskService.updateTasksForDate(email, currentDate, tasks);
    }
  }

  private handleTaskRemove(taskId: string): void {
    const email = AuthService.getCurrentUserEmail();
    const currentDate = this.taskList.getCurrentDate();
    if (!email || !currentDate) return;

    const removed = TaskService.removeTask(email, currentDate, taskId);
    if (removed) {
      const tasks = TaskService.getTasksForDate(email, currentDate);
      if (tasks.length === 0) {
        TaskService.removeDate(email, currentDate);
        this.loadTaskDates();
      } else {
        this.taskList.renderTasks(tasks);
      }
    }
  }

  private handleTaskUpdate(taskId: string, updates: Partial<Task>): void {
    const email = AuthService.getCurrentUserEmail();
    const currentDate = this.taskList.getCurrentDate();
    if (!email || !currentDate) return;

    TaskService.updateTask(email, currentDate, taskId, updates);
    const tasks = TaskService.getTasksForDate(email, currentDate);
    this.taskList.renderTasks(tasks);
  }

  private handleTaskToggleComplete(taskId: string): void {
    const email = AuthService.getCurrentUserEmail();
    const currentDate = this.taskList.getCurrentDate();
    if (!email || !currentDate) return;

    TaskService.toggleComplete(email, currentDate, taskId);
    const tasks = TaskService.getTasksForDate(email, currentDate);
    this.taskList.renderTasks(tasks);
  }

  private async handleBulkAction(action: "move" | "copy", targetISO: string): Promise<void> {
    const email = AuthService.getCurrentUserEmail();
    const currentDate = this.taskList.getCurrentDate();
    if (!email || !currentDate) return;

    const result = action === "move"
      ? TaskService.moveOrCopyTasks(email, currentDate, targetISO, false)
      : TaskService.moveOrCopyTasks(email, currentDate, targetISO, true);

    if (!result.success) {
      alert(result.error || "Erro ao processar ação");
      return;
    }

    const moveDateInput = document.querySelector(".task-move-date") as HTMLInputElement;
    if (moveDateInput) {
      moveDateInput.value = "";
    }

    this.loadTaskDates();

    const resultTargetDate = result.targetDateValue;
    const dateToShow = result.removedOrigin && resultTargetDate ? resultTargetDate : currentDate;
    const tasksToShow = result.removedOrigin && resultTargetDate
      ? (result.userStorage?.[resultTargetDate] || [])
      : TaskService.getTasksForDate(email, dateToShow);

    if (tasksToShow.length > 0) {
      this.taskList.showDateHeader(dateToShow);
      this.taskList.renderTasks(tasksToShow);
    }

    const message = result.transferredCount === 1
      ? `${action === "move" ? "Tarefa movida" : "Tarefa copiada"} para ${result.targetDateValue}.`
      : `${result.transferredCount} tarefas ${action === "move" ? "movidas" : "copiadas"} para ${result.targetDateValue}.`;

    alert(message);
  }

  private handleClearSelection(date: string): void {
    const email = AuthService.getCurrentUserEmail();
    if (!email) return;

    TaskService.clearSelection(email, date);
    const tasks = TaskService.getTasksForDate(email, date);
    this.taskList.renderTasks(tasks);
  }

  private handleSearch(query: string): void {
    this.taskList.setSearchQuery(query);
  }

  private handleFilterTag(tag: string | null): void {
    this.taskList.setFilterTag(tag);
  }

  private handleCookieAccept(): void {
    StorageService.setCookieConsent();
    if (this.cookieOverlay) {
      this.cookieOverlay.classList.remove("amostrar");
    }
  }

  private handleTaskReorder(taskId: string, newIndex: number): void {
    const email = AuthService.getCurrentUserEmail();
    const currentDate = this.taskList.getCurrentDate();
    if (!email || !currentDate) return;

    const tasks = TaskService.getTasksForDate(email, currentDate);
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex !== -1 && taskIndex !== newIndex) {
      const [movedTask] = tasks.splice(taskIndex, 1);
      tasks.splice(newIndex, 0, movedTask);
      TaskService.updateTasksForDate(email, currentDate, tasks);
    }
  }

  private handleExport(): void {
    const email = AuthService.getCurrentUserEmail();
    if (!email) {
      alert("Usuário não encontrado");
      return;
    }
    TaskService.downloadExport(email);
  }

  private handleImport(): void {
    const email = AuthService.getCurrentUserEmail();
    if (!email) {
      alert("Usuário não encontrado");
      return;
    }

    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.style.display = "none";
    input.addEventListener("change", async () => {
      const result = await TaskService.triggerImportFile(input, email);
      if (result.success) {
        alert(`${result.importedCount} tarefas importadas com sucesso!`);
        this.loadTaskDates();
        const currentDate = this.taskList.getCurrentDate();
        if (currentDate) {
          const tasks = TaskService.getTasksForDate(email, currentDate);
          this.taskList.showDateHeader(currentDate);
          this.taskList.renderTasks(tasks);
        }
      } else {
        alert(result.error || "Erro ao importar");
      }
      input.remove();
    });
    document.body.appendChild(input);
    input.click();
  }
}