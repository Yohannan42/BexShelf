import { v4 as uuidv4 } from 'uuid';
import { Journal, CreateJournalRequest, UpdateJournalRequest, SaveJournalContentRequest } from '../types.js';
import fs from 'fs/promises';
import path from 'path';

// File-based storage
const DATA_FILE = path.join(process.cwd(), 'data', 'journals.json');
const CONTENT_DIR = path.join(process.cwd(), 'data', 'journal-content');

// Ensure data directory exists
async function ensureDataDirectory() {
  const dataDir = path.dirname(DATA_FILE);
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

// Ensure content directory exists
async function ensureContentDirectory() {
  try {
    await fs.access(CONTENT_DIR);
  } catch {
    await fs.mkdir(CONTENT_DIR, { recursive: true });
  }
}

// Load journals from file
async function loadJournals(): Promise<Journal[]> {
  try {
    await ensureDataDirectory();
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    const journals = JSON.parse(data);
    // Convert date strings back to Date objects
    return journals.map((journal: any) => ({
      ...journal,
      createdAt: new Date(journal.createdAt),
      updatedAt: new Date(journal.updatedAt),
    }));
  } catch (error) {
    // File doesn't exist or is empty, return empty array
    return [];
  }
}

// Load journals for a specific user
async function loadJournalsForUser(userId: string): Promise<Journal[]> {
  const allJournals = await loadJournals();
  return allJournals.filter(journal => journal.userId === userId);
}

// Save journals to file
async function saveJournals(journals: Journal[]): Promise<void> {
  await ensureDataDirectory();
  await fs.writeFile(DATA_FILE, JSON.stringify(journals, null, 2));
}

// Get content file path for a journal
function getContentFilePath(journalId: string): string {
  return path.join(CONTENT_DIR, `${journalId}.json`);
}

// Load journal content
async function loadJournalContent(journalId: string): Promise<{ content: string; theme: string; wordCount: number } | null> {
  try {
    await ensureContentDirectory();
    const contentFile = getContentFilePath(journalId);
    const data = await fs.readFile(contentFile, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return null;
  }
}

// Save journal content
async function saveJournalContent(journalId: string, content: string, wordCount: number, theme: string = 'classic'): Promise<void> {
  await ensureContentDirectory();
  const contentFile = getContentFilePath(journalId);
  const contentData = {
    content,
    wordCount,
    theme,
    updatedAt: new Date().toISOString(),
  };
  await fs.writeFile(contentFile, JSON.stringify(contentData, null, 2));
}

export class JournalModel {
  static async getAll(userId: string): Promise<Journal[]> {
    return await loadJournalsForUser(userId);
  }

  static async getById(id: string, userId: string): Promise<Journal | null> {
    const journals = await loadJournalsForUser(userId);
    return journals.find(journal => journal.id === id) || null;
  }

  static async create(data: CreateJournalRequest, userId: string): Promise<Journal> {
    const allJournals = await loadJournals();
    const now = new Date();
    const journal: Journal = {
      id: uuidv4(),
      userId,
      title: data.title,
      description: data.description,
      cover: data.cover,
      privacy: data.privacy,
      createdAt: now,
      updatedAt: now,
    };

    allJournals.push(journal);
    await saveJournals(allJournals);
    return journal;
  }

  static async update(id: string, data: UpdateJournalRequest, userId: string): Promise<Journal | null> {
    const allJournals = await loadJournals();
    const journalIndex = allJournals.findIndex(journal => journal.id === id && journal.userId === userId);
    if (journalIndex === -1) return null;

    const updatedJournal = {
      ...journals[journalIndex],
      ...data,
      updatedAt: new Date(),
    };

    allJournals[journalIndex] = updatedJournal;
    await saveJournals(allJournals);
    return updatedJournal;
  }

  static async delete(id: string, userId: string): Promise<boolean> {
    const allJournals = await loadJournals();
    const journalIndex = allJournals.findIndex(journal => journal.id === id && journal.userId === userId);
    if (journalIndex === -1) return false;

    allJournals.splice(journalIndex, 1);
    await saveJournals(allJournals);
    
    // Also delete the content file
    try {
      const contentFile = getContentFilePath(id);
      await fs.unlink(contentFile);
    } catch (error) {
      // Content file doesn't exist, that's fine
    }
    
    return true;
  }

  // Journal content methods
  static async getJournalContent(journalId: string): Promise<{ content: string; theme: string; wordCount: number } | null> {
    return await loadJournalContent(journalId);
  }

  static async saveJournalContent(journalId: string, data: SaveJournalContentRequest): Promise<void> {
    await saveJournalContent(journalId, data.content, data.wordCount, data.theme);
  }
} 