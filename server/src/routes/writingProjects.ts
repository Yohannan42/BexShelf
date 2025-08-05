import { Router } from 'express';
import { WritingProjectController } from '../controllers/writingProjectController.js';

const router = Router();

// Writing project routes
router.get('/', WritingProjectController.getAllProjects);
router.get('/:id', WritingProjectController.getProjectById);
router.post('/', WritingProjectController.createProject);
router.put('/:id', WritingProjectController.updateProject);
router.delete('/:id', WritingProjectController.deleteProject);
router.patch('/:id/word-count', WritingProjectController.updateWordCount);

// Notebook content routes
router.get('/:projectId/content', WritingProjectController.getNotebookContent);
router.post('/:projectId/content', WritingProjectController.saveNotebookContent);

export default router; 