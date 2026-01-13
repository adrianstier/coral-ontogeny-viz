# Project Status & Execution Framework

> **Last Updated**: 2026-01-12 20:57 PST
> **Document Type**: Living Reference Document
> **Purpose**: Authoritative project status for all agents and contributors

---

## Recent Updates

### 2026-01-12: R Data Pipeline Fixed and Validated

**Completed:**
- Fixed `01_validate_data.R` to handle actual Excel format (no headers)
- Fixed `02_transform_data.R` to parse year blocks correctly
- Fixed `03_export_for_webapp.R` to generate webapp JSON files
- Generated all webapp data files in `public/data/`

**Key Findings:**
- Excel file has 387 colonies, 96 columns (8 metadata + 88 measurement columns = 11 years)
- Data format: no header row, cols 1-8 are metadata, cols 9+ are year blocks
- 4,257 observations in long format (387 colonies × 11 years)
- 785 valid measurements (many colonies have missing data codes like "Na", "UK", "D")

**Files Generated:**
- `public/data/coral_webapp.json` (653 KB) - comprehensive dataset for React app
- `public/data/spatial_YYYY.json` (11 files) - per-year spatial data
- `public/data/summary_statistics.json` - dataset overview
- `data/processed/coral_long_format.csv` (498 KB) - tidy long format

---

## Quick Reference

### Project Summary

| Attribute | Value |
|-----------|-------|
| **Project Name** | Coral Ontogeny Visualization System |
| **Type** | Hybrid R Statistical Analysis + React Web Application |
| **Data Source** | Mo'orea LTER back reef transects (2013-2024) |
| **Sample Size** | 387 coral colonies across 4 genera |
| **Current Phase** | MVP Development (Phases 1-3) |
| **Overall Progress** | ~40% complete |

### Key Documents

| Document | Purpose | Location |
|----------|---------|----------|
| [PRD.md](PRD.md) | Product requirements & user stories | Root |
| [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) | Technical implementation details | Root |
| [CLAUDE.md](CLAUDE.md) | AI development guidelines | Root |
| [DATA_DICTIONARY.md](DATA_DICTIONARY.md) | Data schema & field definitions | Root |
| **PROJECT_STATUS.md** | This document - execution tracking | Root |

---

## Current Implementation Status

### Phase Completion Matrix

| Phase | Name | Target | Completed | Status | Blocking Issues |
|-------|------|--------|-----------|--------|-----------------|
| 1 | Foundation & Infrastructure | 100% | 70% | 🟡 In Progress | Deployment pipeline |
| 2 | 2D Transect Visualization | 100% | 40% | 🟡 In Progress | Colony detail popup, controls |
| 3 | Filtering & Interaction | 100% | 50% | 🟡 In Progress | Linked selection |
| 4 | 1D Time Series Views | 100% | 0% | ⚪ Not Started | Depends on Phase 3 |
| 5 | Advanced Analytics | 100% | 20% | 🟠 R Only | Web components pending |
| 6 | Spatial Analytics | 100% | 10% | 🟠 R Only | Web components pending |
| 7 | Dashboard & Export | 100% | 0% | ⚪ Not Started | Depends on Phase 4-6 |
| 8 | Polish & Optimization | 100% | 10% | ⚪ Not Started | Depends on all above |

### Component Status

#### R Statistical Pipeline

| Component | File | Status | Notes |
|-----------|------|--------|-------|
| Utility Functions | `scripts/R/utils.R` | ✅ Complete | Shared helpers |
| Data Validation | `scripts/R/01_validate_data.R` | ✅ Complete | Quality checks |
| Data Transform | `scripts/R/02_transform_data.R` | ✅ Complete | Wide-to-long |
| Web Export | `scripts/R/03_export_for_webapp.R` | ✅ Complete | JSON generation |
| Figure Generation | `scripts/R/04_generate_figures.R` | ✅ Complete | Publication plots |
| Report Generation | `scripts/R/05_generate_report.R` | ✅ Complete | HTML reports |
| Full Pipeline | `scripts/R/run_complete_pipeline.R` | ✅ Complete | Orchestration |

#### R Notebooks

| Notebook | File | Status | Notes |
|----------|------|--------|-------|
| Data Exploration | `notebooks/01_data_exploration.Rmd` | ✅ Complete | EDA |
| Demographic Analysis | `notebooks/02_demographic_analysis.Rmd` | ✅ Complete | Population dynamics |
| Survival Analysis | `notebooks/03_survival_analysis.Rmd` | ✅ Complete | Kaplan-Meier, Cox |
| Spatial Analysis | `notebooks/04_spatial_analysis.Rmd` | ✅ Complete | Clustering, density |

#### React Web Application

| Component | File | Status | Notes |
|-----------|------|--------|-------|
| **Types** | | | |
| Coral Types | `src/types/coral.ts` | ✅ Complete | All type definitions |
| **Utilities** | | | |
| Data Transform | `src/utils/dataTransform.ts` | ✅ Complete | Excel parsing |
| Data Loader | `src/utils/DataLoader.ts` | ✅ Complete | JSON loading |
| Statistics | `src/utils/statistics.ts` | ✅ Complete | Summary stats |
| Colors | `src/utils/colors.ts` | ✅ Complete | Color scales |
| **Hooks** | | | |
| useCoralData | `src/hooks/useCoralData.ts` | ✅ Complete | Excel data hook |
| useCoralDataJSON | `src/hooks/useCoralDataJSON.ts` | ✅ Complete | JSON data hook |
| useAnimation | `src/hooks/useAnimation.ts` | ✅ Complete | Year animation |
| **Store** | | | |
| Zustand Store | `src/store/useStore.ts` | ✅ Complete | State management |
| **Components** | | | |
| App | `src/App.tsx` | 🔄 Partial | Main layout |
| TransectMap | `src/components/TransectMap.tsx` | 🔄 Partial | Needs controls, legend |
| FilterPanel | `src/components/FilterPanel.tsx` | ✅ Complete | Genus, transect filters |
| YearSlider | `src/components/YearSlider.tsx` | ✅ Complete | Year selection |
| MapControls | `src/components/MapControls.tsx` | ❌ Missing | Zoom/pan controls |
| MapLegend | `src/components/MapLegend.tsx` | ❌ Missing | Symbol key |
| ColonyDetail | `src/components/ColonyDetail.tsx` | ❌ Missing | Popup modal |
| PopulationChart | `src/components/PopulationChart.tsx` | ❌ Missing | Phase 4 |
| SizeHistogram | `src/components/SizeHistogram.tsx` | ❌ Missing | Phase 4 |
| TrajectoryChart | `src/components/TrajectoryChart.tsx` | ❌ Missing | Phase 4 |
| SurvivalCurve | `src/components/SurvivalCurve.tsx` | ❌ Missing | Phase 5 |

---

## Work Breakdown Structure

### WBS Hierarchy

```
CORAL-VIZ
├── WP1: Data Infrastructure ────────────────────── 85% Complete
│   ├── 1.1 R Data Pipeline ✅
│   │   ├── 1.1.1 Data validation ✅
│   │   ├── 1.1.2 Data transformation ✅
│   │   ├── 1.1.3 Web export ✅
│   │   └── 1.1.4 Pipeline orchestration ✅
│   ├── 1.2 TypeScript Data Layer ✅
│   │   ├── 1.2.1 Type definitions ✅
│   │   ├── 1.2.2 Data loaders ✅
│   │   └── 1.2.3 Statistics utilities ✅
│   └── 1.3 State Management ✅
│       └── 1.3.1 Zustand store ✅
│
├── WP2: Core Visualization (MVP) ───────────────── 45% Complete
│   ├── 2.1 Transect Map 🔄
│   │   ├── 2.1.1 Base SVG canvas ✅
│   │   ├── 2.1.2 Colony markers 🔄
│   │   ├── 2.1.3 Zoom/pan controls ❌
│   │   └── 2.1.4 Map legend ❌
│   ├── 2.2 Colony Representation 🔄
│   │   ├── 2.2.1 Genus shapes ✅
│   │   ├── 2.2.2 Size encoding ✅
│   │   ├── 2.2.3 Fate colors 🔄
│   │   └── 2.2.4 Hover tooltips ❌
│   ├── 2.3 Temporal Controls 🔄
│   │   ├── 2.3.1 Year slider ✅
│   │   ├── 2.3.2 Play/pause ❌
│   │   └── 2.3.3 Animation speed ❌
│   └── 2.4 Colony Details ❌
│       ├── 2.4.1 Detail popup ❌
│       ├── 2.4.2 History table ❌
│       └── 2.4.3 Mini trajectory ❌
│
├── WP3: Filtering & Interaction ────────────────── 50% Complete
│   ├── 3.1 Filter Panel ✅
│   │   ├── 3.1.1 Genus filter ✅
│   │   ├── 3.1.2 Transect filter ✅
│   │   ├── 3.1.3 Year range filter ✅
│   │   ├── 3.1.4 Fate filter ❌
│   │   └── 3.1.5 Size filter ❌
│   └── 3.2 Linked Interactions ❌
│       ├── 3.2.1 Selection state ❌
│       ├── 3.2.2 Cross-view highlight ❌
│       └── 3.2.3 Multi-select ❌
│
├── WP4: Time Series Views ──────────────────────── 0% Complete
│   ├── 4.1 Population Dynamics ❌
│   ├── 4.2 Size Distribution ❌
│   └── 4.3 Individual Trajectories ❌
│
├── WP5: Advanced Analytics ─────────────────────── 20% Complete (R only)
│   ├── 5.1 Survival Analysis (R ✅, Web ❌)
│   ├── 5.2 Size-Fate Relationships ❌
│   └── 5.3 Cohort Tracking ❌
│
├── WP6: Spatial Analytics ──────────────────────── 10% Complete (R only)
│   ├── 6.1 Density Heatmap ❌
│   ├── 6.2 Neighborhood Analysis ❌
│   └── 6.3 Mortality Hotspots ❌
│
├── WP7: Dashboard & Export ─────────────────────── 0% Complete
│   ├── 7.1 Summary Dashboard ❌
│   └── 7.2 Export Functionality ❌
│
└── WP8: Production Readiness ───────────────────── 10% Complete
    ├── 8.1 Performance Optimization ❌
    ├── 8.2 Responsive Design ❌
    ├── 8.3 Accessibility ❌
    └── 8.4 Documentation ✅

Legend: ✅ Complete | 🔄 In Progress | ❌ Not Started
```

---

## MVP Task Backlog

### Definition of MVP

The Minimum Viable Product includes:
- Interactive 2D transect map with temporal animation
- Colony markers with genus shapes and fate colors
- Genus and transect filtering
- Year slider with animation
- Basic colony tooltips
- Map legend

### MVP Task List

#### Priority 1: Critical Path (Must Complete)

| ID | Task | Status | Dependencies | Assigned |
|----|------|--------|--------------|----------|
| MVP-01 | Validate R pipeline runs end-to-end | ✅ Done | Raw data | Data Scientist |
| MVP-02 | Generate webapp JSON export | ✅ Done | MVP-01 | Data Scientist |
| MVP-03 | Verify JSON loads in React app | ⬜ Todo | MVP-02 | - |
| MVP-04 | Complete colony marker rendering | 🔄 In Progress | MVP-03 | - |
| MVP-05 | Implement all genus shapes | ✅ Done | MVP-04 | - |
| MVP-06 | Implement fate-based coloring | 🔄 In Progress | MVP-04 | - |
| MVP-07 | Add colony hover tooltips | ⬜ Todo | MVP-05, MVP-06 | - |
| MVP-08 | Complete year animation controls | ⬜ Todo | MVP-04 | - |
| MVP-09 | Create MapLegend component | ⬜ Todo | MVP-05, MVP-06 | - |
| MVP-10 | Add zoom/pan controls | ⬜ Todo | MVP-04 | - |

#### Priority 2: Important (Should Complete)

| ID | Task | Status | Dependencies | Assigned |
|----|------|--------|--------------|----------|
| MVP-11 | Colony detail popup modal | ⬜ Todo | MVP-07 | - |
| MVP-12 | Colony measurement history table | ⬜ Todo | MVP-11 | - |
| MVP-13 | Mini trajectory chart in popup | ⬜ Todo | MVP-11 | - |
| MVP-14 | Linked filter highlighting | ⬜ Todo | MVP-10 | - |
| MVP-15 | Animation speed control | ⬜ Todo | MVP-08 | - |

#### Priority 3: Nice to Have

| ID | Task | Status | Dependencies | Assigned |
|----|------|--------|--------------|----------|
| MVP-16 | URL parameter persistence | ⬜ Todo | MVP-14 | - |
| MVP-17 | Keyboard shortcuts | ⬜ Todo | MVP-10 | - |
| MVP-18 | Touch gesture support | ⬜ Todo | MVP-10 | - |
| MVP-19 | Fate filter component | ⬜ Todo | MVP-06 | - |
| MVP-20 | Size filter component | ⬜ Todo | MVP-04 | - |

---

## Critical Path

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CRITICAL PATH                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Raw Data → R Validation → R Transform → JSON Export → TS Data Loader   │
│                                                          ↓               │
│                                               Zustand Store              │
│                                                          ↓               │
│                                               TransectMap Component      │
│                                                    ↓         ↓           │
│                                          Colony Markers  Year Animation  │
│                                                    ↓                     │
│                                          Tooltips + Legend               │
│                                                    ↓                     │
│                                               MVP COMPLETE               │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Blocking Dependencies

| Blocked Item | Waiting On | Risk Level |
|--------------|------------|------------|
| All web visualization | Valid JSON data export | 🔴 High |
| Colony detail popup | Tooltip interactions | 🟡 Medium |
| Analytics views (Phase 4) | MVP completion | 🟡 Medium |
| Export functionality | All visualizations | 🟢 Low |

---

## Risk Register

### Active Risks

| ID | Risk | Probability | Impact | Status | Mitigation |
|----|------|-------------|--------|--------|------------|
| R-01 | Raw Excel data file missing/moved | Medium | 🔴 High | ⚠️ Monitor | Check `data/raw/` location |
| R-02 | R/TypeScript data format mismatch | Medium | 🔴 High | ⚠️ Monitor | Schema validation between pipelines |
| R-03 | D3 performance with 400 colonies | Low | 🟡 Medium | ✅ Mitigated | Canvas fallback in plan |
| R-04 | Scope creep on analytics | High | 🟡 Medium | ⚠️ Monitor | Strict phase gates |
| R-05 | Browser compatibility issues | Low | 🟢 Low | ✅ Mitigated | Modern browser targets only |

### Risk Response Actions

| Risk ID | Action | Owner | Due |
|---------|--------|-------|-----|
| R-01 | Verify data file location, update paths if needed | Data Engineer | Next sprint |
| R-02 | Create shared schema definition, add validation tests | Tech Lead | Before MVP |
| R-04 | Review scope at each phase gate, defer non-essential features | PM | Ongoing |

---

## Technical Decisions Log

### Architecture Decisions

| ID | Decision | Rationale | Date | Status |
|----|----------|-----------|------|--------|
| ADR-01 | R for statistical analysis, TypeScript for web | R ecosystem superior for stats; TS for interactivity | 2026-01-12 | ✅ Accepted |
| ADR-02 | Zustand for state management | Lightweight, TypeScript-first, simpler than Redux | 2026-01-12 | ✅ Accepted |
| ADR-03 | D3.js for visualizations | Industry standard, full control over rendering | 2026-01-12 | ✅ Accepted |
| ADR-04 | Vite for build tooling | Fast HMR, modern defaults, good React support | 2026-01-12 | ✅ Accepted |
| ADR-05 | Tailwind CSS for styling | Utility-first, fast development, consistent design | 2026-01-12 | ✅ Accepted |
| ADR-06 | Static JSON data (no database) | Dataset small enough for client-side; read-only; simpler deployment | 2026-01-12 | ✅ Accepted |
| ADR-07 | R as ETL pipeline (not TypeScript) | R superior for statistical transforms; separation of concerns | 2026-01-12 | ✅ Accepted |

### Pending Decisions

| ID | Decision Needed | Options | Owner | Due |
|----|-----------------|---------|-------|-----|
| PD-01 | Deployment target | GitHub Pages vs Vercel vs Netlify | PM/Stakeholder | Before Phase 8 |
| PD-02 | Canvas vs SVG for large datasets | SVG (current) vs Canvas fallback | Tech Lead | If performance issues |
| PD-03 | Mobile support scope | Full responsive vs tablet-only | UX/Stakeholder | Phase 8 |

---

## Data Pipeline Reference

### R Pipeline Execution

```bash
# Full pipeline (recommended)
Rscript scripts/R/run_complete_pipeline.R

# Individual steps
Rscript scripts/R/01_validate_data.R    # Validate raw data
Rscript scripts/R/02_transform_data.R   # Transform to tidy format
Rscript scripts/R/03_export_for_webapp.R # Generate JSON for web
Rscript scripts/R/04_generate_figures.R  # Publication figures
Rscript scripts/R/05_generate_report.R   # HTML reports
```

### Expected Data Flow

```
data/raw/*.xlsx
       ↓
[01_validate_data.R]
       ↓
data/processed/coral_validated.csv
       ↓
[02_transform_data.R]
       ↓
data/processed/coral_long_format.csv
data/processed/coral_enriched.parquet
       ↓
[03_export_for_webapp.R]
       ↓
data/processed/coral_webapp.json
       ↓
[TypeScript DataLoader]
       ↓
React Application
```

### Web Application Execution

```bash
# Development
npm install        # Install dependencies
npm run dev        # Start dev server (http://localhost:5173)

# Production
npm run build      # Create production build
npm run preview    # Preview production build
npm run lint       # Run linter
```

---

## Data Architecture

> **IMPORTANT**: This is a **client-side visualization application**, NOT a traditional database-backed web app. There is no server-side database, no backend API, and no user authentication.

### Architecture Type: Static Data Visualization

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     DATA ARCHITECTURE OVERVIEW                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────┐                                                   │
│  │  Excel Files     │  ← Source of truth (version controlled)          │
│  │  (data/raw/)     │                                                   │
│  └────────┬─────────┘                                                   │
│           │                                                              │
│           ▼                                                              │
│  ┌──────────────────┐                                                   │
│  │  R ETL Pipeline  │  ← Batch processing (run manually or CI)         │
│  │  (scripts/R/)    │                                                   │
│  └────────┬─────────┘                                                   │
│           │                                                              │
│           ▼                                                              │
│  ┌──────────────────┐                                                   │
│  │  Static JSON     │  ← Pre-computed data snapshots                   │
│  │  (data/processed)│                                                   │
│  └────────┬─────────┘                                                   │
│           │                                                              │
│           ▼                                                              │
│  ┌──────────────────┐                                                   │
│  │  React App       │  ← Client-side only (no backend)                 │
│  │  (Vite bundle)   │                                                   │
│  └────────┬─────────┘                                                   │
│           │                                                              │
│           ▼                                                              │
│  ┌──────────────────┐                                                   │
│  │  Zustand Store   │  ← In-memory "database" (browser state)          │
│  │  (client state)  │                                                   │
│  └────────┬─────────┘                                                   │
│           │                                                              │
│           ▼                                                              │
│  ┌──────────────────┐                                                   │
│  │  D3 Rendering    │  ← SVG/Canvas visualization                      │
│  │  (DOM updates)   │                                                   │
│  └──────────────────┘                                                   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### What This Project Does NOT Have

| Traditional DB App | This Project |
|-------------------|--------------|
| PostgreSQL/MongoDB/etc | ❌ No database server |
| REST/GraphQL API | ❌ No backend API |
| CRUD operations | ❌ Read-only (no mutations) |
| User authentication | ❌ No auth needed |
| Real-time sync | ❌ Static data snapshots |
| Server deployment | Static file hosting only |

### Data Storage Layers

#### Layer 1: Source Data (Excel)
- **Location**: `data/raw/`
- **Format**: Excel `.xlsx` files
- **Access**: Read-only, version controlled
- **Update frequency**: Manual (when new survey data collected)

#### Layer 2: Processed Data (R Output)
- **Location**: `data/processed/`
- **Formats**:
  - `coral_long_format.csv` - Human-readable tidy format
  - `coral_enriched.parquet` - Efficient columnar storage for R
  - `coral_webapp.json` - Web-optimized JSON for browser

#### Layer 3: Client State (Zustand)
- **Location**: Browser memory
- **Structure**: See `src/store/useStore.ts`
- **Persistence**: None (reloads from JSON on page refresh)

### Data Schema Contract

The R pipeline and TypeScript must agree on the JSON schema. The contract is defined in:

- **R side**: `scripts/R/03_export_for_webapp.R` (output format)
- **TypeScript side**: `src/types/coral.ts` (type definitions)

#### Core Data Types

```typescript
// From src/types/coral.ts
interface CoralRecord {
  coral_id: string;
  transect: 'T01' | 'T02';
  genus: 'Pocillopora' | 'Porites' | 'Acropora' | 'Millepora';
  year: number;
  x: number;           // 0-5m across transect
  y: number;           // 0-100cm along transect
  diam1: number;       // cm
  diam2: number;       // cm
  height: number;      // cm
  fate: Fate;          // demographic event
  geometric_mean_diam: number;  // derived: sqrt(diam1 * diam2)
  volume_proxy: number;         // derived: (d1 * d2 * h) / 6
}

type Fate = 'growth' | 'shrinkage' | 'recruitment' |
            'death' | 'stable' | 'fission' | 'fusion' | 'missing';
```

### Performance Characteristics

| Metric | Value | Notes |
|--------|-------|-------|
| Dataset size | ~387 colonies × 11 years | ~4,000 records total |
| JSON file size | ~200-500 KB | Loads in <100ms |
| Memory footprint | ~5-10 MB | Comfortable for any modern browser |
| Query performance | Instant | All filtering is client-side array operations |

### Data Update Workflow

When new survey data is collected:

```bash
# 1. Add new Excel file to data/raw/
cp new_survey_data.xlsx data/raw/

# 2. Run R pipeline to regenerate processed data
Rscript scripts/R/run_complete_pipeline.R

# 3. Commit updated processed data (or regenerate on deploy)
git add data/processed/
git commit -m "Update data with 2025 survey"

# 4. Redeploy web app (picks up new JSON automatically)
npm run build
```

### Why No Traditional Database?

1. **Dataset size**: 387 colonies fits entirely in browser memory
2. **Read-only access**: No user mutations to persist
3. **No authentication**: Research tool, not multi-user app
4. **Simplicity**: Static hosting is simpler, cheaper, more reliable
5. **Offline capable**: Could work offline once loaded
6. **Performance**: Client-side filtering is faster than API roundtrips

### Future Considerations

If requirements change, consider adding a database layer when:
- Dataset grows to 10,000+ colonies
- Multiple users need to annotate/edit data
- Real-time collaboration is required
- User accounts and permissions are needed
- Data needs to sync from multiple sources

---

## Quality Gates

### MVP Completion Criteria

- [ ] R pipeline executes without errors
- [ ] JSON data exports successfully
- [ ] Web app loads and displays transect map
- [ ] All 4 genus shapes render correctly
- [ ] Fate colors display correctly
- [ ] Year slider changes displayed data
- [ ] Animation plays through years smoothly
- [ ] Filters update visualization in real-time
- [ ] Map legend displays correctly
- [ ] No console errors in browser

### Performance Targets

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Initial load time | < 2s | TBD | ⬜ Not tested |
| Filter response time | < 100ms | TBD | ⬜ Not tested |
| Animation FPS | 60 fps | TBD | ⬜ Not tested |
| Bundle size | < 500KB | TBD | ⬜ Not tested |

### Code Quality Standards

- TypeScript strict mode enabled
- ESLint passing with no errors
- All components have TypeScript types
- No `any` types in production code
- React hooks follow rules of hooks
- D3 selections properly cleaned up

---

## Communication Protocol

### Agent Handoff Guidelines

When transitioning work between agents:

1. **Update this document** with current status
2. **Mark completed tasks** in the MVP Task Backlog
3. **Document any blockers** in the Risk Register
4. **Note any decisions made** in Technical Decisions Log
5. **Specify next priority tasks** clearly

### Status Update Format

```markdown
## Status Update: [DATE]

### Completed This Session
- [x] Task description

### In Progress
- [ ] Task description (X% complete)

### Blockers
- Blocker description and proposed resolution

### Next Priority
1. First priority task
2. Second priority task
```

### Escalation Path

| Issue Type | First Contact | Escalate To |
|------------|---------------|-------------|
| Technical blocker | Tech Lead Agent | Stakeholder |
| Data quality issue | Data Engineer Agent | PM Agent |
| Scope question | PM Agent | Stakeholder |
| UX decision | UX Agent | Stakeholder |

---

## File Location Reference

### Key Directories

```
coral-ontogeny-viz/
├── data/
│   ├── raw/           # Original Excel files (read-only)
│   ├── processed/     # R-generated outputs
│   └── external/      # Reference data
├── scripts/R/         # R analysis scripts
├── notebooks/         # R Markdown notebooks
├── outputs/
│   ├── figures/       # Publication plots
│   ├── reports/       # HTML/PDF reports
│   └── exports/       # User exports
├── src/               # React application
│   ├── components/    # UI components
│   ├── hooks/         # Custom hooks
│   ├── store/         # Zustand store
│   ├── types/         # TypeScript types
│   └── utils/         # Utility functions
└── tests/             # Test files
```

### Configuration Files

| File | Purpose |
|------|---------|
| `package.json` | Node.js dependencies and scripts |
| `tsconfig.json` | TypeScript configuration |
| `vite.config.ts` | Vite build configuration |
| `tailwind.config.js` | Tailwind CSS configuration |
| `eslint.config.js` | ESLint configuration |
| `renv.lock` | R package versions |
| `.Rprofile` | R session configuration |

---

## Appendix: Visual Encoding Reference

### Genus → Shape Mapping

| Genus | Shape | D3 Symbol |
|-------|-------|-----------|
| Pocillopora | Circle | `d3.symbolCircle` |
| Porites | Square | `d3.symbolSquare` |
| Acropora | Triangle | `d3.symbolTriangle` |
| Millepora | Diamond | `d3.symbolDiamond` |

### Fate → Color Mapping

| Fate | Color | Hex Code |
|------|-------|----------|
| Growth | Green | `#22c55e` |
| Recruitment | Yellow | `#eab308` |
| Shrinkage | Orange | `#f97316` |
| Death | Red | `#ef4444` |
| Stable/Alive | Gray | `#6b7280` |
| Fission/Fusion | Purple | `#a855f7` |

### Size Encoding

- Colony marker size scales with `geometric_mean_diam = sqrt(diam1 × diam2)`
- Minimum size: 4px (for visibility)
- Maximum size: 40px (to prevent overlap)
- Scale: `d3.scaleSqrt().domain([0, maxDiam]).range([4, 40])`

---

## Document Maintenance

This document should be updated:
- At the start of each work session
- When completing major tasks
- When encountering blockers
- When making architectural decisions
- At phase gate reviews

**Last updated by**: Project Manager Agent
**Next review**: Before next development session
