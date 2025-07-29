// SyncManager - Controlador centralizado de atualizações dos stores
// Previne race conditions e estados inconsistentes

type UpdatePriority = 'critical' | 'high' | 'normal' | 'low';
type StoreType = 'tasks' | 'auth' | 'theme';

interface PendingUpdate {
  id: string;
  storeType: StoreType;
  priority: UpdatePriority;
  updateFn: () => void;
  timestamp: number;
}

class StoreSyncManager {
  private static instance: StoreSyncManager;
  private isUpdating = false;
  private updateQueue: PendingUpdate[] = [];
  private refreshUIDebouncer: NodeJS.Timeout | null = null;
  private lastRefreshTime = 0;
  private readonly MIN_REFRESH_INTERVAL = 16; // ~60fps
  
  // Logs para debugging
  private updateLog: string[] = [];
  
  private constructor() {
    // Singleton pattern
  }
  
  static getInstance(): StoreSyncManager {
    if (!StoreSyncManager.instance) {
      StoreSyncManager.instance = new StoreSyncManager();
    }
    return StoreSyncManager.instance;
  }
  
  // Registra uma atualização para execução sincronizada
  scheduleUpdate(
    storeType: StoreType, 
    updateFn: () => void, 
    priority: UpdatePriority = 'normal'
  ): void {
    const updateId = `${storeType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const pendingUpdate: PendingUpdate = {
      id: updateId,
      storeType,
      priority,
      updateFn,
      timestamp: Date.now()
    };
    
    this.logUpdate(`📝 Agendada atualização: ${updateId} (${storeType}:${priority})`);
    
    // Inserir na fila baseado na prioridade
    this.insertByPriority(pendingUpdate);
    
    // Processar fila se não estiver ocupado
    if (!this.isUpdating) {
      this.processQueue();
    }
  }
  
  private insertByPriority(update: PendingUpdate): void {
    const priorityOrder = { critical: 0, high: 1, normal: 2, low: 3 };
    const updatePriority = priorityOrder[update.priority];
    
    let insertIndex = this.updateQueue.length;
    for (let i = 0; i < this.updateQueue.length; i++) {
      const queueItemPriority = priorityOrder[this.updateQueue[i].priority];
      if (updatePriority < queueItemPriority) {
        insertIndex = i;
        break;
      }
    }
    
    this.updateQueue.splice(insertIndex, 0, update);
  }
  
  private async processQueue(): Promise<void> {
    if (this.isUpdating || this.updateQueue.length === 0) {
      return;
    }
    
    this.isUpdating = true;
    this.logUpdate(`🔄 Iniciando processamento da fila (${this.updateQueue.length} itens)`);
    
    try {
      while (this.updateQueue.length > 0) {
        const update = this.updateQueue.shift()!;
        
        this.logUpdate(`⚡ Executando: ${update.id} (${update.storeType}:${update.priority})`);
        
        try {
          // Executar a atualização
          await this.executeUpdate(update);
          
          // Pequena pausa entre atualizações para evitar travamento da UI
          await new Promise(resolve => setTimeout(resolve, 1));
          
        } catch (error) {
          console.error(`❌ Erro na atualização ${update.id}:`, error);
          this.logUpdate(`❌ Falha: ${update.id} - ${error}`);
        }
      }
      
      // Agendar refresh da UI após todas as atualizações
      this.scheduleRefreshUI();
      
    } finally {
      this.isUpdating = false;
      this.logUpdate(`✅ Processamento da fila finalizado`);
    }
  }
  
  private async executeUpdate(update: PendingUpdate): Promise<void> {
    try {
      update.updateFn();
    } catch (error) {
      throw new Error(`Falha na execução de ${update.id}: ${error}`);
    }
  }
  
  private scheduleRefreshUI(): void {
    // Debouncing do RefreshUI para evitar múltiplas chamadas
    if (this.refreshUIDebouncer) {
      clearTimeout(this.refreshUIDebouncer);
    }
    
    const now = Date.now();
    const timeSinceLastRefresh = now - this.lastRefreshTime;
    
    if (timeSinceLastRefresh >= this.MIN_REFRESH_INTERVAL) {
      // Pode executar imediatamente
      this.executeRefreshUI();
    } else {
      // Aguardar o intervalo mínimo
      const delay = this.MIN_REFRESH_INTERVAL - timeSinceLastRefresh;
      this.refreshUIDebouncer = setTimeout(() => {
        this.executeRefreshUI();
      }, delay);
    }
  }
  
  private executeRefreshUI(): void {
    this.lastRefreshTime = Date.now();
    this.logUpdate(`🎨 RefreshUI executado`);
    
    // Aqui você pode implementar a lógica de refresh da sua UI
    // Por exemplo, disparar um evento ou chamar uma função específica
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('storesSyncRefresh'));
    }
  }
  
  // Força uma sincronização imediata (usar com cuidado)
  async forceSync(): Promise<void> {
    if (this.isUpdating) {
      this.logUpdate(`⏳ Aguardando sincronização em andamento...`);
      
      // Aguardar até que a sincronização atual termine
      while (this.isUpdating) {
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }
    
    if (this.updateQueue.length > 0) {
      await this.processQueue();
    }
  }
  
  // Limpa a fila (emergency stop)
  clearQueue(): void {
    this.updateQueue = [];
    this.isUpdating = false;
    if (this.refreshUIDebouncer) {
      clearTimeout(this.refreshUIDebouncer);
      this.refreshUIDebouncer = null;
    }
    this.logUpdate(`🛑 Fila de atualizações limpa`);
  }
  
  // Método para debugging
  getQueueStatus(): { queueLength: number; isUpdating: boolean; recentLogs: string[] } {
    return {
      queueLength: this.updateQueue.length,
      isUpdating: this.isUpdating,
      recentLogs: this.updateLog.slice(-10) // Últimos 10 logs
    };
  }
  
  private logUpdate(message: string): void {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}`;
    this.updateLog.push(logEntry);
    
    // Manter apenas os últimos 50 logs para evitar memory leak
    if (this.updateLog.length > 50) {
      this.updateLog = this.updateLog.slice(-50);
    }
    
    console.log(logEntry);
  }
}

// Singleton instance
export const syncManager = StoreSyncManager.getInstance();

// Helper functions para os stores
export const syncedUpdate = (
  storeType: StoreType, 
  updateFn: () => void, 
  priority: UpdatePriority = 'normal'
) => {
  syncManager.scheduleUpdate(storeType, updateFn, priority);
};

export const forceSyncAll = () => syncManager.forceSync();
export const clearSyncQueue = () => syncManager.clearQueue();
export const getSyncStatus = () => syncManager.getQueueStatus();
