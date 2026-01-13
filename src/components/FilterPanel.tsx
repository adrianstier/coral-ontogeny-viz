/**
 * Filter Panel Component
 * Beautiful controls for filtering coral data
 */

import { useStore } from '../store/useStore';
import { GENUS_COLORS } from '../utils/colors';
import { Genus } from '../types/coral';

export function FilterPanel() {
  const { filters, toggleGenus, updateFilters } = useStore();
  const { selectedGenera, selectedTransects, yearRange, minSize, maxSize } = filters;

  const genera: Genus[] = ['Poc', 'Por', 'Acr', 'Mil'];
  const genusNames = {
    Poc: 'Pocillopora',
    Por: 'Porites',
    Acr: 'Acropora',
    Mil: 'Millepora',
  };

  return (
    <div className="space-y-8">
      {/* Genus Filter */}
      <div className="space-y-4">
        <label className="block text-sm font-semibold text-gray-300 uppercase tracking-wider">
          Coral Genera
        </label>
        <div className="space-y-2">
          {genera.map((genus) => {
            const isSelected = selectedGenera.includes(genus);
            return (
              <button
                key={genus}
                onClick={() => toggleGenus(genus)}
                aria-label={`${isSelected ? 'Deselect' : 'Select'} ${genusNames[genus]} genus for filtering`}
                aria-pressed={isSelected}
                className={`w-full group flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-300 ${
                  isSelected
                    ? 'bg-gradient-to-r from-gray-800/80 to-gray-700/60 border-2 shadow-lg'
                    : 'bg-gray-800/40 border-2 border-transparent hover:bg-gray-800/60 hover:border-gray-700/50'
                }`}
                style={{
                  borderColor: isSelected ? GENUS_COLORS[genus] : 'transparent',
                  boxShadow: isSelected
                    ? `0 0 20px ${GENUS_COLORS[genus]}30`
                    : 'none',
                }}
              >
                {/* Color Indicator */}
                <div className="relative">
                  <div
                    className={`w-5 h-5 rounded-full transition-all duration-300 ${
                      isSelected ? 'scale-110' : 'scale-100 group-hover:scale-105'
                    }`}
                    style={{
                      backgroundColor: GENUS_COLORS[genus],
                      boxShadow: isSelected
                        ? `0 0 15px ${GENUS_COLORS[genus]}60`
                        : `0 0 8px ${GENUS_COLORS[genus]}30`,
                    }}
                  />
                  {isSelected && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg
                        className="w-3 h-3 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Genus Name */}
                <span className={`flex-1 text-left ${isSelected ? 'text-white' : 'text-gray-400'}`}>
                  {genusNames[genus]}
                </span>

                {/* Check Icon */}
                {isSelected && (
                  <svg
                    className="w-4 h-4 text-cyan-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Transect Filter */}
      <div className="space-y-4">
        <label className="block text-sm font-semibold text-gray-300 uppercase tracking-wider">
          Transects
        </label>
        <div className="grid grid-cols-2 gap-3">
          {['T01', 'T02'].map((transect) => {
            const isSelected = selectedTransects.includes(transect as any);
            return (
              <button
                key={transect}
                onClick={() => {
                  const newTransects = isSelected
                    ? selectedTransects.filter((t) => t !== transect)
                    : [...selectedTransects, transect as any];
                  updateFilters({ selectedTransects: newTransects });
                }}
                aria-label={`${isSelected ? 'Deselect' : 'Select'} transect ${transect}`}
                aria-pressed={isSelected}
                className={`px-4 py-3 rounded-lg font-bold text-sm transition-all duration-300 ${
                  isSelected
                    ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg'
                    : 'bg-gray-800/60 text-gray-400 border border-gray-700/50 hover:bg-gray-800 hover:border-cyan-500/50'
                }`}
                style={{
                  boxShadow: isSelected ? 'var(--glow-cyan)' : 'none',
                }}
              >
                {transect}
              </button>
            );
          })}
        </div>
      </div>

      {/* Year Range */}
      <div className="space-y-4">
        <label className="block text-sm font-semibold text-gray-300 uppercase tracking-wider">
          Year Range
        </label>
        <div className="glass-panel p-4 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Start</span>
            <span className="font-mono font-bold text-cyan-400">{yearRange[0]}</span>
          </div>
          <input
            type="range"
            min="2013"
            max="2023"
            value={yearRange[0]}
            onChange={(e) =>
              updateFilters({ yearRange: [parseInt(e.target.value), yearRange[1]] })
            }
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">End</span>
            <span className="font-mono font-bold text-blue-400">{yearRange[1]}</span>
          </div>
          <input
            type="range"
            min="2013"
            max="2023"
            value={yearRange[1]}
            onChange={(e) =>
              updateFilters({ yearRange: [yearRange[0], parseInt(e.target.value)] })
            }
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>
      </div>

      {/* Size Filter */}
      <div className="space-y-4">
        <label className="block text-sm font-semibold text-gray-300 uppercase tracking-wider">
          Size Range (cm³)
        </label>
        <div className="grid grid-cols-2 gap-3">
          <div className="glass-panel p-3">
            <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wide">
              Minimum
            </label>
            <input
              type="number"
              placeholder="0"
              value={minSize || ''}
              onChange={(e) => updateFilters({ minSize: parseFloat(e.target.value) || 0 })}
              className="w-full bg-gray-800 text-white font-mono rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
            />
          </div>
          <div className="glass-panel p-3">
            <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wide">
              Maximum
            </label>
            <input
              type="number"
              placeholder="10000"
              value={maxSize || ''}
              onChange={(e) =>
                updateFilters({ maxSize: parseFloat(e.target.value) || 10000 })
              }
              className="w-full bg-gray-800 text-white font-mono rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Reset Button */}
      <button
        onClick={() => {
          updateFilters({
            selectedGenera: ['Poc', 'Por', 'Acr', 'Mil'],
            selectedTransects: ['T01', 'T02'],
            yearRange: [2013, 2023],
            minSize: 0,
            maxSize: 10000,
          });
        }}
        className="w-full btn-secondary"
      >
        Reset All Filters
      </button>
    </div>
  );
}
