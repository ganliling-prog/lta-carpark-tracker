import { Carpark, AvailabilityStatus, CarparkRates } from '../types/carpark';
import { INITIAL_CARPARKS } from '../data/mockCarparks';

const FAVORITES_STORAGE_KEY = 'parksg_favorite_carparks';
const BACKEND_CONFIG_KEY = 'parksg_backend_config';

export function getOccupancyStatus(available: number, total: number): AvailabilityStatus {
  if (available <= 0) return 'full';
  const ratio = available / total;
  if (available <= 5 || ratio < 0.05) return 'limited';
  if (available <= 25 || ratio < 0.20) return 'moderate';
  return 'available';
}

// Distance calculation using Haversine formula
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// Simulate real-time lot fluctuations (cars entering / leaving)
export function simulateFluctuations(carparks: Carpark[]): Carpark[] {
  const now = new Date();
  const timeString = now.toLocaleTimeString('en-SG', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return carparks.map((cp) => {
    // 35% chance this carpark experiences lot change
    if (Math.random() > 0.35) {
      return cp;
    }

    const currentLots = cp.lots.car.available;
    const totalLots = cp.lots.car.total;

    // Small random delta between -3 and +3
    const delta = Math.floor(Math.random() * 7) - 3;
    const newAvailable = Math.max(0, Math.min(totalLots, currentLots + delta));

    const updatedOccupancy = getOccupancyStatus(newAvailable, totalLots);

    return {
      ...cp,
      lots: {
        ...cp.lots,
        car: {
          ...cp.lots.car,
          available: newAvailable,
        },
      },
      occupancyStatus: updatedOccupancy,
      lastUpdated: timeString,
    };
  });
}

// Estimate parking fee for a carpark given start time and duration
export function estimateParkingFee(
  rates: CarparkRates,
  agency: string,
  entryDate: Date,
  durationMinutes: number
): { estimatedTotal: number; breakdown: string; freeApplied: boolean } {
  if (durationMinutes <= rates.gracePeriodMins) {
    return {
      estimatedTotal: 0,
      breakdown: `Grace period (${rates.gracePeriodMins} mins) applied: $0.00`,
      freeApplied: true,
    };
  }

  const dayOfWeek = entryDate.getDay(); // 0 = Sunday, 6 = Saturday
  const entryHour = entryDate.getHours();

  // Check HDB/URA Sunday free parking
  if (
    dayOfWeek === 0 &&
    (agency === 'HDB' || agency === 'URA') &&
    entryHour >= 7 &&
    entryHour < 22
  ) {
    return {
      estimatedTotal: 0,
      breakdown: 'HDB/URA Sunday Free Parking Scheme (7:00 AM - 10:30 PM)',
      freeApplied: true,
    };
  }

  // Calculate based on half-hour units
  const chargeableMinutes = durationMinutes;
  const halfHourUnits = Math.ceil(chargeableMinutes / 30);
  const baseRate = rates.perHalfHourEstimate;

  let total = halfHourUnits * baseRate;

  // Night cap discount if applicable for HDB
  if (agency === 'HDB' && (entryHour >= 22 || entryHour < 6) && total > 5.0) {
    total = 5.0;
  }

  return {
    estimatedTotal: Math.round(total * 100) / 100,
    breakdown: `${halfHourUnits} half-hour block(s) @ ~$${baseRate.toFixed(2)}/30m`,
    freeApplied: false,
  };
}

// LocalStorage helpers for user bookmarks
export function getSavedFavorites(): string[] {
  try {
    const data = localStorage.getItem(FAVORITES_STORAGE_KEY);
    return data ? JSON.parse(data) : ['OR-ION', 'HDB-CTM', 'COM-WG'];
  } catch {
    return ['OR-ION', 'HDB-CTM', 'COM-WG'];
  }
}

export function saveFavorites(ids: string[]): void {
  try {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(ids));
  } catch (err) {
    console.error('Failed to save favorites to localStorage', err);
  }
}

// Integration adapter: Fetch live carpark feeds
// Can be swapped to real backend endpoint
export async function fetchLiveCarparks(customEndpoint?: string): Promise<Carpark[]> {
  if (!customEndpoint) {
    return INITIAL_CARPARKS;
  }

  try {
    const response = await fetch(customEndpoint, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Backend returned status: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // If data is array of Carpark, return directly
    if (Array.isArray(data)) {
      return data;
    }

    // If data follows Singapore LTA DataMall structure: { value: [{ CarParkID, Area, Development, AvailableLots, LotType, Agency }] }
    if (data && Array.isArray(data.value)) {
      return data.value.map((item: any) => ({
        id: item.CarParkID || `CP-${Math.random().toString(36).substring(7)}`,
        name: item.Development || 'Singapore Carpark',
        agency: (item.Agency as any) || 'HDB',
        address: item.Development || 'Singapore',
        area: item.Area || 'Central',
        postalCode: '000000',
        coordinates: {
          lat: parseFloat(item.Location?.split(' ')[0] || '1.3521'),
          lng: parseFloat(item.Location?.split(' ')[1] || '103.8198'),
        },
        carparkType: 'Multi-Storey',
        shortTermParking: 'WHOLE_DAY',
        freeParkingScheme: 'None',
        nightParking: true,
        gantryHeightMeters: 2.15,
        hasEvCharging: false,
        paymentMethods: ['EPS (CashCard/FlashPay)', 'Parking.sg'],
        rates: {
          weekdayDay: '$0.60 / 30 mins',
          weekdayNight: '$0.60 / 30 mins',
          saturday: '$0.60 / 30 mins',
          sundayAndPh: 'Free',
          gracePeriodMins: 10,
          perHalfHourEstimate: 0.60,
        },
        lots: {
          car: {
            total: (parseInt(item.AvailableLots, 10) || 50) + 20,
            available: parseInt(item.AvailableLots, 10) || 0,
          },
        },
        lastUpdated: new Date().toLocaleTimeString('en-SG'),
        occupancyStatus: getOccupancyStatus(
          parseInt(item.AvailableLots, 10) || 0,
          (parseInt(item.AvailableLots, 10) || 50) + 20
        ),
        hourlyVacancyPattern: [50, 50, 50, 50, 50, 50, 40, 30, 20, 20, 20, 25, 25, 25, 20, 20, 25, 30, 40, 50, 50, 50, 50, 50],
      }));
    }

    return INITIAL_CARPARKS;
  } catch (err) {
    console.warn('Failed to load from backend URL, falling back to mock dataset:', err);
    throw err;
  }
}
