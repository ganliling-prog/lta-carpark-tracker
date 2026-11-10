import React from 'react';
import { Search, X, SlidersHorizontal, Map, LayoutGrid, SplitSquareVertical } from 'lucide-react';
import { FilterState, VehicleType } from '../types/carpark';

interface FilterControlsProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  viewMode: 'split' | 'map' | 'list';
  setViewMode: (mode: 'split' | 'map' | 'list') => void;
  resultsCount: number;
  totalCount: number;
}

const POPULAR_AREAS = [
  'All Areas',
  'Orchard',
  'Marina Bay',
  'CBD / Raffles Place',
  'Chinatown',
  'Bugis',
  'Jurong East',
  'Tampines',
  'Bedok',
  'Ang Mo Kio',
  'Woodlands',
];

export const FilterControls: React.FC<FilterControlsProps> = ({
  filters,
  setFilters,
  viewMode,
  setViewMode,
  resultsCount,
  totalCount,
}) => {
  const isFiltered =
    filters.searchQuery !== '' ||
    filters.area !== 'All Areas' ||
    filters.agency !== 'All' ||
    filters.vehicleType !== 'car' ||
    filters.availability !== 'all' ||
    filters.evOnly ||
    filters.freeParkingOnly;

  const handleResetFilters = () => {
    setFilters({
      searchQuery: '',
      area: 'All Areas',
      agency: 'All',
      vehicleType: 'car',
      availability: 'all',
      evOnly: false,
      freeParkingOnly: false,
      sortBy: 'lots',
    });
  };

  return (
    <div className="bg-white border-b border-slate-200 sticky top-[57px] z-30 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 space-y-2.5">
        {/* Top search & primary filters bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))}
              placeholder="Search by carpark name, address, postal code, or code (e.g. Takashimaya, 050335, ACB)..."
              className="w-full pl-10 pr-9 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all"
            />
            {filters.searchQuery && (
              <button
                onClick={() => setFilters((prev) => ({ ...prev, searchQuery: '' }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Vehicle Type Selector */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg shrink-0">
            <button
              onClick={() => setFilters((prev) => ({ ...prev, vehicleType: 'car' }))}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                filters.vehicleType === 'car'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Cars
            </button>
            <button
              onClick={() => setFilters((prev) => ({ ...prev, vehicleType: 'motorcycle' }))}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                filters.vehicleType === 'motorcycle'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Motorcycles
            </button>
            <button
              onClick={() => setFilters((prev) => ({ ...prev, vehicleType: 'heavyVehicle' }))}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                filters.vehicleType === 'heavyVehicle'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Heavy
            </button>
          </div>

          {/* Sort selector */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-slate-500 whitespace-nowrap hidden lg:inline">Sort:</span>
            <select
              value={filters.sortBy}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, sortBy: e.target.value as any }))
              }
              className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-600"
            >
              <option value="lots">Most Lots Available</option>
              <option value="distance">Nearest Distance</option>
              <option value="price">Lowest Hourly Rate</option>
              <option value="name">Carpark Name (A-Z)</option>
            </select>
          </div>

          {/* View Mode Switcher (Split, Map, List) */}
          <div className="hidden sm:flex items-center gap-1 p-1 bg-slate-100 rounded-lg shrink-0">
            <button
              onClick={() => setViewMode('split')}
              className={`p-1.5 rounded-md text-xs font-medium transition-colors ${
                viewMode === 'split'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Split View (Map & List)"
            >
              <SplitSquareVertical className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md text-xs font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="List Only"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`p-1.5 rounded-md text-xs font-medium transition-colors ${
                viewMode === 'map'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Map Only"
            >
              <Map className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Secondary filter chips & quick area selection */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {/* Agency filters */}
            <span className="text-slate-400 text-[11px] font-medium mr-1 uppercase tracking-wider">Agency:</span>
            {['All', 'HDB', 'URA', 'Commercial', 'LTA'].map((agency) => (
              <button
                key={agency}
                onClick={() => setFilters((prev) => ({ ...prev, agency }))}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                  filters.agency === agency
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {agency}
              </button>
            ))}

            <span className="text-slate-300 mx-1.5" aria-hidden="true">|</span>

            {/* Availability quick filter */}
            <span className="text-slate-400 text-[11px] font-medium mr-1 uppercase tracking-wider">Status:</span>
            {[
              { id: 'all', label: 'All Lots' },
              { id: 'available', label: 'Plenty (>20)' },
              { id: 'moderate', label: 'Moderate (5-20)' },
              { id: 'limited', label: 'Full / <5' },
            ].map((status) => (
              <button
                key={status.id}
                onClick={() => setFilters((prev) => ({ ...prev, availability: status.id }))}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                  filters.availability === status.id
                    ? 'bg-emerald-800 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {status.label}
              </button>
            ))}

            <span className="text-slate-300 mx-1.5" aria-hidden="true">|</span>

            {/* EV Toggles */}
            <button
              onClick={() => setFilters((prev) => ({ ...prev, evOnly: !prev.evOnly }))}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap border ${
                filters.evOnly
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              ⚡ EV Charging
            </button>

            <button
              onClick={() =>
                setFilters((prev) => ({ ...prev, freeParkingOnly: !prev.freeParkingOnly }))
              }
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap border ${
                filters.freeParkingOnly
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              Free Parking Schemes
            </button>
          </div>

          {/* Results count & reset */}
          <div className="flex items-center gap-2 shrink-0 ml-auto">
            <span className="text-slate-500 font-mono tabular-nums text-xs">
              Showing <strong>{resultsCount}</strong> of {totalCount}
            </span>
            {isFiltered && (
              <button
                onClick={handleResetFilters}
                className="text-xs text-rose-600 hover:text-rose-700 underline font-medium"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Region selector row */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs border-t border-slate-100 pt-2">
          <span className="text-slate-400 text-[11px] font-medium mr-1 uppercase tracking-wider shrink-0">
            Region:
          </span>
          {POPULAR_AREAS.map((area) => (
            <button
              key={area}
              onClick={() => setFilters((prev) => ({ ...prev, area }))}
              className={`px-2.5 py-0.5 rounded-md text-xs whitespace-nowrap transition-colors ${
                filters.area === area
                  ? 'bg-slate-800 text-white font-medium'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {area}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
