import { Router } from 'express';
import * as notesController from '../controllers/notesController';
import { authenticate } from '../middleware/auth';
import { validate } from '../lib/validation';
import { createNoteSchema, updateNoteSchema, sandboxAuthSchema } from '../lib/validation';

const router = Router();

router.use(authenticate);

router.get('/', notesController.getNotes);
router.post('/', validate(createNoteSchema), notesController.createNote);
router.put('/:id', validate(updateNoteSchema), notesController.updateNote);
router.delete('/:id', notesController.deleteNote);

// Sandbox auth
router.post('/sandbox/auth', validate(sandboxAuthSchema), notesController.authenticateSandbox);

export { router as noteRoutes };