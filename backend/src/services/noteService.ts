import bcrypt from 'bcrypt';
import { prisma } from '../app';
import { 
  CreateNoteRequest, 
  UpdateNoteRequest, 
  NoteResponse,
  CreateSandboxLayoutRequest,
  UpdateSandboxLayoutRequest,
  SandboxAuthRequest
} from '../types/note';

export const getUserNotes = async (userId: string): Promise<NoteResponse[]> => {
  const notes = await prisma.note.findMany({
    where: { userId },
    include: {
      layout: true,
      attachments: true
    },
    orderBy: { updatedAt: 'desc' }
  });

  return notes.map(note => ({
    id: note.id,
    content: note.content,
    status: note.status as any,
    createdAt: note.createdAt.toISOString(),
    updatedAt: note.updatedAt.toISOString(),
    layout: note.layout ? {
      id: note.layout.id,
      noteId: note.layout.noteId,
      positionX: note.layout.positionX,
      positionY: note.layout.positionY,
      width: note.layout.width,
      height: note.layout.height,
      zIndex: note.layout.zIndex,
      isExpanded: note.layout.isExpanded,
      color: note.layout.color,
      createdAt: note.layout.createdAt.toISOString(),
      updatedAt: note.layout.updatedAt.toISOString()
    } : undefined,
    attachments: note.attachments.map(att => ({
      id: att.id,
      name: att.name,
      url: att.url,
      type: att.type,
      size: att.size.toString(),
      uploadedAt: att.uploadedAt.toISOString()
    }))
  }));
};

export const createNote = async (userId: string, data: CreateNoteRequest): Promise<NoteResponse> => {
  const note = await prisma.note.create({
    data: {
      userId,
      content: data.content,
      status: data.status || 'active'
    },
    include: {
      layout: true,
      attachments: true
    }
  });

  return {
    id: note.id,
    content: note.content,
    status: note.status as any,
    createdAt: note.createdAt.toISOString(),
    updatedAt: note.updatedAt.toISOString(),
    layout: undefined,
    attachments: []
  };
};

export const updateNote = async (noteId: string, userId: string, data: UpdateNoteRequest): Promise<NoteResponse> => {
  const existingNote = await prisma.note.findFirst({
    where: { id: noteId, userId }
  });

  if (!existingNote) {
    throw new Error('Nota não encontrada');
  }

  const note = await prisma.note.update({
    where: { id: noteId },
    data,
    include: {
      layout: true,
      attachments: true
    }
  });

  return {
    id: note.id,
    content: note.content,
    status: note.status as any,
    createdAt: note.createdAt.toISOString(),
    updatedAt: note.updatedAt.toISOString(),
    layout: note.layout ? {
      id: note.layout.id,
      noteId: note.layout.noteId,
      positionX: note.layout.positionX,
      positionY: note.layout.positionY,
      width: note.layout.width,
      height: note.layout.height,
      zIndex: note.layout.zIndex,
      isExpanded: note.layout.isExpanded,
      color: note.layout.color,
      createdAt: note.layout.createdAt.toISOString(),
      updatedAt: note.layout.updatedAt.toISOString()
    } : undefined,
    attachments: note.attachments.map(att => ({
      id: att.id,
      name: att.name,
      url: att.url,
      type: att.type,
      size: att.size.toString(),
      uploadedAt: att.uploadedAt.toISOString()
    }))
  };
};

export const deleteNote = async (noteId: string, userId: string): Promise<void> => {
  const note = await prisma.note.findFirst({
    where: { id: noteId, userId }
  });

  if (!note) {
    throw new Error('Nota não encontrada');
  }

  await prisma.note.delete({
    where: { id: noteId }
  });
};

export const createSandboxLayout = async (userId: string, data: CreateSandboxLayoutRequest) => {
  // Verificar se a nota pertence ao usuário
  const note = await prisma.note.findFirst({
    where: { id: data.noteId, userId }
  });

  if (!note) {
    throw new Error('Nota não encontrada');
  }

  const layout = await prisma.sandboxLayout.create({
    data: {
      userId,
      noteId: data.noteId,
      positionX: data.positionX || 0,
      positionY: data.positionY || 0,
      width: data.width || 300,
      height: data.height || 200,
      zIndex: data.zIndex || 1,
      isExpanded: data.isExpanded || false,
      color: data.color || '#FEF3C7'
    }
  });

  return layout;
};

export const updateSandboxLayout = async (noteId: string, userId: string, data: UpdateSandboxLayoutRequest) => {
  const layout = await prisma.sandboxLayout.findFirst({
    where: { noteId, userId }
  });

  if (!layout) {
    throw new Error('Layout não encontrado');
  }

  return await prisma.sandboxLayout.update({
    where: { id: layout.id },
    data
  });
};

export const authenticateSandbox = async (userId: string, password: string) => {
  const userSettings = await prisma.userSettings.findUnique({
    where: { userId }
  });

  if (!userSettings?.sandboxEnabled) {
    throw new Error('Sandbox não habilitado');
  }

  if (!userSettings.sandboxPassword) {
    throw new Error('Senha do sandbox não configurada');
  }

  // Verificar senha
  const isValid = await bcrypt.compare(password, userSettings.sandboxPassword);
  
  if (!isValid) {
    // Incrementar tentativas falhadas
    await prisma.sandboxAuth.upsert({
      where: { userId },
      update: {
        failedAttempts: { increment: 1 }
      },
      create: {
        userId,
        isUnlocked: false,
        failedAttempts: 1
      }
    });
    
    throw new Error('Senha incorreta');
  }

  // Atualizar status de desbloqueio
  await prisma.sandboxAuth.upsert({
    where: { userId },
    update: {
      isUnlocked: true,
      lastUnlockTime: new Date(),
      failedAttempts: 0
    },
    create: {
      userId,
      isUnlocked: true,
      lastUnlockTime: new Date(),
      failedAttempts: 0
    }
  });

  return {
    isUnlocked: true,
    unlockTime: new Date().toISOString()
  };
};