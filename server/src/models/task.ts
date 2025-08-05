import { promises as fs } from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { Task, CreateTaskRequest, UpdateTaskRequest } from "../types.js";

const DATA_DIR = path.join(process.cwd(), "data");
const TASKS_FILE = path.join(DATA_DIR, "tasks.json");

export class TaskModel {
  private static async ensureDataDir() {
    try {
      await fs.access(DATA_DIR);
    } catch {
      await fs.mkdir(DATA_DIR, { recursive: true });
    }
  }

  private static async readTasks(): Promise<Task[]> {
    try {
      const data = await fs.readFile(TASKS_FILE, "utf-8");
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  private static async writeTasks(tasks: Task[]): Promise<void> {
    await this.ensureDataDir();
    await fs.writeFile(TASKS_FILE, JSON.stringify(tasks, null, 2));
  }

  static async getAll(userId: string): Promise<Task[]> {
    const allTasks = await this.readTasks();
    return allTasks.filter(task => task.userId === userId);
  }

  static async getByStatus(status: "todo" | "doing" | "done", userId: string): Promise<Task[]> {
    const allTasks = await this.readTasks();
    return allTasks.filter(task => task.status === status && task.userId === userId);
  }

  static async getByDate(dueDate: string, userId: string): Promise<Task[]> {
    const allTasks = await this.readTasks();
    return allTasks.filter(task => task.dueDate === dueDate && task.userId === userId);
  }

  static async getById(id: string, userId: string): Promise<Task | null> {
    const allTasks = await this.readTasks();
    return allTasks.find(task => task.id === id && task.userId === userId) || null;
  }

  static async create(data: CreateTaskRequest, userId: string): Promise<Task> {
    const allTasks = await this.readTasks();
    
    const newTask: Task = {
      id: uuidv4(),
      userId,
      title: data.title,
      description: data.description,
      status: data.status,
      dueDate: data.dueDate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    allTasks.push(newTask);
    await this.writeTasks(allTasks);
    
    return newTask;
  }

  static async update(id: string, data: UpdateTaskRequest, userId: string): Promise<Task | null> {
    const allTasks = await this.readTasks();
    const taskIndex = allTasks.findIndex(task => task.id === id && task.userId === userId);
    
    if (taskIndex === -1) {
      return null;
    }

    allTasks[taskIndex] = {
      ...allTasks[taskIndex],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    await this.writeTasks(allTasks);
    return allTasks[taskIndex];
  }

  static async delete(id: string, userId: string): Promise<boolean> {
    const allTasks = await this.readTasks();
    const filteredTasks = allTasks.filter(task => !(task.id === id && task.userId === userId));
    
    if (filteredTasks.length === allTasks.length) {
      return false; // Task not found
    }

    await this.writeTasks(filteredTasks);
    return true;
  }

  static async getStats(userId: string): Promise<{
    total: number;
    todo: number;
    doing: number;
    done: number;
    tasksByDate: Record<string, number>;
  }> {
    const allTasks = await this.readTasks();
    const tasks = allTasks.filter(task => task.userId === userId);
    
    const stats = {
      total: tasks.length,
      todo: tasks.filter(task => task.status === "todo").length,
      doing: tasks.filter(task => task.status === "doing").length,
      done: tasks.filter(task => task.status === "done").length,
      tasksByDate: {} as Record<string, number>,
    };

    // Group tasks by date
    tasks.forEach(task => {
      const date = task.dueDate;
      stats.tasksByDate[date] = (stats.tasksByDate[date] || 0) + 1;
    });

    return stats;
  }
} 