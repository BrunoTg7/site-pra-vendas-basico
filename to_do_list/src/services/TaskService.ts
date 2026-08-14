import { StorageService, Task, UserTasks } from "./StorageService.js";
import { formatDateForStorage, isoDateToStorageDate, sortDatesAscending } from "../utils/date.js";

export interface MoveCopyResult {
  success: boolean;
  targetDateValue?: string;
  removedOrigin?: boolean;
  transferredCount?: number;
  userStorage?: UserTasks;
  error?: string;
}

export class TaskService {
  static generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  static saveTasks(
    email: string,
    dateValues: string[],
    taskValues: string[],
    timestamp: string,
    tags: string[] = []
  ): void {
    const userTasks = StorageService.getUserTasks(email);

    taskValues.forEach((taskValue) => {
      dateValues.forEach((dateValue) => {
        if (!userTasks[dateValue]) {
          userTasks[dateValue] = [];
        }
        userTasks[dateValue].push({
          id: this.generateId(),
          lista: taskValue,
          selecao: false,
          data: dateValue,
          timestamp,
          tags,
          completed: false,
        });
      });
    });

    StorageService.setUserTasks(email, userTasks);
  }

  static getOrderedDates(email: string): string[] {
    const userTasks = StorageService.getUserTasks(email);
    return sortDatesAscending(Object.keys(userTasks));
  }

  static getTasksForDate(email: string, date: string): Task[] {
    const userTasks = StorageService.getUserTasks(email);
    return userTasks[date] || [];
  }

  static updateTasksForDate(email: string, date: string, tasks: Task[]): void {
    const userTasks = StorageService.getUserTasks(email);
    if (tasks.length === 0) {
      delete userTasks[date];
    } else {
      userTasks[date] = tasks;
    }
    StorageService.setUserTasks(email, userTasks);
  }

  static updateTask(email: string, date: string, taskId: string, updates: Partial<Task>): void {
    const userTasks = StorageService.getUserTasks(email);
    const tasks = userTasks[date];
    if (tasks) {
      const index = tasks.findIndex(t => t.id === taskId);
      if (index !== -1) {
        tasks[index] = { ...tasks[index], ...updates };
        StorageService.setUserTasks(email, userTasks);
      }
    }
  }

  static removeTask(email: string, date: string, taskId: string): boolean {
    const userTasks = StorageService.getUserTasks(email);
    const tasks = userTasks[date];
    if (tasks) {
      const index = tasks.findIndex(t => t.id === taskId);
      if (index !== -1) {
        tasks.splice(index, 1);
        StorageService.setUserTasks(email, userTasks);
        return true;
      }
    }
    return false;
  }

  static removeDate(email: string, date: string): void {
    const userTasks = StorageService.getUserTasks(email);
    delete userTasks[date];
    StorageService.setUserTasks(email, userTasks);
  }

  static moveTaskToDate(
    email: string,
    sourceDate: string,
    taskId: string,
    targetDateValue: string,
    timestamp: string
  ): boolean {
    const userTasks = StorageService.getUserTasks(email);
    const sourceTasks = userTasks[sourceDate];
    if (!sourceTasks) return false;

    const index = sourceTasks.findIndex((t) => t.id === taskId);
    if (index === -1) return false;

    const [task] = sourceTasks.splice(index, 1);
    task.data = targetDateValue;
    task.timestamp = timestamp;

    if (!userTasks[targetDateValue]) {
      userTasks[targetDateValue] = [];
    }
    userTasks[targetDateValue].push(task);

    if (sourceTasks.length === 0) {
      delete userTasks[sourceDate];
    }

    StorageService.setUserTasks(email, userTasks);
    return true;
  }

  static moveOrCopyTasks(
    email: string,
    sourceDate: string,
    targetISO: string,
    copy: boolean = false
  ): MoveCopyResult {
    if (!targetISO) {
      return { success: false, error: "Selecione uma data de destino." };
    }

    const userTasks = StorageService.getUserTasks(email);
    const sourceTasks = userTasks[sourceDate];

    if (!sourceTasks || sourceTasks.length === 0) {
      return { success: false, error: "Não há tarefas para mover nesta data." };
    }

    const selectedTasks = sourceTasks
      .map((task, index) => ({ task, index }))
      .filter(({ task }) => task.selecao);

    if (selectedTasks.length === 0) {
      return { success: false, error: "Selecione pelo menos uma tarefa." };
    }

    const targetDateValue = isoDateToStorageDate(targetISO);
    if (!targetDateValue) {
      return { success: false, error: "Data de destino inválida." };
    }

    if (!copy && targetDateValue === sourceDate) {
      return { success: false, error: "As tarefas já estão cadastradas nesta data." };
    }

    if (!userTasks[targetDateValue]) {
      userTasks[targetDateValue] = [];
    }

    const tasksToTransfer = selectedTasks.map(({ task }) => ({
      ...task,
      id: this.generateId(),
      data: targetDateValue,
      selecao: false,
    }));

    userTasks[targetDateValue].push(...tasksToTransfer);

    let removedOrigin = false;

    if (copy) {
      sourceTasks.forEach((task) => {
        task.selecao = false;
      });
    } else {
      const indexesToRemove = new Set(selectedTasks.map(({ index }) => index));
      userTasks[sourceDate] = sourceTasks.filter(
        (_, index) => !indexesToRemove.has(index)
      );

      if (userTasks[sourceDate].length === 0) {
        delete userTasks[sourceDate];
        removedOrigin = true;
      } else {
        userTasks[sourceDate].forEach((task) => {
          task.selecao = false;
        });
      }
    }

    StorageService.setUserTasks(email, userTasks);

    return {
      success: true,
      targetDateValue,
      removedOrigin,
      userStorage: userTasks,
      transferredCount: tasksToTransfer.length,
    };
  }

  static clearSelection(email: string, date: string): void {
    const userTasks = StorageService.getUserTasks(email);
    const tasks = userTasks[date];
    if (tasks) {
      tasks.forEach((task) => {
        task.selecao = false;
      });
      StorageService.setUserTasks(email, userTasks);
    }
  }

  static toggleComplete(email: string, date: string, taskId: string): void {
    const userTasks = StorageService.getUserTasks(email);
    const tasks = userTasks[date];
    if (tasks) {
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        task.completed = !task.completed;
        StorageService.setUserTasks(email, userTasks);
      }
    }
  }

  static searchTasks(email: string, query: string): Task[] {
    const userTasks = StorageService.getUserTasks(email);
    const allTasks: Task[] = [];
    Object.values(userTasks).forEach(tasks => {
      allTasks.push(...tasks);
    });
    const lowerQuery = query.toLowerCase();
    return allTasks.filter(task =>
      task.lista.toLowerCase().includes(lowerQuery) ||
      task.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  static filterByTag(email: string, tag: string): Task[] {
    const userTasks = StorageService.getUserTasks(email);
    const allTasks: Task[] = [];
    Object.values(userTasks).forEach(tasks => {
      allTasks.push(...tasks);
    });
    return allTasks.filter(task => task.tags.includes(tag));
  }

  static getAllTags(email: string): string[] {
    const userTasks = StorageService.getUserTasks(email);
    const tags = new Set<string>();
    Object.values(userTasks).forEach(tasks => {
      tasks.forEach(task => {
        task.tags.forEach(tag => tags.add(tag));
      });
    });
    return Array.from(tags).sort();
  }

  static exportTasks(email: string): string {
    const userTasks = StorageService.getUserTasks(email);
    const exportData = {
      version: 1,
      exportDate: new Date().toISOString(),
      email,
      tasks: userTasks,
    };
    return JSON.stringify(exportData, null, 2);
  }

  static importTasks(email: string, jsonString: string): { success: boolean; error?: string; importedCount?: number } {
    try {
      const importData = JSON.parse(jsonString);
      
      if (!importData.tasks || typeof importData.tasks !== "object") {
        return { success: false, error: "Formato de arquivo inválido" };
      }

      const userTasks = StorageService.getUserTasks(email);
      let importedCount = 0;

      Object.entries(importData.tasks).forEach(([date, tasks]) => {
        if (!Array.isArray(tasks)) return;
        if (!userTasks[date]) {
          userTasks[date] = [];
        }
        tasks.forEach((task: any) => {
          if (task.lista && task.id) {
            const newTask: Task = {
              id: task.id,
              lista: task.lista,
              selecao: false,
              data: date,
              timestamp: task.timestamp || new Date().toISOString(),
              tags: Array.isArray(task.tags) ? task.tags : [],
              completed: Boolean(task.completed),
            };
            userTasks[date].push(newTask);
            importedCount++;
          }
        });
      });

      StorageService.setUserTasks(email, userTasks);
      return { success: true, importedCount };
    } catch (e) {
      return { success: false, error: "Erro ao importar: arquivo JSON inválido" };
    }
  }

  static downloadExport(email: string): void {
    const json = this.exportTasks(email);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tarefas-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  static triggerImportFile(input: HTMLInputElement, email: string): Promise<{ success: boolean; error?: string; importedCount?: number }> {
    return new Promise((resolve) => {
      const file = input.files?.[0];
      if (!file) {
        resolve({ success: false, error: "Nenhum arquivo selecionado" });
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = this.importTasks(email, e.target?.result as string);
        resolve(result);
      };
      reader.onerror = () => {
        resolve({ success: false, error: "Erro ao ler arquivo" });
      };
      reader.readAsText(file);
    });
  }
}