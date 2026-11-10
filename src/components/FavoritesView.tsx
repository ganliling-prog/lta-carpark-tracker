import React, { useState } from 'react';
import { Carpark, VehicleType } from '../types/carpark';
import { Heart, Bell, BellRing, Navigation, Trash2, Plus, Zap } from 'lucide-react';

interface FavoritesViewProps {
  carparks: Carpark[];
  favoriteIds: string[];
  onToggleFavorite: (id: string) => void;
  onSelectCarpark: (carpark: Carpark) => void;
  onGetDirections: (carpark: Carpark) => void;
  vehicleType: VehicleType;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({
  carparks,
  favoriteIds,
  onToggleFavorite,
  onSelectCarpark,
  onGetDirections,
  vehicleType,
}) => {
  const [alertThresholds, setAlertThresholds] = useState<{ [id: string]: number }>({
    'OR-ION': 20,
    'HDB-CTM': 10,
  });
  const [alertActive, setAlertActive] = useState<{ [id: string]: boolean }>({
    'OR-ION': true,
  });

  const favoriteCarparks = carparks.filter((cp) => favoriteIds.includes(cp.id));

  const toggleAlert = (id: string) => {
    setAlertActive((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleQuickAdd = (cp: Carpark) => {
    onToggleFavorite(cp.id);
  };

  const recommendedToAdd = carparks
    .filter((cp) => !favoriteIds.includes(cp.id))
    .slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
          <span>Saved Carparks & Lot Alerts</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Monitor your daily parking spots (home HDB, office, frequent malls) with real-time lot counters and vacancy threshold alerts.
        </p>
      </div>

      {favoriteCarparks.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
            <Heart className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-base font-semibold text-slate-900">No saved carparks yet</h3>
            <p className="text-xs text-slate-500 mt-1">
              Click the heart icon on any carpark card or map pin to bookmark your home, work, or favourite destinations for fast monitoring.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-700 mb-3">Popular Singapore carparks to add:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {recommendedToAdd.map((cp) => (
                <button
                  key={cp.id}
                  onClick={() => handleQuickAdd(cp)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{cp.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Populated favorites list */
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {favoriteCarparks.map((cp) => {
              const lotInfo =
                vehicleType === 'motorcycle'
                  ? cp.lots.motorcycle || { total: 0, available: 0 }
                  : cp.lots.car;
              const available = lotInfo.available;
              const total = lotInfo.total;
              const threshold = alertThresholds[cp.id] || 15;
              const isAlerting = alertActive[cp.id] && available <= threshold;

              return (
                <div
                  key={cp.id}
                  className={`bg-white border rounded-xl p-4 transition-all ${
                    isAlerting
                      ? 'border-amber-300 ring-2 ring-amber-200 shadow-md'
                      : 'border-slate-200 hover:border-slate-300 shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <span className="font-semibold text-slate-800">{cp.agency}</span>
                      <span aria-hidden="true">·</span>
                      <span>{cp.area}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleAlert(cp.id)}
                        className={`p-1 rounded-md transition-colors ${
                          alertActive[cp.id]
                            ? 'text-amber-600 hover:bg-amber-50'
                            : 'text-slate-300 hover:text-slate-500'
                        }`}
                        title={
                          alertActive[cp.id]
                            ? `Alert active (triggers if lots < ${threshold})`
                            : 'Enable lot alert'
                        }
                      >
                        {alertActive[cp.id] ? (
                          <BellRing className="w-4 h-4 text-amber-500 animate-bounce" />
                        ) : (
                          <Bell className="w-4 h-4" />
                        )}
                      </button>

                      <button
                        onClick={() => onToggleFavorite(cp.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded-md transition-colors"
                        title="Remove bookmark"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h3
                    onClick={() => onSelectCarpark(cp)}
                    className="text-base font-semibold text-slate-900 hover:text-emerald-700 cursor-pointer line-clamp-1 mb-0.5"
                  >
                    {cp.name}
                  </h3>
                  <p className="text-xs text-slate-500 truncate mb-3">{cp.address}</p>

                  {/* Lot availability count */}
                  <div
                    onClick={() => onSelectCarpark(cp)}
                    className="bg-slate-50 p-3 rounded-lg border border-slate-100 cursor-pointer mb-3"
                  >
                    <div className="flex items-baseline justify-between mb-1">
                      <span className="text-xs text-slate-500">Available Lots:</span>
                      <div className="flex items-baseline gap-1 font-mono">
                        <span className="text-2xl font-bold tabular-nums text-slate-900">
                          {available}
                        </span>
                        <span className="text-xs text-slate-400">/ {total}</span>
                      </div>
                    </div>

                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          available < 5
                            ? 'bg-rose-600'
                            : available < 20
                            ? 'bg-amber-500'
                            : 'bg-emerald-600'
                        }`}
                        style={{
                          width: `${Math.round(((total - available) / total) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Actions & Alerts */}
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                    <span className="text-slate-500 font-mono">
                      ~${cp.rates.perHalfHourEstimate.toFixed(2)}/30m
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onGetDirections(cp)}
                        className="flex items-center gap-1 text-slate-600 hover:text-slate-900 font-medium"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>Navigate</span>
                      </button>

                      <button
                        onClick={() => onSelectCarpark(cp)}
                        className="text-emerald-700 hover:text-emerald-800 font-semibold"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
