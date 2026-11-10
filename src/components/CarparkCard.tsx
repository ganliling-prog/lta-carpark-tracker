import React from 'react';
import { Heart, Navigation, ChevronRight, Zap } from 'lucide-react';
import { Carpark, VehicleType } from '../types/carpark';

interface CarparkCardProps {
  carpark: Carpark;
  vehicleType: VehicleType;
  isSelected: boolean;
  isFavorite: boolean;
  onSelect: (carpark: Carpark) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onGetDirections: (carpark: Carpark, e: React.MouseEvent) => void;
}

export const CarparkCard: React.FC<CarparkCardProps> = ({
  carpark,
  vehicleType,
  isSelected,
  isFavorite,
  onSelect,
  onToggleFavorite,
  onGetDirections,
}) => {
  const lotInfo =
    vehicleType === 'motorcycle'
      ? carpark.lots.motorcycle || { total: 0, available: 0 }
      : vehicleType === 'heavyVehicle'
      ? carpark.lots.heavyVehicle || { total: 0, available: 0 }
      : carpark.lots.car;

  const total = lotInfo.total;
  const available = lotInfo.available;
  const occupancyPct = total > 0 ? Math.round(((total - available) / total) * 100) : 0;

  // Semantic color for status line and progress bar
  let statusColor = 'text-emerald-700';
  let barColor = 'bg-emerald-600';
  let statusText = 'Available';

  if (available === 0) {
    statusColor = 'text-rose-700 font-semibold';
    barColor = 'bg-rose-600';
    statusText = 'Full';
  } else if (available < 10 || occupancyPct > 90) {
    statusColor = 'text-amber-700 font-medium';
    barColor = 'bg-amber-500';
    statusText = 'Filling Fast';
  } else if (occupancyPct > 70) {
    statusColor = 'text-slate-700';
    barColor = 'bg-sky-600';
    statusText = 'Moderate';
  }

  return (
    <div
      onClick={() => onSelect(carpark)}
      className={`group relative bg-white border rounded-xl p-4 transition-all cursor-pointer ${
        isSelected
          ? 'border-emerald-600 ring-2 ring-emerald-600/20 shadow-md'
          : 'border-slate-200 hover:border-slate-300 hover:shadow-xs'
      }`}
    >
      {/* Quiet top line: unboxed metadata */}
      <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
        <div className="flex items-center gap-1.5 truncate">
          <span className="font-semibold text-slate-800">{carpark.agency}</span>
          <span aria-hidden="true">·</span>
          <span>{carpark.area}</span>
          <span aria-hidden="true">·</span>
          <span className="font-mono">{carpark.id}</span>
          {carpark.distanceKm !== undefined && (
            <>
              <span aria-hidden="true">·</span>
              <span className="font-mono text-emerald-800">{carpark.distanceKm} km</span>
            </>
          )}
        </div>

        <button
          onClick={(e) => onToggleFavorite(carpark.id, e)}
          className={`p-1.5 rounded-md hover:bg-slate-100 transition-colors ${
            isFavorite ? 'text-rose-500' : 'text-slate-400 hover:text-slate-600'
          }`}
          title={isFavorite ? 'Remove from favorites' : 'Save carpark'}
          aria-label={isFavorite ? 'Remove from favorites' : 'Save carpark'}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500' : ''}`} />
        </button>
      </div>

      {/* Main title */}
      <h3 className="text-base font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1 mb-1">
        {carpark.name}
      </h3>

      {/* Address line */}
      <p className="text-xs text-slate-500 truncate mb-3">
        {carpark.address} · S({carpark.postalCode})
      </p>

      {/* Lot Availability & Progress bar */}
      <div className="space-y-1.5 mb-3 bg-slate-50/80 p-2.5 rounded-lg border border-slate-100">
        <div className="flex items-baseline justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900 tracking-tight">
              {available}
            </span>
            <span className="text-xs text-slate-500 font-mono tabular-nums">
              / {total} lots
            </span>
          </div>

          <div className="text-right">
            <span className={`text-xs ${statusColor}`}>{statusText}</span>
            <span className="text-xs text-slate-400 font-mono tabular-nums ml-1.5">
              ({occupancyPct}% full)
            </span>
          </div>
        </div>

        {/* Linear progress bar */}
        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
          <div
            className={`h-full ${barColor} transition-all duration-500`}
            style={{ width: `${occupancyPct}%` }}
          />
        </div>
      </div>

      {/* Tariffs and features: Unboxed metadata */}
      <div className="flex flex-wrap items-center justify-between text-xs text-slate-600 gap-y-1 border-t border-slate-100 pt-2.5">
        <div className="flex items-center gap-2 truncate">
          <span className="font-medium text-slate-900">
            ~${carpark.rates.perHalfHourEstimate.toFixed(2)}/30m
          </span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span className="text-slate-500 truncate">
            {carpark.rates.gracePeriodMins}m grace
          </span>
          {carpark.hasEvCharging && (
            <>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="flex items-center gap-0.5 text-emerald-700 font-medium">
                <Zap className="w-3 h-3" />
                {carpark.evChargersCount || 2} EV
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={(e) => onGetDirections(carpark, e)}
            className="flex items-center gap-1 px-2.5 py-1 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
            title="Open in Google Maps"
          >
            <Navigation className="w-3 h-3 text-slate-500" />
            <span>Map</span>
          </button>

          <span className="flex items-center text-xs font-medium text-emerald-700 group-hover:translate-x-0.5 transition-transform">
            Details
            <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
          </span>
        </div>
      </div>
    </div>
  );
};
