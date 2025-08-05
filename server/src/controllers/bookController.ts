import { Request, Response } from 'express';
import { BookModel } from '../models/book.js';
import { CreateBookRequest, UpdateBookRequest } from '../types.js';
import multer from 'multer';
import { authenticateToken } from '../middleware/auth.js';

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
});

export class BookController {
  static async getAllBooks(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      const books = await BookModel.getAll(req.user.userId);
      res.json(books);
    } catch (error) {
      console.error('Error fetching books:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getBookById(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      const { id } = req.params;
      const book = await BookModel.getById(id, req.user.userId);
      
      if (!book) {
        return res.status(404).json({ error: 'Book not found' });
      }
      
      res.json(book);
    } catch (error) {
      console.error('Error fetching book:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getBooksByStatus(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      const { status } = req.params;
      const books = await BookModel.getByStatus(status, req.user.userId);
      res.json(books);
    } catch (error) {
      console.error('Error fetching books by status:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async createBook(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      const bookData: CreateBookRequest = req.body;
      
      // Validate required fields
      if (!bookData.title || !bookData.author || !bookData.genre) {
        return res.status(400).json({ error: 'Title, author, and genre are required' });
      }

      const file = req.file;
      const book = await BookModel.create(bookData, req.user.userId, file);
      res.status(201).json(book);
    } catch (error) {
      console.error('Error creating book:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async updateBook(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      const { id } = req.params;
      const updateData: UpdateBookRequest = req.body;
      const file = req.file;
      
      const updatedBook = await BookModel.update(id, updateData, req.user.userId, file);
      
      if (!updatedBook) {
        return res.status(404).json({ error: 'Book not found' });
      }
      
      res.json(updatedBook);
    } catch (error) {
      console.error('Error updating book:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async deleteBook(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      const { id } = req.params;
      const deleted = await BookModel.delete(id, req.user.userId);
      
      if (!deleted) {
        return res.status(404).json({ error: 'Book not found' });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting book:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getBookStats(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      const stats = await BookModel.getStats(req.user.userId);
      res.json(stats);
    } catch (error) {
      console.error('Error fetching book stats:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async downloadBookFile(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      const { id } = req.params;
      const filePath = await BookModel.getBookFilePath(id, req.user.userId);
      
      if (!filePath) {
        return res.status(404).json({ error: 'Book file not found' });
      }
      
      res.download(filePath);
    } catch (error) {
      console.error('Error downloading book file:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Middleware for file upload
  static uploadMiddleware = upload.single('pdf');
} 