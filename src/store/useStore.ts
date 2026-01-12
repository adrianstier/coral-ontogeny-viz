/**
 * Global state management using Zustand
 */

import { create } from 'zustand';
import { AppState, FilterState, Genus, UIState, ViewState } from '../types/coral';

const initialFilters: FilterState = {
  selectedGenera: ['Poc', 'Por', 'Acr', 'Mil'],
  selectedTransects: ['T01', 'T02'],
  yearRange: [2013, 2023],
  currentYear: 2013,
  minSize: 0,
  maxSize: 10000,
};

const initialUI: UIState = {
  selectedCoralIds: [],
  hoveredCoralId: null,
  playAnimation: false,
  animationSpeed: 1,
};

const initialView: ViewState = {
  sizeMetric: 'volume_proxy',
  mapColorBy: 'genus',
  populationMetric: 'count',
};

export const useStore = create<AppState>((set) => ({
  // Data
  corals: [],
  isLoading: false,
  error: null,

  // Filters
  filters: initialFilters,

  // UI
  ui: initialUI,

  // View
  view: initialView,

  // Actions
  setCorals: (corals) => set({ corals }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  updateFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    })),

  updateUI: (newUI) =>
    set((state) => ({
      ui: { ...state.ui, ...newUI },
    })),

  updateView: (newView) =>
    set((state) => ({
      view: { ...state.view, ...newView },
    })),

  selectCorals: (ids) =>
    set((state) => ({
      ui: { ...state.ui, selectedCoralIds: ids },
    })),

  toggleGenus: (genus: Genus) =>
    set((state) => {
      const selectedGenera = state.filters.selectedGenera.includes(genus)
        ? state.filters.selectedGenera.filter((g) => g !== genus)
        : [...state.filters.selectedGenera, genus];

      return {
        filters: { ...state.filters, selectedGenera },
      };
    }),

  setCurrentYear: (year) =>
    set((state) => ({
      filters: { ...state.filters, currentYear: year },
    })),

  toggleAnimation: () =>
    set((state) => ({
      ui: { ...state.ui, playAnimation: !state.ui.playAnimation },
    })),
}));
