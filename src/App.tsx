/**
 * Main Application Component
 * Coral Ontogeny Visualization Dashboard
 */

import { useState } from 'react';
import { useCoralDataJSON } from './hooks/useCoralDataJSON';
import { useAnimation } from './hooks/useAnimation';
import { useStore } from './store/useStore';
import { FilterPanel } from './components/FilterPanel';
import TransectMap from './components/TransectMap';
import './App.css';

function App() {
  const [statsExpanded, setStatsExpanded] = useState(false);
  // Load data from R-generated JSON files
  useCoralDataJSON();

  // Setup animation
  useAnimation();

  const { corals, isLoading, error, filters } = useStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="loading-spinner mx-auto"></div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold gradient-text">
              Loading Coral Demographic Data
            </h2>
            <p className="text-gray-400 font-mono text-sm tracking-wider">
              Mo'orea LTER Back Reef Transects • 2013–2024
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="glass-card max-w-2xl w-full p-8 text-center space-y-6">
          <div className="text-6xl">⚠️</div>
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-red-400">Data Loading Error</h2>
            <p className="text-gray-300">{error}</p>
          </div>
          <div className="glass-panel p-6 text-left space-y-3">
            <p className="text-sm text-gray-400">
              Ensure R-generated JSON files are in{' '}
              <code className="px-2 py-1 bg-gray-800 rounded text-cyan-400">
                public/data/
              </code>
            </p>
            <p className="text-sm text-gray-400">
              Run:{' '}
              <code className="px-2 py-1 bg-gray-800 rounded text-cyan-400">
                Rscript scripts/R/03_export_for_webapp.R
              </code>
            </p>
          </div>
        </div>
      </div>
    );
  }

  const liveColonies = corals.filter((c) => {
    const obs = c.observations.find((o) => o.year === filters.currentYear);
    return obs?.is_alive;
  }).length;

  return (
    <div className="min-h-screen flex flex-col relative z-10">
      {/* Header */}
      <header className="glass-panel border-b border-gray-700/50 sticky top-0 z-50 backdrop-blur-xl">
        <div className="max-w-[1800px] mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-4xl font-bold gradient-text">
                Coral Ontogeny Analysis
              </h1>
              <p className="text-gray-400 font-mono text-sm tracking-wider">
                Hunter Lenihan Time Series • Mo'orea LTER • 2013–2024 •{' '}
                <span className="text-cyan-400">{corals.length.toLocaleString()}</span>{' '}
                Colonies
              </p>
            </div>

            <div className="flex items-center gap-4 flex-wrap">
              {/* Year Badge */}
              <div className="stat-badge">
                <span className="text-gray-400 text-xs">YEAR</span>
                <span className="text-2xl font-bold">{filters.currentYear}</span>
              </div>

              {/* Live Colonies Badge */}
              <div className="stat-badge">
                <span className="text-gray-400 text-xs">LIVE</span>
                <span className="text-2xl font-bold">{liveColonies}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Dashboard */}
      <main className="flex-1 max-w-[1800px] mx-auto w-full p-6 grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
        {/* Primary Visualization - Transect Map */}
        <section className="glass-card p-6 shimmer-border relative overflow-hidden min-h-[800px]">
          <TransectMap className="h-full" />
        </section>

        {/* Sidebar - Filters & Stats */}
        <aside className="space-y-6">
          {/* Filter Panel */}
          <section className="glass-card p-6">
            <h2 className="text-lg font-bold text-gray-200 mb-6 flex items-center gap-3">
              <div className="w-1 h-6 bg-gradient-to-b from-cyan-400 to-blue-500 rounded"></div>
              Filters
            </h2>
            <FilterPanel />
          </section>

          {/* Statistics - Collapsible */}
          <section className="glass-card">
            <button
              onClick={() => setStatsExpanded(!statsExpanded)}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors rounded-t-xl"
            >
              <h2 className="text-base font-bold text-gray-200 flex items-center gap-2">
                <div className="w-1 h-5 bg-gradient-to-b from-pink-400 to-purple-500 rounded"></div>
                Statistics
              </h2>
              <svg
                className={`w-5 h-5 text-gray-400 transition-transform ${statsExpanded ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {statsExpanded && (
              <div className="p-6 pt-0 space-y-6 animate-in fade-in slide-in-from-top-2 duration-200">
                {/* Summary Statistics */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Summary</h3>
                  <div className="space-y-3">
                    <StatItem label="Total Colonies" value={corals.length} color="cyan" />
                    <StatItem label="Live Colonies" value={liveColonies} color="green" />
                    <StatItem label="Study Duration" value="11 years" color="blue" />
                    <StatItem label="Transects" value="2" color="purple" />
                  </div>
                </div>

                {/* Genus Distribution */}
                <div className="space-y-3 border-t border-gray-700/50 pt-4">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Genus Distribution</h3>
                  <GenusStats corals={corals} currentYear={filters.currentYear} />
                </div>
              </div>
            )}
          </section>
        </aside>
      </main>
    </div>
  );
}

// Stat Item Component
function StatItem({
  label,
  value,
  color = 'cyan',
}: {
  label: string;
  value: number | string;
  color?: 'cyan' | 'green' | 'blue' | 'purple';
}) {
  const colorClasses = {
    cyan: 'from-cyan-400/20 to-blue-500/20 border-cyan-400/30 text-cyan-400',
    green: 'from-green-400/20 to-emerald-500/20 border-green-400/30 text-green-400',
    blue: 'from-blue-400/20 to-indigo-500/20 border-blue-400/30 text-blue-400',
    purple: 'from-purple-400/20 to-pink-500/20 border-purple-400/30 text-purple-400',
  };

  return (
    <div
      className={`flex items-center justify-between p-4 rounded-lg border bg-gradient-to-br ${colorClasses[color]}`}
    >
      <span className="text-sm text-gray-300 font-medium">{label}</span>
      <span className={`text-2xl font-bold ${colorClasses[color].split(' ').pop()}`}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </span>
    </div>
  );
}

// Genus Stats Component
function GenusStats({ corals, currentYear }: { corals: import('./types/coral').Coral[]; currentYear: number }) {
  const GENUS_COLORS: Record<string, string> = {
    Poc: '#E41A1C',
    Por: '#377EB8',
    Acr: '#4DAF4A',
    Mil: '#984EA3',
  };

  const GENUS_NAMES: Record<string, string> = {
    Poc: 'Pocillopora',
    Por: 'Porites',
    Acr: 'Acropora',
    Mil: 'Millepora',
  };

  const genusCounts = corals.reduce((acc, coral) => {
    const obs = coral.observations.find((o) => o.year === currentYear);
    if (obs?.is_alive) {
      acc[coral.genus] = (acc[coral.genus] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const total = Object.values(genusCounts).reduce((sum, count) => sum + count, 0);

  return (
    <div className="space-y-3">
      {Object.entries(GENUS_NAMES).map(([code, name]) => {
        const count = genusCounts[code] || 0;
        const percentage = total > 0 ? (count / total) * 100 : 0;

        return (
          <div key={code} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: GENUS_COLORS[code] }}
                ></div>
                <span className="text-gray-300 font-medium">{name}</span>
              </div>
              <span className="text-gray-400 font-mono">{count}</span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${percentage}%`,
                  backgroundColor: GENUS_COLORS[code],
                  boxShadow: `0 0 10px ${GENUS_COLORS[code]}40`,
                }}
              ></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default App;
