export type ProjectStatus = 'active' | 'completed' | 'archived' | 'planning';

export interface CreateProjectRequest {
  name: string;
  icon?: string;
  color?: string;
  status?: ProjectStatus;
  deadline?: string;
  sandboxNotes?: string;
}

export interface UpdateProjectRequest {
  name?: string;
  icon?: string;
  color?: string;
  status?: ProjectStatus;
  deadline?: string;
  sandboxNotes?: string;
}

export interface ProjectResponse {
  id: string;
  name: string;
  icon: string;
  color: string;
  status: ProjectStatus;
  deadline?: string;
  sandboxNotes?: string;
  createdAt: string;
  updatedAt: string;
  tasksCount?: number;
  completedTasksCount?: number;
  totalEnergyPoints?: number;
  completedEnergyPoints?: number;
}

export interface ProjectWithTasksResponse extends ProjectResponse {
  tasks: Array<{
    id: string;
    description: string;
    status: string;
    energyPoints: number;
    type: string;
    createdAt: string;
    completedAt?: string;
  }>;
}