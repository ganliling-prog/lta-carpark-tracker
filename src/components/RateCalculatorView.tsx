import React, { useState } from 'react';
import { Carpark } from '../types/carpark';
import { estimateParkingFee } from '../services/carparkService';
import { Calculator, ArrowUpDown, ChevronRight, Sparkles } from 'lucide-react';

interface RateCalculatorViewProps {
  carparks: Carpark[];
  onSelectCarpark: (carpark: Carpark) => void;
}

export const RateCalculatorView: React.FC<RateCalculatorViewProps> = ({
  carparks,
  onSelectCarpark,
}) => {
  const [selectedArea, setSelectedArea] = useState<string>('Orchard');
  const [durationHours, setDurationHours] = useState<number>(2);
  const [durationMins, setDurationMins] = useState<number>(30);
  const [dayType, setDayType] = useState<'weekday_day' | 'weekday_night' | 'saturday' | 'sunday'>('weekday_day');

  // Compute reference date based on selected dayType
  const getReferenceDate = () => {
    const d = new Date();
    if (dayType === 'weekday_day') {
      // Monday 14:00
      d.setDate(d.getDate() + ((1 + 7 - d.getDay()) % 7 || 7));
      d.setHours(14, 0, 0, 0);
    } else if (dayType === 'weekday_night') {
      // Monday 19:30
      d.setDate(d.getDate() + ((1 + 7 - d.getDay()) % 7 || 7));
      d.setHours(19, 30, 0, 0);
    } else if (dayType === 'saturday') {
      // Saturday 15:00
      d.setDate(d.getDate() + ((6 + 7 - d.getDay()) % 7 || 7));
      d.setHours(15, 0, 0, 0);
    } else {
      // Sunday 11:00
      d.setDate(d.getDate() + ((0 + 7 - d.getDay()) % 7 || 7));
      d.setHours(11, 0, 0, 0);
    }
    return d;
  };

  const refDate = getReferenceDate();
  const totalDurationMins = durationHours * 60 + durationMins;

  // Filter carparks in area or all if desired
  const filtered = carparks.filter(
    (cp) => selectedArea === 'All Areas' || cp.area.toLowerCase().includes(selectedArea.toLowerCase())
  );

  // Calculate fees and sort ascending by cost
  const results = filtered
    .map((cp) => {
      const estimate = estimateParkingFee(cp.rates, cp.agency, refDate, totalDurationMins);
      return {
        carpark: cp,
        fee: estimate.estimatedTotal,
        breakdown: estimate.breakdown,
        isFree: estimate.freeApplied,
      };
    })
    .sort((a, b) => a.fee - b.fee);

  const availableAreas = ['Orchard', 'Marina Bay', 'CBD / Raffles Place', 'Bugis', 'Jurong East', 'Tampines', 'Bedok', 'All Areas'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Calculator className="w-5 h-5 text-emerald-700" />
          <span>Singapore Parking Rate & Trip Cost Calculator</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Compare parking fees across adjacent carparks for any destination and find the cheapest or free parking options.
        </p>
      </div>

      {/* Control filters box */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Destination Area */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Destination Area:
            </label>
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              {availableAreas.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
          </div>

          {/* Time Window */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Entry Schedule:
            </label>
            <select
              value={dayType}
              onChange={(e) => setDayType(e.target.value as any)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              <option value="weekday_day">Weekday Daytime (e.g. 2:00 PM)</option>
              <option value="weekday_night">Weekday Evening (e.g. 7:30 PM)</option>
              <option value="saturday">Saturday Afternoon (e.g. 3:00 PM)</option>
              <option value="sunday">Sunday / Public Holiday (e.g. 11:00 AM)</option>
            </select>
          </div>

          {/* Parking Duration */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Parking Duration:
            </label>
            <div className="flex gap-2">
              <select
                value={durationHours}
                onChange={(e) => setDurationHours(Number(e.target.value))}
                className="w-1/2 text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
              >
                {[0, 1, 2, 3, 4, 5, 6, 8, 12].map((hr) => (
                  <option key={hr} value={hr}>
                    {hr} hr{hr !== 1 ? 's' : ''}
                  </option>
                ))}
              </select>

              <select
                value={durationMins}
                onChange={(e) => setDurationMins(Number(e.target.value))}
                className="w-1/2 text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
              >
                {[0, 15, 30, 45].map((min) => (
                  <option key={min} value={min}>
                    {min} mins
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Tip summary */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>
              Calculating cost for <strong>{totalDurationMins} minutes</strong> of parking in <strong>{selectedArea}</strong>.
            </span>
          </div>
          <span className="font-mono text-[11px] text-slate-400">
            {results.length} carpark options evaluated
          </span>
        </div>
      </div>

      {/* Comparison table / card list */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span className="font-medium">Ranked from Lowest to Highest Estimated Parking Fee</span>
          <span className="flex items-center gap-1 font-mono">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            Sorted by Cost
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {results.map(({ carpark, fee, breakdown, isFree }, idx) => (
            <div
              key={carpark.id}
              onClick={() => onSelectCarpark(carpark)}
              className="bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-300 hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-bold text-slate-700 font-mono">#{idx + 1}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-semibold text-slate-800">{carpark.agency}</span>
                    <span aria-hidden="true">·</span>
                    <span>{carpark.area}</span>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-lg font-bold font-mono tabular-nums ${
                        isFree ? 'text-emerald-700' : 'text-slate-900'
                      }`}
                    >
                      {isFree ? 'FREE' : `$${fee.toFixed(2)}`}
                    </span>
                    {!isFree && <span className="text-[11px] text-slate-400 ml-1">SGD</span>}
                  </div>
                </div>

                <h3 className="text-sm font-semibold text-slate-900 hover:text-emerald-700 transition-colors line-clamp-1">
                  {carpark.name}
                </h3>
                <p className="text-xs text-slate-500 truncate mt-0.5">{carpark.address}</p>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <span className="text-[11px] text-slate-500 block truncate">{breakdown}</span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Currently {carpark.lots.car.available} lots free
                  </span>
                </div>

                <button className="flex items-center gap-0.5 text-xs font-medium text-emerald-700 hover:text-emerald-800 shrink-0 ml-2">
                  <span>View Details</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
