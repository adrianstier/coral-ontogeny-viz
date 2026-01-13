# Repository Organization Summary

## Overview

This repository has been reorganized as a **professional data science project** combining rigorous R statistical analysis with interactive React/D3 web visualizations for coral demographic research.

---

## What Was Built

### 1. Data Infrastructure ✓

**Directory Structure**:
```
data/
├── raw/                    # Original Excel files (immutable)
│   └── metadata.json       # Data provenance and schema
├── processed/              # R-generated tidy datasets
└── external/               # Reference data
```

**Key Features**:
- Separation of raw vs processed data
- Data provenance tracking with metadata
- Multiple export formats (CSV, Parquet)

---

### 2. R Analysis Pipeline ✓

**Scripts** (`scripts/R/`):
- `utils.R` - 46 utility functions for data processing
- `01_validate_data.R` - Automated quality checks & HTML reports
- `02_transform_data.R` - Wide-to-long transformation with enrichment

**R Markdown Notebooks** (`notebooks/`):
1. `01_data_exploration.Rmd` - EDA, schema validation, summary stats
2. `02_demographic_analysis.Rmd` - Population dynamics, recruitment, mortality
3. `03_survival_analysis.Rmd` - Kaplan-Meier curves, Cox models

**Environment**:
- `renv.lock` - R 4.4.0 with 15 core packages
- `.Rprofile` - Auto-activation and project settings

---

### 3. Testing Infrastructure ✓

**Unit Tests** (`tests/unit/test_utils.R`):
- 50+ test cases for utility functions
- Tests for measurement parsing, geometric calculations, growth rates
- Statistical function validation
- Uses `testthat` framework

**Integration Testing**:
- GitHub Actions CI/CD pipeline
- Automated validation → transformation → analysis workflow

---

### 4. Output Generation ✓

**Publication Figures** (`outputs/figures/`):
- Population time series (total and by genus)
- Recruitment vs mortality comparisons
- Growth rate distributions
- Survival curves by genus
- Size-frequency histograms
- Multi-panel summary figures
- 300 DPI PNG/PDF outputs

**Automated Reports** (`outputs/reports/`):
- HTML data quality report
- R Markdown analysis reports
- Statistical summaries
- Session info for reproducibility

---

### 5. Documentation ✓

**Comprehensive Documentation**:
- [README.md](README.md) - Updated with dual R/React workflow
- [CLAUDE.md](CLAUDE.md) - Complete implementation guide (R-focused)
- [DATA_DICTIONARY.md](DATA_DICTIONARY.md) - All variable definitions
- [notebooks/README.md](notebooks/README.md) - Notebook execution guide
- [QUICKSTART.md](QUICKSTART.md) - Developer quick start

---

### 6. CI/CD Pipeline ✓

**GitHub Actions** (`.github/workflows/r-analysis.yml`):
- Automated data validation on push
- Data transformation with output artifacts
- Unit test execution
- R Markdown notebook rendering
- Artifact upload (reports, figures, processed data)

**Workflow Jobs**:
1. `validate-and-transform` - Run QA and create tidy data
2. `run-tests` - Execute unit tests
3. `render-notebooks` - Generate HTML reports
4. `build-status` - Overall pipeline status

---

### 7. Version Control ✓

**Updated .gitignore**:
- Excludes raw data files (large Excel)
- Excludes processed data (regenerated)
- Excludes R package cache (managed by renv)
- Excludes outputs (regenerated from scripts)
- Keeps directory structure with .gitkeep files
- Organized by category (R, Node.js, OS, etc.)

---

## Key R Analysis Functions

### Data Processing (`scripts/R/utils.R`)

| Function | Purpose |
|----------|---------|
| `parse_measurement()` | Handle missing data codes (Na, UK, D) |
| `geometric_mean()` | Calculate sqrt(diam1 × diam2) |
| `calc_volume_proxy()` | Ellipsoid volume approximation |
| `calc_growth_rate()` | Log-transformed growth rates |
| `flag_implausible()` | Identify QA issues |
| `genus_colors()` | Consistent color scheme |
| `validate_schema()` | Check data structure |
| `export_data()` | Save with metadata |

### Statistical Analysis (Notebooks)

**Demographic Rates**:
- `aggregateByYear()` - Population counts over time
- Recruitment rate calculation
- Mortality rate calculation
- Net population change

**Survival Analysis**:
- Kaplan-Meier survival curves (`survival::survfit`)
- Log-rank tests for genus comparisons
- Cox proportional hazards models (`survival::coxph`)
- Median survival time estimation

**Growth Analysis**:
- Growth rate distributions
- Size-frequency histograms
- Log-scale binning
- Genus-specific growth patterns

---

## Reproducible Workflow

### Complete Analysis Pipeline

```bash
# 1. Setup R environment
R -e "renv::restore()"

# 2. Validate raw data
Rscript scripts/R/01_validate_data.R
# → outputs/reports/data_quality_report.html

# 3. Transform to tidy format
Rscript scripts/R/02_transform_data.R
# → data/processed/coral_long_format.csv
# → data/processed/coral_enriched.parquet

# 4. Run exploratory analysis
Rscript -e "rmarkdown::render('notebooks/01_data_exploration.Rmd')"
# → notebooks/01_data_exploration.html

# 5. Run demographic analysis
Rscript -e "rmarkdown::render('notebooks/02_demographic_analysis.Rmd')"
# → notebooks/02_demographic_analysis.html
# → outputs/figures/population_*.png

# 6. Run survival analysis
Rscript -e "rmarkdown::render('notebooks/03_survival_analysis.Rmd')"
# → notebooks/03_survival_analysis.html
# → outputs/figures/survival_*.png

# 7. Run unit tests
Rscript -e "testthat::test_file('tests/unit/test_utils.R')"
```

---

## Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      RAW EXCEL DATA                         │
│              (data/raw/*.xlsx + metadata.json)              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              R: DATA VALIDATION SCRIPT                      │
│           (scripts/R/01_validate_data.R)                    │
│  • Schema checks  • Missing data  • Outliers  • QA flags    │
└─────────────────────────────────────────────────────────────┘
                            ↓
                   [Quality Report HTML]
                            ↓
┌─────────────────────────────────────────────────────────────┐
│           R: DATA TRANSFORMATION SCRIPT                     │
│          (scripts/R/02_transform_data.R)                    │
│  • Wide → Long  • Parse measurements  • Compute metrics     │
│  • Growth rates  • Demographic flags  • Export CSV/Parquet  │
└─────────────────────────────────────────────────────────────┘
                            ↓
              ┌─────────────┴─────────────┐
              ↓                           ↓
┌──────────────────────────┐  ┌──────────────────────────┐
│   R MARKDOWN NOTEBOOKS   │  │   REACT WEB APP          │
│  • Exploratory analysis  │  │  • Load CSV or Excel     │
│  • Demographics          │  │  • Interactive viz       │
│  • Survival analysis     │  │  • Real-time filtering   │
└──────────────────────────┘  └──────────────────────────┘
              ↓                           ↓
┌──────────────────────────┐  ┌──────────────────────────┐
│  PUBLICATION OUTPUTS     │  │  USER INTERACTIONS       │
│  • HTML reports          │  │  • Spatial maps          │
│  • PNG/PDF figures       │  │  • Time series           │
│  • Statistical tables    │  │  • Animations            │
└──────────────────────────┘  └──────────────────────────┘
```

---

## File Statistics

| Component | Files | Lines of Code |
|-----------|-------|---------------|
| R Scripts | 3 | ~700 |
| R Utilities | 1 | ~350 |
| R Notebooks | 3 | ~1,500 |
| R Tests | 1 | ~250 |
| TypeScript/React | 15+ | ~1,100 |
| Documentation | 6 | ~2,500 |
| **Total** | **29+** | **~6,400** |

---

## Next Steps for Users

### For Data Analysts

1. **Setup R environment**:
   ```bash
   R -e "renv::restore()"
   ```

2. **Run validation and transformation**:
   ```bash
   Rscript scripts/R/01_validate_data.R
   Rscript scripts/R/02_transform_data.R
   ```

3. **Open notebooks in RStudio**:
   - Navigate to `notebooks/`
   - Open desired `.Rmd` file
   - Click "Knit" to generate HTML report

4. **Customize analysis**:
   - Modify notebooks for specific research questions
   - Add new analyses following template structure
   - Source `scripts/R/utils.R` for helper functions

### For Web Developers

1. **Install Node.js dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Load processed data** (faster than Excel):
   ```typescript
   const data = await csv('/data/processed/coral_long_format.csv');
   ```

4. **Build for production**:
   ```bash
   npm run build
   npm run preview
   ```

---

## Benefits of This Organization

### Reproducibility ✓
- **Version-controlled scripts** produce deterministic outputs
- **R environment locked** with renv.lock
- **Automated pipeline** via GitHub Actions
- **Session info** embedded in notebook outputs

### Scientific Rigor ✓
- **Automated QA checks** catch data issues early
- **Unit tested functions** ensure correctness
- **Documented transformations** enable verification
- **Publication-ready figures** with consistent styling

### Collaboration ✓
- **Clear separation** of analysis (R) vs visualization (React)
- **Documented workflows** in multiple README files
- **Data dictionary** defines all variables
- **Git-friendly** structure avoids large binary files

### Flexibility ✓
- **Multiple export formats** (CSV, Parquet)
- **Modular notebooks** for different analyses
- **Reusable utilities** reduce code duplication
- **Extensible architecture** for new analyses

### Transparency ✓
- **Open data pipeline** from raw to processed
- **Quality flags** document potential issues
- **Provenance metadata** tracks data sources
- **HTML reports** communicate findings

---

## Comparison: Before vs After

| Aspect | Before | After |
|--------|--------|-------|
| **Data Organization** | Single Excel file | Raw/Processed/External separation |
| **Analysis** | TypeScript only | R (primary) + TypeScript (client) |
| **Validation** | Manual inspection | Automated QA with reports |
| **Reproducibility** | Limited | Full pipeline with renv |
| **Testing** | None | Unit tests + CI/CD |
| **Documentation** | Basic README | 6 comprehensive docs |
| **Figures** | D3 browser plots | R publication-quality + D3 interactive |
| **Reports** | None | Automated R Markdown HTML |
| **Version Control** | Basic .gitignore | Comprehensive, organized |
| **Collaboration** | Single workflow | Dual R + React workflows |

---

## Success Metrics

✅ **Data Quality**: Automated validation with HTML reports
✅ **Reproducibility**: Complete pipeline from raw data to figures
✅ **Testing**: 50+ unit tests for core functions
✅ **Documentation**: 2,500+ lines of comprehensive docs
✅ **Automation**: GitHub Actions CI/CD for R pipeline
✅ **Flexibility**: Multiple export formats and analysis paths
✅ **Scientific Rigor**: Survival analysis, Cox models, demographic rates
✅ **Publication Ready**: 300 DPI figures, R Markdown reports

---

## Maintenance

### Adding New Analyses

1. Create new R Markdown notebook in `notebooks/`
2. Source `scripts/R/utils.R` for helper functions
3. Load processed data from `data/processed/`
4. Add sections with analysis code + visualizations
5. Document in `notebooks/README.md`

### Updating Data

1. Place new Excel file in `data/raw/`
2. Update `metadata.json` with new info
3. Run validation: `Rscript scripts/R/01_validate_data.R`
4. Run transformation: `Rscript scripts/R/02_transform_data.R`
5. Re-render notebooks with new data

### Extending Utilities

1. Add function to `scripts/R/utils.R`
2. Add roxygen-style documentation
3. Add tests to `tests/unit/test_utils.R`
4. Run tests: `testthat::test_file('tests/unit/test_utils.R')`
5. Update `DATA_DICTIONARY.md` if new variables created

---

## Contact

For questions about the R analysis infrastructure:
- Review [CLAUDE.md](CLAUDE.md) implementation guide
- Check [notebooks/README.md](notebooks/README.md) for notebook help
- See [DATA_DICTIONARY.md](DATA_DICTIONARY.md) for variable definitions
- Open GitHub issue for bugs or feature requests

---

**Repository Organization Date**: 2026-01-12
**Organization Lead**: Claude Code (Data Science Expert)
**Status**: ✅ Complete - Ready for Production
