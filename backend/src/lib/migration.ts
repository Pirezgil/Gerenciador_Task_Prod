import { prisma } from '../app';

interface LocalStorageData {
  authStore?: {
    user?: {
      id?: string;
      name?: string;
      email?: string;
      settings?: any;
    };
  };
  tasksStore?: {
    todayTasks?: any[];
    projects?: any[];
    completedTasks?: any[];
    postponedTasks?: any[];
  };
  notesStore?: {
    notes?: any[];
    layouts?: any[];
  };
  habitsStore?: {
    habits?: any[];
    completions?: any[];
  };
  energyStore?: {
    dailyBudget?: number;
    usedEnergy?: number;
    logs?: any[];
  };
}

export const migrateFromLocalStorage = async (localStorageData: LocalStorageData, userId: string) => {
  const results = {
    user: null as any,
    settings: null as any,
    projects: [] as any[],
    tasks: [] as any[],
    notes: [] as any[],
    habits: [] as any[],
    energyLogs: [] as any[],
    errors: [] as string[]
  };

  try {
    console.log('🔄 Iniciando migração dos dados do localStorage...');

    // 1. Migrar configurações do usuário
    if (localStorageData.authStore?.user?.settings) {
      try {
        const settings = await prisma.userSettings.upsert({
          where: { userId },
          update: {
            dailyEnergyBudget: localStorageData.authStore.user.settings.dailyEnergyBudget || 12,
            theme: localStorageData.authStore.user.settings.theme || 'light',
            timezone: localStorageData.authStore.user.settings.timezone || 'America/Sao_Paulo',
            notifications: localStorageData.authStore.user.settings.notifications ?? true,
            sandboxEnabled: localStorageData.authStore.user.settings.sandboxEnabled ?? false
          },
          create: {
            userId,
            dailyEnergyBudget: localStorageData.authStore.user.settings.dailyEnergyBudget || 12,
            theme: localStorageData.authStore.user.settings.theme || 'light',
            timezone: localStorageData.authStore.user.settings.timezone || 'America/Sao_Paulo',
            notifications: localStorageData.authStore.user.settings.notifications ?? true,
            sandboxEnabled: localStorageData.authStore.user.settings.sandboxEnabled ?? false
          }
        });
        results.settings = settings;
        console.log('✅ Configurações do usuário migradas');
      } catch (error: any) {
        results.errors.push(`Erro ao migrar configurações: ${error.message}`);
      }
    }

    // 2. Migrar projetos
    if (localStorageData.tasksStore?.projects) {
      for (const projectData of localStorageData.tasksStore.projects) {
        try {
          const project = await prisma.project.create({
            data: {
              userId,
              name: projectData.name || 'Projeto Migrado',
              icon: projectData.icon || '📁',
              color: projectData.color || '#3B82F6',
              status: projectData.status || 'active',
              deadline: projectData.deadline ? new Date(projectData.deadline) : null,
              sandboxNotes: projectData.sandboxNotes
            }
          });
          results.projects.push(project);

          // Migrar tarefas do projeto (backlog)
          if (projectData.backlog) {
            for (const taskData of projectData.backlog) {
              try {
                const task = await prisma.task.create({
                  data: {
                    userId,
                    projectId: project.id,
                    description: taskData.description || 'Tarefa migrada',
                    energyPoints: taskData.energyPoints || 1,
                    type: taskData.type || 'task',
                    status: taskData.status || 'pending',
                    isRecurring: taskData.isRecurring || false,
                    isAppointment: taskData.isAppointment || false,
                    dueDate: taskData.dueDate ? new Date(taskData.dueDate) : null,
                    externalLinks: taskData.externalLinks || [],
                    completedAt: taskData.completedAt ? new Date(taskData.completedAt) : null,
                    postponementCount: taskData.postponementCount || 0,
                    postponementReason: taskData.postponementReason
                  }
                });
                results.tasks.push(task);
              } catch (error: any) {
                results.errors.push(`Erro ao migrar tarefa do projeto ${project.name}: ${error.message}`);
              }
            }
          }
        } catch (error: any) {
          results.errors.push(`Erro ao migrar projeto: ${error.message}`);
        }
      }
      console.log(`✅ ${results.projects.length} projetos migrados`);
    }

    // 3. Migrar tarefas do dia (hoje)
    if (localStorageData.tasksStore?.todayTasks) {
      for (const taskData of localStorageData.tasksStore.todayTasks) {
        try {
          // Verificar se não é uma tarefa já migrada do projeto
          const existingTask = results.tasks.find(t => 
            t.description === taskData.description && 
            t.energyPoints === taskData.energyPoints
          );

          if (!existingTask) {
            const task = await prisma.task.create({
              data: {
                userId,
                description: taskData.description || 'Tarefa migrada',
                energyPoints: taskData.energyPoints || 1,
                type: taskData.type || 'task',
                status: taskData.status || 'pending',
                isRecurring: taskData.isRecurring || false,
                isAppointment: taskData.isAppointment || false,
                dueDate: taskData.dueDate ? new Date(taskData.dueDate) : null,
                externalLinks: taskData.externalLinks || [],
                completedAt: taskData.completedAt ? new Date(taskData.completedAt) : null,
                postponementCount: taskData.postponementCount || 0,
                postponementReason: taskData.postponementReason
              }
            });
            results.tasks.push(task);
          }
        } catch (error: any) {
          results.errors.push(`Erro ao migrar tarefa do dia: ${error.message}`);
        }
      }
    }

    // 4. Migrar tarefas completadas
    if (localStorageData.tasksStore?.completedTasks) {
      for (const taskData of localStorageData.tasksStore.completedTasks) {
        try {
          const existingTask = results.tasks.find(t => 
            t.description === taskData.description && 
            t.energyPoints === taskData.energyPoints
          );

          if (!existingTask) {
            const task = await prisma.task.create({
              data: {
                userId,
                description: taskData.description || 'Tarefa completada migrada',
                energyPoints: taskData.energyPoints || 1,
                type: taskData.type || 'task',
                status: 'completed',
                completedAt: taskData.completedAt ? new Date(taskData.completedAt) : new Date(),
                externalLinks: taskData.externalLinks || []
              }
            });
            results.tasks.push(task);
          }
        } catch (error: any) {
          results.errors.push(`Erro ao migrar tarefa completada: ${error.message}`);
        }
      }
    }

    console.log(`✅ ${results.tasks.length} tarefas migradas`);

    // 5. Migrar notas
    if (localStorageData.notesStore?.notes) {
      for (const noteData of localStorageData.notesStore.notes) {
        try {
          const note = await prisma.note.create({
            data: {
              userId,
              content: noteData.content || 'Nota migrada',
              status: noteData.status || 'active'
            }
          });

          // Migrar layout se existir
          const layoutData = localStorageData.notesStore.layouts?.find(
            (l: any) => l.noteId === noteData.id
          );

          if (layoutData) {
            await prisma.sandboxLayout.create({
              data: {
                userId,
                noteId: note.id,
                positionX: layoutData.positionX || 0,
                positionY: layoutData.positionY || 0,
                width: layoutData.width || 300,
                height: layoutData.height || 200,
                zIndex: layoutData.zIndex || 1,
                isExpanded: layoutData.isExpanded || false,
                color: layoutData.color || '#FEF3C7'
              }
            });
          }

          results.notes.push(note);
        } catch (error: any) {
          results.errors.push(`Erro ao migrar nota: ${error.message}`);
        }
      }
      console.log(`✅ ${results.notes.length} notas migradas`);
    }

    // 6. Migrar hábitos
    if (localStorageData.habitsStore?.habits) {
      for (const habitData of localStorageData.habitsStore.habits) {
        try {
          const habit = await prisma.habit.create({
            data: {
              userId,
              name: habitData.name || 'Hábito migrado',
              description: habitData.description,
              icon: habitData.icon || '✅',
              color: habitData.color || '#10B981',
              targetCount: habitData.targetCount || 1,
              streak: habitData.streak || 0,
              bestStreak: habitData.bestStreak || 0,
              isActive: habitData.isActive ?? true,
              frequency: {
                create: {
                  type: habitData.frequency?.type || 'daily',
                  intervalDays: habitData.frequency?.intervalDays || 1,
                  daysOfWeek: habitData.frequency?.daysOfWeek || []
                }
              }
            }
          });

          results.habits.push(habit);
        } catch (error: any) {
          results.errors.push(`Erro ao migrar hábito: ${error.message}`);
        }
      }
      console.log(`✅ ${results.habits.length} hábitos migrados`);
    }

    // 7. Migrar logs de energia
    if (localStorageData.energyStore?.logs) {
      for (const logData of localStorageData.energyStore.logs) {
        try {
          const energyLog = await prisma.dailyEnergyLog.create({
            data: {
              userId,
              date: new Date(logData.date),
              budgetTotal: logData.budgetTotal || 12,
              energyUsed: logData.energyUsed || 0,
              energyRemaining: logData.energyRemaining || 12,
              tasksCompleted: logData.tasksCompleted || 0
            }
          });
          results.energyLogs.push(energyLog);
        } catch (error: any) {
          results.errors.push(`Erro ao migrar log de energia: ${error.message}`);
        }
      }
      console.log(`✅ ${results.energyLogs.length} logs de energia migrados`);
    }

    const summary = {
      success: true,
      message: 'Migração concluída',
      migrated: {
        projects: results.projects.length,
        tasks: results.tasks.length,
        notes: results.notes.length,
        habits: results.habits.length,
        energyLogs: results.energyLogs.length
      },
      errors: results.errors
    };

    console.log('✅ Migração concluída com sucesso!');
    console.log(`📊 Resumo: ${summary.migrated.projects} projetos, ${summary.migrated.tasks} tarefas, ${summary.migrated.notes} notas, ${summary.migrated.habits} hábitos`);
    
    if (results.errors.length > 0) {
      console.warn(`⚠️ ${results.errors.length} erros durante a migração`);
    }

    return summary;

  } catch (error: any) {
    console.error('❌ Erro crítico na migração:', error);
    throw new Error(`Falha na migração dos dados: ${error.message}`);
  }
};