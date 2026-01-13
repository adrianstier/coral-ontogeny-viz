import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { useStore } from '../store/useStore';
import { GENUS_COLORS } from '../utils/colors';
import type { Coral, Genus } from '../types/coral';
import './TransectMap.css';

interface TransectMapProps {
  className?: string;
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

  // Filter corals based on current filters and year
  const filteredCorals = corals
    .map((coral) => {
      // Get observation for current year
      const obs = coral.observations.find((o) => o.year === currentYear);
      return obs ? { ...coral, currentObs: obs } : null;
    })
    .filter(
      (coral) =>
        coral &&
        coral.currentObs.is_alive &&
        selectedGenera.includes(coral.genus) &&
        selectedTransects.includes(coral.transect) &&
        (coral.currentObs.volume_proxy || 0) >= minSize &&
        (coral.currentObs.volume_proxy || 0) <= maxSize
    ) as (Coral & { currentObs: any })[];

  // Group by transect
  const transectData = {
    T01: filteredCorals.filter((c) => c.transect === 'T01'),
    T02: filteredCorals.filter((c) => c.transect === 'T02'),
  };

  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 50, right: 50, bottom: 50, left: 70 };
    const width = dimensions.width - margin.left - margin.right;
    const height = dimensions.height - margin.top - margin.bottom;

    // Transect dimensions: 1m x 5m
    // NOTE: Data format is x in METERS (0-5m along), y in CENTIMETERS (0-100cm across)
    const transectWidth = 100;  // 1m = 100cm across transect (y dimension)
    const transectLength = 5;   // 5m along transect (x dimension)

    // Scale for transect positioning (side by side)
    const xScale = d3.scaleLinear()
      .domain([0, transectLength * 2 + 0.5]) // Two 5m transects with 0.5m gap
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain([0, transectWidth]) // y is in cm (0-100cm)
      .range([height, 0]);

    // Size scale for circles - increased for better visibility
    const sizeScale = d3
      .scaleSqrt()
      .domain([0, d3.max(filteredCorals, (d) => d.currentObs.geometric_mean_diam || 0) || 100])
      .range([4, 35]);

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
      .attr('x', xScale(transectLength + 0.5 + transectLength / 2))
      .attr('y', -30)
      .attr('class', 'transect-label')
      .text('Transect 2');

    // Draw colonies
    const colonyGroup = g.append('g').attr('class', 'colonies');

    // T01 colonies
    colonyGroup
      .selectAll('.colony-t01')
      .data(transectData.T01)
      .join('circle')
      .attr('class', (d) => `colony ${selectedCoralIds.includes(d.id) ? 'selected' : ''}`)
      .attr('cx', (d) => xScale(d.x)) // X is along-transect (0-5m)
      .attr('cy', (d) => yScale(d.y)) // Y is across-transect (0-100cm)
      .attr('r', 0)
      .attr('fill', (d) => GENUS_COLORS[d.genus] || '#888')
      .attr('stroke', (d) => (selectedCoralIds.includes(d.id) ? '#fff' : 'none'))
      .attr('stroke-width', 2)
      .attr('opacity', 0.8)
      .style('cursor', 'pointer')
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
            .attr('opacity', 0.8)
            .attr('stroke', 'none');
        }
      })
      .on('click', (event, d) => {
        event.stopPropagation();
        selectCorals([d.id]);
      })
      .transition()
      .duration(800)
      .delay((_d, i) => i * 20)
      .attr('r', (d) => sizeScale(d.currentObs.geometric_mean_diam || 0));

    // T02 colonies (offset by transect length + gap)
    colonyGroup
      .selectAll('.colony-t02')
      .data(transectData.T02)
      .join('circle')
      .attr('class', (d) => `colony ${selectedCoralIds.includes(d.id) ? 'selected' : ''}`)
      .attr('cx', (d) => xScale(transectLength + 0.5 + d.x))
      .attr('cy', (d) => yScale(d.y))
      .attr('r', 0)
      .attr('fill', (d) => GENUS_COLORS[d.genus] || '#888')
      .attr('stroke', (d) => (selectedCoralIds.includes(d.id) ? '#fff' : 'none'))
      .attr('stroke-width', 2)
      .attr('opacity', 0.8)
      .style('cursor', 'pointer')
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
            .attr('opacity', 0.8)
            .attr('stroke', 'none');
        }
      })
      .on('click', (event, d) => {
        event.stopPropagation();
        selectCorals([d.id]);
      })
      .transition()
      .duration(800)
      .delay((_d, i) => i * 20)
      .attr('r', (d) => sizeScale(d.currentObs.geometric_mean_diam || 0));

    // Axes
    const xAxis = d3.axisBottom(xScale)
      .tickValues([0, 1, 2, 3, 4, 5, 5.5, 6.5, 7.5, 8.5, 9.5, 10.5])
      .tickFormat(d => {
        const val = +d;
        if (val <= 5) return `${val}m`;
        if (val === 5.5) return '';
        return `${(val - 5.5).toFixed(1)}m`;
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
