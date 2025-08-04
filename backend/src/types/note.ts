export type NoteStatus = 'active' | 'archived';

export interface CreateNoteRequest {
  content: string;
  status?: NoteStatus;
}

export interface UpdateNoteRequest {
  content?: string;
  status?: NoteStatus;
}

export interface NoteResponse {
  id: string;
  content: string;
  status: NoteStatus;
  createdAt: string;
  updatedAt: string;
  layout?: SandboxLayoutResponse;
  attachments: Array<{
    id: string;
    name: string;
    url: string;
    type: string;
    size: string;
    uploadedAt: string;
  }>;
}

export interface CreateSandboxLayoutRequest {
  noteId: string;
  positionX?: number;
  positionY?: number;
  width?: number;
  height?: number;
  zIndex?: number;
  isExpanded?: boolean;
  color?: string;
}

export interface UpdateSandboxLayoutRequest {
  positionX?: number;
  positionY?: number;
  width?: number;
  height?: number;
  zIndex?: number;
  isExpanded?: boolean;
  color?: string;
}

export interface SandboxLayoutResponse {
  id: string;
  noteId: string;
  positionX: number;
  positionY: number;
  width: number;
  height: number;
  zIndex: number;
  isExpanded: boolean;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface SandboxAuthRequest {
  password: string;
}

export interface SandboxAuthResponse {
  isUnlocked: boolean;
  unlockTime?: string;
}