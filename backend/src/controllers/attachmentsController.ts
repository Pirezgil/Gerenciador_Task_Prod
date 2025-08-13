// ============================================================================
// ATTACHMENTS CONTROLLER - Operações específicas de anexos
// ============================================================================

import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/api';
import { attachmentService } from '../services/attachmentService';

// ============================================================================
// CREATE ATTACHMENT
// ============================================================================

export const createAttachment = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { taskId } = req.params;
    const { name, url, type, size } = req.body;
    
    if (!taskId || !name || !url || !type || !size) {
      res.status(400).json({
        success: false,
        error: 'Dados do anexo são obrigatórios'
      });
      return;
    }

    // Verificar se a tarefa pertence ao usuário
    const attachment = await attachmentService.createAttachment({
      taskId,
      userId: req.userId,
      name,
      url,
      type,
      size: BigInt(size)
    });

    console.log('Anexo criado com sucesso', { 
      attachmentId: attachment.id,
      taskId,
      userId: req.userId 
    });

    res.status(201).json({
      success: true,
      data: attachment
    });

  } catch (error) {
    console.error('Erro ao criar anexo:', error);
    
    if (error instanceof Error) {
      if (error.message === 'Tarefa não encontrada') {
        res.status(404).json({
          success: false,
          error: 'Tarefa não encontrada'
        });
        return;
      }
      if (error.message.includes('Limite')) {
        res.status(400).json({
          success: false,
          error: error.message
        });
        return;
      }
    }

    next(error);
  }
};

// ============================================================================
// DELETE ATTACHMENT  
// ============================================================================

export const deleteAttachment = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { taskId, attachmentId } = req.params;
    
    if (!taskId || !attachmentId) {
      res.status(400).json({
        success: false,
        error: 'IDs da tarefa e anexo são obrigatórios'
      });
      return;
    }

    await attachmentService.deleteAttachment({
      attachmentId,
      taskId,
      userId: req.userId
    });

    console.log('Anexo removido com sucesso', { 
      attachmentId,
      taskId,
      userId: req.userId 
    });

    res.status(200).json({
      success: true,
      message: 'Anexo removido com sucesso'
    });

  } catch (error) {
    console.error('Erro ao remover anexo:', error);
    
    if (error instanceof Error) {
      if (error.message === 'Anexo não encontrado') {
        res.status(404).json({
          success: false,
          error: 'Anexo não encontrado'
        });
        return;
      }
    }

    next(error);
  }
};

// ============================================================================
// GET ATTACHMENTS
// ============================================================================

export const getAttachments = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { taskId } = req.params;
    
    if (!taskId) {
      res.status(400).json({
        success: false,
        error: 'ID da tarefa é obrigatório'
      });
      return;
    }

    const attachments = await attachmentService.getTaskAttachments({
      taskId,
      userId: req.userId
    });

    res.status(200).json({
      success: true,
      data: attachments
    });

  } catch (error) {
    console.error('Erro ao buscar anexos:', error);
    
    if (error instanceof Error) {
      if (error.message === 'Tarefa não encontrada') {
        res.status(404).json({
          success: false,
          error: 'Tarefa não encontrada'
        });
        return;
      }
    }

    next(error);
  }
};