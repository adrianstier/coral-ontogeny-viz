#!/usr/bin/env Rscript
# Data Transformation Script for Coral Ontogeny Dataset
# Converts wide-format Excel data (no headers) to tidy long-format CSV
#
# Input: Excel file with no header row
#   - Cols 1-8: coral_id, site, habitat, transect, genus, x, y, z
#   - Cols 9+: Year blocks (8 cols each): diam1, diam2, height, observer, status, calc, empty, fate
#
# Output: Long-format CSV/Parquet with one row per colony-year

library(here)
library(tidyverse)
library(readxl)
library(janitor)

source(here("scripts/R/utils.R"))

print_header("CORAL DATA TRANSFORMATION")

# Configuration
RAW_DATA_PATH <- here("data/raw/LTER_1_Back_Reef_Transects_1-2_2013-2024.xlsx")
OUTPUT_CSV <- here("data/processed/coral_long_format.csv")
OUTPUT_PARQUET <- here("data/processed/coral_enriched.parquet")
SUMMARY_PATH <- here("data/processed/summary_statistics.rds")

# Ensure output directory exists
dir.create(here("data/processed"), recursive = TRUE, showWarnings = FALSE)

# ============================================================================
# 1. LOAD RAW DATA
# ============================================================================
cat("1. Loading raw data...\n")

coral_raw <- read_excel(RAW_DATA_PATH, col_names = FALSE)

# Assign metadata column names
metadata_names <- c("coral_id", "site", "habitat", "transect", "genus", "x", "y", "z")
names(coral_raw)[1:8] <- metadata_names

cat("✓ Loaded", nrow(coral_raw), "colonies with", ncol(coral_raw), "columns\n\n")

# ============================================================================
# 2. PARSE YEAR BLOCKS INTO LONG FORMAT
# ============================================================================
cat("2. Reshaping year data to long format...\n")

# Constants
N_META_COLS <- 8
COLS_PER_YEAR <- 8
YEARS <- 2013:2023

# Year block columns within each block (relative to block start)
# Based on exploration: diam1, diam2, height, observer, status, calc_field, empty, fate
year_block_names <- c("diam1", "diam2", "height", "observer", "status", "size_calc", "notes", "fate")

# Extract metadata
coral_metadata <- coral_raw %>%
  select(all_of(metadata_names)) %>%
  mutate(
    coral_id = as.integer(coral_id),
    x = as.numeric(x),
    y = as.numeric(y),
    z = as.numeric(z),
    # Expand genus abbreviations
    genus_full = case_when(
      genus == "Poc" ~ "Pocillopora",
      genus == "Por" ~ "Porites",
      genus == "Acr" ~ "Acropora",
      genus == "Mil" ~ "Millepora",
      TRUE ~ genus
    )
  )

# Build long format by iterating through year blocks
coral_long <- tibble()

for (i in seq_along(YEARS)) {
  year <- YEARS[i]
  cat("  Processing year", year, "...\n")

  # Calculate column indices for this year block
  block_start <- N_META_COLS + (i - 1) * COLS_PER_YEAR + 1
  block_end <- block_start + COLS_PER_YEAR - 1

  # Extract year block columns
  year_cols <- coral_raw[, block_start:block_end]
  names(year_cols) <- year_block_names

  # Combine with metadata
  year_data <- bind_cols(coral_metadata, year_cols) %>%
    mutate(year = year)

  # Append to long format
  coral_long <- bind_rows(coral_long, year_data)
}

cat("✓ Reshaped to long format:", nrow(coral_long), "observations\n")
cat("  Colonies:", n_distinct(coral_long$coral_id), "\n")
cat("  Years:", paste(range(coral_long$year), collapse = " - "), "\n\n")

# ============================================================================
# 3. PARSE AND CLEAN MEASUREMENTS
# ============================================================================
cat("3. Parsing and cleaning measurements...\n")

# Helper function to parse measurements (handles Na, UK, D, etc.)
parse_measurement_vec <- function(x) {
  x_clean <- str_trim(toupper(as.character(x)))
  result <- ifelse(x_clean %in% c("NA", "UK", "D", "ED", "FI", "R", ""), NA_real_,
                   suppressWarnings(as.numeric(x)))
  return(result)
}

# Parse measurement columns
coral_long <- coral_long %>%
  mutate(
    diam1 = parse_measurement_vec(diam1),
    diam2 = parse_measurement_vec(diam2),
    height = parse_measurement_vec(height),
    # Clean status and fate
    status = str_trim(toupper(as.character(status))),
    fate = str_trim(as.character(fate)),
    # Convert observer to character
    observer = as.character(observer)
  )

# Count valid measurements
n_valid <- coral_long %>%
  summarise(
    diam1 = sum(!is.na(diam1)),
    diam2 = sum(!is.na(diam2)),
    height = sum(!is.na(height))
  )

cat("✓ Parsed measurements:\n")
cat("  Valid Diam1:", n_valid$diam1, "/", nrow(coral_long), "\n")
cat("  Valid Diam2:", n_valid$diam2, "/", nrow(coral_long), "\n")
cat("  Valid Height:", n_valid$height, "/", nrow(coral_long), "\n\n")

# ============================================================================
# 4. COMPUTE DERIVED METRICS
# ============================================================================
cat("4. Computing derived metrics...\n")

coral_long <- coral_long %>%
  mutate(
    # Geometric mean diameter
    geom_mean_diam = ifelse(!is.na(diam1) & !is.na(diam2) & diam1 > 0 & diam2 > 0,
                            sqrt(diam1 * diam2), NA_real_),

    # Volume proxy (ellipsoid approximation)
    volume_proxy = ifelse(!is.na(diam1) & !is.na(diam2) & !is.na(height) &
                          diam1 > 0 & diam2 > 0 & height > 0,
                          (diam1 * diam2 * height) / 6, NA_real_),

    # Log-transformed metrics
    log_geom_mean = ifelse(!is.na(geom_mean_diam) & geom_mean_diam > 0,
                           log(geom_mean_diam), NA_real_),
    log_volume = ifelse(!is.na(volume_proxy) & volume_proxy > 0,
                        log(volume_proxy), NA_real_)
  )

cat("✓ Computed derived metrics:\n")
cat("  - Geometric mean diameter (sqrt(diam1 * diam2))\n")
cat("  - Volume proxy ((diam1 * diam2 * height) / 6)\n")
cat("  - Log-transformed metrics\n\n")

# ============================================================================
# 5. COMPUTE GROWTH RATES
# ============================================================================
cat("5. Computing growth rates...\n")

coral_long <- coral_long %>%
  group_by(coral_id) %>%
  arrange(year) %>%
  mutate(
    # Lagged size metrics
    geom_mean_lag = lag(geom_mean_diam),
    volume_lag = lag(volume_proxy),

    # Log growth rates (proportional)
    growth_rate_diam = ifelse(!is.na(geom_mean_lag) & geom_mean_lag > 0 &
                              !is.na(geom_mean_diam) & geom_mean_diam > 0,
                              log(geom_mean_diam / geom_mean_lag), NA_real_),
    growth_rate_volume = ifelse(!is.na(volume_lag) & volume_lag > 0 &
                                !is.na(volume_proxy) & volume_proxy > 0,
                                log(volume_proxy / volume_lag), NA_real_),

    # Absolute growth
    growth_abs_diam = geom_mean_diam - geom_mean_lag,
    growth_abs_volume = volume_proxy - volume_lag
  ) %>%
  ungroup()

n_growth_obs <- sum(!is.na(coral_long$growth_rate_diam))
cat("✓ Computed growth rates for", n_growth_obs, "transitions\n\n")

# ============================================================================
# 6. CLASSIFY DEMOGRAPHIC EVENTS
# ============================================================================
cat("6. Classifying demographic events...\n")

# Standardize fate classification
coral_long <- coral_long %>%
  mutate(
    fate_clean = case_when(
      str_detect(tolower(fate), "recruit") ~ "recruitment",
      str_detect(tolower(fate), "death|dead") ~ "death",
      str_detect(tolower(fate), "growth") ~ "growth",
      str_detect(tolower(fate), "shrink") ~ "shrinkage",
      str_detect(tolower(fate), "fiss") ~ "fission",
      str_detect(tolower(fate), "fus") ~ "fusion",
      str_detect(tolower(fate), "edge") ~ "edge",
      str_detect(tolower(fate), "stable|same") ~ "stable",
      is.na(fate) | fate == "" ~ NA_character_,
      TRUE ~ "other"
    )
  )

# Fate distribution
fate_counts <- coral_long %>%
  filter(!is.na(fate_clean)) %>%
  count(fate_clean, sort = TRUE)

cat("✓ Fate classification:\n")
print(fate_counts)
cat("\n")

# ============================================================================
# 7. COMPUTE COLONY-LEVEL DEMOGRAPHICS
# ============================================================================
cat("7. Computing colony-level demographics...\n")

# For each colony, identify lifespan and key events
colony_summary <- coral_long %>%
  filter(!is.na(diam1)) %>%  # Only years with measurements
  group_by(coral_id) %>%
  summarise(
    first_year = min(year),
    last_year = max(year),
    n_years_observed = n(),
    died = any(fate_clean == "death", na.rm = TRUE),
    death_year = ifelse(died, max(year[fate_clean == "death"], na.rm = TRUE), NA_integer_),
    is_recruit = first_year > 2013,  # Appeared after baseline
    recruit_year = ifelse(is_recruit, first_year, NA_integer_),
    .groups = "drop"
  ) %>%
  mutate(lifespan = last_year - first_year)

# Join back to long format
coral_long <- coral_long %>%
  left_join(colony_summary %>%
              select(coral_id, first_year, last_year, lifespan, died, is_recruit),
            by = "coral_id")

cat("✓ Colony demographics computed:\n")
cat("  Total colonies:", n_distinct(coral_long$coral_id), "\n")
cat("  Recruits (after 2013):", sum(colony_summary$is_recruit, na.rm = TRUE), "\n")
cat("  Deaths observed:", sum(colony_summary$died, na.rm = TRUE), "\n")
cat("  Mean lifespan:", round(mean(colony_summary$lifespan, na.rm = TRUE), 2), "years\n\n")

# ============================================================================
# 8. ADD DATA QUALITY FLAGS
# ============================================================================
cat("8. Adding data quality flags...\n")

coral_long <- coral_long %>%
  mutate(
    # Flag implausible measurements
    flag_large_diam = (diam1 > 200 | diam2 > 200),
    flag_large_height = (height > 100),
    flag_negative = (diam1 < 0 | diam2 < 0 | height < 0),

    # Extreme growth rates (>300% or <-50% per year)
    flag_extreme_growth = (!is.na(growth_rate_diam) &
                           (growth_rate_diam > log(4) | growth_rate_diam < log(0.5))),

    # Any flag
    has_flag = coalesce(flag_large_diam, FALSE) |
               coalesce(flag_large_height, FALSE) |
               coalesce(flag_negative, FALSE) |
               coalesce(flag_extreme_growth, FALSE)
  )

n_flagged <- sum(coral_long$has_flag, na.rm = TRUE)
cat("✓ Quality flags added\n")
cat("  Observations flagged:", n_flagged, "(", round(n_flagged/nrow(coral_long)*100, 2), "%)\n\n")

# ============================================================================
# 9. FINALIZE AND EXPORT
# ============================================================================
cat("9. Exporting processed data...\n")

# Select and order columns for export
coral_export <- coral_long %>%
  select(
    # Identifiers
    coral_id, transect, genus, genus_full, year,
    # Spatial
    x, y, z,
    # Measurements
    diam1, diam2, height,
    # Derived metrics
    geom_mean_diam, volume_proxy, log_geom_mean, log_volume,
    # Growth
    growth_rate_diam, growth_rate_volume, growth_abs_diam, growth_abs_volume,
    # Fate
    fate = fate_clean,
    # Demographics
    first_year, last_year, lifespan, died, is_recruit,
    # Metadata
    observer, status
  )

# Export to CSV (without flags for clean export)
write_csv(coral_export, OUTPUT_CSV)
cat("✓ Saved CSV to:", OUTPUT_CSV, "\n")
cat("  Size:", round(file.info(OUTPUT_CSV)$size / 1024, 1), "KB\n")
cat("  Rows:", nrow(coral_export), "\n")

# Export to Parquet (with all columns including flags)
if (requireNamespace("arrow", quietly = TRUE)) {
  arrow::write_parquet(coral_long, OUTPUT_PARQUET)
  cat("✓ Saved Parquet to:", OUTPUT_PARQUET, "\n")
  cat("  Size:", round(file.info(OUTPUT_PARQUET)$size / 1024, 1), "KB\n")
} else {
  cat("⚠ Arrow package not available - skipping Parquet export\n")
}

# ============================================================================
# 10. GENERATE SUMMARY STATISTICS
# ============================================================================
cat("\n10. Generating summary statistics...\n")

summary_stats <- list(
  created = Sys.time(),
  n_colonies = n_distinct(coral_export$coral_id),
  n_observations = nrow(coral_export),
  years = range(coral_export$year),
  genera = unique(coral_export$genus),
  transects = unique(coral_export$transect),

  # Genus counts
  genus_counts = coral_export %>%
    distinct(coral_id, .keep_all = TRUE) %>%
    count(genus_full, name = "n_colonies"),

  # Transect counts
  transect_counts = coral_export %>%
    distinct(coral_id, .keep_all = TRUE) %>%
    count(transect, name = "n_colonies"),

  # Demographics
  n_recruits = sum(colony_summary$is_recruit, na.rm = TRUE),
  n_deaths = sum(colony_summary$died, na.rm = TRUE),
  mean_lifespan = mean(colony_summary$lifespan, na.rm = TRUE),

  # Measurement summary
  measurement_summary = coral_export %>%
    filter(!is.na(geom_mean_diam)) %>%
    summarise(
      n_valid = n(),
      mean_diam = mean(geom_mean_diam, na.rm = TRUE),
      median_diam = median(geom_mean_diam, na.rm = TRUE),
      sd_diam = sd(geom_mean_diam, na.rm = TRUE),
      mean_height = mean(height, na.rm = TRUE),
      median_height = median(height, na.rm = TRUE)
    ),

  # Fate summary
  fate_counts = fate_counts
)

saveRDS(summary_stats, SUMMARY_PATH)
cat("✓ Summary statistics saved to:", SUMMARY_PATH, "\n")

# ============================================================================
# FINAL SUMMARY
# ============================================================================
print_header("TRANSFORMATION COMPLETE")

cat("Input:  ", basename(RAW_DATA_PATH), "\n")
cat("Output: ", basename(OUTPUT_CSV), "\n\n")

cat("Dataset Statistics:\n")
cat("  Colonies:      ", summary_stats$n_colonies, "\n")
cat("  Observations:  ", summary_stats$n_observations, "\n")
cat("  Years:         ", paste(summary_stats$years, collapse = " - "), "\n")
cat("  Genera:        ", paste(summary_stats$genera, collapse = ", "), "\n")
cat("  Transects:     ", paste(summary_stats$transects, collapse = ", "), "\n")
cat("  Recruits:      ", summary_stats$n_recruits, "\n")
cat("  Deaths:        ", summary_stats$n_deaths, "\n")
cat("  Mean lifespan: ", round(summary_stats$mean_lifespan, 1), " years\n")

cat("\n✓✓✓ Transformation complete! ✓✓✓\n")
