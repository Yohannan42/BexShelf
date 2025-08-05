import { Request, Response } from "express";
import { TaskModel } from "../models/task.js";
import { CreateTaskRequest, UpdateTaskRequest } from "../types.js";
import { authenticateToken } from "../middleware/auth.js";

export class TaskController {
  static async getAllTasks(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      const tasks = await TaskModel.getAll(req.user.userId);
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ error: "Failed to fetch tasks" });
    }
  }

  static async getTasksByStatus(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      const { status } = req.params;
      if (!["todo", "doing", "done"].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }

      const tasks = await TaskModel.getByStatus(status as "todo" | "doing" | "done", req.user.userId);
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching tasks by status:", error);
      res.status(500).json({ error: "Failed to fetch tasks by status" });
    }
  }

  static async getTasksByDate(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      const { date } = req.params;
      const tasks = await TaskModel.getByDate(date, req.user.userId);
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching tasks by date:", error);
      res.status(500).json({ error: "Failed to fetch tasks by date" });
    }
  }

  static async getTaskById(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      const { id } = req.params;
      const task = await TaskModel.getById(id, req.user.userId);
      
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }
      
      res.json(task);
    } catch (error) {
      console.error("Error fetching task:", error);
      res.status(500).json({ error: "Failed to fetch task" });
    }
  }

  static async createTask(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      const taskData: CreateTaskRequest = req.body;
      
      // Validate required fields
      if (!taskData.title || !taskData.status || !taskData.dueDate) {
        return res.status(400).json({ 
          error: "Title, status, and due date are required" 
        });
      }

      // Validate status
      if (!["todo", "doing", "done"].includes(taskData.status)) {
        return res.status(400).json({ error: "Invalid status" });
      }

      const newTask = await TaskModel.create(taskData, req.user.userId);
      res.status(201).json(newTask);
    } catch (error) {
      console.error("Error creating task:", error);
      res.status(500).json({ error: "Failed to create task" });
    }
  }

  static async updateTask(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      const { id } = req.params;
      const updateData: UpdateTaskRequest = req.body;

      // Validate status if provided
      if (updateData.status && !["todo", "doing", "done"].includes(updateData.status)) {
        return res.status(400).json({ error: "Invalid status" });
      }

      const updatedTask = await TaskModel.update(id, updateData, req.user.userId);
      
      if (!updatedTask) {
        return res.status(404).json({ error: "Task not found" });
      }
      
      res.json(updatedTask);
    } catch (error) {
      console.error("Error updating task:", error);
      res.status(500).json({ error: "Failed to update task" });
    }
  }

  static async deleteTask(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      const { id } = req.params;
      const deleted = await TaskModel.delete(id, req.user.userId);
      
      if (!deleted) {
        return res.status(404).json({ error: "Task not found" });
      }
      
      res.json({ message: "Task deleted successfully" });
    } catch (error) {
      console.error("Error deleting task:", error);
      res.status(500).json({ error: "Failed to delete task" });
    }
  }

  static async getTaskStats(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      const stats = await TaskModel.getStats(req.user.userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching task stats:", error);
      res.status(500).json({ error: "Failed to fetch task stats" });
    }
  }
} 