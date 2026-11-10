import React from 'react';
import { Carpark } from '../types/carpark';

interface StatsOverviewProps {
  carparks: Carpark[];
  lastRefreshedTime: string;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ carparks, lastRefreshedTime }) => {
  const totalCarparks = carparks.length;
  
  const totalCarLots = carparks.reduce((sum, cp) => sum + cp.lots.car.total, 0);
  const availableCarLots = carparks.reduce((sum, cp) => sum + cp.lots.car.available, 0);
  const overallVacancyPct = totalCarLots > 0 ? Math.round((availableCarLots / totalCarLots) * 100) : 0;
  
  const evCarparksCount = carparks.filter((cp) => cp.hasEvCharging).length;
  const freeSchemeCarparks = carparks.filter(
    (cp) => cp.freeParkingScheme !== 'None'
  ).length;

  return (
    <div className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex flex-wrap items-center justify-between gap-y-2 text-xs text-slate-600">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Carparks:</span>
              <span className="font-semibold text-slate-900 font-mono tabular-nums">{totalCarparks}</span>
            </div>

            <span className="text-slate-300" aria-hidden="true">·</span>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Available Car Lots:</span>
              <span className="font-semibold text-emerald-700 font-mono tabular-nums">
                {availableCarLots.toLocaleString()}
              </span>
              <span className="text-slate-400 font-mono tabular-nums">/ {totalCarLots.toLocaleString()}</span>
            </div>

            <span className="text-slate-300" aria-hidden="true">·</span>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Island Vacancy:</span>
              <span className="font-semibold text-slate-900 font-mono tabular-nums">{overallVacancyPct}%</span>
            </div>

            <span className="text-slate-300" aria-hidden="true">·</span>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">EV Stations:</span>
              <span className="font-semibold text-slate-900 font-mono tabular-nums">{evCarparksCount} sites</span>
            </div>

            <span className="text-slate-300" aria-hidden="true">·</span>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Free/Off-peak Schemes:</span>
              <span className="font-semibold text-slate-900 font-mono tabular-nums">{freeSchemeCarparks} carparks</span>
            </div>
          </div>

          <div className="text-slate-400 font-mono text-[11px]">
            Feed: Real-time simulation (LTA schema ready) · Synced {lastRefreshedTime}
          </div>
        </div>
      </div>
    </div>
  );
};
