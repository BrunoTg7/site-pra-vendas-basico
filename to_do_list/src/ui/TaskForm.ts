import { formatDateForStorage } from "../utils/date.js";
import { Task } from "../services/StorageService.js";

export interface TaskFormData {
  date: string;
  dates: string[];
  timestamp: string;
  tasks: string[];
  tags: string[];
  editTaskId?: string;
}

export class TaskForm {
  private container: HTMLElement;
  private onSave: (data: TaskFormData) => void;
  private onCancel: () => void;
  private formElement: HTMLDivElement | null = null;
  private taskCounter = 0;
  private editTaskId: string | null = null;

  constructor(
    container: HTMLElement,
    onSave: (data: TaskFormData) => void,
    onCancel: () => void
  ) {
    this.container = container;
    this.onSave = onSave;
    this.onCancel = onCancel;
  }

  show(): void {
    this.editTaskId = null;
    this.buildForm();
  }

  showForEdit(task: Task): void {
    this.editTaskId = task.id;
    this.buildForm();

    const form = this.formElement;
    if (!form) return;

    const dateTimeInput = form.querySelector<HTMLInputElement>(
      "input[type='datetime-local']"
    );
    if (dateTimeInput) {
      const [day, month] = task.data.split("/").map(Number);
      const time = task.timestamp ? new Date(task.timestamp) : new Date();
      const local = new Date(
        new Date().getFullYear(),
        month - 1,
        day,
        time.getHours(),
        time.getMinutes()
      );
      local.setMinutes(local.getMinutes() - local.getTimezoneOffset());
      dateTimeInput.value = local.toISOString().slice(0, 16);
    }

    const tagsInput = form.querySelector<HTMLInputElement>(".tags-input");
    if (tagsInput) tagsInput.value = task.tags.join(", ");

    const firstTaskInput = form.querySelector<HTMLInputElement>(
      ".task-input-row input[type='text']"
    );
    if (firstTaskInput) firstTaskInput.value = task.lista;
  }

  private buildForm(): void {
    if (this.formElement) {
      const firstInput = this.formElement.querySelector<HTMLInputElement>(
        'input[type="text"]'
      );
      if (firstInput) firstInput.focus();
      return;
    }

    this.container.style.display = "flex";
    const clearListBtn = document.getElementById("limparLista");
    if (clearListBtn) {
      clearListBtn.style.display = "inline-block";
    }

    this.taskCounter = Date.now();
    this.formElement = this.createForm();
    this.container.appendChild(this.formElement);

    const dateTimeInput = this.formElement.querySelector<HTMLInputElement>(
      'input[type="datetime-local"]'
    );
    if (dateTimeInput) dateTimeInput.focus();
  }

  private createForm(): HTMLDivElement {
    const formContainer = document.createElement("div");
    formContainer.className = "task-form";
    formContainer.id = `task-form-${this.taskCounter}`;

    const dateTimeInput = document.createElement("input");
    dateTimeInput.type = "datetime-local";
    dateTimeInput.id = `datetime-${this.taskCounter}`;
    dateTimeInput.addEventListener("focus", () => {
      if (typeof dateTimeInput.showPicker === "function") {
        dateTimeInput.showPicker();
      }
    });
    // Set default to now
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    dateTimeInput.value = now.toISOString().slice(0, 16);

    const dateExtras = document.createElement("div");
    dateExtras.className = "form-dates";

    const createExtraDateRow = (): HTMLDivElement => {
      const row = document.createElement("div");
      row.className = "form-date-row";

      const extraInput = document.createElement("input");
      extraInput.type = "datetime-local";

      const removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.className = "remove-task-btn";
      removeBtn.title = "Remover este dia";
      removeBtn.textContent = "\u2212";
      removeBtn.addEventListener("click", () => row.remove());

      row.appendChild(extraInput);
      row.appendChild(removeBtn);
      return row;
    };

    const addDateButton = document.createElement("button");
    addDateButton.type = "button";
    addDateButton.className = "add-day-btn";
    addDateButton.textContent = "+ Adicionar outro dia";
    addDateButton.addEventListener("click", () => {
      const row = createExtraDateRow();
      dateExtras.appendChild(row);
      const input = row.querySelector<HTMLInputElement>("input");
      if (input) input.focus();
    });

    const weeklyToggleRow = document.createElement("label");
    weeklyToggleRow.className = "weekly-toggle";
    const weeklyToggle = document.createElement("input");
    weeklyToggle.type = "checkbox";
    weeklyToggle.className = "weekly-repeat-toggle";
    const weeklyLabel = document.createElement("span");
    weeklyLabel.textContent = "Repetir toda semana";
    weeklyToggleRow.appendChild(weeklyToggle);
    weeklyToggleRow.appendChild(weeklyLabel);

    const weekdaysContainer = document.createElement("div");
    weekdaysContainer.className = "weekdays";
    weekdaysContainer.style.display = "none";
    const weekdayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    const weekdayChecks: HTMLInputElement[] = [];
    weekdayNames.forEach((name, dayIndex) => {
      const label = document.createElement("label");
      label.className = "weekday-chip";
      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.value = String(dayIndex);
      const span = document.createElement("span");
      span.textContent = name;
      label.appendChild(cb);
      label.appendChild(span);
      weekdayChecks.push(cb);
      weekdaysContainer.appendChild(label);
    });

    weeklyToggle.addEventListener("change", () => {
      weekdaysContainer.style.display = weeklyToggle.checked ? "flex" : "none";
    });

    const tagsInput = document.createElement("input");
    tagsInput.type = "text";
    tagsInput.placeholder = "Tags (separadas por vírgula, ex: trabalho, urgente)";
    tagsInput.className = "tags-input";

    const tasksWrapper = document.createElement("div");
    tasksWrapper.className = "task-inputs";

    const createTaskRow = (
      options: { showAdd?: boolean; allowRemove?: boolean } = {}
    ): HTMLDivElement => {
      const row = document.createElement("div");
      row.className = "task-input-row";

      const input = document.createElement("input");
      input.type = "text";
      input.placeholder = "Digite a Tarefa...";
      row.appendChild(input);

      if (options.showAdd) {
        const addButton = document.createElement("button");
        addButton.type = "button";
        addButton.className = "add-task-btn";
        addButton.title = "Adicionar outra tarefa para esta data/hora";
        addButton.textContent = "+";
        addButton.addEventListener("click", () => {
          const newRow = createTaskRow({ allowRemove: true });
          tasksWrapper.appendChild(newRow);
          const newInput = newRow.querySelector<HTMLInputElement>("input");
          if (newInput) newInput.focus();
        });
        row.appendChild(addButton);
      }

      if (options.allowRemove) {
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
    saveButton.id = `save-${this.taskCounter}`;

    saveButton.addEventListener("click", () => {
      const allDateInputs = [
        dateTimeInput,
        ...Array.from(
          dateExtras.querySelectorAll<HTMLInputElement>("input[type='datetime-local']")
        ),
      ];

      const dates: string[] = [];
      for (const input of allDateInputs) {
        if (!input.value) {
          alert("Preencha todas as datas ou remova os dias extras.");
          input.focus();
          return;
        }
        const dateTime = new Date(input.value);
        if (Number.isNaN(dateTime.getTime())) {
          alert("Data/hora inválida. Escolha uma data/hora válida.");
          input.focus();
          return;
        }
        const dateValue = formatDateForStorage(dateTime);
        if (!dates.includes(dateValue)) {
          dates.push(dateValue);
        }
      }

      if (weeklyToggle.checked) {
        const selectedWeekdays = weekdayChecks
          .filter((cb) => cb.checked)
          .map((cb) => Number(cb.value));
        if (selectedWeekdays.length > 0) {
          const base = new Date(dateTimeInput.value);
          for (let offset = 1; offset <= 28; offset++) {
            const day = new Date(base.getTime() + offset * 86400000);
            if (selectedWeekdays.includes(day.getDay())) {
              const dateValue = formatDateForStorage(day);
              if (!dates.includes(dateValue)) {
                dates.push(dateValue);
              }
            }
          }
        }
      }

      const taskInputs = Array.from(
        tasksWrapper.querySelectorAll<HTMLInputElement>("input[type='text']")
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

      const timestamp = new Date(dateTimeInput.value).toISOString();

      const tags = tagsInput.value
        .split(",")
        .map(t => t.trim())
        .filter(t => t.length > 0);

      this.onSave({
        date: dates[0],
        dates,
        timestamp,
        tasks: taskValues,
        tags,
        editTaskId: this.editTaskId ?? undefined,
      });
      this.remove();
    });

    const cancelButton = document.createElement("button");
    cancelButton.textContent = "Cancelar";
    cancelButton.type = "button";
    cancelButton.className = "bulk-action-btn bulk-action-clear";
    cancelButton.style.marginLeft = "0.5rem";
    cancelButton.addEventListener("click", () => {
      this.onCancel();
      this.remove();
    });

    const buttonGroup = document.createElement("div");
    buttonGroup.style.display = "flex";
    buttonGroup.style.gap = "0.5rem";
    buttonGroup.appendChild(saveButton);
    buttonGroup.appendChild(cancelButton);

    formContainer.appendChild(dateTimeInput);
    formContainer.appendChild(addDateButton);
    formContainer.appendChild(dateExtras);
    formContainer.appendChild(weeklyToggleRow);
    formContainer.appendChild(weekdaysContainer);
    formContainer.appendChild(tagsInput);
    formContainer.appendChild(tasksWrapper);
    formContainer.appendChild(buttonGroup);

    return formContainer;
  }

  remove(): void {
    if (this.formElement) {
      this.formElement.remove();
      this.formElement = null;
    }
    const hasInputs = this.container.querySelectorAll("input").length > 0;
    if (!hasInputs) {
      this.container.style.display = "none";
      const clearListBtn = document.getElementById("limparLista");
      if (clearListBtn) {
        clearListBtn.style.display = "none";
      }
    }
  }
}