import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { v4 as uuidv4 } from "uuid";
import { ReadingGoal, CreateReadingGoalRequest, UpdateReadingGoalRequest } from "../types";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, "../../data/reading-goals.json");

export class ReadingGoalModel {
  private static async ensureDataFile() {
    const dataDir = path.dirname(DATA_FILE);
    try {
      await fs.access(dataDir);
    } catch {
      await fs.mkdir(dataDir, { recursive: true });
    }
    
    try {
      await fs.access(DATA_FILE);
    } catch {
      await fs.writeFile(DATA_FILE, JSON.stringify([], null, 2));
    }
  }

  private static async readData(): Promise<ReadingGoal[]> {
    await this.ensureDataFile();
    const data = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(data);
  }

  private static async writeData(data: ReadingGoal[]): Promise<void> {
    await this.ensureDataFile();
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
  }

  static async getAll(): Promise<ReadingGoal[]> {
    return await this.readData();
  }

  static async getById(id: string): Promise<ReadingGoal | null> {
    const goals = await this.readData();
    return goals.find(goal => goal.id === id) || null;
  }

  static async getActiveGoal(): Promise<ReadingGoal | null> {
    const goals = await this.readData();
    const currentYear = new Date().getFullYear();
    return goals.find(goal => goal.year === currentYear && goal.isActive) || null;
  }

  static async getByYear(year: number): Promise<ReadingGoal | null> {
    const goals = await this.readData();
    return goals.find(goal => goal.year === year) || null;
  }

  static async create(data: CreateReadingGoalRequest): Promise<ReadingGoal> {
    const goals = await this.readData();
    
    // Deactivate any existing active goals for the same year
    goals.forEach(goal => {
      if (goal.year === data.year) {
        goal.isActive = false;
      }
    });

    const now = new Date().toISOString();
    const newGoal: ReadingGoal = {
      id: uuidv4(),
      targetBooks: data.targetBooks,
      targetPages: data.targetPages,
      year: data.year,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    goals.push(newGoal);
    await this.writeData(goals);
    return newGoal;
  }

  static async update(id: string, data: UpdateReadingGoalRequest): Promise<ReadingGoal> {
    const goals = await this.readData();
    const goalIndex = goals.findIndex(goal => goal.id === id);
    
    if (goalIndex === -1) {
      throw new Error("Reading goal not found");
    }

    const updatedGoal: ReadingGoal = {
      ...goals[goalIndex],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    // If making this goal active, deactivate others for the same year
    if (data.isActive) {
      goals.forEach(goal => {
        if (goal.id !== id && goal.year === updatedGoal.year) {
          goal.isActive = false;
        }
      });
    }

    goals[goalIndex] = updatedGoal;
    await this.writeData(goals);
    return updatedGoal;
  }

  static async delete(id: string): Promise<void> {
    const goals = await this.readData();
    const goalIndex = goals.findIndex(goal => goal.id === id);
    
    if (goalIndex === -1) {
      throw new Error("Reading goal not found");
    }

    goals.splice(goalIndex, 1);
    await this.writeData(goals);
  }
} 