import { Request, Response } from "express";
import { ReadingGoalModel } from "../models/readingGoal.js";
import { CreateReadingGoalRequest, UpdateReadingGoalRequest } from "../types";

export class ReadingGoalController {
  static async getAllReadingGoals(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      const goals = await ReadingGoalModel.getAll(req.user.userId);
      res.json(goals);
    } catch (error) {
      console.error("Error fetching reading goals:", error);
      res.status(500).json({ error: "Failed to fetch reading goals" });
    }
  }

  static async getReadingGoalById(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      const { id } = req.params;
      const goal = await ReadingGoalModel.getById(id, req.user.userId);

      if (!goal) {
        return res.status(404).json({ error: "Reading goal not found" });
      }

      res.json(goal);
    } catch (error) {
      console.error("Error fetching reading goal:", error);
      res.status(500).json({ error: "Failed to fetch reading goal" });
    }
  }

  static async getActiveReadingGoal(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      const goal = await ReadingGoalModel.getActiveGoal(req.user.userId);
      res.json(goal);
    } catch (error) {
      console.error("Error fetching active reading goal:", error);
      res.status(500).json({ error: "Failed to fetch active reading goal" });
    }
  }

  static async getReadingGoalByYear(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      const { year } = req.params;
      const goal = await ReadingGoalModel.getByYear(parseInt(year), req.user.userId);
      res.json(goal);
    } catch (error) {
      console.error("Error fetching reading goal by year:", error);
      res.status(500).json({ error: "Failed to fetch reading goal by year" });
    }
  }

  static async createReadingGoal(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      const data: CreateReadingGoalRequest = req.body;

      if (!data.targetBooks || !data.year) {
        return res.status(400).json({ error: "Target books and year are required" });
      }

      const goal = await ReadingGoalModel.create(data, req.user.userId);
      res.status(201).json(goal);
    } catch (error: any) {
      console.error("Error creating reading goal:", error);
      res.status(500).json({ error: "Failed to create reading goal" });
    }
  }

  static async updateReadingGoal(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      const { id } = req.params;
      const data: UpdateReadingGoalRequest = req.body;

      const goal = await ReadingGoalModel.update(id, data, req.user.userId);
      res.json(goal);
    } catch (error: any) {
      console.error("Error updating reading goal:", error);
      if (error.message.includes("not found")) {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: "Failed to update reading goal" });
    }
  }

  static async deleteReadingGoal(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      const { id } = req.params;
      await ReadingGoalModel.delete(id, req.user.userId);
      res.status(204).send();
    } catch (error: any) {
      console.error("Error deleting reading goal:", error);
      if (error.message.includes("not found")) {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: "Failed to delete reading goal" });
    }
  }
} 