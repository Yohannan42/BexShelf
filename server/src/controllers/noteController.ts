import { Request, Response } from "express";
import { NoteModel } from "../models/note.js";
import { CreateNoteRequest, UpdateNoteRequest } from "../types.js";

export class NoteController {
  static async getAllNotes(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      const notes = await NoteModel.getAll(req.user.userId);
      res.json(notes);
    } catch (error) {
      console.error("Error fetching notes:", error);
      res.status(500).json({ error: "Failed to fetch notes" });
    }
  }

  static async getNoteById(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      const { id } = req.params;
      const note = await NoteModel.getById(id, req.user.userId);
      
      if (!note) {
        return res.status(404).json({ error: "Note not found" });
      }
      
      res.json(note);
    } catch (error) {
      console.error("Error fetching note:", error);
      res.status(500).json({ error: "Failed to fetch note" });
    }
  }

  static async createNote(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      const noteData: CreateNoteRequest = req.body;
      
      // Validate required fields
      if (!noteData.title || !noteData.content) {
        return res.status(400).json({ 
          error: "Title and content are required" 
        });
      }

      const newNote = await NoteModel.create(noteData, req.user.userId);
      res.status(201).json(newNote);
    } catch (error) {
      console.error("Error creating note:", error);
      res.status(500).json({ error: "Failed to create note" });
    }
  }

  static async updateNote(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      const { id } = req.params;
      const updateData: UpdateNoteRequest = req.body;

      const updatedNote = await NoteModel.update(id, updateData, req.user.userId);
      
      if (!updatedNote) {
        return res.status(404).json({ error: "Note not found" });
      }
      
      res.json(updatedNote);
    } catch (error) {
      console.error("Error updating note:", error);
      res.status(500).json({ error: "Failed to update note" });
    }
  }

  static async deleteNote(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      const { id } = req.params;
      const deleted = await NoteModel.delete(id, req.user.userId);
      
      if (!deleted) {
        return res.status(404).json({ error: "Note not found" });
      }
      
      res.json({ message: "Note deleted successfully" });
    } catch (error) {
      console.error("Error deleting note:", error);
      res.status(500).json({ error: "Failed to delete note" });
    }
  }

  static async searchNotes(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      const { q } = req.query;
      
      if (!q || typeof q !== "string") {
        return res.status(400).json({ error: "Search query is required" });
      }

      const notes = await NoteModel.search(q, req.user.userId);
      res.json(notes);
    } catch (error) {
      console.error("Error searching notes:", error);
      res.status(500).json({ error: "Failed to search notes" });
    }
  }

  static async getPinnedNotes(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      const notes = await NoteModel.getPinned(req.user.userId);
      res.json(notes);
    } catch (error) {
      console.error("Error fetching pinned notes:", error);
      res.status(500).json({ error: "Failed to fetch pinned notes" });
    }
  }
} 