import { Request } from 'express';

// Extend Express Request to include user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
      };
    }
  }
}

export interface WritingProject {
  id: string;
  userId: string;
  title: string;
  description?: string;
  type: string;
  status: "planning" | "in_progress" | "completed";
  currentWordCount: number;
  targetWordCount?: number;
  deadline?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Journal {
  id: string;
  userId: string;
  title: string;
  description?: string;
  cover?: string;
  privacy: "private" | "public";
  createdAt: Date;
  updatedAt: Date;
}

export interface Book {
  id: string;
  userId: string;
  title: string;
  author: string;
  genre: string;
  status: "want_to_read" | "currently_reading" | "finished";
  rating?: number;
  notes?: string;
  pdfPath?: string;
  currentPage?: number;
  totalPages?: number;
  startDate?: Date;
  finishDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Chapter {
  id: string;
  projectId: string;
  title: string;
  content: string;
  summary?: string;
  wordCount: number;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Character {
  id: string;
  projectId: string;
  name: string;
  role: string;
  description?: string;
  background?: string;
  traits?: string[];
  goals?: string[];
  relationships?: { characterId: string; relationship: string }[];
}

export interface WritingComment {
  id: string;
  projectId: string;
  chapterId?: string;
  content: string;
  position: number;
  color: string;
  type: "note" | "suggestion" | "edit";
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateWritingProjectRequest {
  title: string;
  description?: string;
  type: string;
  targetWordCount?: number;
  deadline?: string;
}

export interface UpdateWritingProjectRequest {
  title?: string;
  description?: string;
  type?: string;
  status?: "planning" | "in_progress" | "completed";
  currentWordCount?: number;
  targetWordCount?: number;
  deadline?: string;
}

export interface CreateJournalRequest {
  title: string;
  description?: string;
  cover?: string;
  privacy: "private" | "public";
}

export interface UpdateJournalRequest {
  title?: string;
  description?: string;
  cover?: string;
  privacy?: "private" | "public";
}

export interface CreateBookRequest {
  title: string;
  author: string;
  genre: string;
  status: "want_to_read" | "currently_reading" | "finished";
  rating?: number;
  notes?: string;
  currentPage?: number;
  totalPages?: number;
}

export interface UpdateBookRequest {
  title?: string;
  author?: string;
  genre?: string;
  status?: "want_to_read" | "currently_reading" | "finished";
  rating?: number;
  notes?: string;
  currentPage?: number;
  totalPages?: number;
  startDate?: string;
  finishDate?: string;
}

export interface SaveNotebookContentRequest {
  content: string;
  wordCount: number;
  theme?: string;
}

export interface SaveJournalContentRequest {
  content: string;
  wordCount: number;
  theme?: string;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  status: "todo" | "doing" | "done";
  dueDate: string; // ISO date string
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  status: "todo" | "doing" | "done";
  dueDate: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: "todo" | "doing" | "done";
  dueDate?: string;
}

export interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  isPinned?: boolean;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateNoteRequest {
  title: string;
  content: string;
  isPinned?: boolean;
  tags?: string[];
}

export interface UpdateNoteRequest {
  title?: string;
  content?: string;
  isPinned?: boolean;
  tags?: string[];
}

export interface VisionBoard {
  id: string;
  userId: string;
  year: number;
  month: number;
  title?: string;
  description?: string;
  images: VisionImage[];
  createdAt: string;
  updatedAt: string;
}

export interface VisionImage {
  id: string;
  visionBoardId: string;
  fileName: string;
  filePath: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  rotation: number;
  zIndex: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVisionBoardRequest {
  year: number;
  month: number;
  title?: string;
  description?: string;
}

export interface UpdateVisionBoardRequest {
  title?: string;
  description?: string;
}

export interface UpdateVisionImageRequest {
  position?: { x: number; y: number };
  size?: { width: number; height: number };
  rotation?: number;
  zIndex?: number;
}

export interface QuickNote {
  id: string;
  userId: string;
  content: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateQuickNoteRequest {
  content: string;
  color: string;
}

export interface UpdateQuickNoteRequest {
  content?: string;
  color?: string;
}

export interface ReadingGoal {
  id: string;
  userId: string;
  targetBooks: number;
  targetPages?: number;
  year: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReadingGoalRequest {
  targetBooks: number;
  targetPages?: number;
  year: number;
}

export interface UpdateReadingGoalRequest {
  targetBooks?: number;
  targetPages?: number;
  year?: number;
  isActive?: boolean;
} 