// ============================================================================
// ATTACHMENT SERVICE - Serviços para gerenciamento de anexos
// ============================================================================

import { prisma } from '../app';

// ============================================================================
// TYPES
// ============================================================================

interface CreateAttachmentData {
  taskId: string;
  userId: string;
  name: string;
  url: string;
  type: string;
  size: bigint;
}

interface DeleteAttachmentData {
  attachmentId: string;
  taskId: string;
  userId: string;
}

interface GetAttachmentsData {
  taskId: string;
  userId: string;
}

interface AttachmentResponse {
  id: string;
  name: string;
  url: string;
  type: string;
  size: string;
  uploadedAt: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const MAX_ATTACHMENT_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_USER_STORAGE = 2 * 1024 * 1024 * 1024; // 2GB

// ============================================================================
// CREATE ATTACHMENT
// ============================================================================

export const createAttachment = async (data: CreateAttachmentData): Promise<AttachmentResponse> => {
  const { taskId, userId, name, url, type, size } = data;

  // Verificar se a tarefa pertence ao usuário
  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      userId,
      isDeleted: false
    }
  });

  if (!task) {
    throw new Error('Tarefa não encontrada');
  }

  // Verificar limite de tamanho do arquivo
  const sizeNumber = Number(size);
  if (sizeNumber > MAX_ATTACHMENT_SIZE) {
    throw new Error(`Arquivo excede o limite de ${MAX_ATTACHMENT_SIZE / (1024 * 1024)}MB`);
  }

  // Verificar limite total do usuário
  const userAttachments = await prisma.taskAttachment.findMany({
    where: {
      task: {
        userId
      }
    },
    select: {
      size: true
    }
  });

  const totalUserStorage = userAttachments.reduce((total, att) => total + Number(att.size), 0);
  
  if (totalUserStorage + sizeNumber > MAX_USER_STORAGE) {
    throw new Error(`Limite de armazenamento de 2GB por usuário seria excedido`);
  }

  // Criar anexo
  const attachment = await prisma.taskAttachment.create({
    data: {
      taskId,
      name,
      url,
      type,
      size
    }
  });

  console.log('📎 Anexo criado:', {
    attachmentId: attachment.id,
    name: attachment.name,
    taskId,
    userId,
    size: sizeNumber
  });

  return {
    id: attachment.id,
    name: attachment.name,
    url: attachment.url,
    type: attachment.type,
    size: attachment.size.toString(),
    uploadedAt: attachment.uploadedAt.toISOString()
  };
};

// ============================================================================
// DELETE ATTACHMENT
// ============================================================================

export const deleteAttachment = async (data: DeleteAttachmentData): Promise<void> => {
  const { attachmentId, taskId, userId } = data;

  // Verificar se o anexo existe e pertence a uma tarefa do usuário
  const attachment = await prisma.taskAttachment.findFirst({
    where: {
      id: attachmentId,
      taskId,
      task: {
        userId,
        isDeleted: false
      }
    }
  });

  if (!attachment) {
    throw new Error('Anexo não encontrado');
  }

  // Remover anexo
  await prisma.taskAttachment.delete({
    where: {
      id: attachmentId
    }
  });

  console.log('🗑️ Anexo removido:', {
    attachmentId,
    name: attachment.name,
    taskId,
    userId
  });
};

// ============================================================================
// GET TASK ATTACHMENTS
// ============================================================================

export const getTaskAttachments = async (data: GetAttachmentsData): Promise<AttachmentResponse[]> => {
  const { taskId, userId } = data;

  // Verificar se a tarefa pertence ao usuário
  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      userId,
      isDeleted: false
    }
  });

  if (!task) {
    throw new Error('Tarefa não encontrada');
  }

  // Buscar anexos
  const attachments = await prisma.taskAttachment.findMany({
    where: {
      taskId
    },
    orderBy: {
      uploadedAt: 'desc'
    }
  });

  return attachments.map(attachment => ({
    id: attachment.id,
    name: attachment.name,
    url: attachment.url,
    type: attachment.type,
    size: attachment.size.toString(),
    uploadedAt: attachment.uploadedAt.toISOString()
  }));
};

// Export do service
export const attachmentService = {
  createAttachment,
  deleteAttachment,
  getTaskAttachments
};