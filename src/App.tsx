import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Carpark, FilterState, BackendConfig } from './types/carpark';
import { INITIAL_CARPARKS } from './data/mockCarparks';
import {
  simulateFluctuations,
  getSavedFavorites,
  saveFavorites,
  fetchLiveCarparks,
  calculateDistanceKm,
} from './services/carparkService';
import { Header } from './components/Header';
import { StatsOverview } from './components/StatsOverview';
import { FilterControls } from './components/FilterControls';
import { CarparkCard } from './components/CarparkCard';
import { CarparkMap } from './components/CarparkMap';
import { CarparkDetailModal } from './components/CarparkDetailModal';
import { BackendIntegrationModal } from './components/BackendIntegrationModal';
import { RateCalculatorView } from './components/RateCalculatorView';
import { FavoritesView } from './components/FavoritesView';

export default function App() {
  const [carparks, setCarparks] = useState<Carpark[]>(INITIAL_CARPARKS);
  const [activeTab, setActiveTab] = useState<'tracker' | 'map' | 'calculator' | 'favorites' | 'backend'>('tracker');
  const [viewMode, setViewMode] = useState<'split' | 'map' | 'list'>('split');
  const [selectedCarpark, setSelectedCarpark] = useState<Carpark | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<string[]>(getSavedFavorites);
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [lastRefreshedTime, setLastRefreshedTime] = useState<string>(
    new Date().toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  );

  const [backendConfig, setBackendConfig] = useState<BackendConfig>({
    mode: 'mock',
    apiUrl: '',
    autoRefreshIntervalSecs: 30,
    isSimulatingLiveFeed: true,
  });

  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    area: 'All Areas',
    agency: 'All',
    vehicleType: 'car',
    availability: 'all',
    evOnly: false,
    freeParkingOnly: false,
    sortBy: 'lots',
  });

  // Toggle favorite
  const handleToggleFavorite = useCallback((id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFavoriteIds((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      saveFavorites(next);
      return next;
    });
  }, []);

  // Google Maps navigation
  const handleGetDirections = useCallback((carpark: Carpark, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const { lat, lng } = carpark.coordinates;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, '_blank');
  }, []);

  // Manual Refresh
  const handleRefresh = useCallback(() => {
    setCarparks((prev) => simulateFluctuations(prev));
    const nowStr = new Date().toLocaleTimeString('en-SG', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    setLastRefreshedTime(nowStr);
  }, []);

  // Periodic simulation interval (every 8 seconds to reflect realistic lot changes)
  useEffect(() => {
    if (!isSimulating || backendConfig.mode === 'custom_api') return;

    const interval = setInterval(() => {
      setCarparks((prev) => simulateFluctuations(prev));
      setLastRefreshedTime(
        new Date().toLocaleTimeString('en-SG', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    }, 8000);

    return () => clearInterval(interval);
  }, [isSimulating, backendConfig.mode]);

  // Test backend connection
  const handleTestBackendConnection = async (url: string) => {
    try {
      const fetched = await fetchLiveCarparks(url);
      setCarparks(fetched);
      return {
        success: true,
        message: 'Connected successfully to backend API!',
        count: fetched.length,
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Failed to connect. Check CORS or URL endpoint.',
      };
    }
  };

  // User simulated GPS position (e.g. Orchard / Central Singapore)
  const userLat = 1.304;
  const userLng = 103.832;

  // Filter and sort carparks
  const filteredCarparks = useMemo(() => {
    return carparks
      .map((cp) => ({
        ...cp,
        distanceKm: calculateDistanceKm(userLat, userLng, cp.coordinates.lat, cp.coordinates.lng),
      }))
      .filter((cp) => {
        // Query search
        if (filters.searchQuery.trim()) {
          const q = filters.searchQuery.toLowerCase().trim();
          const matchName = cp.name.toLowerCase().includes(q);
          const matchArea = cp.area.toLowerCase().includes(q);
          const matchAddress = cp.address.toLowerCase().includes(q);
          const matchPostal = cp.postalCode.includes(q);
          const matchId = cp.id.toLowerCase().includes(q);
          if (!matchName && !matchArea && !matchAddress && !matchPostal && !matchId) {
            return false;
          }
        }

        // Area filter
        if (filters.area !== 'All Areas') {
          if (!cp.area.toLowerCase().includes(filters.area.toLowerCase())) {
            return false;
          }
        }

        // Agency filter
        if (filters.agency !== 'All') {
          if (cp.agency !== filters.agency) {
            return false;
          }
        }

        // Vehicle type availability check
        const lotInfo =
          filters.vehicleType === 'motorcycle'
            ? cp.lots.motorcycle || { total: 0, available: 0 }
            : filters.vehicleType === 'heavyVehicle'
            ? cp.lots.heavyVehicle || { total: 0, available: 0 }
            : cp.lots.car;

        // If filtering by motorcycle/heavy vehicle, ignore carparks without those lots
        if (filters.vehicleType !== 'car' && lotInfo.total === 0) {
          return false;
        }

        // Availability filter
        if (filters.availability === 'available' && lotInfo.available < 20) {
          return false;
        }
        if (
          filters.availability === 'moderate' &&
          (lotInfo.available < 5 || lotInfo.available >= 20)
        ) {
          return false;
        }
        if (filters.availability === 'limited' && lotInfo.available >= 5) {
          return false;
        }

        // EV toggle
        if (filters.evOnly && !cp.hasEvCharging) {
          return false;
        }

        // Free parking toggle
        if (filters.freeParkingOnly && cp.freeParkingScheme === 'None') {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        const lotA =
          filters.vehicleType === 'motorcycle'
            ? a.lots.motorcycle?.available || 0
            : a.lots.car.available;
        const lotB =
          filters.vehicleType === 'motorcycle'
            ? b.lots.motorcycle?.available || 0
            : b.lots.car.available;

        if (filters.sortBy === 'lots') {
          return lotB - lotA;
        }
        if (filters.sortBy === 'distance') {
          return (a.distanceKm || 0) - (b.distanceKm || 0);
        }
        if (filters.sortBy === 'price') {
          return a.rates.perHalfHourEstimate - b.rates.perHalfHourEstimate;
        }
        if (filters.sortBy === 'name') {
          return a.name.localeCompare(b.name);
        }
        return 0;
      });
  }, [carparks, filters]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        favoritesCount={favoriteIds.length}
        isSimulating={isSimulating}
        setIsSimulating={setIsSimulating}
        onRefresh={handleRefresh}
        lastUpdated={lastRefreshedTime}
      />

      {/* Island-wide metrics bar */}
      <StatsOverview carparks={carparks} lastRefreshedTime={lastRefreshedTime} />

      {/* Main Content Areas */}
      <main className="flex-1 flex flex-col">
        {/* Tab 1: Live Availability Tracker */}
        {activeTab === 'tracker' && (
          <div className="flex-1 flex flex-col">
            <FilterControls
              filters={filters}
              setFilters={setFilters}
              viewMode={viewMode}
              setViewMode={setViewMode}
              resultsCount={filteredCarparks.length}
              totalCount={carparks.length}
            />

            <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-4">
              {/* Split View (Desktop: Map on right / sticky, Cards on left) */}
              {viewMode === 'split' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Left Column: Carpark Cards list */}
                  <div className="lg:col-span-7 space-y-3">
                    {filteredCarparks.length === 0 ? (
                      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
                        <p className="text-sm font-semibold text-slate-900">
                          No carparks found matching your criteria
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          Try searching another Singapore area, clearing filters, or switching vehicle types.
                        </p>
                      </div>
                    ) : (
                      filteredCarparks.map((cp) => (
                        <CarparkCard
                          key={cp.id}
                          carpark={cp}
                          vehicleType={filters.vehicleType}
                          isSelected={selectedCarpark?.id === cp.id}
                          isFavorite={favoriteIds.includes(cp.id)}
                          onSelect={setSelectedCarpark}
                          onToggleFavorite={handleToggleFavorite}
                          onGetDirections={handleGetDirections}
                        />
                      ))
                    )}
                  </div>

                  {/* Right Column: Sticky Map */}
                  <div className="lg:col-span-5 lg:sticky lg:top-[145px] h-[450px] lg:h-[calc(100vh-170px)]">
                    <CarparkMap
                      carparks={filteredCarparks}
                      selectedCarpark={selectedCarpark}
                      onSelectCarpark={setSelectedCarpark}
                      vehicleType={filters.vehicleType}
                    />
                  </div>
                </div>
              )}

              {/* List Only View */}
              {viewMode === 'list' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredCarparks.map((cp) => (
                    <CarparkCard
                      key={cp.id}
                      carpark={cp}
                      vehicleType={filters.vehicleType}
                      isSelected={selectedCarpark?.id === cp.id}
                      isFavorite={favoriteIds.includes(cp.id)}
                      onSelect={setSelectedCarpark}
                      onToggleFavorite={handleToggleFavorite}
                      onGetDirections={handleGetDirections}
                    />
                  ))}
                </div>
              )}

              {/* Map Only View */}
              {viewMode === 'map' && (
                <div className="h-[calc(100vh-180px)] min-h-[500px]">
                  <CarparkMap
                    carparks={filteredCarparks}
                    selectedCarpark={selectedCarpark}
                    onSelectCarpark={setSelectedCarpark}
                    vehicleType={filters.vehicleType}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Island Map view */}
        {activeTab === 'map' && (
          <div className="flex-1 flex flex-col p-4 sm:p-6 max-w-7xl w-full mx-auto">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Singapore Carpark Availability Map</h2>
                <p className="text-xs text-slate-500">
                  Click any pin to view live available lot counts, height restrictions, and tariffs
                </p>
              </div>
              <span className="text-xs font-mono text-slate-500">
                {carparks.length} Carparks Active
              </span>
            </div>
            <div className="flex-1 min-h-[550px] h-[calc(100vh-210px)]">
              <CarparkMap
                carparks={carparks}
                selectedCarpark={selectedCarpark}
                onSelectCarpark={setSelectedCarpark}
                vehicleType={filters.vehicleType}
              />
            </div>
          </div>
        )}

        {/* Tab 3: Parking Rate Calculator */}
        {activeTab === 'calculator' && (
          <RateCalculatorView carparks={carparks} onSelectCarpark={setSelectedCarpark} />
        )}

        {/* Tab 4: Saved / Bookmarked Spots */}
        {activeTab === 'favorites' && (
          <FavoritesView
            carparks={carparks}
            favoriteIds={favoriteIds}
            onToggleFavorite={handleToggleFavorite}
            onSelectCarpark={setSelectedCarpark}
            onGetDirections={handleGetDirections}
            vehicleType={filters.vehicleType}
          />
        )}

        {/* Tab 5: Backend API Integration Guide */}
        {activeTab === 'backend' && (
          <BackendIntegrationModal
            config={backendConfig}
            setConfig={setBackendConfig}
            onClose={() => setActiveTab('tracker')}
            onTestConnection={handleTestBackendConnection}
          />
        )}
      </main>

      {/* Carpark Detail Drawer / Modal */}
      <CarparkDetailModal
        carpark={selectedCarpark}
        onClose={() => setSelectedCarpark(null)}
        isFavorite={selectedCarpark ? favoriteIds.includes(selectedCarpark.id) : false}
        onToggleFavorite={handleToggleFavorite}
      />

      {/* Quiet Footer adhering to anti-slop rules */}
      <footer className="bg-white border-t border-slate-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">ParkSG</span>
            <span aria-hidden="true">·</span>
            <span>Singapore Carpark Availability Tracker</span>
            <span aria-hidden="true">·</span>
            <span>HDB, URA & LTA Compatible</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('backend')}
              className="hover:text-slate-900 transition-colors font-medium"
            >
              Backend Integration Guide
            </button>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="text-slate-400">DataMall API Ready</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
