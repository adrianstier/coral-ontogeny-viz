/**
 * Filter Panel Component
 * Controls for filtering coral data by genus, transect, year range, and size
 */

import React from 'react';
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
    <div className="space-y-6">
      {/* Genus Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Coral Genera
        </label>
        <div className="space-y-2">
          {genera.map((genus) => (
            <button
              key={genus}
              onClick={() => toggleGenus(genus)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded text-sm font-medium transition-colors ${
                selectedGenera.includes(genus)
                  ? 'bg-gray-700 text-white border-2'
                  : 'bg-gray-800 text-gray-400 border-2 border-transparent hover:bg-gray-700'
              }`}
              style={{
                borderColor: selectedGenera.includes(genus)
                  ? GENUS_COLORS[genus]
                  : 'transparent',
              }}
            >
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: GENUS_COLORS[genus] }}
              />
              <span className="flex-1 text-left">{genusNames[genus]}</span>
              <span className="text-xs text-gray-500">
                {selectedGenera.includes(genus) ? '✓' : ''}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Transect Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Transects
        </label>
        <div className="flex gap-2">
          {['T01', 'T02'].map((transect) => (
            <button
              key={transect}
              onClick={() => {
                const newTransects = selectedTransects.includes(transect as any)
                  ? selectedTransects.filter((t) => t !== transect)
                  : [...selectedTransects, transect as any];
                updateFilters({ selectedTransects: newTransects });
              }}
              className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-colors ${
                selectedTransects.includes(transect as any)
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {transect}
            </button>
          ))}
        </div>
      </div>

      {/* Year Range */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Year Range: {yearRange[0]} - {yearRange[1]}
        </label>
        <div className="space-y-2">
          <input
            type="range"
            min="2013"
            max="2023"
            value={yearRange[0]}
            onChange={(e) =>
              updateFilters({ yearRange: [parseInt(e.target.value), yearRange[1]] })
            }
            className="w-full"
          />
          <input
            type="range"
            min="2013"
            max="2023"
            value={yearRange[1]}
            onChange={(e) =>
              updateFilters({ yearRange: [yearRange[0], parseInt(e.target.value)] })
            }
            className="w-full"
          />
        </div>
      </div>

      {/* Size Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Size Range (cm³)
        </label>
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min"
              value={minSize}
              onChange={(e) => updateFilters({ minSize: parseFloat(e.target.value) || 0 })}
              className="flex-1 px-3 py-2 bg-gray-700 text-white rounded text-sm"
            />
            <input
              type="number"
              placeholder="Max"
              value={maxSize}
              onChange={(e) =>
                updateFilters({ maxSize: parseFloat(e.target.value) || 10000 })
              }
              className="flex-1 px-3 py-2 bg-gray-700 text-white rounded text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
