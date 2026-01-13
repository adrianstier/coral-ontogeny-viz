# R Analysis Notebooks

This directory contains R Markdown notebooks for analyzing the coral ontogeny dataset.

## Notebook Execution Order

Execute notebooks in the following order for a complete analysis workflow:

### 1. **01_data_exploration.Rmd** - Initial Data Exploration
**Purpose**: Load, validate, and explore the raw Excel dataset

**Key outputs**:
- Data structure overview
- Schema validation results
- Missing data patterns
- Genus and transect distributions
- Spatial position plots
- Initial size measurements summary

**Runtime**: ~2-3 minutes

---

### 2. **02_demographic_analysis.Rmd** - Population Dynamics
**Purpose**: Analyze demographic patterns and population changes over time

**Prerequisite**: Must run `scripts/R/02_transform_data.R` first to generate tidy data

**Key outputs**:
- Population time series (total and by genus)
- Recruitment rates over time
- Mortality rates over time
- Net population change
- Growth rate distributions
- Size-frequency histograms
- Multi-panel summary figure

**Runtime**: ~3-5 minutes

---

### 3. **03_survival_analysis.Rmd** - Survival Analysis
**Purpose**: Kaplan-Meier survival curves and Cox proportional hazards models

**Prerequisite**: Requires processed data from transformation script

**Key outputs**:
- Overall survival curves
- Survival by genus (with log-rank tests)
- Cox model hazard ratios
- Size-dependent mortality analysis
- Median survival times
- Model diagnostics

**Runtime**: ~4-6 minutes

---

## Setup Requirements

### Install R Packages

```r
# Install renv for package management
install.packages("renv")

# Restore project environment
renv::restore()
```

### Or install packages manually:

```r
install.packages(c(
  "tidyverse",    # Data manipulation and visualization
  "readxl",       # Excel file reading
  "here",         # Path management
  "janitor",      # Data cleaning
  "knitr",        # Report generation
  "patchwork",    # Multi-panel figures
  "survival",     # Survival analysis
  "survminer",    # Survival visualization
  "arrow"         # Parquet file support
))
```

---

## Running the Notebooks

### Option 1: RStudio
1. Open RStudio
2. Navigate to `notebooks/` directory
3. Open desired `.Rmd` file
4. Click "Knit" button to generate HTML output

### Option 2: Command Line
```bash
# Render a specific notebook
Rscript -e "rmarkdown::render('notebooks/01_data_exploration.Rmd')"

# Render all notebooks
Rscript -e "lapply(list.files('notebooks', pattern='*.Rmd', full.names=TRUE), rmarkdown::render)"
```

---

## Output Locations

All notebook outputs are saved to:
- **HTML reports**: Same directory as `.Rmd` file
- **Figures**: `outputs/figures/`
- **Data exports**: `data/processed/`

---

## Data Pipeline Overview

```
Raw Excel Data
     ↓
[scripts/R/01_validate_data.R]  ← Data quality checks
     ↓
[scripts/R/02_transform_data.R]  ← Wide → Long transformation
     ↓
Processed CSV/Parquet
     ↓
[R Markdown Notebooks]  ← Analysis and visualization
     ↓
HTML Reports + Figures
```

---

## Notebook Templates

Each notebook follows this structure:

1. **Setup**: Load libraries and source utility functions
2. **Data Loading**: Read processed data
3. **Analysis Sections**: Modular analysis with visualizations
4. **Summary**: Key findings and next steps
5. **Session Info**: R version and package versions

---

## Customization

### Modify Figure Output
```r
# In setup chunk, adjust:
knitr::opts_chunk$set(
  fig.width = 12,   # Change width
  fig.height = 8,   # Change height
  dpi = 300         # Change resolution
)
```

### Change Color Schemes
```r
# Edit in scripts/R/utils.R:
genus_colors() function
fate_colors() function
```

### Add New Analyses
Create new notebook with template:

```r
---
title: "Your Analysis Title"
output: html_document
---

{r setup}
library(here)
library(tidyverse)
source(here("scripts/R/utils.R"))


{r load-data}
coral_data <- read_csv(here("data/processed/coral_long_format.csv"))


# Your analysis here...
```

---

## Troubleshooting

**Problem**: "Cannot find file"
- **Solution**: Make sure you're using `here()` for all file paths
- Check working directory with `getwd()`

**Problem**: Missing processed data
- **Solution**: Run `Rscript scripts/R/02_transform_data.R` first

**Problem**: Package not found
- **Solution**: Run `renv::restore()` or install packages manually

**Problem**: Out of memory
- **Solution**: Close other R sessions, or process data in chunks

---

## Citation

If you use these analyses, please cite:

```
MCR LTER Back Reef Coral Monitoring Program (2013-2024)
Moorea Coral Reef Long Term Ecological Research
```

---

## Contact

For questions about the analysis code, see the project README or open an issue on GitHub.
