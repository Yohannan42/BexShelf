import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { v4 as uuidv4 } from "uuid";
import { QuickNote, CreateQuickNoteRequest, UpdateQuickNoteRequest } from "../types";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, "../../data/quick-notes.json");

export class QuickNoteModel {
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

  private static async readData(): Promise<QuickNote[]> {
    await this.ensureDataFile();
    const data = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(data);
  }

  private static async writeData(data: QuickNote[]): Promise<void> {
    await this.ensureDataFile();
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
  }

  static async getAll(userId: string): Promise<QuickNote[]> {
    const allNotes = await this.readData();
    return allNotes.filter(note => note.userId === userId);
  }

  static async getById(id: string, userId: string): Promise<QuickNote | null> {
    const allNotes = await this.readData();
    return allNotes.find(note => note.id === id && note.userId === userId) || null;
  }

  static async create(data: CreateQuickNoteRequest, userId: string): Promise<QuickNote> {
    const allNotes = await this.readData();
    
    // Check if we already have 8 notes for this user
    const userNotes = allNotes.filter(note => note.userId === userId);
    if (userNotes.length >= 8) {
      throw new Error("Maximum of 8 quick notes allowed");
    }

    // Validate content length (15 words max)
    const wordCount = data.content.trim().split(/\s+/).length;
    if (wordCount > 15) {
      throw new Error("Quick note cannot exceed 15 words");
    }

    const now = new Date().toISOString();
    const newNote: QuickNote = {
      id: uuidv4(),
      userId,
      content: data.content.trim(),
      color: data.color,
      createdAt: now,
      updatedAt: now,
    };

    allNotes.push(newNote);
    await this.writeData(allNotes);
    return newNote;
  }

  static async update(id: string, data: UpdateQuickNoteRequest, userId: string): Promise<QuickNote> {
    const allNotes = await this.readData();
    const noteIndex = allNotes.findIndex(note => note.id === id && note.userId === userId);
    
    if (noteIndex === -1) {
      throw new Error("Quick note not found");
    }

    // Validate content length if content is being updated
    if (data.content) {
      const wordCount = data.content.trim().split(/\s+/).length;
      if (wordCount > 15) {
        throw new Error("Quick note cannot exceed 15 words");
      }
    }

    const updatedNote: QuickNote = {
      ...allNotes[noteIndex],
      ...data,
      content: data.content ? data.content.trim() : allNotes[noteIndex].content,
      updatedAt: new Date().toISOString(),
    };

    allNotes[noteIndex] = updatedNote;
    await this.writeData(allNotes);
    return updatedNote;
  }

  static async delete(id: string, userId: string): Promise<void> {
    const allNotes = await this.readData();
    const noteIndex = allNotes.findIndex(note => note.id === id && note.userId === userId);
    
    if (noteIndex === -1) {
      throw new Error("Quick note not found");
    }

    allNotes.splice(noteIndex, 1);
    await this.writeData(allNotes);
  }

  static async getCount(userId: string): Promise<number> {
    const allNotes = await this.readData();
    return allNotes.filter(note => note.userId === userId).length;
  }
} 