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

  static async getAll(): Promise<Note[]> {
    return await this.readNotes();
  }

  static async getById(id: string): Promise<Note | null> {
    const notes = await this.readNotes();
    return notes.find(note => note.id === id) || null;
  }

  static async create(data: CreateNoteRequest): Promise<Note> {
    const notes = await this.readNotes();
    
    const newNote: Note = {
      id: uuidv4(),
      title: data.title,
      content: data.content,
      isPinned: data.isPinned || false,
      tags: data.tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    notes.push(newNote);
    await this.writeNotes(notes);
    
    return newNote;
  }

  static async update(id: string, data: UpdateNoteRequest): Promise<Note | null> {
    const notes = await this.readNotes();
    const noteIndex = notes.findIndex(note => note.id === id);
    
    if (noteIndex === -1) {
      return null;
    }

    notes[noteIndex] = {
      ...notes[noteIndex],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    await this.writeNotes(notes);
    return notes[noteIndex];
  }

  static async delete(id: string): Promise<boolean> {
    const notes = await this.readNotes();
    const filteredNotes = notes.filter(note => note.id !== id);
    
    if (filteredNotes.length === notes.length) {
      return false; // Note not found
    }

    await this.writeNotes(filteredNotes);
    return true;
  }

  static async search(query: string): Promise<Note[]> {
    const notes = await this.readNotes();
    const searchTerm = query.toLowerCase();
    
    return notes.filter(note => 
      note.title.toLowerCase().includes(searchTerm) ||
      note.content.toLowerCase().includes(searchTerm) ||
      note.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  }

  static async getPinned(): Promise<Note[]> {
    const notes = await this.readNotes();
    return notes.filter(note => note.isPinned);
  }
} 