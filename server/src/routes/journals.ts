import { Router } from 'express';
import { JournalController } from '../controllers/journalController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// Journal routes - all require authentication
router.use(authenticateToken);

router.get('/', JournalController.getAllJournals);
router.get('/:id', JournalController.getJournalById);
router.post('/', JournalController.createJournal);
router.put('/:id', JournalController.updateJournal);
router.delete('/:id', JournalController.deleteJournal);

// Journal content routes
router.get('/:journalId/content', JournalController.getJournalContent);
router.post('/:journalId/content', JournalController.saveJournalContent);

export default router; 