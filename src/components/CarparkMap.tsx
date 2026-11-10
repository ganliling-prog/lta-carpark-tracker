import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Carpark, VehicleType } from '../types/carpark';
import { Locate, Maximize2, Navigation } from 'lucide-react';

interface CarparkMapProps {
  carparks: Carpark[];
  selectedCarpark: Carpark | null;
  onSelectCarpark: (carpark: Carpark) => void;
  vehicleType: VehicleType;
}

export const CarparkMap: React.FC<CarparkMapProps> = ({
  carparks,
  selectedCarpark,
  onSelectCarpark,
  vehicleType,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Centered at central Singapore
    const map = L.map(mapContainerRef.current, {
      center: [1.3521, 103.8198],
      zoom: 12,
      minZoom: 11,
      maxZoom: 18,
      zoomControl: false,
    });

    // Add CartoDB Positron clean map tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20,
    }).addTo(map);

    // Zoom control at bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update markers whenever carparks, selectedCarpark, or vehicleType changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear old markers
    Object.values(markersRef.current).forEach((marker) => marker.remove());
    markersRef.current = {};

    carparks.forEach((cp) => {
      const lotInfo =
        vehicleType === 'motorcycle'
          ? cp.lots.motorcycle || { total: 0, available: 0 }
          : vehicleType === 'heavyVehicle'
          ? cp.lots.heavyVehicle || { total: 0, available: 0 }
          : cp.lots.car;

      const available = lotInfo.available;
      const isSelected = selectedCarpark?.id === cp.id;

      // Color based on vacancy
      let bgClass = 'bg-emerald-600 text-white';
      let borderClass = 'border-white';
      if (available === 0) {
        bgClass = 'bg-rose-600 text-white';
      } else if (available < 10) {
        bgClass = 'bg-amber-500 text-white';
      } else if (available < 30) {
        bgClass = 'bg-sky-600 text-white';
      }

      const selectedEffect = isSelected
        ? 'ring-4 ring-emerald-500 ring-offset-2 scale-125 z-50 shadow-lg'
        : 'hover:scale-110 shadow-md';

      const customIcon = L.divIcon({
        className: 'custom-carpark-pin',
        html: `
          <div class="flex items-center justify-center min-w-[34px] h-[34px] px-2 rounded-full border-2 ${borderClass} ${bgClass} font-mono font-bold text-xs tracking-tight transition-transform ${selectedEffect}">
            ${available}
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });

      const marker = L.marker([cp.coordinates.lat, cp.coordinates.lng], {
        icon: customIcon,
      }).addTo(map);

      // Popup
      const popupHtml = `
        <div style="min-width: 200px; font-family: 'Plus Jakarta Sans', sans-serif;">
          <div style="font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase;">
            ${cp.agency} · ${cp.area}
          </div>
          <div style="font-size: 13px; font-weight: 700; color: #0f172a; margin-top: 2px;">
            ${cp.name}
          </div>
          <div style="margin-top: 6px; padding: 6px 8px; background: #f8fafc; border-radius: 6px; border: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 11px; color: #64748b;">Available Lots:</span>
            <span style="font-family: 'JetBrains Mono', monospace; font-size: 14px; font-weight: 700; color: #0f172a;">${available} <span style="font-size: 11px; color: #94a3b8; font-weight: normal;">/ ${lotInfo.total}</span></span>
          </div>
          <div style="font-size: 11px; color: #334155; margin-top: 6px;">
            Rate: <strong>$${cp.rates.perHalfHourEstimate.toFixed(2)}/30m</strong> · ${cp.rates.gracePeriodMins}m grace
          </div>
          <button id="btn-inspect-${cp.id}" style="width: 100%; margin-top: 8px; background: #0f172a; color: #ffffff; border: none; padding: 6px 10px; border-radius: 6px; font-size: 11px; font-weight: 600; cursor: pointer;">
            View Details & Tariffs
          </button>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        closeButton: false,
        offset: [0, -10],
      });

      marker.on('click', () => {
        onSelectCarpark(cp);
      });

      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-inspect-${cp.id}`);
        if (btn) {
          btn.onclick = () => onSelectCarpark(cp);
        }
      });

      markersRef.current[cp.id] = marker;
    });
  }, [carparks, selectedCarpark, vehicleType, onSelectCarpark]);

  // Center on selected carpark when changed
  useEffect(() => {
    if (!selectedCarpark || !mapInstanceRef.current) return;
    const { lat, lng } = selectedCarpark.coordinates;
    mapInstanceRef.current.flyTo([lat, lng], 15, { duration: 0.8 });

    // Open popup
    const marker = markersRef.current[selectedCarpark.id];
    if (marker) {
      marker.openPopup();
    }
  }, [selectedCarpark]);

  const handleCenterSingapore = () => {
    mapInstanceRef.current?.flyTo([1.3521, 103.8198], 12, { duration: 0.6 });
  };

  const handleFitBounds = () => {
    if (!mapInstanceRef.current || carparks.length === 0) return;
    const bounds = L.latLngBounds(
      carparks.map((cp) => [cp.coordinates.lat, cp.coordinates.lng])
    );
    mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40] });
  };

  const handleCenterOrchard = () => {
    mapInstanceRef.current?.flyTo([1.304, 103.834], 14, { duration: 0.6 });
  };

  return (
    <div className="relative w-full h-full min-h-[350px] bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
      {/* Map container */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Floating control buttons */}
      <div className="absolute top-3 right-3 z-20 flex flex-col gap-1.5 bg-white/95 backdrop-blur-xs p-1 rounded-lg border border-slate-200 shadow-md text-xs">
        <button
          onClick={handleFitBounds}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors font-medium whitespace-nowrap"
          title="Fit all carparks in view"
        >
          <Maximize2 className="w-3.5 h-3.5 text-slate-500" />
          <span>Fit All</span>
        </button>

        <button
          onClick={handleCenterSingapore}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors font-medium whitespace-nowrap"
          title="Center whole island"
        >
          <Locate className="w-3.5 h-3.5 text-slate-500" />
          <span>Singapore</span>
        </button>

        <button
          onClick={handleCenterOrchard}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors font-medium whitespace-nowrap"
          title="Jump to Orchard / CBD"
        >
          <Navigation className="w-3.5 h-3.5 text-slate-500" />
          <span>Orchard</span>
        </button>
      </div>

      {/* Map Legend at bottom left */}
      <div className="absolute bottom-3 left-3 z-20 bg-white/95 backdrop-blur-xs px-3 py-2 rounded-lg border border-slate-200 shadow-sm text-[11px] text-slate-600 flex items-center gap-3">
        <span className="font-semibold text-slate-800">Lots:</span>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
          <span>&gt;30 Available</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-600 inline-block" />
          <span>10-30</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
          <span>&lt;10 Limited</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-600 inline-block" />
          <span>0 Full</span>
        </div>
      </div>
    </div>
  );
};
