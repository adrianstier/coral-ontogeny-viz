# Coral Ontogeny Visualization System

**Visualizing Hunter Lenihan's Time Series Work in 1D and 2D**

An interactive web platform for exploring coral demographic data from Mo'orea LTER back reef transects. This system visualizes **Hunter Lenihan's long-term time series work** through both **1D temporal visualizations** (population dynamics, survival curves, growth rates) and **2D spatial-temporal visualizations** (colony positions and fates over time). Track individual coral colonies of four genera (Pocillopora, Acropora, Porites, Millepora) from 2013-2024, exploring recruitment, growth, shrinkage, fission, fusion, and mortality events.

## Overview

This visualization platform brings Hunter Lenihan's coral demographic time series research to life through interactive web visualizations:

### **Core Purpose**
- **Visualize Time Series Data**: Transform 11 years of coral monitoring into interactive 1D and 2D visualizations
- **Spatial-Temporal Analysis**: Show how coral populations change across space and time
- **Demographic Patterns**: Reveal recruitment pulses, mortality events, and growth trajectories
- **Research Communication**: Make complex time series data accessible and engaging

### **1D Visualizations** (Time Series)
- **Population Dynamics**: Colony counts over time by genus and transect
- **Size Distributions**: Temporal changes in colony size-frequency distributions
- **Survival Curves**: Kaplan-Meier survival analysis by genus
- **Growth Trajectories**: Individual and cohort growth rates through time
- **Recruitment & Mortality**: Temporal patterns of demographic events

### **2D Visualizations** (Spatial-Temporal)
- **Interactive Transect Maps**: Colony positions, sizes, and fates animated through time
- **Spatial Patterns**: Clustering, spacing, and neighborhood effects
- **Temporal Animation**: Year-by-year playback of demographic changes
- **Multi-Scale Views**: Zoom from individual colonies to transect-wide patterns

## Features

### Current Capabilities
- Interactive 2D transect map with temporal animation
- Colony size and fate visualization
- Genus-based filtering and color coding
- Year-by-year timeline scrubbing
- Colony detail popups with complete history
- Responsive design for desktop and tablet

### Planned Enhancements
- Population dynamics time series
- Size distribution histograms
- Survival curve analysis
- Cohort tracking
- Fission/fusion relationship visualization
- Spatial clustering analysis
- Data export functionality

## Technology Stack

### **Statistical Analysis (R)**
- **Language**: R 4.4+
- **Core Packages**: tidyverse, survival, survminer, ggplot2
- **Notebooks**: R Markdown (knitr, rmarkdown)
- **Package Management**: renv
- **Testing**: testthat

### **Web Visualization (TypeScript/React)**
- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite 5
- **Visualization**: D3.js v7
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Data Processing**: TypeScript utilities

## Getting Started

### Prerequisites

**For R Analysis**:
- R 4.4+
- RStudio (recommended) or R command line

**For Web Application**:
- Node.js 18+ and npm 9+
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

#### R Analysis Environment

```bash
# Clone the repository
git clone https://github.com/adrianstier/coral-ontogeny-viz.git
cd coral-ontogeny-viz

# Install R packages
R -e "install.packages('renv')"
R -e "renv::restore()"
```

#### Web Application

```bash
# Install Node.js dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

### Building for Production

```bash
# Create optimized production build
npm run build

# Preview production build locally
npm run preview
```

## Project Structure

```
coral-ontogeny-viz/
├── data/                       # DATA LAYER
│   ├── raw/                    # Original Excel files (read-only)
│   ├── processed/              # R-generated CSV/Parquet files
│   └── external/               # Reference data
│
├── scripts/R/                  # R ANALYSIS SCRIPTS
│   ├── utils.R                 # Shared utility functions
│   ├── 01_validate_data.R      # Data quality checks
│   └── 02_transform_data.R     # Wide-to-long transformation
│
├── notebooks/                  # R MARKDOWN NOTEBOOKS
│   ├── 01_data_exploration.Rmd
│   ├── 02_demographic_analysis.Rmd
│   ├── 03_survival_analysis.Rmd
│   └── README.md
│
├── outputs/                    # GENERATED OUTPUTS
│   ├── figures/                # Publication-quality plots
│   ├── reports/                # HTML/PDF reports
│   └── exports/                # User data exports
│
├── src/                        # WEB APPLICATION
│   ├── components/             # React components
│   ├── hooks/                  # Custom React hooks
│   ├── store/                  # Zustand state management
│   ├── types/                  # TypeScript type definitions
│   ├── utils/                  # Data processing utilities
│   └── App.tsx                 # Main application
│
├── tests/                      # TESTING
│   └── unit/                   # R unit tests (testthat)
│
├── docs/                       # DOCUMENTATION
│   ├── PRD.md                  # Product requirements
│   ├── CLAUDE.md               # Implementation guide
│   └── IMPLEMENTATION_PLAN.md  # Development roadmap
│
├── renv.lock                   # R package versions
└── package.json                # Node.js dependencies
```

## Data Structure

### Source Data
- **Transects**: 1m × 5m permanent plots (T01, T02)
- **Temporal Span**: 2013-2023 (11 years)
- **Sample Size**: 387 individual coral records
- **Genera**: Pocillopora (80), Porites (286), Acropora (19), Millepora (2)

### Core Measurements
- **X**: Position across transect width (0-5m)
- **Y**: Position along transect length (0-100cm)
- **Diam1**: Largest diameter (cm)
- **Diam2**: Perpendicular diameter (cm)
- **Height**: Colony height (cm)

### Demographic Events
- Recruitment (new colony)
- Growth (size increase)
- Shrinkage (size decrease)
- Death (mortality)
- Fission (colony split)
- Fusion (colony merge)

## Development

### R Analysis Workflow

```bash
# 1. Validate raw data quality
Rscript scripts/R/01_validate_data.R

# 2. Transform to tidy format
Rscript scripts/R/02_transform_data.R

# 3. Run exploratory analysis
Rscript -e "rmarkdown::render('notebooks/01_data_exploration.Rmd')"

# 4. Run demographic analysis
Rscript -e "rmarkdown::render('notebooks/02_demographic_analysis.Rmd')"

# 5. Run survival analysis
Rscript -e "rmarkdown::render('notebooks/03_survival_analysis.Rmd')"

# Run unit tests
Rscript -e "testthat::test_file('tests/unit/test_utils.R')"
```

### Web Application Scripts

```bash
npm run dev          # Start development server with HMR
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler check
```

### Complete Analysis Pipeline

```bash
# Full reproducible workflow
Rscript scripts/R/01_validate_data.R && \
Rscript scripts/R/02_transform_data.R && \
Rscript -e "purrr::walk(list.files('notebooks', pattern='*.Rmd', full.names=TRUE), rmarkdown::render)"
```

## Documentation

- **[PROJECT_STATUS.md](./PROJECT_STATUS.md)**: Current project status, task backlog, and execution tracking (START HERE)
- **[PRD.md](./PRD.md)**: Complete product requirements document
- **[CLAUDE.md](./CLAUDE.md)**: Implementation guide for AI-assisted development
- **[IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md)**: Phased development roadmap

## Contributing

This is a research project. For contributions or questions, please contact the project maintainers.

## Data Source

Data collected from Mo'orea LTER back reef transects by the Stier Lab. For data access or collaboration inquiries, please contact Adrian Stier.

## License

Copyright 2026. All rights reserved.

## Acknowledgments

- **Hunter Lenihan** for the long-term coral demographic time series data
- Mo'orea LTER for back reef monitoring infrastructure
- Stier Lab for data collection, curation, and research support
- Claude AI for development assistance

## Contact

Adrian Stier - [GitHub](https://github.com/adrianstier)

Project Link: [https://github.com/adrianstier/coral-ontogeny-viz](https://github.com/adrianstier/coral-ontogeny-viz)
