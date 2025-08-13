export interface TimeSlot {
  time: string;
  date?: string;
}

export interface IntervalReminderSlots {
  slots: TimeSlot[];
  totalCount: number;
}

export interface AppointmentReminderTimes {
  prepareTime: Date;
  urgentTime: Date;
  prepareTimeString: string;
  urgentTimeString: string;
}

export class ReminderCalculator {
  /**
   * Calcula todos os horários de lembretes em intervalo para um período
   */
  static calculateIntervalSlots(
    startTime: string, // "09:00"
    endTime: string,   // "18:00"
    intervalMinutes: number, // 30
    _daysOfWeek?: number[] // [1,3,5] opcional, se não informado considera apenas o horário
  ): IntervalReminderSlots {
    const slots: TimeSlot[] = [];
    
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    const startTotalMinutes = startHour * 60 + startMinute;
    const endTotalMinutes = endHour * 60 + endMinute;
    
    if (startTotalMinutes >= endTotalMinutes) {
      throw new Error('Horário de início deve ser menor que o horário de fim');
    }
    
    let currentMinutes = startTotalMinutes;
    
    while (currentMinutes < endTotalMinutes) {
      const hour = Math.floor(currentMinutes / 60);
      const minute = currentMinutes % 60;
      
      slots.push({
        time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      });
      
      currentMinutes += intervalMinutes;
    }
    
    return {
      slots,
      totalCount: slots.length
    };
  }
  
  /**
   * Calcula os horários de lembretes automáticos para compromissos
   */
  static calculateAppointmentReminders(
    appointmentTime: string, // "10:00"
    preparationTime: number  // 15 (minutos)
  ): AppointmentReminderTimes {
    const today = new Date();
    const [hour, minute] = appointmentTime.split(':').map(Number);
    
    const appointment = new Date(today);
    appointment.setHours(hour, minute, 0, 0);
    
    const doublePrep = preparationTime * 2;
    
    // Lembrete "Prepare-se": compromisso - (2 * preparationTime + 10min)
    const prepareTime = new Date(appointment.getTime() - (doublePrep + 10) * 60000);
    
    // Lembrete "Ultra Urgente": compromisso - (2 * preparationTime)
    const urgentTime = new Date(appointment.getTime() - doublePrep * 60000);
    
    return {
      prepareTime,
      urgentTime,
      prepareTimeString: `${prepareTime.getHours().toString().padStart(2, '0')}:${prepareTime.getMinutes().toString().padStart(2, '0')}`,
      urgentTimeString: `${urgentTime.getHours().toString().padStart(2, '0')}:${urgentTime.getMinutes().toString().padStart(2, '0')}`
    };
  }
  
  /**
   * Calcula a próxima ocorrência de um lembrete baseado nos dias da semana
   */
  static calculateNextScheduledDate(
    scheduledTime: string, // "08:00"
    daysOfWeek: number[],  // [1,2,3,4,5] = segunda a sexta
    fromDate?: Date
  ): Date | null {
    if (daysOfWeek.length === 0) {
      return null;
    }
    
    const baseDate = fromDate || new Date();
    const [hour, minute] = scheduledTime.split(':').map(Number);
    
    // Procura o próximo dia da semana válido
    for (let i = 0; i < 14; i++) { // 14 dias para garantir que encontre pelo menos uma ocorrência
      const currentDate = new Date(baseDate);
      currentDate.setDate(baseDate.getDate() + i);
      
      const currentDayOfWeek = currentDate.getDay();
      
      if (daysOfWeek.includes(currentDayOfWeek)) {
        // Se for hoje, verifica se ainda não passou o horário
        if (i === 0) {
          const now = new Date();
          const scheduledDateTime = new Date(currentDate);
          scheduledDateTime.setHours(hour, minute, 0, 0);
          
          if (scheduledDateTime > now) {
            return scheduledDateTime;
          }
          // Se já passou, continua para o próximo dia
          continue;
        }
        
        currentDate.setHours(hour, minute, 0, 0);
        return currentDate;
      }
    }
    
    return null;
  }
  
  /**
   * Valida se um horário está no formato correto (HH:MM)
   */
  static validateTimeFormat(time: string): boolean {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  }
  
  /**
   * Valida se os dias da semana estão no formato correto (0-6)
   */
  static validateDaysOfWeek(daysOfWeek: number[]): boolean {
    if (!Array.isArray(daysOfWeek)) return false;
    return daysOfWeek.every(day => day >= 0 && day <= 6);
  }
  
  /**
   * Converte minutos em formato de texto legível
   */
  static minutesToHumanReadable(minutes: number): string {
    if (minutes < 60) {
      return `${minutes} minuto${minutes !== 1 ? 's' : ''}`;
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (remainingMinutes === 0) {
      return `${hours} hora${hours !== 1 ? 's' : ''}`;
    }
    
    return `${hours}h ${remainingMinutes}min`;
  }
  
  /**
   * Converte array de dias da semana em texto legível
   */
  static daysOfWeekToHumanReadable(daysOfWeek: number[]): string {
    const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const sortedDays = [...daysOfWeek].sort();
    
    if (sortedDays.length === 7) {
      return 'Todos os dias';
    }
    
    if (sortedDays.length === 5 && 
        sortedDays.every(day => day >= 1 && day <= 5)) {
      return 'Dias úteis (Segunda a Sexta)';
    }
    
    if (sortedDays.length === 2 && 
        sortedDays.includes(0) && sortedDays.includes(6)) {
      return 'Fins de semana (Sábado e Domingo)';
    }
    
    return sortedDays.map(day => dayNames[day]).join(', ');
  }
  
  /**
   * Calcula quantos lembretes serão criados em um período para intervalos
   */
  static estimateIntervalRemindersCount(
    startTime: string,
    endTime: string,
    intervalMinutes: number,
    daysOfWeek: number[],
    periodDays: number = 30 // Estimar para os próximos 30 dias
  ): number {
    const slotsPerDay = this.calculateIntervalSlots(startTime, endTime, intervalMinutes);
    const daysCount = daysOfWeek.length;
    const weeksInPeriod = Math.ceil(periodDays / 7);
    
    return slotsPerDay.totalCount * daysCount * weeksInPeriod;
  }
}