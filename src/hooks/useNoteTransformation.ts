// ============================================================================
// NOTE TRANSFORMATION HOOK - Hook para transformar notas em tarefas/projetos
// ============================================================================

import { useCallback } from 'react';
import { useUpdateNote } from '@/hooks/api/useNotes';
import { useNotification } from '@/hooks/useNotification';
import type { Note } from '@/types';

export function useNoteTransformation() {
  const updateNote = useUpdateNote();
  const { success, error } = useNotification();

  const archiveTransformedNote = useCallback(async (note: Note | null) => {
    if (!note) return;

    try {
      await updateNote.mutateAsync({
        noteId: note.id,
        updates: { status: 'archived' }
      });

      success('Nota arquivada automaticamente', {
        description: 'A nota foi arquivada após ser transformada',
        context: 'note_transformation'
      });
    } catch (err) {
      error('Erro ao arquivar nota', {
        description: 'A nota não pôde ser arquivada automaticamente',
        context: 'note_transformation'
      });
    }
  }, [updateNote, success, error]);

  return {
    archiveTransformedNote
  };
}