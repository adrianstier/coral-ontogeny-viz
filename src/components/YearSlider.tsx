/**
 * Year Slider Component
 * Cinematic controls for temporal navigation
 */

import { useRef, useEffect, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { getYearArray } from '../utils/dataUtils';

export function YearSlider() {
  const { filters, ui, setCurrentYear, toggleAnimation, updateUI } = useStore();
  const { currentYear, yearRange } = filters;
  const { playAnimation, animationSpeed } = ui;
  const sliderRef = useRef<HTMLInputElement>(null);
  const isUpdatingRef = useRef(false);

  const [minYear, maxYear] = yearRange;
  const years = useMemo(() => getYearArray(minYear, maxYear), [minYear, maxYear]);

  // Force update slider value when currentYear changes (fixes animation sync issue)
  useEffect(() => {
    if (sliderRef.current && sliderRef.current.value !== String(currentYear)) {
      isUpdatingRef.current = true;
      sliderRef.current.value = String(currentYear);
      isUpdatingRef.current = false;
    }
  }, [currentYear]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isUpdatingRef.current) {
      setCurrentYear(parseInt(e.target.value));
    }
  };

  return (
    <div className="flex items-center gap-6">
      {/* Play/Pause Button */}
      <button
        onClick={toggleAnimation}
        className={`flex-shrink-0 px-6 py-3 rounded-lg font-bold text-sm transition-all duration-300 flex items-center gap-3 ${
          playAnimation
            ? 'bg-gradient-to-br from-orange-500 to-red-600 text-white shadow-lg'
            : 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg'
        }`}
        style={{
          boxShadow: playAnimation ? 'var(--glow-coral)' : 'var(--glow-cyan)',
        }}
      >
        {playAnimation ? (
          <>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span>Pause</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                clipRule="evenodd"
              />
            </svg>
            <span>Play</span>
          </>
        )}
      </button>

      {/* Year Display - Large */}
      <div className="flex-shrink-0">
        <div className="glass-panel px-6 py-3 border-2 border-cyan-500/30">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Current Year</div>
          <div className="text-3xl font-bold gradient-text font-mono tracking-tight">
            {currentYear}
          </div>
        </div>
      </div>

      {/* Year Slider */}
      <div className="flex-1 space-y-3">
        {/* Slider Track */}
        <div className="relative">
          <input
            ref={sliderRef}
            type="range"
            min={minYear}
            max={maxYear}
            defaultValue={currentYear}
            onChange={handleSliderChange}
            className="w-full h-3 bg-gray-800 rounded-full appearance-none cursor-pointer slider-modern"
            style={{
              background: `linear-gradient(to right,
                var(--bio-cyan) 0%,
                var(--bio-cyan) ${((currentYear - minYear) / (maxYear - minYear)) * 100}%,
                rgb(31 41 55) ${((currentYear - minYear) / (maxYear - minYear)) * 100}%,
                rgb(31 41 55) 100%)`,
            }}
          />
        </div>

        {/* Year Labels */}
        <div className="flex justify-between text-xs font-mono">
          {years.map((year) => (
            <button
              key={year}
              onClick={() => setCurrentYear(year)}
              aria-label={`Jump to year ${year}`}
              aria-current={year === currentYear ? 'true' : 'false'}
              className={`transition-all duration-200 ${
                year === currentYear
                  ? 'text-cyan-400 font-bold scale-110'
                  : 'text-gray-600 hover:text-gray-400'
              }`}
            >
              {year}
            </button>
          ))}
        </div>
      </div>

      {/* Speed Control Slider */}
      <div className="flex-shrink-0 flex flex-col gap-2 min-w-[180px]">
        <div className="flex items-center justify-between">
          <label className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Speed</label>
          <span className="text-sm font-bold text-cyan-400 font-mono">{animationSpeed}×</span>
        </div>
        <div className="relative">
          <input
            type="range"
            min="0.5"
            max="4"
            step="0.5"
            value={animationSpeed}
            onChange={(e) => updateUI({ animationSpeed: parseFloat(e.target.value) })}
            className="w-full h-2 bg-gray-800 rounded-full appearance-none cursor-pointer speed-slider"
            style={{
              background: `linear-gradient(to right,
                var(--bio-purple) 0%,
                var(--bio-purple) ${((animationSpeed - 0.5) / 3.5) * 100}%,
                rgb(31 41 55) ${((animationSpeed - 0.5) / 3.5) * 100}%,
                rgb(31 41 55) 100%)`,
            }}
          />
          {/* Speed markers */}
          <div className="flex justify-between mt-1 px-1">
            {[0.5, 1, 2, 4].map((speed) => (
              <button
                key={speed}
                onClick={() => updateUI({ animationSpeed: speed })}
                className={`text-xs font-mono transition-colors ${
                  speed === animationSpeed
                    ? 'text-purple-400 font-bold'
                    : 'text-gray-600 hover:text-gray-400'
                }`}
                aria-label={`Set speed to ${speed}x`}
              >
                {speed}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Navigation Buttons */}
      <div className="flex-shrink-0 flex items-center gap-2">
        <button
          onClick={() => setCurrentYear(Math.max(minYear, currentYear - 1))}
          disabled={currentYear === minYear}
          className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-cyan-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          title="Previous Year"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </button>
        <button
          onClick={() => setCurrentYear(Math.min(maxYear, currentYear + 1))}
          disabled={currentYear === maxYear}
          className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-cyan-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          title="Next Year"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
