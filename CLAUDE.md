# Claude Implementation Guide: Coral Ontogeny Visualization

## IMPORTANT: Project Status Reference

**Before starting any work, consult [PROJECT_STATUS.md](PROJECT_STATUS.md)** for:
- Current implementation status and phase
- MVP task backlog with priorities
- Active blockers and risks
- Critical path dependencies
- Technical decisions already made

**After completing work, update PROJECT_STATUS.md** with:
- Tasks completed
- New blockers encountered
- Decisions made
- Next priority recommendations

---

## Project Overview

This project combines an interactive web visualization (React/D3) with rigorous statistical analysis (R) for coral demographic data from MCR LTER.

## Analysis Workflow (R-Based)

### 1. Data Science Pipeline

All statistical analysis and exploratory data analysis is performed in **R**:

```
Raw Excel Data
     ↓
R: Data Validation (scripts/R/01_validate_data.R)
     ↓
R: Data Transformation (scripts/R/02_transform_data.R)
     ↓
Processed Data (CSV/Parquet)
     ↓
R Markdown Notebooks (exploratory analysis)
     ↓
Publication Figures & Reports
```

### 2. Web Application Pipeline

The React application provides interactive visualization:

```
Processed Data OR Raw Excel
     ↓
TypeScript: Client-side parsing (src/utils/dataTransform.ts)
     ↓
React/D3 Visualization
     ↓
Interactive Dashboard
```

---

## Directory Structure

```
coral-ontogeny-viz/
├── data/
│   ├── raw/                    # Original Excel files (read-only)
│   ├── processed/              # R-generated CSV/Parquet files
│   └── external/               # Reference data
│
├── scripts/R/                  # R analysis scripts
│   ├── utils.R                 # Shared R utility functions
│   ├── 01_validate_data.R      # Data quality checks
│   └── 02_transform_data.R     # Wide-to-long transformation
│
├── notebooks/                  # R Markdown analysis notebooks
│   ├── 01_data_exploration.Rmd
│   ├── 02_demographic_analysis.Rmd
│   ├── 03_survival_analysis.Rmd
│   └── README.md
│
├── outputs/
│   ├── figures/                # Publication-quality plots
│   ├── reports/                # HTML/PDF reports
│   └── exports/                # User data exports
│
├── src/                        # React web application
│   ├── components/
│   ├── utils/                  # TypeScript utilities
│   └── ...
│
├── tests/
│   └── unit/                   # R unit tests (testthat)
│
└── configs/
    └── renv.lock               # R package versions
```

---

## Implementation Guidelines

### For Data Analysis Tasks

**Use R** for all:
- Exploratory data analysis
- Statistical modeling (survival analysis, growth models)
- Data validation and quality checks
- Data transformation (wide to long format)
- Publication figure generation
- Automated reporting

**R Notebooks**:
1. `01_data_exploration.Rmd` - Initial EDA, schema validation, summary stats
2. `02_demographic_analysis.Rmd` - Population dynamics, recruitment, mortality
3. `03_survival_analysis.Rmd` - Kaplan-Meier curves, Cox models

**Run R Scripts**:
```bash
# Validate raw data
Rscript scripts/R/01_validate_data.R

# Transform to tidy format
Rscript scripts/R/02_transform_data.R

# Render analysis notebook
Rscript -e "rmarkdown::render('notebooks/02_demographic_analysis.Rmd')"
```

### For Web Development Tasks

**Use TypeScript/React** for:
- Interactive visualizations
- Real-time filtering and animation
- User interface components
- Client-side data loading

**Key Files**:
- `src/utils/dataTransform.ts` - Browser-side Excel parsing
- `src/utils/statistics.ts` - Client-side summary statistics
- `src/components/` - React UI components

---

## Key Principles

### 1. Data Processing

**R is the source of truth** for:
- Processed data formats (CSV, Parquet)
- Statistical computations
- Data quality validation
- Derived metrics (growth rates, survival curves)

**TypeScript replicates** R logic for:
- Browser compatibility (client-side Excel loading)
- Interactive filtering
- Real-time calculations for UI updates

### 2. File Formats

- **Raw data**: Excel `.xlsx` (immutable, version controlled)
- **Processed data**: CSV (human-readable), Parquet (efficient, columnar)
- **Analysis outputs**: PNG/PDF (figures), HTML/PDF (reports)
- **Web app data**: Can load Excel directly OR use processed CSV

### 3. Reproducibility

**All R scripts must be**:
- Idempotent (produce same output when run multiple times)
- Self-contained (use `here::here()` for paths)
- Documented (comments explaining transformations)
- Tested (unit tests in `tests/unit/`)

**R Environment**:
```r
# Restore package environment
renv::restore()

# Update package snapshot
renv::snapshot()
```

### 4. Version Control

**DO commit**:
- R scripts and notebooks
- Configuration files (renv.lock)
- Documentation
- Small reference data

**DO NOT commit**:
- Raw Excel files (>100MB)
- Processed data files (regenerated from scripts)
- Output figures and reports
- R package cache

---

## Common Tasks

### Add New Statistical Analysis

1. Create R Markdown notebook in `notebooks/`
2. Source utility functions: `source(here("scripts/R/utils.R"))`
3. Load processed data: `read_csv(here("data/processed/coral_long_format.csv"))`
4. Add analysis sections with visualizations
5. Save figures to `outputs/figures/`
6. Document in `notebooks/README.md`

### Add New Data Transformation

1. Edit `scripts/R/02_transform_data.R`
2. Add transformation logic
3. Update output schema
4. Add unit tests in `tests/unit/`
5. Document new variables in data dictionary

### Add New Utility Function

1. Add function to `scripts/R/utils.R`
2. Add documentation comments (roxygen-style)
3. Add unit tests to `tests/unit/test_utils.R`
4. Run tests: `testthat::test_file("tests/unit/test_utils.R")`

### Update Web Visualization

1. Modify React components in `src/components/`
2. Update data parsing if needed in `src/utils/dataTransform.ts`
3. Ensure calculations match R implementations
4. Test with `npm run dev`

---

## Data Dictionary

### Core Variables

**Metadata** (per colony):
- `coral_id`: Unique identifier
- `transect`: T01 or T02
- `genus`: Pocillopora, Porites, Acropora, Millepora
- `x`, `y`, `z`: Spatial coordinates (m)

**Measurements** (per colony-year):
- `diam1`, `diam2`: Perpendicular diameter measurements (cm)
- `height`: Colony height (cm)
- `status`: Colony status code
- `fate`: Demographic event (growth, death, recruitment, etc.)
- `observer`: Initials of observer

**Derived Metrics** (computed by R):
- `geom_mean_diam`: sqrt(diam1 × diam2)
- `volume_proxy`: (diam1 × diam2 × height) / 6
- `growth_rate_diam`: log(size_t / size_{t-1})
- `first_year`, `last_year`: Colony temporal extent
- `lifespan`: Years in study
- `is_recruit`: Appeared after baseline year

**Quality Flags**:
- `flag_large_diam`: Diameter > 200 cm
- `flag_negative`: Any negative measurement
- `flag_out_of_bounds`: Outside transect boundaries
- `flag_extreme_growth`: Growth rate > 300% or < -50%

---

## Statistical Methods

### Implemented in R

1. **Population Dynamics**
   - Time series of abundance by genus
   - Recruitment and mortality rates
   - Net population change

2. **Survival Analysis**
   - Kaplan-Meier survival curves
   - Log-rank tests for genus comparisons
   - Cox proportional hazards models
   - Size-dependent mortality

3. **Growth Analysis**
   - Log-transformed growth rates
   - Size-frequency distributions
   - Growth rate distributions by genus

### Implemented in TypeScript

- Client-side filtering
- Real-time population counts
- Mean size calculations
- Basic summary statistics

---

## Testing Strategy

### R Unit Tests

Located in `tests/unit/test_utils.R`:

```r
# Run all tests
testthat::test_file("tests/unit/test_utils.R")
```

Tests cover:
- Measurement parsing (`parse_measurement`)
- Geometric calculations (`geometric_mean`, `calc_volume_proxy`)
- Growth rate calculations
- Data validation functions
- Statistical helper functions

### Integration Tests

Validate full pipeline:

```bash
# 1. Validate raw data
Rscript scripts/R/01_validate_data.R

# 2. Transform data
Rscript scripts/R/02_transform_data.R

# 3. Check outputs exist
ls data/processed/coral_long_format.csv
ls data/processed/coral_enriched.parquet
```

---

## Performance Considerations

### R Script Optimization

- Use `data.table` or `arrow` for large datasets (>1M rows)
- Pre-filter data before expensive operations
- Use vectorized operations instead of loops
- Save intermediate results to RDS files

### Web App Optimization

- Load processed CSV instead of Excel when possible (10x faster)
- Implement virtual scrolling for large colony lists
- Debounce filter updates
- Use Web Workers for heavy computations

---

## Publication Workflow

### Generating Publication Figures

All figures in `outputs/figures/` are:
- 300 DPI minimum
- PDF or PNG format
- Multi-panel layouts using `patchwork`
- Consistent color schemes from `utils.R`

```r
# Generate all figures
source(here("scripts/R/04_generate_figures.R"))
```

### Automated Reports

R Markdown notebooks generate HTML reports with:
- Embedded figures
- Statistical tables
- Session info for reproducibility

```bash
# Render all notebooks
Rscript -e "purrr::walk(list.files('notebooks', pattern='.Rmd$', full.names=TRUE), rmarkdown::render)"
```

---

## Deployment

### R Analysis Environment

**Production**:
```bash
# Install R 4.4+
# Restore environment
R -e "renv::restore()"

# Run pipeline
Rscript scripts/R/01_validate_data.R
Rscript scripts/R/02_transform_data.R
```

### Web Application

**Development**:
```bash
npm install
npm run dev
```

**Production**:
```bash
npm run build
npm run preview
```

---

## Contact & Resources

- **R Package Documentation**: Run `?function_name` in R console
- **Notebook Examples**: See `notebooks/README.md`
- **Unit Tests**: Run `testthat::test_dir("tests/unit")`
- **Data Issues**: Check `outputs/reports/data_quality_report.html`

---

## Quick Reference

### R Package Ecosystem

- `tidyverse`: Data manipulation (dplyr, tidyr, ggplot2)
- `survival`: Kaplan-Meier, Cox models
- `readxl`: Excel file reading
- `arrow`: Parquet file support
- `here`: Path management
- `rmarkdown`: Notebook rendering

### Essential R Functions

```r
# Load data
read_csv()          # CSV files
read_excel()        # Excel files
read_parquet()      # Parquet files

# Transform data
pivot_longer()      # Wide to long
group_by() %>% summarise()  # Aggregation

# Visualization
ggplot() + geom_*() # Plotting
ggsave()            # Save figures

# Survival analysis
survfit()           # Kaplan-Meier
coxph()             # Cox model
```

---

**Last Updated**: 2026-01-12

**Maintained By**: Data Science Team
