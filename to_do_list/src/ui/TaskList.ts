import { Task } from "../services/StorageService.js";
import { TaskService, MoveCopyResult } from "../services/TaskService.js";

type TaskSelectionChangeCallback = (task: Task, selected: boolean) => void;
type TaskRemoveCallback = (taskId: string) => void;
type TaskUpdateCallback = (taskId: string, updates: Partial<Task>) => void;
type TaskToggleCompleteCallback = (taskId: string) => void;
type BulkActionCallback = (action: "move" | "copy", targetDate: string) => void;
type SearchCallback = (query: string) => void;
type FilterTagCallback = (tag: string | null) => void;

type TaskReorderCallback = (taskId: string, newIndex: number) => void;
type GoBackCallback = () => void;
type EditTaskCallback = (task: Task) => void;

export class TaskList {
  private container: HTMLElement;
  private currentDate: string | null = null;
  private tasks: Task[] = [];
  private filteredTasks: Task[] = [];
  private onSelectionChange?: TaskSelectionChangeCallback;
  private onTaskRemove?: TaskRemoveCallback;
  private onTaskUpdate?: TaskUpdateCallback;
  private onTaskToggleComplete?: TaskToggleCompleteCallback;
  private onBulkAction?: BulkActionCallback;
  private onSearch?: SearchCallback;
  private onFilterTag?: FilterTagCallback;
  private onTaskReorder?: TaskReorderCallback;
  private onGoBack?: GoBackCallback;
  private onEditTask?: EditTaskCallback;
  private moveDateInput: HTMLInputElement | null = null;
  private actionInfo: HTMLSpanElement | null = null;
  private moveButton: HTMLButtonElement | null = null;
  private copyButton: HTMLButtonElement | null = null;
  private clearButton: HTMLButtonElement | null = null;
  private searchInput: HTMLInputElement | null = null;
  private filterTagSelect: HTMLSelectElement | null = null;
  private editingTaskId: string | null = null;
  private draggedItem: HTMLElement | null = null;
  private dragOverItem: HTMLElement | null = null;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  setCallbacks(
    onSelectionChange?: TaskSelectionChangeCallback,
    onTaskRemove?: TaskRemoveCallback,
    onTaskUpdate?: TaskUpdateCallback,
    onTaskToggleComplete?: TaskToggleCompleteCallback,
    onBulkAction?: BulkActionCallback,
    onSearch?: SearchCallback,
    onFilterTag?: FilterTagCallback,
    onTaskReorder?: TaskReorderCallback,
    onGoBack?: GoBackCallback,
    onEditTask?: EditTaskCallback
  ): void {
    this.onSelectionChange = onSelectionChange;
    this.onTaskRemove = onTaskRemove;
    this.onTaskUpdate = onTaskUpdate;
    this.onTaskToggleComplete = onTaskToggleComplete;
    this.onBulkAction = onBulkAction;
    this.onSearch = onSearch;
    this.onFilterTag = onFilterTag;
    this.onTaskReorder = onTaskReorder;
    this.onGoBack = onGoBack;
    this.onEditTask = onEditTask;
  }

  showDateHeader(date: string): void {
    this.clearTasksOnly();
    this.currentDate = date;

    const previousHeaders = this.container.querySelectorAll(".date-header-wrapper");
    previousHeaders.forEach((el) => el.remove());

    const allDateButtons = this.container.querySelectorAll<HTMLButtonElement>(".dateButton");
    allDateButtons.forEach((btn) => {
      btn.style.display = "";
    });
    const currentButton = Array.from(allDateButtons).find((btn) =>
      btn.textContent?.includes(date)
    );
    if (currentButton) {
      currentButton.style.display = "none";
    }

    const headerWrapper = document.createElement("div");
    headerWrapper.className = "date-header-wrapper";

    const headerRow = document.createElement("div");
    headerRow.className = "date-header-row";

    const dateHeader = document.createElement("h3");
    dateHeader.textContent = `Tarefas para ${date}:`;
    dateHeader.className = "dateHeader";

    const backButton = document.createElement("button");
    backButton.type = "button";
    backButton.className = "back-btn";
    backButton.textContent = "\u2190 Voltar";
    backButton.addEventListener("click", () => {
      if (this.onGoBack) this.onGoBack();
    });

    headerRow.appendChild(dateHeader);
    headerRow.appendChild(backButton);

    this.createSearchAndFilter();

    headerWrapper.appendChild(headerRow);
    headerWrapper.appendChild(this.searchInput!);
    headerWrapper.appendChild(this.filterTagSelect!);
    this.container.appendChild(headerWrapper);
  }

  private createSearchAndFilter(): void {
    this.searchInput = document.createElement("input");
    this.searchInput.type = "search";
    this.searchInput.className = "task-search-input";
    this.searchInput.placeholder = "Buscar tarefas...";
    this.searchInput.setAttribute("aria-label", "Buscar tarefas");
    this.searchInput.addEventListener("input", (e) => {
      const query = (e.target as HTMLInputElement).value;
      if (this.onSearch) {
        this.onSearch(query);
      }
    });

    this.filterTagSelect = document.createElement("select");
    this.filterTagSelect.className = "task-filter-tag";
    this.filterTagSelect.setAttribute("aria-label", "Filtrar por tag");
    this.filterTagSelect.addEventListener("change", (e) => {
      const tag = (e.target as HTMLSelectElement).value || null;
      if (this.onFilterTag) {
        this.onFilterTag(tag);
      }
    });
  }

  updateFilterTags(tags: string[]): void {
    if (!this.filterTagSelect) return;
    const currentValue = this.filterTagSelect.value;
    this.filterTagSelect.innerHTML = '<option value="">Todas as tags</option>';
    tags.forEach(tag => {
      const option = document.createElement("option");
      option.value = tag;
      option.textContent = tag;
      this.filterTagSelect!.appendChild(option);
    });
    this.filterTagSelect.value = currentValue;
  }

  private createActionBar(): void {
    const actionBar = document.createElement("div");
    actionBar.className = "task-action-bar";

    const actionInfo = document.createElement("span");
    actionInfo.className = "task-action-info";
    actionInfo.textContent = "Marque as tarefas e escolha uma nova data:";
    this.actionInfo = actionInfo;

    this.moveDateInput = document.createElement("input");
    this.moveDateInput.type = "date";
    this.moveDateInput.className = "task-move-date";
    this.moveDateInput.title = "Nova data para as tarefas selecionadas";
    this.moveDateInput.setAttribute(
      "aria-label",
      "Escolha a nova data para as tarefas"
    );
    this.moveDateInput.addEventListener("focus", () => {
      if (typeof this.moveDateInput!.showPicker === "function") {
        this.moveDateInput!.showPicker();
      }
    });

    const buttonsGroup = document.createElement("div");
    buttonsGroup.className = "task-action-buttons";

    this.moveButton = document.createElement("button");
    this.moveButton.type = "button";
    this.moveButton.className = "bulk-action-btn bulk-action-move";
    this.moveButton.textContent = "Mover selecionadas";
    this.moveButton.disabled = true;
    this.moveButton.addEventListener("click", () => {
      if (this.moveDateInput?.value && this.onBulkAction) {
        this.onBulkAction("move", this.moveDateInput.value);
      }
    });

    this.copyButton = document.createElement("button");
    this.copyButton.type = "button";
    this.copyButton.className = "bulk-action-btn bulk-action-copy";
    this.copyButton.textContent = "Copiar";
    this.copyButton.disabled = true;
    this.copyButton.addEventListener("click", () => {
      if (this.moveDateInput?.value && this.onBulkAction) {
        this.onBulkAction("copy", this.moveDateInput.value);
      }
    });

    this.clearButton = document.createElement("button");
    this.clearButton.type = "button";
    this.clearButton.className = "bulk-action-btn bulk-action-clear";
    this.clearButton.textContent = "Limpar seleção";
    this.clearButton.disabled = true;
    this.clearButton.addEventListener("click", () => {
      if (this.onSelectionChange && this.currentDate) {
        const event = new CustomEvent("clearSelection", { detail: { date: this.currentDate } });
        document.dispatchEvent(event);
      }
    });

    buttonsGroup.append(this.moveButton, this.copyButton, this.clearButton);
    actionBar.append(actionInfo, this.moveDateInput, buttonsGroup);
    this.container.appendChild(actionBar);

    this.moveDateInput.addEventListener("input", () => this.updateBulkActionState());
    this.moveDateInput.addEventListener("change", () => this.updateBulkActionState());
  }

  private searchQuery: string = "";
  private filterTag: string | null = null;

  private updateBulkActionState(): void {
    const selectedCount = this.tasks.filter((task) => task.selecao).length;
    const hasSelection = selectedCount > 0;
    const hasDate = Boolean(this.moveDateInput?.value);

    if (this.actionInfo) {
      this.actionInfo.textContent = hasSelection
        ? `${selectedCount} tarefa${selectedCount > 1 ? "s" : ""} selecionada${selectedCount > 1 ? "s" : ""}. Escolha a nova data:`
        : "Marque as tarefas e escolha uma nova data:";
    }

    if (this.moveButton) this.moveButton.disabled = !hasSelection || !hasDate;
    if (this.copyButton) this.copyButton.disabled = !hasSelection || !hasDate;
    if (this.clearButton) this.clearButton.disabled = !hasSelection;
  }

  private applyFilters(): void {
    this.filteredTasks = this.tasks.filter(task => {
      const matchesSearch = this.searchQuery === "" ||
        task.lista.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        task.tags.some(tag => tag.toLowerCase().includes(this.searchQuery.toLowerCase()));
      const matchesTag = this.filterTag === null || task.tags.includes(this.filterTag);
      return matchesSearch && matchesTag;
    });
  }

  renderTasks(tasks: Task[]): void {
    this.tasks = tasks;
    this.applyFilters();
    this.clearTasksOnly();

    const allTags = [...new Set(tasks.flatMap(t => t.tags))];
    this.updateFilterTags(allTags);

    if (this.filteredTasks.length === 0) {
      const emptyState = document.createElement("p");
      emptyState.className = "emptyTasksMessage";
      emptyState.textContent = this.searchQuery || this.filterTag
        ? "Nenhuma tarefa encontrada com este filtro."
        : "Nenhuma tarefa cadastrada para esta data.";
      this.container.appendChild(emptyState);
      this.updateBulkActionState();
      return;
    }

    this.createActionBar();

    this.filteredTasks.forEach((task) => {
      const item = this.createTaskElement(task);
      this.container.appendChild(item);
    });

    this.updateBulkActionState();
  }

  setSearchQuery(query: string): void {
    this.searchQuery = query;
    this.applyFilters();
    this.rerenderFiltered();
  }

  setFilterTag(tag: string | null): void {
    this.filterTag = tag;
    this.applyFilters();
    this.rerenderFiltered();
  }

  private rerenderFiltered(): void {
    const taskItems = this.container.querySelectorAll(".toDoItem");
    taskItems.forEach(item => item.remove());

    this.filteredTasks.forEach((task) => {
      const item = this.createTaskElement(task);
      this.container.appendChild(item);
    });

    this.updateBulkActionState();
  }

  private createTaskElement(task: Task): HTMLElement {
    const item = document.createElement("div");
    item.className = "toDoItem";
    item.dataset.taskId = task.id;
    item.draggable = true;
    if (task.selecao) {
      item.classList.add("selected-task");
    }
    if (task.completed) {
      item.classList.add("completed");
    }

    this.addDragEvents(item, task);

    item.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;
      if (target.closest("input, button, a, select, textarea")) return;
      task.selecao = !task.selecao;
      item.classList.toggle("selected-task", task.selecao);
      if (this.onSelectionChange) {
        this.onSelectionChange(task, task.selecao);
      }
      this.updateBulkActionState();
    });

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "task-checkbox";
    checkbox.checked = task.selecao;
    checkbox.addEventListener("change", () => {
      task.selecao = checkbox.checked;
      item.classList.toggle("selected-task", checkbox.checked);
      if (this.onSelectionChange) {
        this.onSelectionChange(task, task.selecao);
      }
      this.updateBulkActionState();
    });

    const contentWrapper = document.createElement("div");
    contentWrapper.className = "task-content";

    const span = document.createElement("span");
    span.className = "task-text";
    span.textContent = task.lista;
    span.addEventListener("dblclick", () => this.startInlineEdit(task, span));

    const metaWrapper = document.createElement("div");
    metaWrapper.className = "task-meta";

    if (task.timestamp) {
      const timeEl = document.createElement("time");
      timeEl.className = "task-time";
      timeEl.textContent = this.formatTime(task.timestamp);
      metaWrapper.appendChild(timeEl);
    }

    if (task.tags && task.tags.length > 0) {
      const tagsWrapper = document.createElement("div");
      tagsWrapper.className = "task-tags";
      task.tags.forEach(tag => {
        const tagEl = document.createElement("span");
        tagEl.className = "task-tag";
        tagEl.textContent = tag;
        tagsWrapper.appendChild(tagEl);
      });
      metaWrapper.appendChild(tagsWrapper);
    }

    contentWrapper.appendChild(span);
    if (metaWrapper.children.length > 0) {
      contentWrapper.appendChild(metaWrapper);
    }

    const actionsWrapper = document.createElement("div");
    actionsWrapper.className = "task-actions";

    const completeButton = document.createElement("button");
    completeButton.type = "button";
    completeButton.className = "task-action-btn complete-btn";
    completeButton.title = task.completed ? "Reabrir tarefa" : "Marcar como concluída";
    completeButton.textContent = "\u2713";
    completeButton.addEventListener("click", () => {
      task.completed = !task.completed;
      item.classList.toggle("completed", task.completed);
      completeButton.title = task.completed ? "Reabrir tarefa" : "Marcar como concluída";
      if (this.onTaskToggleComplete) {
        this.onTaskToggleComplete(task.id);
      }
    });

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "task-action-btn edit-btn";
    editButton.title = "Editar (texto, data e horário)";
    editButton.textContent = "\u270F\uFE0F";
    editButton.addEventListener("click", () => {
      if (this.onEditTask) {
        this.onEditTask(task);
      }
    });

    const removerButton = document.createElement("button");
    removerButton.type = "button";
    removerButton.className = "task-action-btn remove-btn";
    removerButton.title = "Remover";
    removerButton.textContent = "\uD83D\uDDD1\uFE0F";
    removerButton.addEventListener("click", () => {
      if (confirm(`Remover tarefa: "${task.lista}"?`)) {
        if (this.onTaskRemove) {
          this.onTaskRemove(task.id);
        }
      }
    });

    actionsWrapper.appendChild(completeButton);
    actionsWrapper.appendChild(editButton);
    actionsWrapper.appendChild(removerButton);

    item.appendChild(checkbox);
    item.appendChild(contentWrapper);
    item.appendChild(actionsWrapper);

    return item;
  }

  private addDragEvents(item: HTMLElement, task: Task): void {
    item.addEventListener("dragstart", (e) => {
      this.draggedItem = item;
      item.classList.add("dragging");
      e.dataTransfer!.effectAllowed = "move";
      e.dataTransfer!.setData("text/plain", task.id);
    });

    item.addEventListener("dragend", () => {
      item.classList.remove("dragging");
      this.draggedItem = null;
      this.dragOverItem = null;
      document.querySelectorAll(".drag-over").forEach(el => el.classList.remove("drag-over"));
    });

    item.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.dataTransfer!.dropEffect = "move";
      const target = e.currentTarget as HTMLElement;
      if (target !== this.draggedItem) {
        this.dragOverItem = target;
        target.classList.add("drag-over");
      }
    });

    item.addEventListener("dragleave", (e) => {
      const target = e.currentTarget as HTMLElement;
      if (!target.contains(e.relatedTarget as Node)) {
        target.classList.remove("drag-over");
      }
    });

    item.addEventListener("drop", (e) => {
      e.preventDefault();
      const target = e.currentTarget as HTMLElement;
      target.classList.remove("drag-over");
      const targetId = target.dataset.taskId;
      const sourceId = this.draggedItem?.dataset.taskId;
      if (sourceId && targetId && sourceId !== targetId) {
        const sourceIndex = this.filteredTasks.findIndex(t => t.id === sourceId);
        const targetIndex = this.filteredTasks.findIndex(t => t.id === targetId);
        if (sourceIndex !== -1 && targetIndex !== -1) {
          const [movedTask] = this.filteredTasks.splice(sourceIndex, 1);
          this.filteredTasks.splice(targetIndex, 0, movedTask);
          // Also update main tasks array
          const mainSourceIndex = this.tasks.findIndex(t => t.id === sourceId);
          const mainTargetIndex = this.tasks.findIndex(t => t.id === targetId);
          if (mainSourceIndex !== -1 && mainTargetIndex !== -1) {
            const [mainMovedTask] = this.tasks.splice(mainSourceIndex, 1);
            this.tasks.splice(mainTargetIndex, 0, mainMovedTask);
            if (this.onTaskReorder) {
              this.onTaskReorder(sourceId, mainTargetIndex);
            }
            this.rerenderFiltered();
          }
        }
      }
    });
  }

  private startInlineEdit(task: Task, spanElement: HTMLElement): void {
    if (this.editingTaskId) return;
    this.editingTaskId = task.id;

    const input = document.createElement("input");
    input.type = "text";
    input.className = "task-edit-input";
    input.value = task.lista;
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        this.finishInlineEdit(task.id, input.value.trim());
      } else if (e.key === "Escape") {
        this.cancelInlineEdit(task.lista);
      }
    });
    input.addEventListener("blur", () => {
      this.finishInlineEdit(task.id, input.value.trim());
    });

    spanElement.replaceWith(input);
    input.focus();
    input.select();
  }

  private finishInlineEdit(taskId: string, newText: string): void {
    if (!newText) {
      this.cancelInlineEdit(this.tasks.find(t => t.id === taskId)?.lista || "");
      return;
    }
    if (this.onTaskUpdate) {
      this.onTaskUpdate(taskId, { lista: newText });
    }
    this.editingTaskId = null;
  }

  private cancelInlineEdit(originalText: string): void {
    this.editingTaskId = null;
    // Re-render will restore original text
    this.renderTasks(this.tasks);
  }

  private formatTime(isoString: string): string {
    const date = new Date(isoString);
    return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  }

  private clearTasksOnly(): void {
    const elementsToRemove = this.container.querySelectorAll(
      ".toDoItem, .task-action-bar, .emptyTasksMessage"
    );
    elementsToRemove.forEach((el) => el.remove());
  }

  clear(): void {
    this.container.innerHTML = "";
    this.currentDate = null;
    this.tasks = [];
    this.editingTaskId = null;
  }

  getCurrentDate(): string | null {
    return this.currentDate;
  }
}