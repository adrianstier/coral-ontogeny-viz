# Implementation Plan: Coral Ontogeny Visualization System

## Overview

This document outlines the phased implementation strategy for building the Coral Ontogeny Visualization System. The plan is structured to deliver incremental value while maintaining code quality and architectural integrity.

## Development Phases

### Phase 1: Foundation & Core Infrastructure (Week 1-2)

#### 1.1 Project Setup
- [x] Initialize Vite + React + TypeScript project
- [x] Configure Tailwind CSS
- [x] Set up ESLint and TypeScript strict mode
- [x] Create project structure and documentation
- [ ] Set up basic routing (if needed)
- [ ] Configure deployment pipeline

#### 1.2 Type System & Data Models
**Files**: `src/types/`

```typescript
// Core types to implement
- CoralRecord: Individual measurement record
- CoralColony: Aggregated colony with temporal history
- Genus: Enum for coral genera
- Fate: Enum for demographic events
- TransectData: Complete transect structure
- Filters: Filter state interface
```

**Deliverable**: Complete TypeScript type definitions for all data entities

#### 1.3 Data Loading & Processing
**Files**: `src/utils/dataLoader.ts`, `src/utils/dataProcessing.ts`

**Tasks**:
- [ ] Excel/CSV parser for transect data
- [ ] Wide-to-long format transformation
- [ ] Derived field calculations:
  - Volume proxy: `(diam1 * diam2 * height) / 6`
  - Geometric mean diameter: `sqrt(diam1 * diam2)`
  - Growth rate: `log(size_t1 / size_t0)`
- [ ] Missing data handling (Na, UK, D codes)
- [ ] Colony trajectory construction
- [ ] Fate classification logic

**Deliverable**: Robust data pipeline with sample data loaded

#### 1.4 State Management
**Files**: `src/store/useCoralStore.ts`

**Store Slices**:
- [ ] Data slice (transect data, colonies, computed metrics)
- [ ] Filter slice (genus, year range, transect, fate, size)
- [ ] UI slice (selected colonies, hovered items, year scrubber position)
- [ ] View slice (map zoom/pan, chart domains)

**Deliverable**: Zustand store with all state management logic

---

### Phase 2: 2D Transect Visualization (Week 3-4)

#### 2.1 Base Map Component
**Files**: `src/components/TransectMap/`

**Components**:
- [ ] `TransectMap.tsx`: Main container
- [ ] `TransectCanvas.tsx`: SVG canvas with coordinate system
- [ ] `ColonyMarker.tsx`: Individual colony representation
- [ ] `MapControls.tsx`: Zoom, pan, reset controls
- [ ] `MapLegend.tsx`: Symbol and color key

**Features**:
- [ ] 1m × 5m transect layout (vertical orientation)
- [ ] X/Y axis with scale markers
- [ ] Responsive scaling for different screen sizes
- [ ] Zoom and pan with D3 zoom behavior

**Deliverable**: Interactive transect map with static colony positions

#### 2.2 Colony Representation
**Files**: `src/components/TransectMap/ColonyMarker.tsx`

**Encoding Rules**:
- [ ] Shape by genus:
  - Circle: Pocillopora
  - Square: Porites
  - Triangle: Acropora
  - Diamond: Millepora
- [ ] Size by colony volume/diameter
- [ ] Color by fate:
  - Green: Growth
  - Yellow: Recruitment
  - Orange: Shrinkage
  - Red: Death
  - Gray: Stable/Alive
  - Purple: Fission/Fusion

**Features**:
- [ ] Hover tooltips with basic info
- [ ] Click selection
- [ ] Highlight on hover
- [ ] Smooth transitions between states

**Deliverable**: Fully encoded colony markers with interactions

#### 2.3 Temporal Animation
**Files**: `src/components/TransectMap/TimeControl.tsx`

**Components**:
- [ ] Year slider with play/pause
- [ ] Animation speed control
- [ ] Year display
- [ ] Timeline scrubber

**Features**:
- [ ] Animate through years (2013-2023)
- [ ] Smooth transitions for colony appearance/disappearance
- [ ] Pause on user interaction
- [ ] Jump to specific year

**Deliverable**: Working temporal animation system

#### 2.4 Colony Detail Popup
**Files**: `src/components/TransectMap/ColonyDetail.tsx`

**Content**:
- [ ] Colony ID and genus
- [ ] Complete measurement history table
- [ ] Mini growth trajectory chart (D3 line plot)
- [ ] Fate timeline with event markers
- [ ] Links to related colonies (fission/fusion)

**Deliverable**: Rich detail view for individual colonies

---

### Phase 3: Filtering & Interaction (Week 5)

#### 3.1 Filter Panel
**Files**: `src/components/Filters/`

**Components**:
- [ ] `FilterPanel.tsx`: Container
- [ ] `GenusFilter.tsx`: Multi-select chips
- [ ] `YearRangeFilter.tsx`: Dual-handle slider
- [ ] `TransectFilter.tsx`: T01/T02 toggle
- [ ] `FateFilter.tsx`: Checkboxes for fate types
- [ ] `SizeFilter.tsx`: Min/max sliders
- [ ] `FilterSummary.tsx`: Active filter chips

**Features**:
- [ ] Real-time filtering (no apply button)
- [ ] Filter count badges
- [ ] Clear all filters button
- [ ] Persist filters in URL params (optional)

**Deliverable**: Complete filtering system

#### 3.2 Linked Interactions
**Files**: `src/hooks/useLinkedSelection.ts`

**Features**:
- [ ] Selection state management
- [ ] Cross-view highlighting
- [ ] Multi-select with Shift/Cmd
- [ ] Deselection logic

**Deliverable**: Working linked brushing across views

---

### Phase 4: 1D Time Series Views (Week 6-7)

#### 4.1 Population Dynamics Panel
**Files**: `src/components/TimeSeries/PopulationChart.tsx`

**Charts**:
- [ ] Line chart: Colony count over time
- [ ] Separate lines by genus (color-coded)
- [ ] Aggregate or separate by transect (toggle)
- [ ] Recruitment/mortality rate overlay (optional)

**Features**:
- [ ] D3-based line chart with axes
- [ ] Hover tooltips with exact values
- [ ] Legend with toggle visibility
- [ ] Responsive resizing

**Deliverable**: Population dynamics line chart

#### 4.2 Size Distribution Panel
**Files**: `src/components/TimeSeries/SizeHistogram.tsx`

**Charts**:
- [ ] Histogram of colony sizes (bins by volume proxy)
- [ ] Animate through years
- [ ] Overlay for multiple genera
- [ ] KDE smoothing option (optional)

**Features**:
- [ ] D3 histogram layout
- [ ] Synchronized with year scrubber
- [ ] Brushing to filter size range

**Deliverable**: Animated size distribution histogram

#### 4.3 Individual Trajectories
**Files**: `src/components/TimeSeries/TrajectoryChart.tsx`

**Charts**:
- [ ] Multi-line chart for selected colonies
- [ ] Size vs time
- [ ] Fate event annotations (markers)
- [ ] Different line styles by genus

**Features**:
- [ ] Add/remove colonies from selection
- [ ] Zoom to specific time range
- [ ] Export selected trajectories

**Deliverable**: Colony trajectory visualization

---

### Phase 5: Advanced Analytics (Week 8-9)

#### 5.1 Survival Analysis
**Files**: `src/components/TimeSeries/SurvivalCurve.tsx`

**Charts**:
- [ ] Kaplan-Meier survival curves by genus
- [ ] Confidence intervals (optional)
- [ ] Comparison tests (log-rank)

**Analysis**:
- [ ] Compute survival probabilities
- [ ] Handle censored data
- [ ] Group by genus/size class

**Deliverable**: Survival curve visualization

#### 5.2 Growth/Mortality Relationships
**Files**: `src/components/Analytics/SizeFateChart.tsx`

**Charts**:
- [ ] Probability of fate vs initial size
- [ ] Binned scatter plots
- [ ] Logistic regression curves (optional)

**Deliverable**: Size-fate relationship charts

#### 5.3 Cohort Tracking
**Files**: `src/hooks/useCohortTracking.ts`

**Features**:
- [ ] Tag colonies by recruitment year
- [ ] Follow cohort through time
- [ ] Cohort-specific metrics dashboard
- [ ] Highlight cohort in all views

**Deliverable**: Cohort tracking system

---

### Phase 6: Spatial Analytics (Week 10)

#### 6.1 Density Heatmap
**Files**: `src/components/TransectMap/DensityOverlay.tsx`

**Features**:
- [ ] Kernel density estimation
- [ ] Contour overlay on transect map
- [ ] Toggle on/off

**Deliverable**: Spatial density visualization

#### 6.2 Neighborhood Analysis
**Files**: `src/utils/spatialAnalysis.ts`

**Features**:
- [ ] Find neighbors within radius
- [ ] Highlight selected + neighbors
- [ ] Compute spatial autocorrelation (optional)

**Deliverable**: Spatial proximity tools

#### 6.3 Mortality Hotspots
**Files**: `src/components/TransectMap/MortalityHeatmap.tsx`

**Features**:
- [ ] Aggregate death locations across years
- [ ] Heatmap visualization
- [ ] Temporal comparison

**Deliverable**: Mortality hotspot analysis

---

### Phase 7: Dashboard & Export (Week 11)

#### 7.1 Summary Statistics Dashboard
**Files**: `src/components/Dashboard/StatsDashboard.tsx`

**Widgets**:
- [ ] Current year colony counts
- [ ] Year-over-year changes
- [ ] Mean size ± SD by genus
- [ ] Recruitment/mortality rates
- [ ] Top recruits and deaths

**Deliverable**: Comprehensive metrics dashboard

#### 7.2 Export Functionality
**Files**: `src/utils/export.ts`

**Features**:
- [ ] PNG export of current view (html2canvas or native SVG)
- [ ] SVG export of maps/charts
- [ ] CSV export of filtered data
- [ ] PDF report generation (optional)

**Deliverable**: Multi-format export system

---

### Phase 8: Polish & Optimization (Week 12)

#### 8.1 Performance Optimization
- [ ] Memoize expensive computations
- [ ] Virtualize large lists
- [ ] Lazy load historical data
- [ ] Optimize D3 rendering (canvas fallback for 400+ colonies)
- [ ] Bundle size optimization

**Target**: 60fps animation, <100ms filter response

#### 8.2 Responsive Design
- [ ] Desktop layout (1200px+)
- [ ] Tablet layout (768px+)
- [ ] Touch-friendly controls
- [ ] Mobile-friendly (optional, simplified views)

#### 8.3 Accessibility
- [ ] Keyboard navigation
- [ ] ARIA labels
- [ ] Color-blind friendly palette
- [ ] Screen reader support (where feasible)

#### 8.4 Documentation
- [ ] Component API documentation
- [ ] User guide
- [ ] Data format specification
- [ ] Deployment guide

**Deliverable**: Production-ready application

---

## Technical Architecture

### Component Hierarchy

```
App
├── Header
│   └── Navigation
├── FilterPanel
│   ├── GenusFilter
│   ├── YearRangeFilter
│   ├── TransectFilter
│   ├── FateFilter
│   └── SizeFilter
├── MainLayout
│   ├── TransectMap (Primary)
│   │   ├── TransectCanvas
│   │   ├── ColonyMarker (×N)
│   │   ├── MapControls
│   │   ├── MapLegend
│   │   └── TimeControl
│   └── AnalyticsPanel (Secondary)
│       ├── PopulationChart
│       ├── SizeHistogram
│       ├── TrajectoryChart
│       └── SurvivalCurve
├── Dashboard
│   └── StatsDashboard
└── ColonyDetailModal
```

### Data Flow

```
Raw Data (Excel/CSV)
    ↓
DataLoader (parse & validate)
    ↓
DataProcessor (transform & compute)
    ↓
Zustand Store (state management)
    ↓
React Components (UI rendering)
    ↓
D3.js (visualization)
```

### Key Utilities

| Utility | Purpose |
|---------|---------|
| `dataLoader.ts` | Load and parse Excel/CSV data |
| `dataProcessing.ts` | Transform, compute derived fields |
| `spatialAnalysis.ts` | Neighborhood, clustering algorithms |
| `survivalAnalysis.ts` | Kaplan-Meier curves, hazard ratios |
| `export.ts` | PNG/SVG/CSV export functions |
| `colorScales.ts` | Color mapping functions |
| `formatters.ts` | Number/date formatting |

---

## Testing Strategy

### Unit Tests
- Data processing functions
- Derived metric calculations
- Filter logic
- Export utilities

### Integration Tests
- Data loading pipeline
- Store state updates
- Component interactions

### Visual Regression Tests (Optional)
- Screenshot comparison for charts
- Ensure consistent rendering

### Performance Tests
- Animation frame rate
- Filter response time
- Large dataset handling (400+ colonies)

---

## Deployment

### Hosting Options
1. **GitHub Pages**: Simple, free, auto-deploy from main branch
2. **Vercel**: Zero-config, preview deployments, fast CDN
3. **Netlify**: Similar to Vercel, good CI/CD integration

### Deployment Checklist
- [ ] Build production bundle
- [ ] Optimize assets
- [ ] Configure environment variables (if any)
- [ ] Set up custom domain (optional)
- [ ] Enable HTTPS
- [ ] Configure caching headers
- [ ] Set up analytics (optional)

---

## Success Criteria

### MVP (Phase 1-3)
- [ ] 2D transect map with temporal animation
- [ ] Colony markers with full encoding
- [ ] Genus and year filtering
- [ ] Colony detail popups
- [ ] Smooth 60fps animation

### Full Feature Set (Phase 4-7)
- [ ] All 1D time series views
- [ ] Survival and size-fate analytics
- [ ] Cohort tracking
- [ ] Spatial analysis tools
- [ ] Export functionality
- [ ] Summary dashboard

### Production Quality (Phase 8)
- [ ] <2s initial load time
- [ ] <100ms filter response
- [ ] Responsive on tablet+
- [ ] Accessible keyboard navigation
- [ ] Complete documentation

---

## Risk Mitigation

### Technical Risks
| Risk | Mitigation |
|------|------------|
| Poor performance with 400+ colonies | Use canvas rendering fallback, virtualization |
| Complex fission/fusion visualization | Defer to Phase 7, start with simple linking |
| Excel parsing issues | Use well-tested library (SheetJS/xlsx) |
| Browser compatibility | Test on Chrome, Firefox, Safari; use polyfills |

### Scope Risks
| Risk | Mitigation |
|------|------------|
| Feature creep | Stick to phased plan, prioritize MVP |
| Data quality issues | Implement robust validation and error handling |
| Unclear requirements | Regular check-ins with stakeholders |

---

## Timeline Summary

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| 1: Foundation | 2 weeks | Data pipeline + type system |
| 2: 2D Map | 2 weeks | Interactive transect map |
| 3: Filtering | 1 week | Complete filter system |
| 4: Time Series | 2 weeks | Population & size charts |
| 5: Analytics | 2 weeks | Survival & cohort tracking |
| 6: Spatial | 1 week | Density & neighborhood tools |
| 7: Dashboard | 1 week | Stats & export features |
| 8: Polish | 1 week | Optimization & documentation |
| **Total** | **12 weeks** | **Production-ready app** |

---

## Next Steps

1. **Review this plan** with stakeholders
2. **Set up development environment** (Phase 1.1)
3. **Load sample data** to validate format (Phase 1.3)
4. **Build type system** as foundation (Phase 1.2)
5. **Start Phase 2** once foundation is solid

---

## Appendix: Key Dependencies

### Core Libraries
- **React 18**: UI framework
- **TypeScript 5**: Type safety
- **Vite 5**: Build tool
- **D3.js v7**: Data visualization
- **Zustand 4**: State management
- **Tailwind CSS 3**: Styling

### D3 Modules (Specific)
- `d3-scale`: Color and size scales
- `d3-axis`: Chart axes
- `d3-shape`: Line generators, areas
- `d3-selection`: DOM manipulation
- `d3-zoom`: Zoom/pan behavior
- `d3-transition`: Smooth animations
- `d3-array`: Statistical functions
- `d3-hierarchy`: Optional for clustering

### Utility Libraries
- `clsx`: Conditional class names
- `date-fns`: Date formatting (optional)
- `xlsx` or `papaparse`: Data parsing

---

**Document Version**: 1.0  
**Last Updated**: 2026-01-12  
**Author**: Claude AI  
**Status**: Ready for Implementation
