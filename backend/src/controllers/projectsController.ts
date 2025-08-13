import { Response, NextFunction } from 'express';
import * as projectService from '../services/projectService';
import { AuthenticatedRequest } from '../types/api';
import { CreateProjectRequest, UpdateProjectRequest } from '../types/project';

export const getProjects = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        error: 'Não autenticado',
        timestamp: new Date().toISOString()
      });
      return;
    }

    const includeStats = req.query.includeStats === 'true';
    const projects = await projectService.getUserProjects(req.userId, includeStats);
    
    res.json({
      success: true,
      data: projects,
      meta: {
        total: projects.length,
        includeStats
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

export const getProject = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        error: 'Não autenticado',
        timestamp: new Date().toISOString()
      });
      return;
    }

    const { id } = req.params;
    const includeTasks = req.query.includeTasks === 'true';
    
    const project = await projectService.getProjectById(id, req.userId, includeTasks);
    
    res.json({
      success: true,
      data: project,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    if (error.message === 'Projeto não encontrado') {
      res.status(404).json({
        success: false,
        error: 'Projeto não encontrado',
        message: 'O projeto solicitado não existe ou não pertence ao usuário',
        timestamp: new Date().toISOString()
      });
      return;
    }
    next(error);
  }
};

export const createProject = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        error: 'Não autenticado',
        timestamp: new Date().toISOString()
      });
      return;
    }

    const projectData: CreateProjectRequest = req.body;
    const project = await projectService.createProject(req.userId, projectData);
    
    res.status(201).json({
      success: true,
      message: 'Projeto criado com sucesso',
      data: project,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

export const updateProject = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        error: 'Não autenticado',
        timestamp: new Date().toISOString()
      });
      return;
    }

    const { id } = req.params;
    const updateData: UpdateProjectRequest = req.body;
    
    const project = await projectService.updateProject(id, req.userId, updateData);
    
    res.json({
      success: true,
      message: 'Projeto atualizado com sucesso',
      data: project,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    if (error.message === 'Projeto não encontrado') {
      res.status(404).json({
        success: false,
        error: 'Projeto não encontrado',
        timestamp: new Date().toISOString()
      });
      return;
    }
    if (error.message?.includes('Não é possível finalizar projeto com')) {
      res.status(400).json({
        success: false,
        error: 'Projeto contém tarefas pendentes',
        message: error.message,
        timestamp: new Date().toISOString()
      });
      return;
    }
    next(error);
  }
};

export const deleteProject = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        error: 'Não autenticado',
        timestamp: new Date().toISOString()
      });
      return;
    }

    const { id } = req.params;
    await projectService.deleteProject(id, req.userId);
    
    res.json({
      success: true,
      message: 'Projeto deletado com sucesso',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    if (error.message === 'Projeto não encontrado') {
      res.status(404).json({
        success: false,
        error: 'Projeto não encontrado',
        timestamp: new Date().toISOString()
      });
      return;
    }
    if (error.message === 'Não é possível deletar projeto com tarefas vinculadas') {
      res.status(400).json({
        success: false,
        error: 'Projeto contém tarefas',
        message: 'Remova ou mova todas as tarefas antes de deletar o projeto',
        timestamp: new Date().toISOString()
      });
      return;
    }
    next(error);
  }
};

export const getProjectStats = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        error: 'Não autenticado',
        timestamp: new Date().toISOString()
      });
      return;
    }

    const { id } = req.params;
    const stats = await projectService.getProjectStats(id, req.userId);
    
    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    if (error.message === 'Projeto não encontrado') {
      res.status(404).json({
        success: false,
        error: 'Projeto não encontrado',
        timestamp: new Date().toISOString()
      });
      return;
    }
    next(error);
  }
};

export const updateProjectTask = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        error: 'Não autenticado',
        timestamp: new Date().toISOString()
      });
      return;
    }

    const { id: projectId, taskId } = req.params;
    const taskUpdates = req.body;
    
    const updatedTask = await projectService.updateProjectTask(projectId, taskId, req.userId, taskUpdates);
    
    res.json({
      success: true,
      message: 'Tarefa do projeto atualizada com sucesso',
      data: updatedTask,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    if (error.message === 'Projeto não encontrado' || error.message === 'Tarefa não encontrada') {
      res.status(404).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
      return;
    }
    next(error);
  }
};