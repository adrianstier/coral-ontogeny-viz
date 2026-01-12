/**
 * Year Slider Component
 * Controls for animating through years and selecting specific year
 */

import React from 'react';
import { useStore } from '../store/useStore';

export function YearSlider() {
  const { filters, ui, setCurrentYear, toggleAnimation, updateUI } = useStore();
  const { currentYear } = filters;
  const { playAnimation, animationSpeed } = ui;

  return (
    <div className="flex items-center gap-4">
      {/* Play/Pause Button */}
      <button
        onClick={toggleAnimation}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
      >
        {playAnimation ? (
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Pause
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
            Play
          </span>
        )}
      </button>

      {/* Year Display */}
      <div className="text-2xl font-bold text-blue-400 w-20 text-center">
        {currentYear}
      </div>

      {/* Year Slider */}
      <div className="flex-1">
        <input
          type="range"
          min="2013"
          max="2023"
          value={currentYear}
          onChange={(e) => setCurrentYear(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>2013</span>
          <span>2018</span>
          <span>2023</span>
        </div>
      </div>

      {/* Speed Control */}
      <div className="flex items-center gap-2">
        <label className="text-sm text-gray-400">Speed:</label>
        <select
          value={animationSpeed}
          onChange={(e) => updateUI({ animationSpeed: parseFloat(e.target.value) })}
          className="px-3 py-2 bg-gray-700 text-white rounded text-sm"
        >
          <option value="0.5">0.5x</option>
          <option value="1">1x</option>
          <option value="2">2x</option>
          <option value="4">4x</option>
        </select>
      </div>
    </div>
  );
}
