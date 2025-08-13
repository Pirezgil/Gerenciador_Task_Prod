// ============================================================================
// ATTACHMENTS ROUTES - Rotas específicas para anexos de tarefas
// ============================================================================

import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { validate, createAttachmentSchema, deleteAttachmentSchema } from '../lib/validation';
import * as attachmentsController from '../controllers/attachmentsController';

const router = Router();

// Aplicar autenticação em todas as rotas
router.use(authenticate);

// ============================================================================
// ROUTES
// ============================================================================

// GET /tasks/:taskId/attachments - Listar anexos da tarefa
router.get('/:taskId/attachments', 
  attachmentsController.getAttachments
);

// POST /tasks/:taskId/attachments - Adicionar anexo à tarefa
router.post('/:taskId/attachments', 
  validate(createAttachmentSchema),
  attachmentsController.createAttachment
);

// DELETE /tasks/:taskId/attachments/:attachmentId - Remover anexo específico
router.delete('/:taskId/attachments/:attachmentId', 
  attachmentsController.deleteAttachment
);

export default router;