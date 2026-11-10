import React from 'react';
import { RefreshCw, Radio } from 'lucide-react';

interface HeaderProps {
  activeTab: 'tracker' | 'map' | 'calculator' | 'favorites' | 'backend';
  setActiveTab: (tab: 'tracker' | 'map' | 'calculator' | 'favorites' | 'backend') => void;
  favoritesCount: number;
  isSimulating: boolean;
  setIsSimulating: (val: boolean) => void;
  onRefresh: () => void;
  lastUpdated: string;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  favoritesCount,
  isSimulating,
  setIsSimulating,
  onRefresh,
  lastUpdated,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-4 sm:px-6 py-3.5">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('tracker');
            }}
            className="flex items-center gap-2 group"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-base shadow-xs group-hover:bg-emerald-700 transition-colors">
              P
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 whitespace-nowrap">
              ParkSG
            </span>
          </a>
        </div>

        {/* Zone 2: 4–5 clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button
            onClick={() => setActiveTab('tracker')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeTab === 'tracker'
                ? 'text-emerald-700 font-semibold border-b-2 border-emerald-600'
                : 'hover:text-slate-900'
            }`}
          >
            Live Availability
          </button>

          <button
            onClick={() => setActiveTab('map')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeTab === 'map'
                ? 'text-emerald-700 font-semibold border-b-2 border-emerald-600'
                : 'hover:text-slate-900'
            }`}
          >
            Island Map
          </button>

          <button
            onClick={() => setActiveTab('calculator')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeTab === 'calculator'
                ? 'text-emerald-700 font-semibold border-b-2 border-emerald-600'
                : 'hover:text-slate-900'
            }`}
          >
            Parking Rates
          </button>

          <button
            onClick={() => setActiveTab('favorites')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 flex items-center gap-1.5 ${
              activeTab === 'favorites'
                ? 'text-emerald-700 font-semibold border-b-2 border-emerald-600'
                : 'hover:text-slate-900'
            }`}
          >
            <span>Saved Spots</span>
            {favoritesCount > 0 && (
              <span className="text-xs bg-slate-100 text-slate-700 rounded-full px-1.5 py-0.2 font-mono">
                {favoritesCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('backend')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeTab === 'backend'
                ? 'text-emerald-700 font-semibold border-b-2 border-emerald-600'
                : 'hover:text-slate-900'
            }`}
          >
            Backend API
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setIsSimulating(!isSimulating)}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap ${
              isSimulating
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
            }`}
            title={isSimulating ? 'Simulated real-time updates enabled' : 'Updates paused'}
          >
            <Radio className={`w-3.5 h-3.5 ${isSimulating ? 'text-emerald-600 animate-pulse' : 'text-slate-400'}`} />
            <span>{isSimulating ? 'Live Sim Active' : 'Live Sim Paused'}</span>
          </button>

          <button
            onClick={onRefresh}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap"
            title="Refresh carpark availability"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Refresh Lots</span>
            <span className="sm:hidden">Refresh</span>
          </button>
        </div>
      </div>

      {/* Mobile navigation tab row */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-200/80 px-2 py-2 text-xs font-medium bg-slate-50/70 overflow-x-auto">
        <button
          onClick={() => setActiveTab('tracker')}
          className={`px-2 py-1 whitespace-nowrap ${activeTab === 'tracker' ? 'text-emerald-700 font-bold' : 'text-slate-600'}`}
        >
          Availability
        </button>
        <button
          onClick={() => setActiveTab('map')}
          className={`px-2 py-1 whitespace-nowrap ${activeTab === 'map' ? 'text-emerald-700 font-bold' : 'text-slate-600'}`}
        >
          Map
        </button>
        <button
          onClick={() => setActiveTab('calculator')}
          className={`px-2 py-1 whitespace-nowrap ${activeTab === 'calculator' ? 'text-emerald-700 font-bold' : 'text-slate-600'}`}
        >
          Rates
        </button>
        <button
          onClick={() => setActiveTab('favorites')}
          className={`px-2 py-1 whitespace-nowrap ${activeTab === 'favorites' ? 'text-emerald-700 font-bold' : 'text-slate-600'}`}
        >
          Saved ({favoritesCount})
        </button>
        <button
          onClick={() => setActiveTab('backend')}
          className={`px-2 py-1 whitespace-nowrap ${activeTab === 'backend' ? 'text-emerald-700 font-bold' : 'text-slate-600'}`}
        >
          Backend API
        </button>
      </div>
    </header>
  );
};
