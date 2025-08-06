import { Request, Response } from 'express';
import { WritingProjectModel } from '../models/writingProject.js';
import { CreateWritingProjectRequest, UpdateWritingProjectRequest, SaveNotebookContentRequest } from '../types.js';

export class WritingProjectController {
  static async getAllProjects(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      const projects = await WritingProjectModel.getAll(req.user.userId);
      res.json(projects);
    } catch (error) {
      console.error('Error fetching writing projects:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getProjectById(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      const { id } = req.params;
      const project = await WritingProjectModel.getById(id, req.user.userId);
      
      if (!project) {
        return res.status(404).json({ error: 'Writing project not found' });
      }
      
      res.json(project);
    } catch (error) {
      console.error('Error fetching writing project:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async createProject(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      const projectData: CreateWritingProjectRequest = req.body;
      
      // Validate required fields
      if (!projectData.title || !projectData.type) {
        return res.status(400).json({ error: 'Title and type are required' });
      }

      const project = await WritingProjectModel.create(projectData, req.user.userId);
      res.status(201).json(project);
    } catch (error) {
      console.error('Error creating writing project:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async updateProject(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      const { id } = req.params;
      const updateData: UpdateWritingProjectRequest = req.body;
      
      const updatedProject = await WritingProjectModel.update(id, updateData, req.user.userId);
      
      if (!updatedProject) {
        return res.status(404).json({ error: 'Writing project not found' });
      }
      
      res.json(updatedProject);
    } catch (error) {
      console.error('Error updating writing project:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async deleteProject(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      const { id } = req.params;
      const deleted = await WritingProjectModel.delete(id, req.user.userId);
      
      if (!deleted) {
        return res.status(404).json({ error: 'Writing project not found' });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting writing project:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async updateWordCount(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      const { id } = req.params;
      const { wordCount } = req.body;
      
      if (typeof wordCount !== 'number' || wordCount < 0) {
        return res.status(400).json({ error: 'Word count must be a positive number' });
      }
      
      const updatedProject = await WritingProjectModel.updateWordCount(id, wordCount, req.user.userId);
      
      if (!updatedProject) {
        return res.status(404).json({ error: 'Writing project not found' });
      }
      
      res.json(updatedProject);
    } catch (error) {
      console.error('Error updating word count:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Notebook content methods
  static async getNotebookContent(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      const { projectId } = req.params;
      const content = await WritingProjectModel.getNotebookContent(projectId);
      
      if (!content) {
        return res.json({ content: '', theme: 'classic', wordCount: 0 });
      }
      
      res.json(content);
    } catch (error) {
      console.error('Error fetching notebook content:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async saveNotebookContent(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      const { projectId } = req.params;
      const contentData: SaveNotebookContentRequest = req.body;
      
      if (!contentData.content) {
        return res.status(400).json({ error: 'Content is required' });
      }
      
      await WritingProjectModel.saveNotebookContent(projectId, contentData, req.user.userId);
      res.json({ success: true });
    } catch (error) {
      console.error('Error saving notebook content:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
} 