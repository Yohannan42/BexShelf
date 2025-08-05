import { Request, Response } from 'express';
import { JournalModel } from '../models/journal.js';
import { CreateJournalRequest, UpdateJournalRequest, SaveJournalContentRequest } from '../types.js';
import { authenticateToken } from '../middleware/auth.js';

export class JournalController {
  static async getAllJournals(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      const journals = await JournalModel.getAll(req.user.userId);
      res.json(journals);
    } catch (error) {
      console.error('Error fetching journals:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getJournalById(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      const { id } = req.params;
      const journal = await JournalModel.getById(id, req.user.userId);
      
      if (!journal) {
        return res.status(404).json({ error: 'Journal not found' });
      }
      
      res.json(journal);
    } catch (error) {
      console.error('Error fetching journal:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async createJournal(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      const journalData: CreateJournalRequest = req.body;
      
      // Validate required fields
      if (!journalData.title) {
        return res.status(400).json({ error: 'Title is required' });
      }

      const journal = await JournalModel.create(journalData, req.user.userId);
      res.status(201).json(journal);
    } catch (error) {
      console.error('Error creating journal:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async updateJournal(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      const { id } = req.params;
      const updateData: UpdateJournalRequest = req.body;
      
      const updatedJournal = await JournalModel.update(id, updateData, req.user.userId);
      
      if (!updatedJournal) {
        return res.status(404).json({ error: 'Journal not found' });
      }
      
      res.json(updatedJournal);
    } catch (error) {
      console.error('Error updating journal:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async deleteJournal(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      const { id } = req.params;
      const deleted = await JournalModel.delete(id, req.user.userId);
      
      if (!deleted) {
        return res.status(404).json({ error: 'Journal not found' });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting journal:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Journal content methods
  static async getJournalContent(req: Request, res: Response) {
    try {
      const { journalId } = req.params;
      const content = await JournalModel.getJournalContent(journalId);
      
      if (!content) {
        return res.json({ content: '', theme: 'classic', wordCount: 0 });
      }
      
      res.json(content);
    } catch (error) {
      console.error('Error fetching journal content:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async saveJournalContent(req: Request, res: Response) {
    try {
      const { journalId } = req.params;
      const contentData: SaveJournalContentRequest = req.body;
      
      if (!contentData.content) {
        return res.status(400).json({ error: 'Content is required' });
      }
      
      await JournalModel.saveJournalContent(journalId, contentData);
      res.json({ success: true });
    } catch (error) {
      console.error('Error saving journal content:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
} 