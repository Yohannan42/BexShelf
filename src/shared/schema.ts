export interface Book {
  id: string;
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

export interface Journal {
  id: string;
  title: string;
  description?: string;
  cover?: string;
  privacy: "private" | "public";
  createdAt: Date;
  updatedAt: Date;
}

export interface JournalEntry {
  id: string;
  journalId: string;
  title: string;
  content: string;
  mood?: string;
  tags?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface WritingProject {
  id: string;
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

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: "todo" | "doing" | "done";
  priority: "low" | "medium" | "high";
  dueDate?: Date;
  category?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface StickyNote {
  id: string;
  content: string;
  color: string;
  position: { x: number; y: number };
  createdAt: Date;
  updatedAt: Date;
}

export interface ReadingGoal {
  id: string;
  targetBooks: number;
  targetPages?: number;
  year: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  isPinned?: boolean;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface VisionBoard {
  id: string;
  year: number;
  month: number;
  title?: string;
  description?: string;
  images: VisionImage[];
  createdAt: Date;
  updatedAt: Date;
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
  createdAt: Date;
  updatedAt: Date;
}

export interface QuickNote {
  id: string;
  content: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
} 