# Coral Ontogeny Visualization System

An interactive visualization platform for exploring coral demographic data from Mo'orea LTER back reef transects. This system tracks individual coral colonies of four genera (Pocillopora, Acropora, Porites, Millepora) through time, visualizing recruitment, growth, shrinkage, fission, fusion, and mortality events from 2013-2023.

## Overview

The Coral Ontogeny Visualization System provides researchers with powerful tools to analyze and understand coral population dynamics through:

- **2D Spatial Visualization**: Interactive transect maps showing colony positions, sizes, and fates over time
- **Time Series Analysis**: Population dynamics, size distributions, and growth trajectories
- **Demographic Analytics**: Survival curves, recruitment rates, and mortality patterns
- **Interactive Filtering**: Multi-dimensional data exploration with linked brushing across views

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

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite 5
- **Visualization**: D3.js v7
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Data Processing**: Built-in TypeScript utilities

## Getting Started

### Prerequisites

- Node.js 18+ and npm 9+
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

```bash
# Clone the repository
git clone https://github.com/adrianstier/coral-ontogeny-viz.git
cd coral-ontogeny-viz

# Install dependencies
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
├── src/
│   ├── components/        # React components
│   │   ├── TransectMap/   # 2D spatial visualization
│   │   ├── TimeSeries/    # Time-based charts
│   │   ├── Filters/       # Control panels
│   │   └── shared/        # Reusable UI components
│   ├── hooks/             # Custom React hooks
│   ├── store/             # Zustand state management
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Data processing utilities
│   ├── data/              # Sample data and loaders
│   ├── App.tsx            # Main application component
│   ├── main.tsx           # Application entry point
│   └── index.css          # Global styles
├── public/                # Static assets
├── docs/                  # Documentation
│   ├── PRD.md             # Product Requirements
│   ├── CLAUDE.md          # Implementation guide
│   └── IMPLEMENTATION_PLAN.md  # Development roadmap
└── package.json           # Dependencies and scripts
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

### Available Scripts

```bash
npm run dev          # Start development server with HMR
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler check
```

### Development Workflow

1. **Feature Development**: Create feature branches from `main`
2. **Testing**: Test locally with development server
3. **Type Safety**: Ensure TypeScript compilation passes
4. **Commit**: Use descriptive commit messages
5. **Pull Request**: Submit PR for review

## Documentation

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

- Mo'orea LTER for long-term monitoring data
- Stier Lab for data collection and curation
- Claude AI for development assistance

## Contact

Adrian Stier - [GitHub](https://github.com/adrianstier)

Project Link: [https://github.com/adrianstier/coral-ontogeny-viz](https://github.com/adrianstier/coral-ontogeny-viz)
