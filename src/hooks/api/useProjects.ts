// ============================================================================
// PROJECTS HOOKS - Hooks React Query para operações de projetos
// ============================================================================

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { projectsApi } from '@/lib/api';
import { queryKeys, invalidateQueries } from '@/lib/queryClient';
import type { Project, Task } from '@/types/task';

// ============================================================================
// QUERY HOOKS
// ============================================================================

// Hook para buscar todos os projetos do usuário
export function useProjects() {
  return useQuery({
    queryKey: queryKeys.projects.all,
    queryFn: projectsApi.getProjects,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

// Hook para buscar um projeto específico
export function useProject(projectId: string) {
  return useQuery({
    queryKey: queryKeys.projects.detail(projectId),
    queryFn: () => projectsApi.getProjects().then(projects => projects.find(p => p.id === projectId)),
    enabled: !!projectId,
  });
}

// Hook para buscar tarefas de um projeto específico
export function useProjectTasks(projectId: string) {
  return useQuery({
    queryKey: queryKeys.projects.tasks(projectId),
    queryFn: () => projectsApi.getProjects().then(projects => {
      const project = projects.find(p => p.id === projectId);
      return project?.backlog || [];
    }),
    enabled: !!projectId,
  });
}

// ============================================================================
// MUTATION HOOKS
// ============================================================================

// Hook para criar novo projeto
export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: projectsApi.createProject,
    onMutate: async (newProject) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.projects.all });

      const previousProjects = queryClient.getQueryData<Project[]>(queryKeys.projects.all);

      // Otimistic update
      if (previousProjects) {
        const optimisticProject: Project = {
          ...newProject,
          id: `temp-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          backlog: [],
        };

        queryClient.setQueryData<Project[]>(queryKeys.projects.all, [...previousProjects, optimisticProject]);
      }

      return { previousProjects };
    },
    onError: (err, newProject, context) => {
      if (context?.previousProjects) {
        queryClient.setQueryData(queryKeys.projects.all, context.previousProjects);
      }
    },
    onSettled: () => {
      invalidateQueries.all(); // Invalidar tasks também pois podem estar relacionadas
    },
  });
}

// Hook para atualizar projeto
export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, updates }: { projectId: string; updates: Partial<Project> }) =>
      projectsApi.updateProject(projectId, updates),
    onMutate: async ({ projectId, updates }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.projects.all });

      const previousProjects = queryClient.getQueryData<Project[]>(queryKeys.projects.all);

      // Otimistic update
      if (previousProjects) {
        const updatedProjects = previousProjects.map(project =>
          project.id === projectId
            ? { ...project, ...updates, updatedAt: new Date().toISOString() }
            : project
        );
        queryClient.setQueryData(queryKeys.projects.all, updatedProjects);
      }

      return { previousProjects };
    },
    onError: (err, variables, context) => {
      if (context?.previousProjects) {
        queryClient.setQueryData(queryKeys.projects.all, context.previousProjects);
      }
    },
    onSettled: (data, error, { projectId }) => {
      invalidateQueries.project(projectId);
    },
  });
}

// Hook para deletar projeto
export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: projectsApi.deleteProject,
    onMutate: async (projectId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.projects.all });

      const previousProjects = queryClient.getQueryData<Project[]>(queryKeys.projects.all);

      // Otimistic update - remover projeto
      if (previousProjects) {
        const updatedProjects = previousProjects.filter(project => project.id !== projectId);
        queryClient.setQueryData(queryKeys.projects.all, updatedProjects);
      }

      return { previousProjects };
    },
    onError: (err, projectId, context) => {
      if (context?.previousProjects) {
        queryClient.setQueryData(queryKeys.projects.all, context.previousProjects);
      }
    },
    onSettled: () => {
      invalidateQueries.all(); // Invalidar tasks também
    },
  });
}

// Hook para adicionar tarefa a um projeto
export function useAddTaskToProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, taskData }: { 
      projectId: string; 
      taskData: Omit<Task, 'id' | 'status' | 'createdAt' | 'projectId'> 
    }) => projectsApi.addTaskToProject(projectId, taskData),
    onMutate: async ({ projectId, taskData }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.projects.all });

      const previousProjects = queryClient.getQueryData<Project[]>(queryKeys.projects.all);

      // Otimistic update - adicionar tarefa ao backlog do projeto
      if (previousProjects) {
        const optimisticTask: Task = {
          ...taskData,
          id: `temp-${Date.now()}`,
          projectId,
          status: 'pending',
          createdAt: new Date().toISOString(),
          completedAt: undefined,
          postponedAt: undefined,
          updatedAt: new Date().toISOString(),
          comments: [],
          attachments: [],
          externalLinks: [],
          history: [],
        };

        const updatedProjects = previousProjects.map(project =>
          project.id === projectId
            ? { ...project, backlog: [...(project.backlog || []), optimisticTask] }
            : project
        );
        queryClient.setQueryData(queryKeys.projects.all, updatedProjects);
      }

      return { previousProjects };
    },
    onError: (err, variables, context) => {
      if (context?.previousProjects) {
        queryClient.setQueryData(queryKeys.projects.all, context.previousProjects);
      }
    },
    onSettled: (data, error, { projectId }) => {
      invalidateQueries.project(projectId);
      invalidateQueries.tasks();
    },
  });
}

// ============================================================================
// COMPUTED HOOKS (Dados derivados)
// ============================================================================

// Hook para estatísticas dos projetos
export function useProjectsStats() {
  const { data: projects = [] } = useProjects();

  return {
    total: projects.length,
    active: projects.filter(p => p.status === 'active').length,
    completed: projects.filter(p => p.status === 'completed').length,
    archived: projects.filter(p => p.status === 'archived').length,
    planning: projects.filter(p => p.status === 'planning').length,
    totalTasks: projects.reduce((sum, p) => sum + (p.backlog?.length || 0), 0),
    totalCompletedTasks: projects.reduce((sum, p) => 
      sum + (p.backlog?.filter(t => t.status === 'completed').length || 0), 0
    ),
  };
}

// Hook para projetos ativos
export function useActiveProjects() {
  const { data: projects = [] } = useProjects();
  
  return projects.filter(project => project.status === 'active');
}

// Hook para projetos com deadline próximo
export function useProjectsWithUpcomingDeadlines(days: number = 7) {
  const { data: projects = [] } = useProjects();
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + days);

  return projects.filter(project => {
    if (!project.deadline) return false;
    
    const deadline = new Date(project.deadline);
    return deadline <= targetDate && deadline >= new Date();
  });
}