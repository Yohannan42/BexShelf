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

  static async getAll(): Promise<QuickNote[]> {
    return await this.readData();
  }

  static async getById(id: string): Promise<QuickNote | null> {
    const notes = await this.readData();
    return notes.find(note => note.id === id) || null;
  }

  static async create(data: CreateQuickNoteRequest): Promise<QuickNote> {
    const notes = await this.readData();
    
    // Check if we already have 8 notes
    if (notes.length >= 8) {
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
      content: data.content.trim(),
      color: data.color,
      createdAt: now,
      updatedAt: now,
    };

    notes.push(newNote);
    await this.writeData(notes);
    return newNote;
  }

  static async update(id: string, data: UpdateQuickNoteRequest): Promise<QuickNote> {
    const notes = await this.readData();
    const noteIndex = notes.findIndex(note => note.id === id);
    
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
      ...notes[noteIndex],
      ...data,
      content: data.content ? data.content.trim() : notes[noteIndex].content,
      updatedAt: new Date().toISOString(),
    };

    notes[noteIndex] = updatedNote;
    await this.writeData(notes);
    return updatedNote;
  }

  static async delete(id: string): Promise<void> {
    const notes = await this.readData();
    const noteIndex = notes.findIndex(note => note.id === id);
    
    if (noteIndex === -1) {
      throw new Error("Quick note not found");
    }

    notes.splice(noteIndex, 1);
    await this.writeData(notes);
  }

  static async getCount(): Promise<number> {
    const notes = await this.readData();
    return notes.length;
  }
} 