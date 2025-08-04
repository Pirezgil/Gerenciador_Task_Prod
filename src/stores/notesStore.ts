'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Note, MovableNote, SandboxLayout, Attachment } from '@/types';

interface NotesState {
  notes: Note[];
  newNoteContent: string;
  editingNote: string | null;
  sandboxLayout: SandboxLayout;

  // Actions
  setEditingNote: (noteId: string | null) => void;
  setNewNoteContent: (content: string) => void;
  saveNote: (content: string) => void;
  updateNote: (noteId: string, content: string) => void;
  archiveNote: (noteId: string) => void;
  deleteNote: (noteId: string) => void;
  updateNoteAttachments: (noteId: string, attachments: Attachment[]) => void;

  // Sandbox Layout Actions
  convertNotesToMovable: () => void;
  updateNotePosition: (noteId: string, x: number, y: number) => void;
  updateNoteSize: (noteId: string, width: number, height: number) => void;
  updateNoteZIndex: (noteId: string, zIndex: number) => void;
  toggleNoteExpanded: (noteId: string) => void;
  updateNoteColor: (noteId: string, color: string) => void;
  selectNote: (noteId: string | null) => void;
  setLayoutMode: (mode: 'free' | 'grid' | 'list' | 'masonry') => void;
  setSnapToGrid: (snap: boolean) => void;
  setGridSize: (size: number) => void;
  setShowGrid: (show: boolean) => void;
}

const initialSandboxLayout: SandboxLayout = {
  notes: [],
  selectedNoteId: null,
  gridSize: 20,
  showGrid: false,
  layoutMode: 'free',
  snapToGrid: true,
  density: 'normal',
};

export const useNotesStore = create<NotesState>()(
  persist(
    (set, get) => ({
      // State
      notes: [],
      newNoteContent: '',
      editingNote: null,
      sandboxLayout: initialSandboxLayout,

      // Actions
      setEditingNote: (noteId) => set({ editingNote: noteId }),
      setNewNoteContent: (content) => set({ newNoteContent: content }),

      saveNote: (content) => {
        const newNote: Note = {
          id: `note_${Date.now()}`,
          content,
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          attachments: [],
        };
        set(state => ({
          notes: [...state.notes, newNote],
          newNoteContent: '',
        }));
      },

      updateNote: (noteId, content) => {
        set(state => ({
          notes: state.notes.map(note =>
            note.id === noteId
              ? { ...note, content, updatedAt: new Date().toISOString() }
              : note
          ),
          editingNote: null,
        }));
      },

      archiveNote: (noteId) => {
        set(state => ({
          notes: state.notes.map(note =>
            note.id === noteId
              ? { ...note, status: 'archived', updatedAt: new Date().toISOString() }
              : note
          )
        }));
      },

      deleteNote: (noteId) => {
        set(state => ({
          notes: state.notes.filter(note => note.id !== noteId),
          sandboxLayout: {
            ...state.sandboxLayout,
            notes: state.sandboxLayout.notes.filter(note => note.id !== noteId)
          }
        }));
      },

      updateNoteAttachments: (noteId, attachments) => {
        set(state => ({
          notes: state.notes.map(note =>
            note.id === noteId
              ? { ...note, attachments, updatedAt: new Date().toISOString() }
              : note
          )
        }));
      },

      // Sandbox Layout Actions
      convertNotesToMovable: () => {
        const { notes, sandboxLayout } = get();
        const existingMovableIds = new Set(sandboxLayout.notes.map(n => n.id));
        const newNotesToConvert = notes.filter(note => !existingMovableIds.has(note.id) && note.status === 'active');

        const newMovableNotes: MovableNote[] = newNotesToConvert.map((note, index) => ({
          ...note,
          position: { x: 50 + (index % 5) * 120, y: 150 + Math.floor(index / 5) * 120 },
          size: { width: 300, height: 200 },
          isExpanded: false,
          color: '#fbbf24',
          zIndex: 1 + index,
        }));

        set(state => ({
          sandboxLayout: {
            ...state.sandboxLayout,
            notes: [...state.sandboxLayout.notes, ...newMovableNotes],
          },
        }));
      },

      updateNotePosition: (noteId, x, y) => {
        set(state => ({
          sandboxLayout: {
            ...state.sandboxLayout,
            notes: state.sandboxLayout.notes.map(note =>
              note.id === noteId
                ? { ...note, position: { x, y }, updatedAt: new Date().toISOString() }
                : note
            ),
          },
        }));
      },

      updateNoteSize: (noteId, width, height) => {
        set(state => ({
          sandboxLayout: {
            ...state.sandboxLayout,
            notes: state.sandboxLayout.notes.map(note =>
              note.id === noteId
                ? { ...note, size: { width, height }, updatedAt: new Date().toISOString() }
                : note
            ),
          },
        }));
      },

      updateNoteZIndex: (noteId, zIndex) => {
        set(state => ({
          sandboxLayout: {
            ...state.sandboxLayout,
            notes: state.sandboxLayout.notes.map(note =>
              note.id === noteId
                ? { ...note, zIndex, updatedAt: new Date().toISOString() }
                : note
            ),
          },
        }));
      },

      toggleNoteExpanded: (noteId) => {
        set(state => ({
          sandboxLayout: {
            ...state.sandboxLayout,
            notes: state.sandboxLayout.notes.map(note =>
              note.id === noteId
                ? { ...note, isExpanded: !note.isExpanded, updatedAt: new Date().toISOString() }
                : note
            ),
          },
        }));
      },

      updateNoteColor: (noteId, color) => {
        set(state => ({
          sandboxLayout: {
            ...state.sandboxLayout,
            notes: state.sandboxLayout.notes.map(note =>
              note.id === noteId
                ? { ...note, color, updatedAt: new Date().toISOString() }
                : note
            ),
          },
        }));
      },

      selectNote: (noteId) => {
        set(state => ({
          sandboxLayout: {
            ...state.sandboxLayout,
            selectedNoteId: noteId,
          },
        }));
      },

      setLayoutMode: (mode) => {
        set(state => ({
          sandboxLayout: { ...state.sandboxLayout, layoutMode: mode }
        }));
      },

      setSnapToGrid: (snap) => {
        set(state => ({
          sandboxLayout: { ...state.sandboxLayout, snapToGrid: snap }
        }));
      },

      setGridSize: (size) => {
        set(state => ({
          sandboxLayout: { ...state.sandboxLayout, gridSize: size }
        }));
      },

      setShowGrid: (show) => {
        set(state => ({
          sandboxLayout: { ...state.sandboxLayout, showGrid: show }
        }));
      },
    }),
    {
      name: 'cerebro-notes-store',
      version: 1,
    }
  )
);