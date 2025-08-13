'use client';

interface IntervalConfig {
  intervalEnabled: boolean;
  intervalMinutes: number;
  intervalStartTime: string;
  intervalEndTime: string;
}

interface IntervalReminderConfigProps {
  config: IntervalConfig;
  onChange: (config: IntervalConfig) => void;
}

const intervalOptions = [
  { value: 15, label: '15 minutos' },
  { value: 30, label: '30 minutos' },
  { value: 60, label: '1 hora' },
  { value: 120, label: '2 horas' },
  { value: 180, label: '3 horas' },
];

export default function IntervalReminderConfig({
  config,
  onChange
}: IntervalReminderConfigProps) {
  
  const updateConfig = (updates: Partial<IntervalConfig>) => {
    onChange({ ...config, ...updates });
  };

  const calculateIntervalCount = () => {
    if (!config.intervalEnabled || !config.intervalStartTime || !config.intervalEndTime) {
      return 0;
    }

    try {
      const [startHour, startMinute] = config.intervalStartTime.split(':').map(Number);
      const [endHour, endMinute] = config.intervalEndTime.split(':').map(Number);
      
      const startTotalMinutes = startHour * 60 + startMinute;
      const endTotalMinutes = endHour * 60 + endMinute;
      
      if (startTotalMinutes >= endTotalMinutes) {
        return 0;
      }
      
      const totalMinutes = endTotalMinutes - startTotalMinutes;
      return Math.floor(totalMinutes / config.intervalMinutes);
    } catch {
      return 0;
    }
  };

  const getTimeSlots = () => {
    const count = calculateIntervalCount();
    if (count === 0) return [];

    const slots = [];
    const [startHour, startMinute] = config.intervalStartTime.split(':').map(Number);
    let currentMinutes = startHour * 60 + startMinute;

    for (let i = 0; i < Math.min(count, 6); i++) { // Mostrar no máximo 6 horários no preview
      const hour = Math.floor(currentMinutes / 60);
      const minute = currentMinutes % 60;
      slots.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
      currentMinutes += config.intervalMinutes;
    }

    return slots;
  };

  const intervalCount = calculateIntervalCount();
  const timeSlots = getTimeSlots();

  return (
    <div className="space-y-4">
      {/* Toggle para habilitar intervalos */}
      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-medium text-gray-700">
            Lembretes em intervalo
          </label>
          <p className="text-xs text-gray-500">
            Receber lembretes adicionais em intervalos regulares
          </p>
        </div>
        <button
          type="button"
          onClick={() => updateConfig({ intervalEnabled: !config.intervalEnabled })}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            config.intervalEnabled ? 'bg-blue-600' : 'bg-gray-200'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
              config.intervalEnabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {config.intervalEnabled && (
        <div className="pl-4 border-l-2 border-blue-100 space-y-4">
          {/* Seleção do intervalo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Intervalo entre lembretes
            </label>
            <div className="grid grid-cols-5 gap-2">
              {intervalOptions.map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => updateConfig({ intervalMinutes: option.value })}
                  className={`p-2 text-xs font-medium rounded-md border transition-colors duration-200 ${
                    config.intervalMinutes === option.value
                      ? 'bg-blue-100 border-blue-500 text-blue-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:border-blue-300'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Período dos intervalos */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Início dos intervalos
              </label>
              <input
                type="time"
                value={config.intervalStartTime}
                onChange={(e) => updateConfig({ intervalStartTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fim dos intervalos
              </label>
              <input
                type="time"
                value={config.intervalEndTime}
                onChange={(e) => updateConfig({ intervalEndTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
          </div>

          {/* Preview dos horários */}
          {intervalCount > 0 && (
            <div className="mt-3 p-3 bg-amber-50 rounded-md">
              <div className="flex items-start justify-between mb-2">
                <h5 className="text-sm font-medium text-amber-800">
                  Horários dos intervalos ({intervalCount} lembretes)
                </h5>
                {intervalCount > 20 && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                    ⚠️ Muitos lembretes
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-1">
                {timeSlots.map((time, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-amber-100 text-amber-700"
                  >
                    {time}
                  </span>
                ))}
                {intervalCount > 6 && (
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-amber-200 text-amber-800">
                    +{intervalCount - 6} mais
                  </span>
                )}
              </div>
              {intervalCount > 20 && (
                <p className="text-xs text-amber-700 mt-2">
                  💡 Considere aumentar o intervalo ou reduzir o período para evitar muitas notificações.
                </p>
              )}
            </div>
          )}

          {/* Aviso sobre horário inválido */}
          {config.intervalStartTime >= config.intervalEndTime && (
            <div className="p-3 bg-red-50 rounded-md">
              <p className="text-sm text-red-600">
                ⚠️ O horário de início deve ser anterior ao horário de fim.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}