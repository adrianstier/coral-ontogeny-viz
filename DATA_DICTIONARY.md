# Coral Ontogeny Data Dictionary

## Overview

This document defines all variables in the coral monitoring dataset, including raw measurements, derived metrics, and quality flags.

---

## Metadata Variables

**Collected once per colony, time-invariant**

| Variable | Type | Unit | Description | Example |
|----------|------|------|-------------|---------|
| `coral_id` | Character | - | Unique colony identifier | "T01_001" |
| `transect` | Factor | - | Transect designation | T01, T02 |
| `genus` | Factor | - | Coral genus | Pocillopora, Porites, Acropora, Millepora |
| `x` | Numeric | meters | Position across transect width | 0.0 - 1.0 |
| `y` | Numeric | meters | Position along transect length | 0.0 - 5.0 |
| `z` | Numeric | meters | Vertical position/depth | Variable |

---

## Raw Measurement Variables

**Collected annually per colony**

| Variable | Type | Unit | Description | Range | Missing Codes |
|----------|------|------|-------------|-------|---------------|
| `year` | Integer | - | Survey year | 2013 - 2024 | - |
| `diam1` | Numeric | cm | Maximum colony diameter | 0 - 200 | Na, UK, D |
| `diam2` | Numeric | cm | Perpendicular diameter | 0 - 200 | Na, UK, D |
| `height` | Numeric | cm | Colony height | 0 - 100 | Na, UK, D |
| `status` | Character | - | Colony status code | Various | - |
| `fate` | Character | - | Demographic event | See below | - |
| `observer` | Character | - | Observer initials | 2-3 letters | - |
| `notes` | Character | - | Field observations | Free text | - |
| `growth_ratio` | Numeric | - | Field-calculated growth | Numeric | - |

### Missing Data Codes

- **Na**: Not applicable (colony not present at that time)
- **UK**: Unknown or not recorded
- **D**: Dead (colony died before this measurement)

---

## Derived Metrics

**Computed by R transformation scripts**

### Size Metrics

| Variable | Formula | Unit | Description |
|----------|---------|------|-------------|
| `geom_mean_diam` | sqrt(diam1 × diam2) | cm | Geometric mean diameter |
| `volume_proxy` | (diam1 × diam2 × height) / 6 | cm³ | Ellipsoid volume approximation |
| `log_geom_mean` | log(geom_mean_diam) | log cm | Log-transformed diameter |
| `log_volume` | log(volume_proxy) | log cm³ | Log-transformed volume |

### Growth Metrics

| Variable | Formula | Unit | Description |
|----------|---------|------|-------------|
| `geom_mean_lag` | lag(geom_mean_diam) | cm | Previous year's diameter |
| `volume_lag` | lag(volume_proxy) | cm³ | Previous year's volume |
| `growth_rate_diam` | log(size_t / size_{t-1}) | log units | Proportional diameter growth |
| `growth_rate_volume` | log(vol_t / vol_{t-1}) | log units | Proportional volume growth |
| `growth_abs_diam` | geom_mean_diam - geom_mean_lag | cm | Absolute diameter change |
| `growth_abs_volume` | volume_proxy - volume_lag | cm³ | Absolute volume change |

**Note**: Log growth rates represent proportional changes. For example:
- log(1.2) ≈ 0.18 = 20% growth
- log(0.8) ≈ -0.22 = 20% shrinkage

### Demographic Variables

| Variable | Type | Description |
|----------|------|-------------|
| `first_year` | Integer | Year of first observation (recruitment or baseline) |
| `last_year` | Integer | Year of last observation |
| `lifespan` | Integer | Years in study (last_year - first_year) |
| `died` | Logical | TRUE if colony died during study |
| `death_year` | Integer | Year of death (NA if still alive) |
| `is_recruit` | Logical | TRUE if appeared after 2013 baseline |

---

## Quality Flags

**Automated data quality indicators**

| Flag | Condition | Description |
|------|-----------|-------------|
| `flag_large_diam` | diam1 > 200 OR diam2 > 200 | Implausibly large diameter |
| `flag_large_height` | height > 100 | Implausibly large height |
| `flag_negative` | diam1 < 0 OR diam2 < 0 OR height < 0 | Negative measurement |
| `flag_out_of_bounds` | x < 0 OR x > 1 OR y < 0 OR y > 5 | Outside transect boundaries |
| `flag_extreme_growth` | growth_rate > log(4) OR growth_rate < log(0.5) | >300% growth or >50% shrinkage |
| `any_flag` | ANY of the above | Composite flag for any issue |

---

## Fate Categories

| Code | Description | Interpretation |
|------|-------------|----------------|
| Growth | Colony increased in size | Positive demographic outcome |
| Shrinkage | Colony decreased in size | Partial mortality or stress |
| Death | Colony died | Complete mortality |
| Recruitment | New colony appeared | Larval settlement or fragmentation |
| Fission | Colony split into multiple | Asexual reproduction |
| Fusion | Multiple colonies merged | Growth or competitive outcome |
| Stable | No significant size change | Maintenance |

---

## Data Transformations

### Wide to Long Format

**Original (Wide) Format**:
```
Coral ID | Genus | X | Y | Z | Diam1_2013 | Diam2_2013 | Height_2013 | ... | Diam1_2024 | ...
```

**Transformed (Long/Tidy) Format**:
```
coral_id | genus | x | y | z | year | diam1 | diam2 | height | ...
```

### Processing Pipeline

1. **Load raw Excel**: `scripts/R/01_validate_data.R`
   - Schema validation
   - Missing data checks
   - Implausible value detection

2. **Transform to tidy format**: `scripts/R/02_transform_data.R`
   - Wide to long reshaping
   - Measurement parsing (handle Na, UK, D codes)
   - Derived metric calculation
   - Quality flag assignment

3. **Export formats**:
   - CSV: `data/processed/coral_long_format.csv` (human-readable)
   - Parquet: `data/processed/coral_enriched.parquet` (optimized)

---

## Data Usage Examples

### R

```r
# Load processed data
library(tidyverse)
library(here)

coral_data <- read_csv(here("data/processed/coral_long_format.csv"))

# Filter to live colonies in 2023
live_2023 <- coral_data %>%
  filter(year == 2023, !is.na(geom_mean_diam))

# Calculate mean growth rate by genus
growth_summary <- coral_data %>%
  filter(!is.na(growth_rate_diam)) %>%
  group_by(genus) %>%
  summarise(
    mean_growth = mean(growth_rate_diam, na.rm = TRUE),
    se_growth = sd(growth_rate_diam, na.rm = TRUE) / sqrt(n())
  )
```

### TypeScript

```typescript
// Load processed data in web app
import { csv } from 'd3';

const data = await csv('/data/coral_long_format.csv', (d) => ({
  coralId: d.coral_id,
  genus: d.genus,
  year: +d.year,
  diameter: +d.geom_mean_diam,
  volume: +d.volume_proxy,
  // ... other fields
}));

// Filter and aggregate
const pocillopora2023 = data.filter(d =>
  d.genus === 'Pocillopora' && d.year === 2023
);
```

---

## Measurement Protocols

### Size Measurements

- **Diam1**: Largest diameter across colony
- **Diam2**: Perpendicular to Diam1
- **Height**: Maximum vertical extent from substrate

**Measurement precision**: ±0.5 cm (field caliper precision)

### Spatial Coordinates

- **X**: Distance from transect baseline (0 = baseline, 1 = 1m perpendicular)
- **Y**: Distance along transect length (0 = origin, 5 = 5m end)
- **Z**: Depth or vertical position relative to reference

**Coordinate precision**: ±1 cm

---

## Quality Assurance

### Validation Checks

Run `Rscript scripts/R/01_validate_data.R` to generate:

- Schema validation report
- Missing data summary
- Outlier detection
- Spatial coverage check
- Temporal completeness
- HTML quality report: `outputs/reports/data_quality_report.html`

### Data Versioning

- **Raw data**: Immutable, version-controlled with Git LFS or documented separately
- **Processed data**: Regenerated from scripts, not version-controlled
- **Scripts**: Version-controlled, produce reproducible outputs
- **R environment**: Locked with `renv.lock` for package version consistency

---

## Citation

When using this dataset, please cite:

```
MCR LTER Back Reef Coral Monitoring Program (2013-2024)
Moorea Coral Reef Long Term Ecological Research
Principal Investigator: [Name]
Dataset DOI: [if available]
```

---

## Updates & Maintenance

**Last Updated**: 2026-01-12

**Maintained By**: Data Science Team

**Version**: 1.0

For questions about variable definitions or data quality, contact the project maintainers or open an issue on GitHub.
