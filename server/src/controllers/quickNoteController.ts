import { Request, Response } from "express";
import { QuickNoteModel } from "../models/quickNote.js";
import { CreateQuickNoteRequest, UpdateQuickNoteRequest } from "../types";

export class QuickNoteController {
  static async getAllQuickNotes(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      const notes = await QuickNoteModel.getAll(req.user.userId);
      res.json(notes);
    } catch (error) {
      console.error("Error fetching quick notes:", error);
      res.status(500).json({ error: "Failed to fetch quick notes" });
    }
  }

  static async getQuickNoteById(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      const { id } = req.params;
      const note = await QuickNoteModel.getById(id, req.user.userId);
      
      if (!note) {
        return res.status(404).json({ error: "Quick note not found" });
      }
      
      res.json(note);
    } catch (error) {
      console.error("Error fetching quick note:", error);
      res.status(500).json({ error: "Failed to fetch quick note" });
    }
  }

  static async createQuickNote(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      const data: CreateQuickNoteRequest = req.body;
      
      if (!data.content || !data.color) {
        return res.status(400).json({ error: "Content and color are required" });
      }

      const note = await QuickNoteModel.create(data, req.user.userId);
      res.status(201).json(note);
    } catch (error: any) {
      console.error("Error creating quick note:", error);
      if (error.message.includes("Maximum of 8 quick notes") || 
          error.message.includes("cannot exceed 15 words")) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: "Failed to create quick note" });
    }
  }

  static async updateQuickNote(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      const { id } = req.params;
      const data: UpdateQuickNoteRequest = req.body;
      
      const note = await QuickNoteModel.update(id, data, req.user.userId);
      res.json(note);
    } catch (error: any) {
      console.error("Error updating quick note:", error);
      if (error.message.includes("not found")) {
        return res.status(404).json({ error: error.message });
      }
      if (error.message.includes("cannot exceed 15 words")) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: "Failed to update quick note" });
    }
  }

  static async deleteQuickNote(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      const { id } = req.params;
      await QuickNoteModel.delete(id, req.user.userId);
      res.status(204).send();
    } catch (error: any) {
      console.error("Error deleting quick note:", error);
      if (error.message.includes("not found")) {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: "Failed to delete quick note" });
    }
  }

  static async getQuickNotesCount(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      const count = await QuickNoteModel.getCount(req.user.userId);
      res.json({ count });
    } catch (error) {
      console.error("Error fetching quick notes count:", error);
      res.status(500).json({ error: "Failed to fetch quick notes count" });
    }
  }
} 