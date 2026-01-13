# R Analysis Scripts

This directory contains R scripts for the complete statistical analysis pipeline of the coral ontogeny dataset.

---

## Scripts Overview

| Script | Purpose | Runtime | Dependencies |
|--------|---------|---------|--------------|
| **utils.R** | Shared utility functions (46 functions) | - | Base R + tidyverse |
| **01_validate_data.R** | Data quality checks and HTML report | ~30s | readxl, janitor |
| **02_transform_data.R** | Wide-to-long transformation | ~45s | readxl, arrow |
| **03_export_for_webapp.R** | Export JSON/CSV for React app | ~30s | jsonlite |
| **04_generate_figures.R** | Publication-quality figures | ~60s | ggplot2, patchwork, survival |
| **05_generate_report.R** | Render all R Markdown notebooks | ~5min | rmarkdown, knitr |
| **run_complete_pipeline.R** | Master script - runs all above | ~7min | All of the above |

---

## Quick Start

### Run Complete Pipeline

```bash
# Execute all analysis steps in order
Rscript scripts/R/run_complete_pipeline.R
```

This will:
1. Validate raw data quality
2. Transform Excel → CSV/Parquet
3. Generate all publication figures
4. Render all R Markdown notebooks
5. Create HTML reports

**Output locations**:
- `data/processed/` - Tidy datasets
- `outputs/figures/` - Publication figures
- `outputs/reports/` - HTML analysis reports
- `public/data/` - Web app data exports

---

## Individual Scripts

### 1. Data Validation

```bash
Rscript scripts/R/01_validate_data.R
```

**What it does**:
- Schema validation (required columns present?)
- Missing data analysis
- Measurement range checks (biologically plausible?)
- Spatial boundary validation
- Duplicate ID detection
- Genus/transect validation

**Outputs**:
- `outputs/reports/data_quality_report.html` - Interactive HTML report
- `outputs/reports/validation_results.rds` - Programmatic results

**Key checks**:
- ✓ All metadata columns present
- ✓ Year blocks complete (2013-2023)
- ✓ No negative measurements
- ✓ Sizes within biological range
- ✓ Colonies within transect boundaries

---

### 2. Data Transformation

```bash
Rscript scripts/R/02_transform_data.R
```

**What it does**:
- Loads raw Excel file
- Converts wide format → long (tidy) format
- Parses measurements (handles Na, UK, D codes)
- Computes derived metrics:
  - Geometric mean diameter
  - Volume proxy
  - Growth rates (log scale)
  - Demographic flags
- Adds quality flags
- Exports multiple formats

**Outputs**:
- `data/processed/coral_long_format.csv` (human-readable)
- `data/processed/coral_enriched.parquet` (optimized binary)
- `data/processed/summary_statistics.rds`

**Schema transformation**:

*Before (wide)*:
```
Coral ID | Genus | X | Y | Diam1_2013 | Diam2_2013 | ... | Diam1_2023 | ...
```

*After (long)*:
```
coral_id | genus | x | y | year | diam1 | diam2 | geom_mean_diam | growth_rate | ...
```

---

### 3. Web App Data Export

```bash
Rscript scripts/R/03_export_for_webapp.R
```

**What it does**:
- Creates optimized JSON/CSV files for React app
- Generates time series aggregations
- Exports spatial data by year
- Creates size-frequency distributions
- Builds demographic event timelines
- Generates data manifest

**Outputs** (`public/data/`):
- `summary_statistics.json` - Dataset overview
- `timeseries.csv` - Population time series
- `spatial_YYYY.json` - Spatial positions per year (11 files)
- `demographic_events.json` - Recruitment/mortality events
- `size_frequency.json` - Size distributions
- `color_schemes.json` - Visualization color mappings
- `data_dictionary.json` - Variable definitions
- `manifest.json` - File index and usage guide

**Web app usage**:
```javascript
// Fetch manifest
const manifest = await fetch('/data/manifest.json').then(r => r.json());

// Load summary stats
const summary = await fetch('/data/summary_statistics.json').then(r => r.json());

// Load spatial data for specific year
const spatial2023 = await fetch('/data/spatial_2023.json').then(r => r.json());
```

---

### 4. Publication Figures

```bash
Rscript scripts/R/04_generate_figures.R
```

**What it does**:
- Generates all publication-quality figures
- Creates multi-panel composite figures
- Produces both PNG (300 DPI) and PDF formats
- Uses consistent color schemes
- Applies publication-ready styling

**Outputs** (`outputs/figures/`):

**Main Figures**:
1. `figure_1_population_dynamics_overview.png` (4-panel)
   - Total population over time
   - Population by genus
   - Recruitment vs mortality
   - Mean colony size

2. `figure_2_growth_rates.png` (2-panel)
   - Growth rate distributions by genus
   - Violin plot comparisons

3. `figure_3_size_distributions.png` (2-panel)
   - Overall size distribution (log scale)
   - Size distribution over time (faceted)

4. `figure_4_survival_curves.png`
   - Kaplan-Meier curves by genus
   - Risk table
   - Log-rank test p-value

5. `figure_5_spatial_distribution.png`
   - Colony positions on transects
   - Size-coded points
   - Genus colors

**Supplementary Figures**:
- `supp_figure_S1_transect_comparison.png`
- `supp_figure_S2_growth_temporal.png`

---

### 5. Report Generation

```bash
Rscript scripts/R/05_generate_report.R
```

**What it does**:
- Renders all R Markdown notebooks
- Creates HTML analysis reports
- Generates index page with links
- Builds executive summary
- Tracks rendering status

**Outputs** (`outputs/reports/`):
- `index.html` - Report index with navigation
- `executive_summary.html` - Key findings summary
- Links to rendered notebooks in `notebooks/` directory

**Rendered notebooks**:
- `notebooks/01_data_exploration.html`
- `notebooks/02_demographic_analysis.html`
- `notebooks/03_survival_analysis.html`
- `notebooks/04_spatial_analysis.html`

---

## Utility Functions (utils.R)

### Data Processing

```r
parse_measurement(x)           # Handle missing codes (Na, UK, D)
geometric_mean(x, y)           # sqrt(x * y)
calc_volume_proxy(d1, d2, h)   # Ellipsoid volume
calc_growth_rate(t0, t1)       # Log growth rate
flag_implausible(data)         # QA flag outliers
```

### Statistical

```r
se(x)                    # Standard error
ci_95(x)                 # 95% confidence interval
log_bins(sizes, n)       # Log-scale histogram bins
```

### Visualization

```r
genus_colors()           # Named vector of genus colors
fate_colors()            # Named vector of fate colors
```

### Data Management

```r
validate_schema(data, cols)         # Check required columns
export_data(data, path, format)     # Export with metadata
print_header(title)                 # Formatted console output
```

---

## Running Tests

```bash
# Run unit tests for utility functions
Rscript -e "testthat::test_file('tests/unit/test_utils.R')"
```

**Tests cover**:
- Measurement parsing
- Geometric calculations
- Growth rate formulas
- Data validation
- Statistical functions

---

## Workflow Examples

### Example 1: Quick Analysis

```bash
# Validate and transform data
Rscript scripts/R/01_validate_data.R
Rscript scripts/R/02_transform_data.R

# Generate key figures only
Rscript scripts/R/04_generate_figures.R
```

### Example 2: Update Web App Data

```bash
# Transform data (if not done)
Rscript scripts/R/02_transform_data.R

# Export for web app
Rscript scripts/R/03_export_for_webapp.R

# Files are now in public/data/ ready for React app
```

### Example 3: Full Reproducible Workflow

```bash
# Run everything
Rscript scripts/R/run_complete_pipeline.R

# View results
open outputs/reports/index.html  # macOS
xdg-open outputs/reports/index.html  # Linux
```

---

## Performance Notes

**Large Dataset Optimization**:
- Use `arrow::read_parquet()` instead of CSV for >100K rows
- Process by year chunks if memory limited
- Use `data.table` for very large joins

**Parallel Processing**:
```r
library(future)
plan(multisession, workers = 4)

# Process years in parallel
library(furrr)
results <- future_map(years, process_year)
```

---

## Troubleshooting

**Error: Package not found**
```bash
# Restore R environment
R -e "renv::restore()"
```

**Error: Cannot find file**
```r
# Check working directory
getwd()  # Should be project root

# Use here() for all paths
library(here)
here("data/raw/my_file.xlsx")  # Always correct
```

**Error: Out of memory**
```r
# Process in chunks
years <- unique(coral_data$year)
for (yr in years) {
  subset <- coral_data %>% filter(year == yr)
  process(subset)
}
```

**Excel file locked**
- Close Excel before running scripts
- Check no other R sessions are accessing file

---

## File Conventions

**Script naming**:
- `##_descriptive_name.R` - Numbered for execution order
- `utils.R` - Shared functions (no number)
- `run_*.R` - Master/orchestration scripts

**Output naming**:
- `figure_#_description.png` - Main figures
- `supp_figure_S#_description.png` - Supplementary
- `*_report.html` - HTML reports
- `*_YYYY-MM-DD.csv` - Dated exports

---

## Dependencies

**Core packages** (from renv.lock):
```r
tidyverse (2.0.0)     # Data manipulation
survival (3.5-7)      # Survival analysis
survminer (0.4.9)     # Survival visualization
ggplot2 (3.4.4)       # Plotting
readxl (1.4.3)        # Excel reading
arrow (14.0.0)        # Parquet support
rmarkdown (2.25)      # Report generation
knitr (1.45)          # Notebooks
testthat (3.2.1)      # Testing
here (1.0.1)          # Path management
janitor (2.2.0)       # Data cleaning
patchwork (1.2.0)     # Multi-panel figures
jsonlite (1.8.8)      # JSON export
```

**Install all**:
```r
renv::restore()
```

---

## Best Practices

1. **Always use `here()`** for file paths
2. **Source `utils.R`** at start of scripts
3. **Check inputs exist** before processing
4. **Use `tryCatch`** for robust error handling
5. **Save intermediate results** to RDS files
6. **Document new functions** with roxygen comments
7. **Add tests** for new utility functions
8. **Use version control** for scripts (not outputs)

---

## Contact

For questions about R scripts:
- See `CLAUDE.md` for implementation details
- Check `DATA_DICTIONARY.md` for variable definitions
- Run unit tests to validate functions
- Open GitHub issue for bugs

---

**Last Updated**: 2026-01-12

**Maintainer**: Data Science Team
