/**
 * Type definitions for coral demographic data
 */

export type Genus = 'Poc' | 'Por' | 'Acr' | 'Mil';
export type Transect = 'T01' | 'T02';
export type SizeMetric = 'volume_proxy' | 'geometric_mean_diam' | 'diam1';
export type MapColorBy = 'genus' | 'fate' | 'size';
export type PopulationMetric = 'count' | 'recruitment' | 'mortality' | 'mean_size';

export interface CoralObservation {
  coral_id: number;
  transect: Transect;
  genus: Genus;
  x: number; // 0-5 meters
  y: number; // 0-100 cm
  year: number; // 2013-2023
  diam1: number | null;
  diam2: number | null;
  height: number | null;
  observer: string | null;
  status: string | null;
  fate: string | null;
  growth_ratio: number | null;
  is_alive: boolean;
  is_recruit: boolean;
  // Computed fields
  geometric_mean_diam?: number;
  volume_proxy?: number;
  growth_rate?: number;
}

export interface Coral {
  id: number;
  transect: Transect;
  genus: Genus;
  x: number;
  y: number;
  z: number;
  observations: CoralObservation[];
  // Derived fields
  recruitment_year: number | null;
  death_year: number | null;
  max_size: number;
  lifespan: number;
}

export interface FilterState {
  selectedGenera: Genus[];
  selectedTransects: Transect[];
  yearRange: [number, number];
  currentYear: number;
  minSize: number;
  maxSize: number;
}

export interface UIState {
  selectedCoralIds: number[];
  hoveredCoralId: number | null;
  playAnimation: boolean;
  animationSpeed: number;
}

export interface ViewState {
  sizeMetric: SizeMetric;
  mapColorBy: MapColorBy;
  populationMetric: PopulationMetric;
}

export interface AppState {
  // Data
  corals: Coral[];
  isLoading: boolean;
  error: string | null;

  // Filters
  filters: FilterState;

  // UI
  ui: UIState;

  // View settings
  view: ViewState;

  // Actions
  setCorals: (corals: Coral[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  updateFilters: (filters: Partial<FilterState>) => void;
  updateUI: (ui: Partial<UIState>) => void;
  updateView: (view: Partial<ViewState>) => void;
  selectCorals: (ids: number[]) => void;
  toggleGenus: (genus: Genus) => void;
  setCurrentYear: (year: number) => void;
  toggleAnimation: () => void;
}

export interface YearData {
  year: number;
  [genus: string]: number | { count: number; recruits: number; deaths: number };
}

export interface SurvivalEvent {
  duration: number;
  event: number; // 1 = death, 0 = censored
  genus: Genus;
}
