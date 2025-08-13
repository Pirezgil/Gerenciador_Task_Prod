// ============================================================================
// ATTACHMENTS HOOKS - React Query para operações de anexos
// ============================================================================

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/providers/AuthProvider';
import { queryKeys } from '@/lib/queryClient';

// ============================================================================
// TYPES
// ============================================================================

interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: string;
  uploadedAt: string;
}

interface CreateAttachmentData {
  taskId: string;
  name: string;
  url: string;
  type: string;
  size: string;
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

const attachmentsApi = {
  // Buscar anexos de uma tarefa
  getTaskAttachments: async (taskId: string, _token?: string): Promise<Attachment[]> => {
    const response = await fetch(`http://localhost:3001/api/tasks/${taskId}/attachments`, {
      credentials: 'include' // Enviar cookies automaticamente
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao buscar anexos');
    }

    const data = await response.json();
    return data.data;
  },

  // Criar anexo
  createAttachment: async (data: CreateAttachmentData, _token?: string): Promise<Attachment> => {
    const { taskId, ...attachmentData } = data;
    
    const response = await fetch(`http://localhost:3001/api/tasks/${taskId}/attachments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include', // Enviar cookies automaticamente
      body: JSON.stringify(attachmentData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao criar anexo');
    }

    const responseData = await response.json();
    return responseData.data;
  },

  // Remover anexo
  deleteAttachment: async (taskId: string, attachmentId: string, _token?: string): Promise<void> => {
    const response = await fetch(`http://localhost:3001/api/tasks/${taskId}/attachments/${attachmentId}`, {
      method: 'DELETE',
      credentials: 'include' // Enviar cookies automaticamente
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao remover anexo');
    }
  }
};

// ============================================================================
// HOOKS
// ============================================================================

// Hook para buscar anexos de uma tarefa
export function useTaskAttachments(taskId: string) {
  const { user, isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: queryKeys.attachments.task(taskId),
    queryFn: () => {
      // Para autenticação baseada em cookies, não precisamos passar token
      return attachmentsApi.getTaskAttachments(taskId, '');
    },
    enabled: !!taskId && isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutos - anexos são relativamente estáveis
  });
}

// Hook para criar anexo com update otimista
export function useCreateAttachment() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (data: CreateAttachmentData) => 
      attachmentsApi.createAttachment(data, ''), // Usar cookies para auth
    
    onMutate: async (newAttachmentData) => {
      // Cancelar queries em andamento
      await queryClient.cancelQueries({ queryKey: queryKeys.attachments.task(newAttachmentData.taskId) });

      // Snapshot do estado anterior
      const previousAttachments = queryClient.getQueryData<Attachment[]>(
        queryKeys.attachments.task(newAttachmentData.taskId)
      );

      // Update otimista - adicionar anexo imediatamente
      if (previousAttachments) {
        const optimisticAttachment: Attachment = {
          id: `temp_${Date.now()}`, // ID temporário
          name: newAttachmentData.name,
          url: newAttachmentData.url,
          type: newAttachmentData.type,
          size: newAttachmentData.size,
          uploadedAt: new Date().toISOString()
        };

        queryClient.setQueryData<Attachment[]>(
          queryKeys.attachments.task(newAttachmentData.taskId),
          [...previousAttachments, optimisticAttachment]
        );
      }

      return { previousAttachments };
    },

    onError: (err, newAttachmentData, context) => {
      // Reverter update otimista em caso de erro
      if (context?.previousAttachments) {
        queryClient.setQueryData(
          queryKeys.attachments.task(newAttachmentData.taskId),
          context.previousAttachments
        );
      }
    },

    onSuccess: (createdAttachment, variables) => {
      // Substituir anexo temporário pelo real
      const taskId = variables.taskId;
      queryClient.setQueryData<Attachment[]>(
        queryKeys.attachments.task(taskId),
        (old) => {
          if (!old) return [createdAttachment];
          // Substituir ID temporário pelo real
          return old.map(att => 
            att.id.startsWith('temp_') ? createdAttachment : att
          );
        }
      );

      // Invalidar cache da tarefa para atualizar contador de anexos
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.detail(taskId) });
    },
  });
}

// Hook para remover anexo com update otimista
export function useDeleteAttachment() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: ({ taskId, attachmentId }: { taskId: string; attachmentId: string }) =>
      attachmentsApi.deleteAttachment(taskId, attachmentId, ''), // Usar cookies para auth
    
    onMutate: async ({ taskId, attachmentId }) => {
      // Cancelar queries em andamento
      await queryClient.cancelQueries({ queryKey: queryKeys.attachments.task(taskId) });

      // Snapshot do estado anterior
      const previousAttachments = queryClient.getQueryData<Attachment[]>(
        queryKeys.attachments.task(taskId)
      );

      // Update otimista - remover anexo imediatamente
      if (previousAttachments) {
        queryClient.setQueryData<Attachment[]>(
          queryKeys.attachments.task(taskId),
          previousAttachments.filter(att => att.id !== attachmentId)
        );
      }

      return { previousAttachments };
    },

    onError: (err, { taskId }, context) => {
      // Reverter update otimista em caso de erro
      if (context?.previousAttachments) {
        queryClient.setQueryData(
          queryKeys.attachments.task(taskId),
          context.previousAttachments
        );
      }
    },

    onSuccess: (_, { taskId }) => {
      // Invalidar cache da tarefa para atualizar contador de anexos
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.detail(taskId) });
    },
  });
}