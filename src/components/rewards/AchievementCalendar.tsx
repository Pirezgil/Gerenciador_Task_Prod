// ============================================================================
// ACHIEVEMENT CALENDAR - Componente de calendário para visualizar medalhas
// ============================================================================

'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Grid3X3, BarChart2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MedalCard } from './MedalCard';
import type { Achievement } from '@/types/achievement';

// ============================================================================
// INTERFACES E TIPOS
// ============================================================================

type CalendarView = 'day' | 'week' | 'month';

interface AchievementCalendarProps {
  achievements: Achievement[];
  onAchievementClick: (achievement: Achievement) => void;
  initialView?: CalendarView;
}

interface CalendarDay {
  date: Date;
  achievements: Achievement[];
  isCurrentMonth: boolean;
  isToday: boolean;
}

interface CalendarWeek {
  days: CalendarDay[];
  weekNumber: number;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  return new Date(d.setDate(diff));
}

function endOfWeek(date: Date): Date {
  const d = startOfWeek(date);
  return new Date(d.setDate(d.getDate() + 6));
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function isSameDay(date1: Date, date2: Date): boolean {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
}

function formatDateForGrouping(date: Date): string {
  return date.toISOString().split('T')[0];
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

// ============================================================================
// COMPONENTES AUXILIARES
// ============================================================================

function CalendarHeader({ 
  view, 
  currentDate, 
  onViewChange, 
  onDateChange 
}: {
  view: CalendarView;
  currentDate: Date;
  onViewChange: (view: CalendarView) => void;
  onDateChange: (date: Date) => void;
}) {
  const formatTitle = () => {
    switch (view) {
      case 'day':
        return currentDate.toLocaleDateString('pt-BR', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
      case 'week':
        const weekStart = startOfWeek(currentDate);
        const weekEnd = endOfWeek(currentDate);
        return `${weekStart.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })} - ${weekEnd.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' })}`;
      case 'month':
        return currentDate.toLocaleDateString('pt-BR', { 
          year: 'numeric', 
          month: 'long' 
        });
    }
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    
    switch (view) {
      case 'day':
        newDate.setDate(currentDate.getDate() + (direction === 'next' ? 1 : -1));
        break;
      case 'week':
        newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
        break;
      case 'month':
        newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
        break;
    }
    
    onDateChange(newDate);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 mb-4 sm:mb-6">
      {/* MOBILE NAVIGATION (< sm) */}
      <div className="sm:hidden">
        {/* Date Navigation - Mobile */}
        <div className="flex items-center justify-between mb-4">
          <Button
            onClick={() => navigateDate('prev')}
            variant="outline"
            size="icon"
            className="h-12 w-12 min-h-[48px]"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          
          <div className="text-center">
            <h2 className="text-base font-semibold text-gray-900">
              {formatTitle()}
            </h2>
          </div>
          
          <Button
            onClick={() => navigateDate('next')}
            variant="outline"
            size="icon"
            className="h-12 w-12 min-h-[48px]"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
        
        {/* View Toggle - Mobile */}
        <div className="grid grid-cols-3 gap-2">
          <Button
            onClick={() => onViewChange('day')}
            variant={view === 'day' ? "default" : "outline"}
            className="flex items-center justify-center space-x-1 min-h-[44px] text-sm"
          >
            <CalendarIcon className="w-4 h-4" />
            <span>Dia</span>
          </Button>
          <Button
            onClick={() => onViewChange('week')}
            variant={view === 'week' ? "default" : "outline"}
            className="flex items-center justify-center space-x-1 min-h-[44px] text-sm"
          >
            <BarChart2 className="w-4 h-4" />
            <span>Semana</span>
          </Button>
          <Button
            onClick={() => onViewChange('month')}
            variant={view === 'month' ? "default" : "outline"}
            className="flex items-center justify-center space-x-1 min-h-[44px] text-sm"
          >
            <Grid3X3 className="w-4 h-4" />
            <span>Mês</span>
          </Button>
        </div>
      </div>

      {/* DESKTOP NAVIGATION (≥ sm) - LAYOUT ORIGINAL MELHORADO */}
      <div className="hidden sm:flex items-center justify-between">
        {/* Navigation */}
        <div className="flex items-center gap-2">
          <Button
            onClick={() => navigateDate('prev')}
            variant="outline"
            size="sm"
            className="h-10 w-10 p-0 hover:bg-gray-100"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <h2 className="text-lg font-semibold text-gray-900 min-w-[200px] text-center">
            {formatTitle()}
          </h2>
          
          <Button
            onClick={() => navigateDate('next')}
            variant="outline"
            size="sm"
            className="h-10 w-10 p-0 hover:bg-gray-100"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => onViewChange('day')}
            className={`
              flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all
              ${view === 'day' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-800'
              }
            `}
          >
            <CalendarIcon className="w-4 h-4" />
            <span>Dia</span>
          </button>
          <button
            onClick={() => onViewChange('week')}
            className={`
              flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all
              ${view === 'week' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-800'
              }
            `}
          >
            <BarChart2 className="w-4 h-4" />
            <span>Semana</span>
          </button>
          <button
            onClick={() => onViewChange('month')}
            className={`
              flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all
              ${view === 'month' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-800'
              }
            `}
          >
            <Grid3X3 className="w-4 h-4" />
            <span>Mês</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function DayView({ 
  currentDate, 
  achievements, 
  onAchievementClick 
}: {
  currentDate: Date;
  achievements: Achievement[];
  onAchievementClick: (achievement: Achievement) => void;
}) {
  const dayAchievements = achievements.filter(achievement => 
    isSameDay(new Date(achievement.earnedAt), currentDate)
  );

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <span className="text-4xl">🏆</span>
        </div>
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
          {currentDate.toLocaleDateString('pt-BR', { 
            weekday: 'long',
            day: 'numeric',
            month: 'long'
          })}
        </h3>
      </div>

      {dayAchievements.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <div className="text-6xl mb-4">🌟</div>
          <p className="text-gray-600">Nenhuma conquista neste dia</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {dayAchievements.map((achievement, index) => (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="cursor-pointer"
              onClick={() => onAchievementClick(achievement)}
            >
              <MedalCard 
                achievement={achievement}
                size="medium"
                showAnimation={false}
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

function WeekView({ 
  currentDate, 
  achievements, 
  onAchievementClick 
}: {
  currentDate: Date;
  achievements: Achievement[];
  onAchievementClick: (achievement: Achievement) => void;
}) {
  const weekStart = startOfWeek(currentDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);
    return {
      date,
      achievements: achievements.filter(achievement => 
        isSameDay(new Date(achievement.earnedAt), date)
      )
    };
  });

  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm">
      <div className="grid grid-cols-7 gap-2 sm:gap-4 items-start">
        {weekDays.map((day, index) => (
          <div key={index} className="text-center flex flex-col">
            <div className="font-medium text-gray-700 mb-2">
              {dayNames[index]}
            </div>
            <div className="text-sm text-gray-500 mb-3">
              {day.date.getDate()}
            </div>
            <div className="flex flex-col gap-2 flex-1">
              {day.achievements.length > 0 ? (
                day.achievements.map((achievement, index) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className="cursor-pointer"
                    onClick={() => onAchievementClick(achievement)}
                  >
                    <MedalCard 
                      achievement={achievement}
                      size="small"
                      showAnimation={false}
                    />
                  </motion.div>
                ))
              ) : (
                <div className="text-xs text-gray-400 text-center py-4 min-h-[120px] flex items-center justify-center">
                  Nenhuma conquista
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MonthView({ 
  currentDate, 
  achievements, 
  onAchievementClick 
}: {
  currentDate: Date;
  achievements: Achievement[];
  onAchievementClick: (achievement: Achievement) => void;
}) {
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);
  const [popoverPosition, setPopoverPosition] = useState<{ x: number; y: number } | null>(null);

  const handleDayClick = (day: CalendarDay, event: React.MouseEvent<HTMLDivElement>) => {
    if (day.achievements.length === 0) return;
    
    const rect = event.currentTarget.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    
    // Calculate position with bounds checking
    const popoverWidth = 320; // w-80 = 320px
    const popoverHeight = 400; // estimated max height
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    let x = rect.left + scrollLeft + rect.width / 2;
    let y = rect.bottom + scrollTop + 10;
    
    // Adjust X position to keep popover in viewport
    if (x + popoverWidth / 2 > viewportWidth) {
      x = viewportWidth - popoverWidth / 2 - 20;
    }
    if (x - popoverWidth / 2 < 0) {
      x = popoverWidth / 2 + 20;
    }
    
    // Adjust Y position if popover would go below viewport
    if (y + popoverHeight > scrollTop + viewportHeight) {
      y = rect.top + scrollTop - popoverHeight - 10;
      // If still too high, place in middle
      if (y < scrollTop) {
        y = scrollTop + viewportHeight / 2 - popoverHeight / 2;
      }
    }
    
    setSelectedDay(day);
    setPopoverPosition({ x, y });
  };

  const handleClosePopover = () => {
    setSelectedDay(null);
    setPopoverPosition(null);
  };
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  
  // Get first day of calendar (might be from previous month)
  const calendarStart = startOfWeek(monthStart);
  // Get last day of calendar (might be from next month)
  const calendarEnd = endOfWeek(monthEnd);
  
  const weeks: CalendarWeek[] = [];
  let currentWeekStart = new Date(calendarStart);
  
  while (currentWeekStart <= calendarEnd) {
    const week: CalendarDay[] = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentWeekStart);
      date.setDate(currentWeekStart.getDate() + i);
      
      week.push({
        date,
        achievements: achievements.filter(achievement => 
          isSameDay(new Date(achievement.earnedAt), date)
        ),
        isCurrentMonth: date.getMonth() === currentDate.getMonth(),
        isToday: isSameDay(date, new Date())
      });
    }
    
    weeks.push({
      days: week,
      weekNumber: getWeekNumber(currentWeekStart)
    });
    
    currentWeekStart.setDate(currentWeekStart.getDate() + 7);
  }

  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm">
      {/* Header with day names */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-4">
        {dayNames.map((day) => (
          <div key={day} className="text-center font-medium text-gray-700 py-2 text-xs sm:text-sm">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {weeks.map((week) =>
          week.days.map((day, dayIndex) => (
            <div
              key={`${week.weekNumber}-${dayIndex}`}
              onClick={(e) => handleDayClick(day, e)}
              className={`
                min-h-[60px] sm:min-h-[80px] p-1 sm:p-2 border rounded-lg transition-colors relative
                ${day.isCurrentMonth 
                  ? 'bg-white border-gray-200' 
                  : 'bg-gray-50 border-gray-100'
                }
                ${day.isToday ? 'ring-2 ring-blue-500' : ''}
                ${day.achievements.length > 0 
                  ? 'cursor-pointer hover:bg-blue-50 hover:border-blue-200' 
                  : 'hover:bg-gray-50'
                }
              `}
            >
              <div className={`
                text-sm font-medium mb-1
                ${day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
                ${day.isToday ? 'text-blue-600' : ''}
              `}>
                {day.date.getDate()}
              </div>
              
              <div className="space-y-1">
                {day.achievements.slice(0, 2).map((achievement) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <MedalCard 
                      achievement={achievement}
                      size="tiny"
                      showAnimation={false}
                    />
                  </motion.div>
                ))}
                {day.achievements.length > 2 && (
                  <div className="text-xs text-blue-600 font-medium">
                    +{day.achievements.length - 2} mais
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Day Popover */}
      <AnimatePresence>
        {selectedDay && popoverPosition && (
          <>
            {/* Overlay */}
            <div
              className="fixed inset-0 z-40"
              onClick={handleClosePopover}
            />
            
            {/* Popover */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2 }}
              className="fixed z-50 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 max-w-sm w-80"
              style={{
                left: `${popoverPosition.x}px`,
                top: `${popoverPosition.y}px`,
                transform: 'translateX(-50%)'
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedDay.date.toLocaleDateString('pt-BR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long'
                  })}
                </h3>
                <button
                  onClick={handleClosePopover}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Achievements */}
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {selectedDay.achievements.map((achievement, index) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className="cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-colors"
                    onClick={() => {
                      onAchievementClick(achievement);
                      handleClosePopover();
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <MedalCard 
                        achievement={achievement}
                        size="small"
                        showAnimation={false}
                        showDetails={false}
                        disableTooltip={true}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900">
                          {achievement.type === 'task_completion' && `⚡ Faísca ${achievement.subtype}`}
                          {achievement.type === 'project_completion' && '🏗️ Arquiteto de Sonhos'}
                          {achievement.type === 'daily_master' && '👑 Imperador da Jornada'}
                          {achievement.type === 'weekly_legend' && '⏳ Guardião do Tempo'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(achievement.earnedAt).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Footer */}
              <div className="mt-4 pt-3 border-t border-gray-200 text-center">
                <span className="text-sm text-gray-600">
                  {selectedDay.achievements.length} conquista{selectedDay.achievements.length !== 1 ? 's' : ''} neste dia
                </span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function AchievementCalendar({ 
  achievements, 
  onAchievementClick,
  initialView = 'month'
}: AchievementCalendarProps) {
  const [view, setView] = useState<CalendarView>(initialView);
  const [currentDate, setCurrentDate] = useState(new Date());

  const renderCalendarView = () => {
    switch (view) {
      case 'day':
        return (
          <DayView
            currentDate={currentDate}
            achievements={achievements}
            onAchievementClick={onAchievementClick}
          />
        );
      case 'week':
        return (
          <WeekView
            currentDate={currentDate}
            achievements={achievements}
            onAchievementClick={onAchievementClick}
          />
        );
      case 'month':
        return (
          <MonthView
            currentDate={currentDate}
            achievements={achievements}
            onAchievementClick={onAchievementClick}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <CalendarHeader
        view={view}
        currentDate={currentDate}
        onViewChange={setView}
        onDateChange={setCurrentDate}
      />
      
      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderCalendarView()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}