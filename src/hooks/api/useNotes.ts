// ============================================================================
// NOTES HOOKS - Hooks React Query para operações de notas (Sandbox)
// ============================================================================

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notesApi } from '@/lib/api';
import { queryKeys, invalidateQueries } from '@/lib/queryClient';
import type { Note } from '@/types';

// ============================================================================
// QUERY HOOKS
// ============================================================================

// Hook para buscar todas as notas do usuário
export function useNotes() {
  return useQuery({
    queryKey: queryKeys.notes.all,
    queryFn: notesApi.getNotes,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
}

// Hook para buscar uma nota específica
export function useNote(noteId: string) {
  return useQuery({
    queryKey: queryKeys.notes.detail(noteId),
    queryFn: () => notesApi.getNotes().then(notes => notes.find(n => n.id === noteId)),
    enabled: !!noteId,
  });
}

// ============================================================================
// MUTATION HOOKS
// ============================================================================

// Hook para criar nova nota
export function useCreateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notesApi.createNote,
    onMutate: async (newNote) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.notes.all });

      const previousNotes = queryClient.getQueryData<Note[]>(queryKeys.notes.all);

      // Otimistic update
      if (previousNotes) {
        const optimisticNote: Note = {
          ...newNote,
          id: `temp-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        queryClient.setQueryData<Note[]>(queryKeys.notes.all, [...previousNotes, optimisticNote]);
      }

      return { previousNotes };
    },
    onError: (err, newNote, context) => {
      if (context?.previousNotes) {
        queryClient.setQueryData(queryKeys.notes.all, context.previousNotes);
      }
    },
    onSettled: () => {
      invalidateQueries.notes();
    },
  });
}

// Hook para atualizar nota
export function useUpdateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ noteId, updates }: { noteId: string; updates: Partial<Note> }) =>
      notesApi.updateNote(noteId, updates),
    onMutate: async ({ noteId, updates }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.notes.all });

      const previousNotes = queryClient.getQueryData<Note[]>(queryKeys.notes.all);

      // Otimistic update
      if (previousNotes) {
        const updatedNotes = previousNotes.map(note =>
          note.id === noteId
            ? { ...note, ...updates, updatedAt: new Date().toISOString() }
            : note
        );
        queryClient.setQueryData(queryKeys.notes.all, updatedNotes);
      }

      return { previousNotes };
    },
    onError: (err, variables, context) => {
      if (context?.previousNotes) {
        queryClient.setQueryData(queryKeys.notes.all, context.previousNotes);
      }
    },
    onSettled: () => {
      invalidateQueries.notes();
    },
  });
}

// Hook para deletar nota
export function useDeleteNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notesApi.deleteNote,
    onMutate: async (noteId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.notes.all });

      const previousNotes = queryClient.getQueryData<Note[]>(queryKeys.notes.all);

      // Otimistic update - remover nota
      if (previousNotes) {
        const updatedNotes = previousNotes.filter(note => note.id !== noteId);
        queryClient.setQueryData(queryKeys.notes.all, updatedNotes);
      }

      return { previousNotes };
    },
    onError: (err, noteId, context) => {
      if (context?.previousNotes) {
        queryClient.setQueryData(queryKeys.notes.all, context.previousNotes);
      }
    },
    onSettled: () => {
      invalidateQueries.notes();
    },
  });
}

// ============================================================================
// COMPUTED HOOKS (Dados derivados)
// ============================================================================

// Hook para estatísticas das notas
export function useNotesStats() {
  const { data: notes = [] } = useNotes();

  return {
    total: notes.length,
    active: notes.filter(n => n.status === 'active').length,
    archived: notes.filter(n => n.status === 'archived').length,
  };
}

// Hook para notas ativas
export function useActiveNotes() {
  const { data: notes = [] } = useNotes();
  
  return notes.filter(note => note.status === 'active');
}