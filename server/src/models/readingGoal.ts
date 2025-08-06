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

  static async getAll(userId: string): Promise<ReadingGoal[]> {
    const allGoals = await this.readData();
    return allGoals.filter(goal => goal.userId === userId);
  }

  static async getById(id: string, userId: string): Promise<ReadingGoal | null> {
    const allGoals = await this.readData();
    return allGoals.find(goal => goal.id === id && goal.userId === userId) || null;
  }

  static async getActiveGoal(userId: string): Promise<ReadingGoal | null> {
    const allGoals = await this.readData();
    const userGoals = allGoals.filter(goal => goal.userId === userId);
    const currentYear = new Date().getFullYear();
    return userGoals.find(goal => goal.year === currentYear && goal.isActive) || null;
  }

  static async getByYear(year: number, userId: string): Promise<ReadingGoal | null> {
    const allGoals = await this.readData();
    const userGoals = allGoals.filter(goal => goal.userId === userId);
    return userGoals.find(goal => goal.year === year) || null;
  }

  static async create(data: CreateReadingGoalRequest, userId: string): Promise<ReadingGoal> {
    const allGoals = await this.readData();
    const userGoals = allGoals.filter(goal => goal.userId === userId);
    
    // Deactivate any existing active goals for the same year for this user
    userGoals.forEach(goal => {
      if (goal.year === data.year) {
        goal.isActive = false;
      }
    });

    const now = new Date().toISOString();
    const newGoal: ReadingGoal = {
      id: uuidv4(),
      userId,
      targetBooks: data.targetBooks,
      targetPages: data.targetPages,
      year: data.year,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    allGoals.push(newGoal);
    await this.writeData(allGoals);
    return newGoal;
  }

  static async update(id: string, data: UpdateReadingGoalRequest, userId: string): Promise<ReadingGoal> {
    const allGoals = await this.readData();
    const goalIndex = allGoals.findIndex(goal => goal.id === id && goal.userId === userId);
    
    if (goalIndex === -1) {
      throw new Error("Reading goal not found");
    }

    const updatedGoal: ReadingGoal = {
      ...allGoals[goalIndex],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    // If making this goal active, deactivate others for the same year for this user
    if (data.isActive) {
      allGoals.forEach(goal => {
        if (goal.id !== id && goal.userId === userId && goal.year === updatedGoal.year) {
          goal.isActive = false;
        }
      });
    }

    allGoals[goalIndex] = updatedGoal;
    await this.writeData(allGoals);
    return updatedGoal;
  }

  static async delete(id: string, userId: string): Promise<void> {
    const allGoals = await this.readData();
    const goalIndex = allGoals.findIndex(goal => goal.id === id && goal.userId === userId);
    
    if (goalIndex === -1) {
      throw new Error("Reading goal not found");
    }

    allGoals.splice(goalIndex, 1);
    await this.writeData(allGoals);
  }
} 