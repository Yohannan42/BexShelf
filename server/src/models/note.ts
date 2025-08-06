import { promises as fs } from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { Note, CreateNoteRequest, UpdateNoteRequest } from "../types.js";

const DATA_DIR = path.join(process.cwd(), "data");
const NOTES_FILE = path.join(DATA_DIR, "notes.json");

export class NoteModel {
  private static async ensureDataDir() {
    try {
      await fs.access(DATA_DIR);
    } catch {
      await fs.mkdir(DATA_DIR, { recursive: true });
    }
  }

  private static async readNotes(): Promise<Note[]> {
    try {
      const data = await fs.readFile(NOTES_FILE, "utf-8");
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  private static async writeNotes(notes: Note[]): Promise<void> {
    await this.ensureDataDir();
    await fs.writeFile(NOTES_FILE, JSON.stringify(notes, null, 2));
  }

  static async getAll(userId: string): Promise<Note[]> {
    const allNotes = await this.readNotes();
    return allNotes.filter(note => note.userId === userId);
  }

  static async getById(id: string, userId: string): Promise<Note | null> {
    const allNotes = await this.readNotes();
    return allNotes.find(note => note.id === id && note.userId === userId) || null;
  }

  static async create(data: CreateNoteRequest, userId: string): Promise<Note> {
    const allNotes = await this.readNotes();
    
    const newNote: Note = {
      id: uuidv4(),
      userId,
      title: data.title,
      content: data.content,
      isPinned: data.isPinned || false,
      tags: data.tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    allNotes.push(newNote);
    await this.writeNotes(allNotes);
    
    return newNote;
  }

  static async update(id: string, data: UpdateNoteRequest, userId: string): Promise<Note | null> {
    const allNotes = await this.readNotes();
    const noteIndex = allNotes.findIndex(note => note.id === id && note.userId === userId);
    
    if (noteIndex === -1) {
      return null;
    }

    allNotes[noteIndex] = {
      ...allNotes[noteIndex],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    await this.writeNotes(allNotes);
    return allNotes[noteIndex];
  }

  static async delete(id: string, userId: string): Promise<boolean> {
    const allNotes = await this.readNotes();
    const filteredNotes = allNotes.filter(note => !(note.id === id && note.userId === userId));
    
    if (filteredNotes.length === allNotes.length) {
      return false; // Note not found
    }

    await this.writeNotes(filteredNotes);
    return true;
  }

  static async search(query: string, userId: string): Promise<Note[]> {
    const allNotes = await this.readNotes();
    const userNotes = allNotes.filter(note => note.userId === userId);
    const searchTerm = query.toLowerCase();
    
    return userNotes.filter(note => 
      note.title.toLowerCase().includes(searchTerm) ||
      note.content.toLowerCase().includes(searchTerm) ||
      note.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  }

  static async getPinned(userId: string): Promise<Note[]> {
    const allNotes = await this.readNotes();
    return allNotes.filter(note => note.isPinned && note.userId === userId);
  }
} 