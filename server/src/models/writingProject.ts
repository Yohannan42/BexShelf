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
  static async getAll(): Promise<WritingProject[]> {
    return await loadProjects();
  }

  static async getById(id: string): Promise<WritingProject | null> {
    const projects = await loadProjects();
    return projects.find(project => project.id === id) || null;
  }

  static async create(data: CreateWritingProjectRequest): Promise<WritingProject> {
    const projects = await loadProjects();
    const now = new Date();
    const project: WritingProject = {
      id: uuidv4(),
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

    projects.push(project);
    await saveProjects(projects);
    return project;
  }

  static async update(id: string, data: UpdateWritingProjectRequest): Promise<WritingProject | null> {
    const projects = await loadProjects();
    const projectIndex = projects.findIndex(project => project.id === id);
    if (projectIndex === -1) return null;

    const updatedProject = {
      ...projects[projectIndex],
      ...data,
      deadline: data.deadline ? new Date(data.deadline) : projects[projectIndex].deadline,
      updatedAt: new Date(),
    };

    projects[projectIndex] = updatedProject;
    await saveProjects(projects);
    return updatedProject;
  }

  static async delete(id: string): Promise<boolean> {
    const projects = await loadProjects();
    const projectIndex = projects.findIndex(project => project.id === id);
    if (projectIndex === -1) return false;

    projects.splice(projectIndex, 1);
    await saveProjects(projects);
    
    // Also delete the content file
    try {
      const contentFile = getContentFilePath(id);
      await fs.unlink(contentFile);
    } catch (error) {
      // Content file doesn't exist, that's fine
    }
    
    return true;
  }

  static async updateWordCount(id: string, wordCount: number): Promise<WritingProject | null> {
    const projects = await loadProjects();
    const projectIndex = projects.findIndex(project => project.id === id);
    if (projectIndex === -1) return null;

    projects[projectIndex] = {
      ...projects[projectIndex],
      currentWordCount: wordCount,
      updatedAt: new Date(),
    };

    await saveProjects(projects);
    return projects[projectIndex];
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