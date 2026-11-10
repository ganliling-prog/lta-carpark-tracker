export type CarparkAgency = 'HDB' | 'URA' | 'LTA' | 'Commercial';

export type VehicleType = 'car' | 'motorcycle' | 'heavyVehicle';

export type AvailabilityStatus = 'available' | 'moderate' | 'limited' | 'full';

export interface LotBreakdown {
  total: number;
  available: number;
}

export interface CarparkRates {
  weekdayDay: string;
  weekdayNight: string;
  saturday: string;
  sundayAndPh: string;
  gracePeriodMins: number;
  perHalfHourEstimate: number; // in SGD
}

export interface Carpark {
  id: string; // e.g., 'ACB', 'ION', 'MBS-01'
  name: string;
  agency: CarparkAgency;
  address: string;
  area: string;
  postalCode: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  carparkType: 'Multi-Storey' | 'Basement' | 'Surface' | 'Mechanized';
  shortTermParking: 'WHOLE_DAY' | '7AM_1030PM' | 'NO';
  freeParkingScheme: string; // e.g. "Sundays & PH 7:00am - 10:30pm" or "None"
  nightParking: boolean;
  gantryHeightMeters: number;
  hasEvCharging: boolean;
  evChargersCount?: number;
  evProvider?: 'SP Group' | 'Shell Recharge' | 'CDG ENGIE' | 'Charge+' | 'Tesla Supercharger';
  paymentMethods: string[];
  rates: CarparkRates;
  lots: {
    car: LotBreakdown;
    motorcycle?: LotBreakdown;
    heavyVehicle?: LotBreakdown;
  };
  lastUpdated: string;
  occupancyStatus: AvailabilityStatus;
  hourlyVacancyPattern: number[]; // 24 values (0-23h) indicating average lot availability percentage
  distanceKm?: number; // Calculated relative to search point or user location
}

export interface FilterState {
  searchQuery: string;
  area: string;
  agency: string;
  vehicleType: VehicleType;
  availability: string; // 'all' | 'available' | 'moderate' | 'limited' | 'full'
  evOnly: boolean;
  freeParkingOnly: boolean;
  sortBy: 'lots' | 'distance' | 'price' | 'name';
}

export interface BackendConfig {
  mode: 'mock' | 'custom_api';
  apiUrl: string;
  autoRefreshIntervalSecs: number;
  isSimulatingLiveFeed: boolean;
}
