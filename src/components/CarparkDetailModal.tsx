import React, { useState } from 'react';
import { X, Navigation, Heart, ExternalLink, Calculator, Zap, ShieldCheck } from 'lucide-react';
import { Carpark } from '../types/carpark';
import { estimateParkingFee } from '../services/carparkService';

interface CarparkDetailModalProps {
  carpark: Carpark | null;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}

export const CarparkDetailModal: React.FC<CarparkDetailModalProps> = ({
  carpark,
  onClose,
  isFavorite,
  onToggleFavorite,
}) => {
  if (!carpark) return null;

  // State for parking fee estimator inside modal
  const [estimateDurationHours, setEstimateDurationHours] = useState<number>(2);
  const [estimateDurationMins, setEstimateDurationMins] = useState<number>(0);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const totalEstimateMins = estimateDurationHours * 60 + estimateDurationMins;
  const now = new Date();
  const feeCalculation = estimateParkingFee(
    carpark.rates,
    carpark.agency,
    now,
    totalEstimateMins
  );

  const handleOpenGoogleMaps = () => {
    const { lat, lng } = carpark.coordinates;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, '_blank');
  };

  const handleCopyDetails = () => {
    const text = `${carpark.name} (${carpark.id})\nAddress: ${carpark.address}, Singapore ${carpark.postalCode}\nAvailable Lots: ${carpark.lots.car.available}/${carpark.lots.car.total}\nRates: ${carpark.rates.weekdayDay}`;
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const carLots = carpark.lots.car;
  const motoLots = carpark.lots.motorcycle;
  const heavyLots = carpark.lots.heavyVehicle;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto border border-slate-200 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-slate-200 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <span className="font-semibold text-slate-900">{carpark.agency}</span>
              <span aria-hidden="true">·</span>
              <span>{carpark.area}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono text-slate-700 font-medium">Code: {carpark.id}</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">{carpark.name}</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {carpark.address} · Singapore {carpark.postalCode}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onToggleFavorite(carpark.id)}
              className={`p-2 rounded-lg border transition-colors ${
                isFavorite
                  ? 'bg-rose-50 border-rose-200 text-rose-600'
                  : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-600'
              }`}
              title={isFavorite ? 'Remove from saved' : 'Save to favorites'}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500' : ''}`} />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Real-time lot vacancy dashboard */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-slate-900">Live Lots Availability</h3>
              <span className="text-xs text-slate-400 font-mono">
                Updated {carpark.lastUpdated}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Cars */}
              <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span className="font-medium text-slate-700">Cars</span>
                  <span className="text-[11px] font-mono">
                    {Math.round((carLots.available / carLots.total) * 100)}% free
                  </span>
                </div>
                <div className="flex items-baseline gap-1.5 mb-2">
                  <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
                    {carLots.available}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">/ {carLots.total}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      carLots.available < 5
                        ? 'bg-rose-600'
                        : carLots.available < 20
                        ? 'bg-amber-500'
                        : 'bg-emerald-600'
                    }`}
                    style={{
                      width: `${Math.round(((carLots.total - carLots.available) / carLots.total) * 100)}%`,
                    }}
                  />
                </div>
              </div>

              {/* Motorcycles */}
              <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span className="font-medium text-slate-700">Motorcycles</span>
                  <span className="text-[11px] font-mono">
                    {motoLots ? `${Math.round((motoLots.available / motoLots.total) * 100)}% free` : 'N/A'}
                  </span>
                </div>
                {motoLots ? (
                  <>
                    <div className="flex items-baseline gap-1.5 mb-2">
                      <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
                        {motoLots.available}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">/ {motoLots.total}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-sky-600"
                        style={{
                          width: `${Math.round(((motoLots.total - motoLots.available) / motoLots.total) * 100)}%`,
                        }}
                      />
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-slate-400 mt-2">No dedicated lots</p>
                )}
              </div>

              {/* Heavy vehicles */}
              <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span className="font-medium text-slate-700">Heavy Vehicles</span>
                  <span className="text-[11px] font-mono">
                    {heavyLots ? `${Math.round((heavyLots.available / heavyLots.total) * 100)}% free` : 'N/A'}
                  </span>
                </div>
                {heavyLots ? (
                  <>
                    <div className="flex items-baseline gap-1.5 mb-2">
                      <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
                        {heavyLots.available}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">/ {heavyLots.total}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-slate-700"
                        style={{
                          width: `${Math.round(((heavyLots.total - heavyLots.available) / heavyLots.total) * 100)}%`,
                        }}
                      />
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-slate-400 mt-2">No heavy vehicle lots</p>
                )}
              </div>
            </div>
          </div>

          {/* Parking Tariffs Table */}
          <div className="border border-slate-200 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Official Parking Tariffs</h3>
            <div className="divide-y divide-slate-100 text-xs">
              <div className="py-2 flex items-start justify-between gap-4">
                <span className="text-slate-500 font-medium">Weekdays (Daytime):</span>
                <span className="text-slate-900 font-mono font-medium text-right">
                  {carpark.rates.weekdayDay}
                </span>
              </div>
              <div className="py-2 flex items-start justify-between gap-4">
                <span className="text-slate-500 font-medium">Night Parking (5pm/6pm onwards):</span>
                <span className="text-slate-900 font-mono font-medium text-right">
                  {carpark.rates.weekdayNight}
                </span>
              </div>
              <div className="py-2 flex items-start justify-between gap-4">
                <span className="text-slate-500 font-medium">Saturdays:</span>
                <span className="text-slate-900 font-mono font-medium text-right">
                  {carpark.rates.saturday}
                </span>
              </div>
              <div className="py-2 flex items-start justify-between gap-4">
                <span className="text-slate-500 font-medium">Sundays & Public Holidays:</span>
                <span className="text-slate-900 font-mono font-medium text-right">
                  {carpark.rates.sundayAndPh}
                </span>
              </div>
              <div className="py-2 flex items-center justify-between gap-4">
                <span className="text-slate-500 font-medium">Grace Period:</span>
                <span className="text-emerald-800 font-semibold font-mono">
                  {carpark.rates.gracePeriodMins} minutes free
                </span>
              </div>
              <div className="py-2 flex items-center justify-between gap-4">
                <span className="text-slate-500 font-medium">Free Parking Scheme:</span>
                <span className="text-slate-800 font-medium">
                  {carpark.freeParkingScheme}
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Parking Fee Estimator */}
          <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200">
            <div className="flex items-center gap-2 mb-3">
              <Calculator className="w-4 h-4 text-emerald-700" />
              <h3 className="text-sm font-semibold text-slate-900">Parking Fee Estimator</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs text-slate-600 mb-1 font-medium">
                  Estimated Duration:
                </label>
                <div className="flex items-center gap-2">
                  <select
                    value={estimateDurationHours}
                    onChange={(e) => setEstimateDurationHours(Number(e.target.value))}
                    className="text-xs bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-slate-800 flex-1 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  >
                    {[0, 1, 2, 3, 4, 5, 6, 8, 12, 24].map((hr) => (
                      <option key={hr} value={hr}>
                        {hr} hour{hr !== 1 ? 's' : ''}
                      </option>
                    ))}
                  </select>

                  <select
                    value={estimateDurationMins}
                    onChange={(e) => setEstimateDurationMins(Number(e.target.value))}
                    className="text-xs bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-slate-800 flex-1 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  >
                    {[0, 15, 30, 45].map((min) => (
                      <option key={min} value={min}>
                        {min} mins
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Estimated Total Display */}
              <div className="bg-white p-3 rounded-lg border border-slate-200 flex flex-col justify-center">
                <span className="text-xs text-slate-500">Estimated Total (Entering now):</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-xl font-bold font-mono tabular-nums text-slate-900">
                    ${feeCalculation.estimatedTotal.toFixed(2)}
                  </span>
                  <span className="text-[11px] text-slate-500">SGD</span>
                </div>
                <span className="text-[11px] text-slate-400 mt-0.5 truncate">
                  {feeCalculation.breakdown}
                </span>
              </div>
            </div>
          </div>

          {/* 24-hour Occupancy Pattern */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-slate-900">Typical 24-Hour Vacancy Trend</h3>
              <span className="text-[11px] text-slate-400">Higher bar = more free lots</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="flex items-end justify-between h-20 gap-1 pt-2">
                {carpark.hourlyVacancyPattern.map((val, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center group relative">
                    <div
                      className={`w-full rounded-t-xs transition-all ${
                        idx === now.getHours()
                          ? 'bg-emerald-600 ring-2 ring-emerald-500'
                          : 'bg-slate-300 group-hover:bg-slate-400'
                      }`}
                      style={{ height: `${Math.max(6, val)}%` }}
                    />
                    {/* Tooltip on hover */}
                    <div className="hidden group-hover:block absolute -top-7 bg-slate-900 text-white text-[10px] py-0.5 px-1.5 rounded-sm font-mono whitespace-nowrap z-20">
                      {idx}:00 — {val}% lots free
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1.5 px-1">
                <span>12 AM</span>
                <span>6 AM</span>
                <span>12 PM</span>
                <span>6 PM</span>
                <span>11 PM</span>
              </div>
            </div>
          </div>

          {/* Physical Specifications & Features */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5">
              <span className="font-semibold text-slate-900">Physical & Height Limits</span>
              <p className="text-slate-600">
                Structure: <strong>{carpark.carparkType}</strong>
              </p>
              <p className="text-slate-600">
                Gantry Height: <strong className="font-mono">{carpark.gantryHeightMeters}m</strong>
              </p>
              <p className="text-slate-600">
                Overnight Parking: <strong>{carpark.nightParking ? 'Permitted' : 'No'}</strong>
              </p>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5">
              <span className="font-semibold text-slate-900">Payment & EV Charging</span>
              <p className="text-slate-600 truncate">
                Payment: <strong>{carpark.paymentMethods.join(', ')}</strong>
              </p>
              <p className="text-slate-600 flex items-center gap-1">
                EV Charging:{' '}
                {carpark.hasEvCharging ? (
                  <strong className="text-emerald-700 flex items-center gap-0.5">
                    <Zap className="w-3 h-3" /> {carpark.evChargersCount} lots ({carpark.evProvider})
                  </strong>
                ) : (
                  <strong>None available</strong>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 flex items-center justify-between gap-3">
          <button
            onClick={handleCopyDetails}
            className="text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            {copiedLink ? 'Copied to clipboard!' : 'Copy Carpark Info'}
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Close
            </button>

            <button
              onClick={handleOpenGoogleMaps}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Get Directions</span>
              <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
