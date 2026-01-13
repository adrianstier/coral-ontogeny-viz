# Coral Ontogeny Visualization - Integration Guide

## Overview

This document explains how the R statistical analysis pipeline integrates with the React/D3.js web visualization dashboard.

**Last Updated**: 2026-01-12

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                     RAW DATA (Excel)                                │
│                  data/raw/*.xlsx                                    │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│                R DATA PROCESSING PIPELINE                           │
│                                                                     │
│  01_validate_data.R    → Quality checks & reports                  │
│  02_transform_data.R   → Wide-to-long transformation               │
│  03_export_for_webapp.R → JSON exports for React                   │
│  04_generate_figures.R  → Publication figures                      │
│  05_generate_report.R   → R Markdown reports                       │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
              ┌───────────────┴───────────────┐
              ↓                               ↓
┌──────────────────────────┐    ┌──────────────────────────┐
│   PROCESSED DATA         │    │   WEB APP DATA           │
│   data/processed/        │    │   public/data/           │
│                          │    │                          │
│   • coral_long_format    │    │   • summary_statistics   │
│   • coral_enriched       │    │   • spatial_YYYY         │
│   • summary_stats        │    │   • timeseries           │
└──────────────────────────┘    │   • demographic_events   │
                                │   • size_frequency       │
                                │   • color_schemes        │
                                │   • manifest.json        │
                                └──────────────────────────┘
                                              ↓
                              ┌───────────────────────────┐
                              │   REACT WEB APPLICATION   │
                              │   src/                    │
                              │                           │
                              │   • DataLoader utility    │
                              │   • TransectMap (D3.js)   │
                              │   • FilterPanel           │
                              │   • YearSlider            │
                              │   • Zustand store         │
                              └───────────────────────────┘
```

---

## Data Flow

### 1. R Processing → JSON Export

**Script**: `scripts/R/03_export_for_webapp.R`

Exports optimized JSON files for web consumption:

```r
# Generate spatial data for each year
for (year in 2013:2024) {
  spatial_year <- coral_long %>%
    filter(year == !!year, !is.na(status), status != "D") %>%
    select(coral_id, transect, genus, x, y, diameter = geom_mean_diam, alive = is_alive)

  write_json(spatial_year, here(glue("public/data/spatial_{year}.json")))
}

# Generate summary statistics
summary <- list(
  dataset = list(
    name = "MCR LTER Back Reef Transects",
    years = list(min = 2013, max = 2024),
    n_colonies = n_distinct(coral_long$coral_id),
    n_observations = nrow(coral_long)
  ),
  population = population_by_year,
  genera = genus_summary
)

write_json(summary, here("public/data/summary_statistics.json"))
```

**Output Files** (`public/data/`):
- `summary_statistics.json` - Dataset overview and aggregates
- `spatial_2013.json` through `spatial_2024.json` - Colony positions per year
- `demographic_events.json` - Recruitment and mortality events
- `size_frequency.json` - Size distribution data
- `color_schemes.json` - Genus and fate color mappings (from R)
- `manifest.json` - File index and metadata

### 2. React Data Loading

**Utility**: `src/utils/DataLoader.ts`

TypeScript class for loading R-generated JSON files:

```typescript
class DataLoaderClass {
  private basePath = '/data';

  async loadSummary(): Promise<SummaryData> {
    const response = await fetch(`${this.basePath}/summary_statistics.json`);
    return response.json();
  }

  async loadSpatial(year: number): Promise<SpatialColony[]> {
    const response = await fetch(`${this.basePath}/spatial_${year}.json`);
    return response.json();
  }

  // Additional loading methods...
}

export const DataLoader = new DataLoaderClass();
```

**Hook**: `src/hooks/useCoralDataJSON.ts`

Loads JSON data and transforms it into the application's data model:

```typescript
export function useCoralDataJSON() {
  const { setCorals, setLoading, setError } = useStore();

  useEffect(() => {
    async function loadData() {
      // Load summary
      const summary = await DataLoader.loadSummary();

      // Load spatial data for all years in parallel
      const spatialDataByYear = await Promise.all(
        years.map(year => DataLoader.loadSpatial(year))
      );

      // Transform to Coral objects
      // Group by coral_id, create observations array
      const corals = transformToCoralObjects(spatialDataByYear);

      setCorals(corals);
    }

    loadData();
  }, []);
}
```

### 3. State Management

**Store**: `src/store/useStore.ts`

Zustand store manages application state:

```typescript
interface AppState {
  // Data
  corals: Coral[];
  isLoading: boolean;
  error: string | null;

  // Filters
  filters: {
    selectedGenera: Genus[];
    selectedTransects: Transect[];
    yearRange: [number, number];
    currentYear: number;
    minSize: number;
    maxSize: number;
  };

  // UI
  ui: {
    selectedCoralIds: number[];
    hoveredCoralId: number | null;
    playAnimation: boolean;
    animationSpeed: number;
  };

  // Actions
  updateFilters: (filters: Partial<FilterState>) => void;
  setCurrentYear: (year: number) => void;
  toggleGenus: (genus: Genus) => void;
  selectCorals: (ids: number[]) => void;
  // ...
}
```

### 4. Visualization Components

**TransectMap**: `src/components/TransectMap.tsx`

D3.js-powered spatial visualization:

```typescript
const TransectMap: React.FC = () => {
  const { corals, filters, selectCorals } = useStore();
  const { currentYear, selectedGenera, selectedTransects } = filters;

  // Filter corals for current year
  const filteredCorals = corals
    .map(coral => {
      const obs = coral.observations.find(o => o.year === currentYear);
      return obs ? { ...coral, currentObs: obs } : null;
    })
    .filter(coral =>
      coral &&
      coral.currentObs.is_alive &&
      selectedGenera.includes(coral.genus) &&
      selectedTransects.includes(coral.transect)
    );

  // D3 rendering
  useEffect(() => {
    const svg = d3.select(svgRef.current);

    // Create scales
    const xScale = d3.scaleLinear()
      .domain([0, transectLength * 2 + 0.5])
      .range([0, width]);

    const sizeScale = d3.scaleSqrt()
      .domain([0, d3.max(filteredCorals, d => d.currentObs.diameter)])
      .range([3, 25]);

    // Draw colonies
    svg.selectAll('.colony')
      .data(filteredCorals)
      .join('circle')
      .attr('cx', d => xScale(d.y))
      .attr('cy', d => yScale(d.x))
      .attr('r', d => sizeScale(d.currentObs.diameter))
      .attr('fill', d => GENUS_COLORS[d.genus])
      .on('click', (event, d) => selectCorals([d.id]));
  }, [filteredCorals]);

  return <svg ref={svgRef} />;
};
```

---

## Color Scheme Consistency

Colors are defined in R and exported to JavaScript:

**R** (`scripts/R/utils.R`):
```r
genus_colors <- function() {
  c(
    "Pocillopora" = "#E41A1C",
    "Porites" = "#377EB8",
    "Acropora" = "#4DAF4A",
    "Millepora" = "#984EA3"
  )
}
```

**TypeScript** (`src/utils/colors.ts`):
```typescript
export const GENUS_COLORS: Record<Genus, string> = {
  Poc: '#E64B35',  // Pocillopora
  Por: '#4DBBD5',  // Porites
  Acr: '#00A087',  // Acropora
  Mil: '#8B4513',  // Millepora
};
```

**Note**: Colors are intentionally different between R (publication figures) and React (interactive viz) for medium differentiation, but maintain genus associations.

---

## Workflow

### Initial Setup

```bash
# 1. Install R dependencies
R -e "renv::restore()"

# 2. Install Node.js dependencies
npm install

# 3. Install missing dependency (framer-motion)
npm install framer-motion
```

### Development Workflow

#### Option A: Work with R-generated JSON (Recommended)

```bash
# 1. Generate web app data from R
Rscript scripts/R/03_export_for_webapp.R

# 2. Start development server
npm run dev

# 3. Open browser to http://localhost:5173
```

#### Option B: Full R pipeline + Web dev

```bash
# 1. Run complete R analysis
Rscript scripts/R/run_complete_pipeline.R

# This generates:
#   - data/processed/*.csv (tidy datasets)
#   - outputs/figures/*.png (publication figures)
#   - outputs/reports/*.html (R analysis reports)
#   - public/data/*.json (web app data)

# 2. Start web app
npm run dev
```

### Data Update Workflow

When new coral monitoring data arrives:

```bash
# 1. Replace Excel file in data/raw/
cp new_data.xlsx data/raw/

# 2. Update metadata
nano data/raw/metadata.json

# 3. Validate data quality
Rscript scripts/R/01_validate_data.R
open outputs/reports/data_quality_report.html

# 4. If validation passes, run full pipeline
Rscript scripts/R/run_complete_pipeline.R

# 5. Web app automatically picks up new JSON files
npm run dev
```

---

## File Locations

### R Outputs

```
outputs/
├── figures/              # Publication figures (PNG, PDF)
│   ├── figure_1_population_dynamics_overview.png
│   ├── figure_2_growth_rates.png
│   ├── figure_3_size_distributions.png
│   ├── figure_4_survival_curves.png
│   └── figure_5_spatial_distribution.png
│
└── reports/              # Analysis reports (HTML)
    ├── index.html                      # Report index
    ├── executive_summary.html
    └── data_quality_report.html

notebooks/                # Rendered R Markdown
├── 01_data_exploration.html
├── 02_demographic_analysis.html
├── 03_survival_analysis.html
└── 04_spatial_analysis.html

data/processed/           # Tidy datasets
├── coral_long_format.csv        # Human-readable
└── coral_enriched.parquet       # Optimized binary
```

### Web App Data

```
public/data/              # JSON files for React app
├── manifest.json                 # File index
├── summary_statistics.json       # Dataset overview
├── timeseries.csv               # Population time series
├── spatial_2013.json            # Year-specific spatial data
├── spatial_2014.json
│   ... (one per year)
├── spatial_2024.json
├── demographic_events.json      # Recruitment/mortality
├── size_frequency.json          # Size distributions
└── color_schemes.json           # Visualization colors
```

---

## Component Hierarchy

```
App.tsx
├── Header
│   ├── Title & Subtitle
│   └── Metadata Badges (current year, live colonies)
│
├── Dashboard Grid
│   ├── TransectMap (Main visualization)
│   │   ├── D3.js SVG rendering
│   │   ├── Colony circles (size-coded, color by genus)
│   │   ├── Transect backgrounds
│   │   ├── Grid lines
│   │   ├── Axes
│   │   ├── Legend
│   │   └── Hover tooltip
│   │
│   └── Sidebar
│       ├── FilterPanel
│       │   ├── Genus toggles
│       │   ├── Transect selection
│       │   ├── Year range sliders
│       │   └── Size range inputs
│       │
│       └── Stats Card (placeholder)
│
└── Timeline Footer
    └── YearSlider
        ├── Year slider control
        └── Play/pause animation
```

---

## Data Types

### R Data Model

```r
# Long-format coral data
coral_long_format <- data.frame(
  coral_id = character,      # Unique colony ID
  transect = character,      # T01 or T02
  genus = character,         # Pocillopora, Porites, Acropora, Millepora
  x = numeric,               # Across-transect position (0-1m)
  y = numeric,               # Along-transect position (0-5m)
  year = integer,            # Survey year (2013-2024)
  diam1 = numeric,           # First diameter (cm)
  diam2 = numeric,           # Second diameter (cm)
  geom_mean_diam = numeric,  # sqrt(diam1 * diam2)
  volume_proxy = numeric,    # Ellipsoid volume
  growth_rate = numeric,     # Log-transformed growth
  status = character,        # alive/dead/missing
  is_alive = logical,
  is_recruit = logical
)
```

### TypeScript Data Model

```typescript
interface CoralObservation {
  coral_id: number;
  transect: 'T01' | 'T02';
  genus: 'Poc' | 'Por' | 'Acr' | 'Mil';
  x: number;              // 0-1 meters
  y: number;              // 0-5 meters
  year: number;           // 2013-2024
  diam1: number | null;
  diam2: number | null;
  geometric_mean_diam?: number;
  volume_proxy?: number;
  growth_rate?: number;
  is_alive: boolean;
  is_recruit: boolean;
}

interface Coral {
  id: number;
  transect: 'T01' | 'T02';
  genus: 'Poc' | 'Por' | 'Acr' | 'Mil';
  x: number;
  y: number;
  observations: CoralObservation[];  // Time series
  recruitment_year: number | null;
  death_year: number | null;
  max_size: number;
  lifespan: number;
}
```

---

## Key Features

### Implemented ✓

1. **R Statistical Pipeline**
   - Automated data validation with HTML reports
   - Wide-to-long transformation with enrichment
   - Publication-quality figure generation
   - R Markdown analysis notebooks
   - JSON export for web app

2. **React Visualization Dashboard**
   - Scientific editorial aesthetic (oceanic theme)
   - D3.js spatial visualization (2D transect maps)
   - Interactive filtering (genus, transect, year, size)
   - Year-by-year data display
   - Zustand state management
   - DataLoader utility for R-generated JSON

3. **Design System**
   - Custom typography (Crimson Pro serif + Space Mono mono)
   - Oceanic color palette (deep blues, coral accents, bioluminescent highlights)
   - Animated backgrounds and micro-interactions
   - Responsive grid layout
   - Accessible hover states and tooltips

### Pending (from original spec)

4. **Additional Visualizations**
   - Time series charts (population dynamics)
   - Survival curve visualization (Kaplan-Meier)
   - Size distribution histograms
   - Year-by-year animation with play/pause controls

5. **Interactivity**
   - Colony detail popups (full history)
   - Data export functionality
   - Multi-colony selection

---

## Troubleshooting

### Data Not Loading

**Issue**: "Error loading JSON data"

**Solutions**:
1. Check that R export script has been run:
   ```bash
   Rscript scripts/R/03_export_for_webapp.R
   ```

2. Verify JSON files exist in `public/data/`:
   ```bash
   ls -la public/data/
   ```

3. Check browser console for specific fetch errors

### Missing Dependencies

**Issue**: "Cannot find module 'framer-motion'"

**Solution**:
```bash
npm install framer-motion
```

### Type Errors

**Issue**: TypeScript compilation errors

**Solutions**:
1. Check type definitions match between:
   - `src/types/coral.ts`
   - R JSON exports
   - Component props

2. Run type check:
   ```bash
   npm run type-check
   ```

### Styling Issues

**Issue**: CSS not applying or conflicts

**Solutions**:
1. Ensure CSS variables are defined in `src/App.css`
2. Check CSS import order in components
3. Verify Tailwind/custom CSS precedence

---

## Performance Considerations

### R Processing

- **Large datasets** (>100K observations): Use Parquet format
- **Memory constraints**: Process by year chunks
- **Parallel processing**: Enable with `future` package

### Web App

- **Initial load**: Lazy load spatial data by year
- **Rendering**: D3 transitions can be disabled for large datasets (>10K colonies)
- **State updates**: Debounce filter changes to reduce re-renders

### Optimizations Applied

1. **JSON splitting**: Spatial data separated by year (11 small files vs 1 large file)
2. **Data transformation**: Minimize client-side processing, pre-compute in R
3. **Parallel loading**: Fetch multiple year files concurrently
4. **SVG optimization**: Use D3 enter/update/exit pattern for efficient DOM updates

---

## Next Steps

### For Researchers

1. Review R analysis outputs in `outputs/reports/index.html`
2. Modify R Markdown notebooks for custom analyses
3. Generate updated figures with `scripts/R/04_generate_figures.R`

### For Developers

1. Complete pending visualization components (time series, survival curves, histograms)
2. Add animation controls (play/pause, speed)
3. Implement colony detail modal
4. Add data export functionality
5. Optimize for mobile/tablet viewing

### For Both

- Keep R analysis and web visualizations in sync
- Document new derived metrics in DATA_DICTIONARY.md
- Test with updated monitoring data
- Share findings through interactive dashboard + publication figures

---

## Resources

- **R Documentation**: [scripts/R/README.md](scripts/R/README.md)
- **Data Dictionary**: [DATA_DICTIONARY.md](DATA_DICTIONARY.md)
- **Getting Started**: [GETTING_STARTED.md](GETTING_STARTED.md)
- **Implementation Details**: [CLAUDE.md](CLAUDE.md)
- **Repository Summary**: [REPO_ORGANIZATION_SUMMARY.md](REPO_ORGANIZATION_SUMMARY.md)

---

**Integration Status**: ✅ R Pipeline → JSON Export → React Visualization (Complete)

**Last Tested**: 2026-01-12

**Maintained By**: Data Science Team
