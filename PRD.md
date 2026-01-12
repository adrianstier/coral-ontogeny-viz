# Product Requirements Document: Coral Ontogeny Visualization System

## Overview

An interactive visualization platform for exploring coral demographic data from Mo'orea LTER back reef transects. The system tracks individual coral colonies of four genera (Pocillopora, Acropora, Porites, Millepora) through time, visualizing recruitment, growth, shrinkage, fission, fusion, and mortality events.

## Data Structure

### Source Data
- **Transects**: 1m × 5m permanent plots (T01, T02)
- **Temporal span**: 2013-2023 (11 years)
- **Sample size**: 387 individual coral records
- **Genera**: Pocillopora (80), Porites (286), Acropora (19), Millepora (2)

### Core Measurements
| Field | Description | Range |
|-------|-------------|-------|
| X | Position across transect width | 0-5m |
| Y | Position along transect length | 0-100cm |
| Diam1 | Largest diameter (cm) | 0.1-70 |
| Diam2 | Perpendicular diameter (cm) | 0.1-70 |
| Height | Colony height (cm) | 0.1-70 |

### Demographic Events (Fates)
- **Recruitment**: New colony detected
- **Growth**: Size increase (t to t+1)
- **Shrinkage**: Size decrease
- **Death**: Colony mortality
- **Fission**: Colony splits (tracked with FissionN suffix)
- **Fusion**: Colonies merge (tracked with FusionN suffix)
- **Missing Data**: Not measured that year

## Visualization Requirements

### 1. 1D Time Series Views

#### 1.1 Population Dynamics Panel
- **Abundance over time**: Line plot of colony counts by genus
- **Filters**: Toggle genera on/off, aggregate or separate by transect
- **Derived metrics**:
  - Net recruitment rate: (recruits - deaths) / N per year
  - Turnover rate: (recruits + deaths) / (2 × N)

#### 1.2 Size Distribution Panel
- **Size histogram**: Distribution of colony sizes (geometric mean of diameters × height)
- **Animation**: Scrubber to animate through years
- **Overlays**: Show size distribution shifts, recruitment cohort tracking
- **Filters**: By genus, by transect

#### 1.3 Growth/Mortality Curves
- **Survival curves**: Kaplan-Meier style curves by genus
- **Size-fate relationships**: Probability of growth/shrinkage/death as function of size
- **Interactive**: Hover for cohort details, click to highlight individuals in 2D view

#### 1.4 Individual Colony Trajectories
- **Size vs time**: Line plots for selected individuals
- **Selection**: Click on 2D map or filter by fate history
- **Annotations**: Mark fate events (recruitment, fission, fusion, death)

### 2. 2D Spatial Views

#### 2.1 Transect Map
- **Layout**: 1m × 5m transect oriented vertically (Y = 0-100cm along length, X = 0-5m across)
- **Colony symbols**:
  - Shape encodes genus (circle=Poc, square=Por, triangle=Acr, diamond=Mil)
  - Size encodes colony size (scaled diameter)
  - Color encodes fate/status:
    - Green: Growth
    - Yellow: Recruitment
    - Orange: Shrinkage
    - Red: Death
    - Gray: Alive, stable
    - Purple: Fission/Fusion events
- **Time control**: Year slider with play/pause animation

#### 2.2 Colony Detail Popup
- Click any colony to show:
  - Complete measurement history table
  - Mini growth trajectory plot
  - Fate timeline with event markers
  - Link to related colonies (fission/fusion siblings)

#### 2.3 Spatial Pattern Analysis
- Heatmap overlay option: Density of colonies
- Neighborhood analysis: Highlight colonies within radius of selected
- Mortality hotspots: Aggregate death locations across years

### 3. Interactive Features

#### 3.1 Global Filters
- **Genus selector**: Multi-select with color-coded chips
- **Year range**: Dual-handle slider for temporal subsetting
- **Transect selector**: T01, T02, or both
- **Fate filter**: Include/exclude specific fate types
- **Size filter**: Min/max size thresholds

#### 3.2 Linked Brushing
- Selection in any view highlights same individuals in all other views
- Example: Select small corals in size distribution → highlights their positions in 2D map → shows their trajectories in time series

#### 3.3 Cohort Tracking
- Tag corals by recruitment year
- Follow specific cohort through time
- Compare cohort-specific survival and growth rates

### 4. Derived Metrics Dashboard

#### 4.1 Summary Statistics Card
- Current year colony count by genus
- Year-over-year changes
- Mean size ± SD by genus
- Recruitment/mortality rates

#### 4.2 Comparative Metrics
- Genus comparison: Side-by-side bar charts
- Temporal comparison: Selected year vs baseline
- Transect comparison: T01 vs T02 demographics

## Technical Requirements

### Performance
- Smooth animation at 60fps for up to 400 colonies
- Sub-100ms filter response time
- Lazy loading for historical data if needed

### Responsiveness
- Desktop-first design (1200px minimum width)
- Tablet support (768px+) with simplified views
- Touch-friendly controls for year slider and map interaction

### Data Pipeline
- Load Excel data, parse wide-format to long-format internally
- Compute derived fields:
  - `volume_proxy = (diam1 * diam2 * height) / 6` (rough ellipsoid)
  - `geometric_mean_diam = sqrt(diam1 * diam2)`
  - `growth_rate = log(size_t1 / size_t0)`
- Handle missing data codes: 'Na', 'UK', 'D'

### Export Features
- PNG/SVG export of current view
- CSV export of filtered data
- Summary statistics report

## User Stories

1. **As a coral ecologist**, I want to see how Porites colony sizes change over time so I can understand growth dynamics post-disturbance.

2. **As a restoration practitioner**, I want to identify which size classes have highest survival so I can optimize outplanting strategies.

3. **As a graduate student**, I want to track specific colonies that underwent fission to understand clonal dynamics.

4. **As a lab PI**, I want to compare recruitment rates between transects to assess spatial heterogeneity.

5. **As a collaborator**, I want to export a subset of the data filtered by my criteria for further analysis.

## Priority Features (MVP)

### Phase 1 (Core)
- [ ] 2D transect map with year animation
- [ ] Genus filter toggle
- [ ] Size distribution histogram with year scrubber
- [ ] Basic colony click-to-detail

### Phase 2 (Analytics)
- [ ] Population dynamics time series
- [ ] Survival curves
- [ ] Linked brushing between views
- [ ] Cohort tracking

### Phase 3 (Advanced)
- [ ] Fission/fusion relationship visualization
- [ ] Spatial clustering analysis
- [ ] Export functionality
- [ ] Multi-transect comparison views
