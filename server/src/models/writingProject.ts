import { v4 as uuidv4 } from 'uuid';
import { WritingProject, CreateWritingProjectRequest, UpdateWritingProjectRequest, SaveNotebookContentRequest } from '../types.js';
import fs from 'fs/promises';
import path from 'path';

// File-based storage
const DATA_FILE = path.join(process.cwd(), 'data', 'writing-projects.json');
const CONTENT_DIR = path.join(process.cwd(), 'data', 'notebook-content');

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

// Load projects from file
async function loadProjects(): Promise<WritingProject[]> {
  try {
    await ensureDataDirectory();
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    const projects = JSON.parse(data);
    // Convert date strings back to Date objects
    return projects.map((project: any) => ({
      ...project,
      createdAt: new Date(project.createdAt),
      updatedAt: new Date(project.updatedAt),
      deadline: project.deadline ? new Date(project.deadline) : undefined,
    }));
  } catch (error) {
    // File doesn't exist or is empty, return empty array
    return [];
  }
}

// Save projects to file
async function saveProjects(projects: WritingProject[]): Promise<void> {
  await ensureDataDirectory();
  await fs.writeFile(DATA_FILE, JSON.stringify(projects, null, 2));
}

// Get content file path for a project
function getContentFilePath(projectId: string): string {
  return path.join(CONTENT_DIR, `${projectId}.json`);
}

// Load notebook content
async function loadNotebookContent(projectId: string): Promise<{ content: string; theme: string; wordCount: number } | null> {
  try {
    await ensureContentDirectory();
    const contentFile = getContentFilePath(projectId);
    const data = await fs.readFile(contentFile, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return null;
  }
}

// Save notebook content
async function saveNotebookContent(projectId: string, content: string, wordCount: number, theme: string = 'classic'): Promise<void> {
  await ensureContentDirectory();
  const contentFile = getContentFilePath(projectId);
  const contentData = {
    content,
    wordCount,
    theme,
    updatedAt: new Date().toISOString(),
  };
  await fs.writeFile(contentFile, JSON.stringify(contentData, null, 2));
}

export class WritingProjectModel {
  static async getAll(userId: string): Promise<WritingProject[]> {
    const allProjects = await loadProjects();
    return allProjects.filter(project => project.userId === userId);
  }

  static async getById(id: string, userId: string): Promise<WritingProject | null> {
    const allProjects = await loadProjects();
    return allProjects.find(project => project.id === id && project.userId === userId) || null;
  }

  static async create(data: CreateWritingProjectRequest, userId: string): Promise<WritingProject> {
    const allProjects = await loadProjects();
    const now = new Date();
    const project: WritingProject = {
      id: uuidv4(),
      userId,
      title: data.title,
      description: data.description,
      type: data.type,
      status: "planning",
      currentWordCount: 0,
      targetWordCount: data.targetWordCount,
      deadline: data.deadline ? new Date(data.deadline) : undefined,
      createdAt: now,
      updatedAt: now,
    };

    allProjects.push(project);
    await saveProjects(allProjects);
    return project;
  }

  static async update(id: string, data: UpdateWritingProjectRequest, userId: string): Promise<WritingProject | null> {
    const allProjects = await loadProjects();
    const projectIndex = allProjects.findIndex(project => project.id === id && project.userId === userId);
    if (projectIndex === -1) return null;

    const updatedProject = {
      ...allProjects[projectIndex],
      ...data,
      deadline: data.deadline ? new Date(data.deadline) : allProjects[projectIndex].deadline,
      updatedAt: new Date(),
    };

    allProjects[projectIndex] = updatedProject;
    await saveProjects(allProjects);
    return updatedProject;
  }

  static async delete(id: string, userId: string): Promise<boolean> {
    const allProjects = await loadProjects();
    const projectIndex = allProjects.findIndex(project => project.id === id && project.userId === userId);
    if (projectIndex === -1) return false;

    allProjects.splice(projectIndex, 1);
    await saveProjects(allProjects);
    
    // Also delete the content file
    try {
      const contentFile = getContentFilePath(id);
      await fs.unlink(contentFile);
    } catch (error) {
      // Content file doesn't exist, that's fine
    }
    
    return true;
  }

  static async updateWordCount(id: string, wordCount: number, userId: string): Promise<WritingProject | null> {
    const allProjects = await loadProjects();
    const projectIndex = allProjects.findIndex(project => project.id === id && project.userId === userId);
    if (projectIndex === -1) return null;

    allProjects[projectIndex] = {
      ...allProjects[projectIndex],
      currentWordCount: wordCount,
      updatedAt: new Date(),
    };

    await saveProjects(allProjects);
    return allProjects[projectIndex];
  }

  // Notebook content methods
  static async getNotebookContent(projectId: string): Promise<{ content: string; theme: string; wordCount: number } | null> {
    return await loadNotebookContent(projectId);
  }

  static async saveNotebookContent(projectId: string, data: SaveNotebookContentRequest): Promise<void> {
    await saveNotebookContent(projectId, data.content, data.wordCount, data.theme);
    
    // Also update the project's word count
    await this.updateWordCount(projectId, data.wordCount);
  }
} 