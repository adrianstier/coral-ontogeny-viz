/**
 * Main Application Component
 */

import React from 'react';
import { useCoralData } from './hooks/useCoralData';
import { useAnimation } from './hooks/useAnimation';
import { useStore } from './store/useStore';
import { FilterPanel } from './components/FilterPanel';
import { YearSlider } from './components/YearSlider';

function App() {
  // Load data
  useCoralData();

  // Setup animation
  useAnimation();

  const { corals, isLoading, error } = useStore();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-xl text-gray-300">Loading coral demographic data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center max-w-lg card bg-red-900/30 border border-red-500">
          <h2 className="text-2xl font-bold text-red-400 mb-2">Error Loading Data</h2>
          <p className="text-gray-300">{error}</p>
          <p className="text-sm text-gray-400 mt-4">
            Make sure the data file is placed in <code className="bg-gray-800 px-2 py-1 rounded">public/data/</code>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-blue-400">
              Coral Ontogeny Visualization
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Mo'orea LTER Back Reef Transects | 2013-2023 | {corals.length} coral colonies
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">Interactive Data Explorer</p>
            <p className="text-xs text-gray-500">MCR LTER NSF #OCE-1637396</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 overflow-auto">
        <div className="grid grid-cols-3 gap-4 h-full">
          {/* Left Panel - TransectMap */}
          <div className="col-span-2 card">
            <h2 className="text-lg font-semibold mb-4 text-blue-300">Transect Map</h2>
            <div className="h-[calc(100%-2rem)] flex items-center justify-center text-gray-500">
              <p>TransectMap Component - Coming Soon</p>
            </div>
          </div>

          {/* Right Panel - Controls & Filters */}
          <div className="space-y-4">
            {/* Filter Panel */}
            <div className="card">
              <h2 className="text-lg font-semibold mb-4 text-blue-300">Filters</h2>
              <FilterPanel />
            </div>

            {/* Size Distribution */}
            <div className="card">
              <h2 className="text-lg font-semibold mb-4 text-blue-300">Size Distribution</h2>
              <div className="h-48 flex items-center justify-center text-gray-500 text-sm">
                SizeDistribution Component - Coming Soon
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer - Year Slider */}
      <footer className="bg-gray-800 border-t border-gray-700 px-6 py-4">
        <YearSlider />
      </footer>
    </div>
  );
}

export default App;
