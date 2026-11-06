import React, { useState } from 'react';
import { useTime, TIME_SIMULATION_PRESETS } from '../../context/TimeContext';
import {
  Clock,
  CheckCircle2,
  Sliders,
  X,
  RotateCcw,
  Sparkles
} from 'lucide-react';

/**
 * Compact Live Clock Component
 * Layout:
 *           02:30 PM | 31 Oct
 *           ● Evening Snacks
 *
 * Positioned immediately below the navbar, aligned towards the top-right corner.
 * Updates automatically every second without page refreshes.
 */
export const CompactLiveClock = () => {
  const {
    effectiveDate,
    formattedTime,
    isSimulated,
    simulatedTimeStr,
    currentMealPhase,
    setSimulationPreset
  } = useTime();

  const [simulatorOpen, setSimulatorOpen] = useState(false);

  // Format 12-hour time: e.g. "02:30 PM"
  const timeStr = effectiveDate
    ? effectiveDate.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }).toUpperCase()
    : (formattedTime ? formattedTime.toUpperCase() : '12:00 PM');

  // Format compact date: e.g. "31 Oct"
  const dateStr = effectiveDate
    ? effectiveDate.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short'
      })
    : '31 Oct';

  // Current meal period title without extra wordings
  const periodTitle = currentMealPhase?.title
    ? currentMealPhase.title.replace(' Available', '')
    : 'All-Day Items';

  return (
    <div className="relative inline-flex flex-col items-end text-right select-none">
      <button
        type="button"
        onClick={() => setSimulatorOpen(!simulatorOpen)}
        className="group flex flex-col items-end text-right hover:opacity-85 transition cursor-pointer"
        title={isSimulated ? "Simulated time active (Click to change or reset)" : "Pragati University Live Clock (Click to test times)"}
      >
        {/* Line 1: 02:30 PM | 31 Oct */}
        <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-800 dark:text-[#F8FAFC] leading-tight">
          <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-[#3B82F6] shrink-0" />
          <span>{timeStr}</span>
          <span className="text-slate-300 dark:text-[#334155] font-sans font-normal">|</span>
          <span className="font-sans font-semibold text-slate-600 dark:text-[#CBD5E1]">{dateStr}</span>
          {isSimulated && (
            <span className="text-[9px] font-black uppercase text-amber-700 bg-amber-100 dark:bg-amber-950/80 dark:text-amber-300 px-1 py-0.2 rounded border border-amber-300 dark:border-amber-700 tracking-tight">
              Sim
            </span>
          )}
        </div>

        {/* Line 2: ● Evening Snacks */}
        <div className="flex items-center gap-1.5 mt-0.5">
          <span
            className={`w-1.5 h-1.5 rounded-full shrink-0 ${
              currentMealPhase?.color === 'rose'
                ? 'bg-rose-500 animate-ping'
                : currentMealPhase?.color === 'amber'
                ? 'bg-amber-500'
                : currentMealPhase?.color === 'teal'
                ? 'bg-teal-500'
                : 'bg-emerald-500 animate-pulse'
            }`}
          />
          <span className="text-[11px] font-bold text-slate-600 dark:text-[#CBD5E1] tracking-tight">
            {periodTitle}
          </span>
        </div>
      </button>

      {/* Time Machine Simulator Dropdown Popup (Opens when clock is clicked) */}
      {simulatorOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 p-4 rounded-2xl bg-white dark:bg-[#1E293B] text-slate-900 dark:text-[#F8FAFC] border border-slate-200 dark:border-[#334155] shadow-2xl z-50 animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-[#334155]">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
              <Sliders className="w-3.5 h-3.5" />
              <span>Time Machine Simulator</span>
            </div>
            <button
              type="button"
              onClick={() => setSimulatorOpen(false)}
              className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-0.5 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="py-2.5 space-y-1.5 max-h-60 overflow-y-auto">
            {TIME_SIMULATION_PRESETS.map((preset) => {
              const isSelected = isSimulated
                ? simulatedTimeStr === preset.value
                : preset.value === 'LIVE';

              return (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => {
                    setSimulationPreset(preset.value);
                    setSimulatorOpen(false);
                  }}
                  className={`w-full p-2 rounded-xl text-left text-xs transition border flex items-center justify-between ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 font-black border-amber-400'
                      : 'bg-slate-50 hover:bg-slate-100 dark:bg-[#172033] dark:hover:bg-[#111827] text-slate-800 dark:text-[#CBD5E1] border-slate-200 dark:border-[#334155]'
                  }`}
                >
                  <div>
                    <span className="block font-bold">{preset.label.split('—')[0]}</span>
                    <span className={`text-[10px] block ${isSelected ? 'text-slate-950/80' : 'text-slate-500 dark:text-[#94A3B8]'}`}>
                      {preset.desc}
                    </span>
                  </div>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-slate-950 shrink-0 ml-2" />}
                </button>
              );
            })}
          </div>

          {isSimulated && (
            <div className="pt-2 border-t border-slate-100 dark:border-[#334155] flex justify-between items-center text-xs">
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">Simulated Active</span>
              <button
                type="button"
                onClick={() => {
                  setSimulationPreset('LIVE');
                  setSimulatorOpen(false);
                }}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-[#172033] dark:hover:bg-[#111827] text-slate-800 dark:text-white rounded-lg text-[10px] font-bold flex items-center gap-1 border border-slate-200 dark:border-[#334155]"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset to Real Time</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Standard LiveTimeBar - default export renders the compact clock aligned to top-right
 */
export const LiveTimeBar = () => {
  return (
    <div className="w-full flex justify-end">
      <CompactLiveClock />
    </div>
  );
};

export default LiveTimeBar;
