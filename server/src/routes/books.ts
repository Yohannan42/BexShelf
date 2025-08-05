import { Router } from 'express';
import { BookController } from '../controllers/bookController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// Book routes - all require authentication
router.use(authenticateToken);

router.get('/', BookController.getAllBooks);
router.get('/stats', BookController.getBookStats);
router.get('/status/:status', BookController.getBooksByStatus);
router.get('/:id', BookController.getBookById);
router.post('/', BookController.uploadMiddleware, BookController.createBook);
router.put('/:id', BookController.uploadMiddleware, BookController.updateBook);
router.delete('/:id', BookController.deleteBook);

// File download route
router.get('/:id/download', BookController.downloadBookFile);

export default router; 