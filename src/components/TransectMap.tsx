import { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { useStore } from '../store/useStore';
import { GENUS_COLORS } from '../utils/colors';
import type { Coral, CoralObservation, Genus } from '../types/coral';
import './TransectMap.css';

interface TransectMapProps {
  className?: string;
}

interface CoralWithCurrentObs extends Coral {
  currentObs: CoralObservation;
}

const genusNamesMap: Record<Genus, string> = {
  Poc: 'Pocillopora',
  Por: 'Porites',
  Acr: 'Acropora',
  Mil: 'Millepora',
};

const TransectMap: React.FC<TransectMapProps> = ({ className }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [hoveredColony, setHoveredColony] = useState<number | null>(null);

  const { corals, filters, ui, selectCorals } = useStore();
  const { selectedGenera, selectedTransects, currentYear, minSize, maxSize } = filters;
  const { selectedCoralIds } = ui;

  // Clear hovered colony and selection when year or filters change (prevents orphan tooltips)
  useEffect(() => {
    setHoveredColony(null);
    selectCorals([]); // Clear selection when filters change
  }, [currentYear, selectedGenera, selectedTransects, minSize, maxSize, selectCorals]);

  // Update dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (svgRef.current) {
        const rect = svgRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width, height: rect.height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Filter corals based on current filters and year (memoized for performance)
  const filteredCorals = useMemo(() => {
    return corals
      .map((coral) => {
        // Get observation for current year
        const obs = coral.observations.find((o) => o.year === currentYear);
        return obs ? { ...coral, currentObs: obs } : null;
      })
      .filter(
        (coral): coral is CoralWithCurrentObs =>
          coral !== null &&
          coral.currentObs.is_alive &&
          selectedGenera.includes(coral.genus) &&
          selectedTransects.includes(coral.transect) &&
          (coral.currentObs.volume_proxy || 0) >= minSize &&
          (coral.currentObs.volume_proxy || 0) <= maxSize
      );
  }, [corals, currentYear, selectedGenera, selectedTransects, minSize, maxSize]);

  // Debug logging (development only)
  if (import.meta.env.MODE === 'development') {
    console.log(`[TransectMap] Year ${currentYear}: ${filteredCorals.length} colonies (${corals.length} total in store)`);

    // Sample a few colonies to check their data
    if (filteredCorals.length > 0) {
      const sample = filteredCorals.slice(0, 3).map(c => ({
        id: c.id,
        year: c.currentObs.year,
        is_alive: c.currentObs.is_alive,
        diam: c.currentObs.geometric_mean_diam
      }));
      console.log(`[TransectMap] Sample colonies for ${currentYear}:`, sample);
    }
  }

  // Group by transect
  const transectData = {
    T01: filteredCorals.filter((c) => c.transect === 'T01'),
    T02: filteredCorals.filter((c) => c.transect === 'T02'),
  };

  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 40, right: 30, bottom: 40, left: 60 }; // Reduced margins
    const width = dimensions.width - margin.left - margin.right;
    const height = dimensions.height - margin.top - margin.bottom;

    // Transect dimensions: 1m x 5m
    // NOTE: Data format is x in METERS (0-5m along), y in CENTIMETERS (0-100cm across)
    const transectWidth = 100;  // 1m = 100cm across transect (y dimension)
    const transectLength = 5;   // 5m along transect (x dimension)

    // Scale for transect positioning (side by side) - reduced gap from 0.5m to 0.3m
    const xScale = d3.scaleLinear()
      .domain([0, transectLength * 2 + 0.3]) // Two 5m transects with smaller 0.3m gap
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain([0, transectWidth]) // y is in cm (0-100cm)
      .range([height, 0]);

    // Size scale for circles - increased minimum for visibility against dark background
    const sizeScale = d3
      .scaleSqrt()
      .domain([0, d3.max(filteredCorals, (d) => d.currentObs.geometric_mean_diam || 0) || 100])
      .range([8, 35]); // Increased from [4, 35] to [8, 35] for better visibility

    // Main group
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Background grid
    const gridGroup = g.append('g').attr('class', 'grid');

    // Vertical grid lines (every 0.5m)
    for (let i = 0; i <= transectLength * 2 + 0.5; i += 0.5) {
      gridGroup.append('line')
        .attr('x1', xScale(i))
        .attr('x2', xScale(i))
        .attr('y1', 0)
        .attr('y2', height)
        .attr('class', 'grid-line');
    }

    // Horizontal grid lines (every 25cm)
    for (let i = 0; i <= transectWidth; i += 25) {
      gridGroup.append('line')
        .attr('x1', 0)
        .attr('x2', width)
        .attr('y1', yScale(i))
        .attr('y2', yScale(i))
        .attr('class', 'grid-line');
    }

    // Transect rectangles
    const transectGroup = g.append('g').attr('class', 'transects');

    // T01 background
    transectGroup.append('rect')
      .attr('x', xScale(0))
      .attr('y', yScale(transectWidth))
      .attr('width', xScale(transectLength) - xScale(0))
      .attr('height', height - yScale(transectWidth))
      .attr('class', 'transect-bg')
      .attr('data-transect', 'T01');

    // T02 background
    transectGroup.append('rect')
      .attr('x', xScale(transectLength + 0.5))
      .attr('y', yScale(transectWidth))
      .attr('width', xScale(transectLength) - xScale(0))
      .attr('height', height - yScale(transectWidth))
      .attr('class', 'transect-bg')
      .attr('data-transect', 'T02');

    // Transect labels
    g.append('text')
      .attr('x', xScale(transectLength / 2))
      .attr('y', -30)
      .attr('class', 'transect-label')
      .text('Transect 1');

    g.append('text')
      .attr('x', xScale(transectLength + 0.3 + transectLength / 2)) // Updated for smaller gap
      .attr('y', -30)
      .attr('class', 'transect-label')
      .text('Transect 2');

    // Draw colonies with biological fate styling
    const colonyGroup = g.append('g').attr('class', 'colonies');

    // Helper function to determine colony fate state
    const getColonyFateClass = (coral: CoralWithCurrentObs) => {
      // Use is_recruit from current observation (marks NEW colonies this year)
      const isRecruit = coral.currentObs.is_recruit;
      const isNewDeath = coral.death_year === currentYear;
      const baseClass = `colony ${selectedCoralIds.includes(coral.id) ? 'selected' : ''}`;

      if (isRecruit) return `${baseClass} recruit-birth`;
      if (isNewDeath) return `${baseClass} recent-death`;
      return baseClass;
    };

    // Helper function to get colony opacity based on fate
    const getColonyOpacity = (coral: CoralWithCurrentObs) => {
      // Use is_recruit from current observation
      const isRecruit = coral.currentObs.is_recruit;
      if (isRecruit) return 1.0; // Full opacity for new recruits
      return 0.9; // High opacity for survivors (increased from 0.75)
    };

    // Calculate stagger delays so both transects finish at the same time
    const totalDuration = 2000; // Total time for animation to complete (slower)
    const baseDuration = 800; // Base transition duration (slower)
    const maxColonies = Math.max(transectData.T01.length, transectData.T02.length);
    const staggerDelay = maxColonies > 0 ? (totalDuration - baseDuration) / maxColonies : 0;

    // T01 colonies
    colonyGroup
      .selectAll('.colony-t01')
      .data(transectData.T01)
      .join('circle')
      .attr('class', (d) => getColonyFateClass(d))
      .attr('cx', (d) => xScale(d.x)) // X is along-transect (0-5m)
      .attr('cy', (d) => yScale(d.y)) // Y is across-transect (0-100cm)
      .attr('r', 0)
      .attr('fill', (d) => GENUS_COLORS[d.genus] || '#888')
      .attr('stroke', (d) => {
        if (selectedCoralIds.includes(d.id)) return '#fff';
        if (d.currentObs.is_recruit) return '#06ffa5'; // Cyan glow for recruits
        return 'rgba(255, 255, 255, 0.3)'; // Subtle white stroke for all colonies
      })
      .attr('stroke-width', (d) => {
        if (selectedCoralIds.includes(d.id)) return 2.5;
        if (d.currentObs.is_recruit) return 2;
        return 1; // Thin stroke for normal colonies
      })
      .attr('opacity', (d) => getColonyOpacity(d))
      .style('cursor', 'pointer')
      .style('filter', (d) => {
        if (d.currentObs.is_recruit) {
          return 'drop-shadow(0 0 8px rgba(6, 255, 165, 0.8)) drop-shadow(0 0 4px rgba(6, 255, 165, 0.6))';
        }
        return 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))';
      })
      .on('mouseenter', (event, d) => {
        setHoveredColony(d.id);
        d3.select(event.target)
          .transition()
          .duration(200)
          .attr('opacity', 1)
          .attr('stroke', '#fff')
          .attr('stroke-width', 2);
      })
      .on('mouseleave', (event, d) => {
        setHoveredColony(null);
        if (!selectedCoralIds.includes(d.id)) {
          d3.select(event.target)
            .transition()
            .duration(200)
            .attr('opacity', getColonyOpacity(d))
            .attr('stroke', d.currentObs.is_recruit ? '#06ffa5' : 'rgba(255, 255, 255, 0.3)')
            .attr('stroke-width', d.currentObs.is_recruit ? 2 : 1);
        }
      })
      .on('click', (event, d) => {
        event.stopPropagation();
        selectCorals([d.id]);
      })
      .transition()
      .duration(baseDuration)
      .delay((_d, i) => i * staggerDelay)
      .attr('r', (d) => sizeScale(d.currentObs.geometric_mean_diam || 0));

    // T02 colonies (offset by transect length + gap) with same biological fate styling
    colonyGroup
      .selectAll('.colony-t02')
      .data(transectData.T02)
      .join('circle')
      .attr('class', (d) => getColonyFateClass(d))
      .attr('cx', (d) => xScale(transectLength + 0.3 + d.x)) // Updated gap from 0.5 to 0.3
      .attr('cy', (d) => yScale(d.y))
      .attr('r', 0)
      .attr('fill', (d) => GENUS_COLORS[d.genus] || '#888')
      .attr('stroke', (d) => {
        if (selectedCoralIds.includes(d.id)) return '#fff';
        if (d.currentObs.is_recruit) return '#06ffa5'; // Cyan glow for recruits
        return 'rgba(255, 255, 255, 0.3)'; // Subtle white stroke for all colonies
      })
      .attr('stroke-width', (d) => {
        if (selectedCoralIds.includes(d.id)) return 2.5;
        if (d.currentObs.is_recruit) return 2;
        return 1; // Thin stroke for normal colonies
      })
      .attr('opacity', (d) => getColonyOpacity(d))
      .style('cursor', 'pointer')
      .style('filter', (d) => {
        if (d.currentObs.is_recruit) {
          return 'drop-shadow(0 0 8px rgba(6, 255, 165, 0.8)) drop-shadow(0 0 4px rgba(6, 255, 165, 0.6))';
        }
        return 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))';
      })
      .on('mouseenter', (event, d) => {
        setHoveredColony(d.id);
        d3.select(event.target)
          .transition()
          .duration(200)
          .attr('opacity', 1)
          .attr('stroke', '#fff')
          .attr('stroke-width', 2);
      })
      .on('mouseleave', (event, d) => {
        setHoveredColony(null);
        if (!selectedCoralIds.includes(d.id)) {
          d3.select(event.target)
            .transition()
            .duration(200)
            .attr('opacity', getColonyOpacity(d))
            .attr('stroke', d.currentObs.is_recruit ? '#06ffa5' : 'rgba(255, 255, 255, 0.3)')
            .attr('stroke-width', d.currentObs.is_recruit ? 2 : 1);
        }
      })
      .on('click', (event, d) => {
        event.stopPropagation();
        selectCorals([d.id]);
      })
      .transition()
      .duration(baseDuration)
      .delay((_d, i) => i * staggerDelay)
      .attr('r', (d) => sizeScale(d.currentObs.geometric_mean_diam || 0));

    // Axes - updated for smaller gap
    const xAxis = d3.axisBottom(xScale)
      .tickValues([0, 1, 2, 3, 4, 5, 5.3, 6.3, 7.3, 8.3, 9.3, 10.3])
      .tickFormat(d => {
        const val = +d;
        if (val <= 5) return `${val}m`;
        if (val === 5.3) return '';
        return `${(val - 5.3).toFixed(1)}m`;
      });

    const yAxis = d3.axisLeft(yScale)
      .ticks(5)
      .tickFormat(d => `${d}cm`);

    g.append('g')
      .attr('class', 'axis axis-x')
      .attr('transform', `translate(0,${height})`)
      .call(xAxis);

    g.append('g')
      .attr('class', 'axis axis-y')
      .call(yAxis);

    // Axis labels
    g.append('text')
      .attr('class', 'axis-label')
      .attr('x', width / 2)
      .attr('y', height + 35)
      .text('Along-transect position');

    g.append('text')
      .attr('class', 'axis-label')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height / 2)
      .attr('y', -45)
      .text('Across-transect position');

    // Cleanup function to remove event listeners
    return () => {
      if (svgRef.current) {
        const svg = d3.select(svgRef.current);
        svg.selectAll('.colony-t01').on('mouseenter', null);
        svg.selectAll('.colony-t01').on('mouseleave', null);
        svg.selectAll('.colony-t01').on('click', null);
        svg.selectAll('.colony-t02').on('mouseenter', null);
        svg.selectAll('.colony-t02').on('mouseleave', null);
        svg.selectAll('.colony-t02').on('click', null);
      }
    };
  }, [dimensions, filteredCorals, selectedCoralIds, selectCorals]);

  const hoveredColonyData = hoveredColony
    ? filteredCorals.find((c) => c.id === hoveredColony)
    : null;

  return (
    <div className={`transect-map-container ${className || ''}`}>
      <div className="map-header">
        <h2 className="card-title">Spatial Distribution — {currentYear}</h2>
        <div className="map-stats">
          <span className="stat">
            <span className="stat-label">T01:</span>
            <span className="stat-value">{transectData.T01.length}</span>
          </span>
          <span className="stat">
            <span className="stat-label">T02:</span>
            <span className="stat-value">{transectData.T02.length}</span>
          </span>
          <span className="stat">
            <span className="stat-label">Total:</span>
            <span className="stat-value">{filteredCorals.length}</span>
          </span>
        </div>
      </div>

      <svg ref={svgRef} className="transect-svg" onClick={() => selectCorals([])} />

      {/* Legend */}
      <div className="map-legend">
        {(Object.keys(GENUS_COLORS) as Genus[]).map((genus) => (
          <div key={genus} className="legend-item">
            <div className="legend-color" style={{ backgroundColor: GENUS_COLORS[genus] }} />
            <span className="legend-label">{genusNamesMap[genus]}</span>
          </div>
        ))}
      </div>

      {/* Hover tooltip */}
      {hoveredColonyData && (
        <div
          className="colony-tooltip"
        >
          <div className="tooltip-header">Colony {hoveredColonyData.id}</div>
          <div className="tooltip-row">
            <span>Genus:</span>
            <span style={{ color: GENUS_COLORS[hoveredColonyData.genus] }}>
              {genusNamesMap[hoveredColonyData.genus]}
            </span>
          </div>
          <div className="tooltip-row">
            <span>Diameter:</span>
            <span>{(hoveredColonyData.currentObs.geometric_mean_diam || 0).toFixed(1)} cm</span>
          </div>
          <div className="tooltip-row">
            <span>Position:</span>
            <span>
              ({hoveredColonyData.x.toFixed(2)}, {hoveredColonyData.y.toFixed(2)})
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransectMap;
