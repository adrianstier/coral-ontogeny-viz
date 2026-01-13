#!/usr/bin/env Rscript
# Data Validation Script for Coral Ontogeny Dataset
# Performs automated quality checks on raw Excel data
#
# This script handles the actual Excel format which has:
# - No header row (data starts on row 1)
# - Columns 1-8: Metadata (ID, Site, Habitat, Transect, Genus, X, Y, Z)
# - Columns 9+: Year blocks with measurements

library(here)
library(tidyverse)
library(readxl)
library(janitor)

source(here("scripts/R/utils.R"))

print_header("CORAL DATA VALIDATION")

# Configuration
RAW_DATA_PATH <- here("data/raw/LTER_1_Back_Reef_Transects_1-2_2013-2024.xlsx")
REPORT_PATH <- here("outputs/reports/data_quality_report.html")

# Ensure output directory exists
dir.create(here("outputs/reports"), recursive = TRUE, showWarnings = FALSE)

# ============================================================================
# 1. LOAD DATA WITH PROPER STRUCTURE
# ============================================================================
cat("1. LOADING DATA\n")
cat(strrep("-", 40), "\n")

# Load data without headers (the file has no header row)
coral_raw <- read_excel(RAW_DATA_PATH, col_names = FALSE)

# Assign proper column names for metadata
metadata_names <- c("coral_id", "site", "habitat", "transect", "genus", "x", "y", "z")
names(coral_raw)[1:8] <- metadata_names

cat("✓ Data loaded:", nrow(coral_raw), "rows ×", ncol(coral_raw), "columns\n\n")

# Initialize validation results
validation_results <- list()
issues <- list()

# ============================================================================
# 2. METADATA VALIDATION
# ============================================================================
cat("2. METADATA VALIDATION\n")
cat(strrep("-", 40), "\n")

# Check required metadata columns exist
if (all(metadata_names %in% names(coral_raw))) {
  cat("✓ All metadata columns present\n")
  validation_results$metadata_columns <- TRUE
} else {
  cat("✗ Missing metadata columns\n")
  issues$missing_metadata <- setdiff(metadata_names, names(coral_raw))
}

# Check for unique coral IDs
n_unique_ids <- n_distinct(coral_raw$coral_id)
n_rows <- nrow(coral_raw)

if (n_unique_ids == n_rows) {
  cat("✓ All coral IDs are unique (", n_unique_ids, "colonies)\n")
} else {
  cat("⚠ Duplicate coral IDs detected:", n_rows - n_unique_ids, "duplicates\n")
  issues$duplicate_ids <- coral_raw %>%
    count(coral_id) %>%
    filter(n > 1)
}

cat("\n")

# ============================================================================
# 3. GENUS VALIDATION
# ============================================================================
cat("3. GENUS VALIDATION\n")
cat(strrep("-", 40), "\n")

expected_genera <- c("Poc", "Por", "Acr", "Mil")
observed_genera <- unique(coral_raw$genus)
observed_genera <- observed_genera[!is.na(observed_genera)]

unexpected_genera <- setdiff(observed_genera, expected_genera)

if (length(unexpected_genera) == 0) {
  cat("✓ All genera are expected (Poc, Por, Acr, Mil)\n")
} else {
  cat("⚠ Unexpected genera found:", paste(unexpected_genera, collapse = ", "), "\n")
  issues$unexpected_genera <- unexpected_genera
}

# Genus distribution
genus_counts <- coral_raw %>%
  count(genus, sort = TRUE) %>%
  mutate(
    percent = round(n / sum(n) * 100, 1),
    full_name = case_when(
      genus == "Poc" ~ "Pocillopora",
      genus == "Por" ~ "Porites",
      genus == "Acr" ~ "Acropora",
      genus == "Mil" ~ "Millepora",
      TRUE ~ genus
    )
  )

cat("\nGenus distribution:\n")
print(genus_counts)

validation_results$genus_counts <- genus_counts
cat("\n")

# ============================================================================
# 4. TRANSECT VALIDATION
# ============================================================================
cat("4. TRANSECT VALIDATION\n")
cat(strrep("-", 40), "\n")

expected_transects <- c("T01", "T02")
observed_transects <- unique(coral_raw$transect)

if (all(observed_transects %in% expected_transects)) {
  cat("✓ All transects are expected (T01, T02)\n")
} else {
  unexpected <- setdiff(observed_transects, expected_transects)
  cat("⚠ Unexpected transects:", paste(unexpected, collapse = ", "), "\n")
  issues$unexpected_transects <- unexpected
}

transect_counts <- coral_raw %>% count(transect, sort = TRUE)
cat("\nTransect distribution:\n")
print(transect_counts)

validation_results$transect_counts <- transect_counts
cat("\n")

# ============================================================================
# 5. SPATIAL VALIDATION
# ============================================================================
cat("5. SPATIAL VALIDATION\n")
cat(strrep("-", 40), "\n")

# Convert coordinates to numeric
coral_raw <- coral_raw %>%
  mutate(
    x = as.numeric(x),
    y = as.numeric(y),
    z = as.numeric(z)
  )

# Check spatial bounds (transects are 1m x 5m, but data shows larger range)
x_range <- range(coral_raw$x, na.rm = TRUE)
y_range <- range(coral_raw$y, na.rm = TRUE)
z_range <- range(coral_raw$z, na.rm = TRUE)

cat("Spatial coordinate ranges:\n")
cat(sprintf("  X: %.3f - %.3f m\n", x_range[1], x_range[2]))
cat(sprintf("  Y: %.3f - %.3f m\n", y_range[1], y_range[2]))
cat(sprintf("  Z: %.3f - %.3f m\n", z_range[1], z_range[2]))

# Note: The PRD says transects are 1m x 5m, but actual data shows:
# X: 0-5m (across transect width)
# Y: 0-100 (along transect length, possibly cm)
# This needs verification with domain expert

validation_results$spatial_ranges <- list(x = x_range, y = y_range, z = z_range)
cat("\n")

# ============================================================================
# 6. YEAR BLOCK STRUCTURE VALIDATION
# ============================================================================
cat("6. YEAR BLOCK STRUCTURE\n")
cat(strrep("-", 40), "\n")

n_metadata_cols <- 8
n_remaining_cols <- ncol(coral_raw) - n_metadata_cols

# Each year block should have 8 columns:
# Diam1, Diam2, Height, Observer, Status, (calc), (empty), Fate
cols_per_year <- 8
n_years_estimated <- n_remaining_cols / cols_per_year

cat("Metadata columns: 8\n")
cat("Measurement columns:", n_remaining_cols, "\n")
cat("Estimated year blocks:", n_years_estimated, "\n")

if (n_remaining_cols %% cols_per_year == 0) {
  cat("✓ Column count consistent with", n_years_estimated, "years of data\n")
  years <- 2013:(2013 + n_years_estimated - 1)
  cat("  Years covered:", paste(range(years), collapse = " - "), "\n")
} else {
  cat("⚠ Uneven column count - may indicate missing or extra columns\n")
  issues$column_structure <- "Uneven column count"
}

cat("\n")

# ============================================================================
# 7. MEASUREMENT SAMPLE VALIDATION
# ============================================================================
cat("7. MEASUREMENT SAMPLE VALIDATION\n")
cat(strrep("-", 40), "\n")

# Check first year's measurements (columns 9-11 should be Diam1, Diam2, Height)
first_year_diam1 <- coral_raw[[9]]
first_year_diam2 <- coral_raw[[10]]
first_year_height <- coral_raw[[11]]

# Parse measurements (handling Na, UK, D codes)
parse_values <- function(x) {
  x_clean <- str_trim(toupper(as.character(x)))
  ifelse(x_clean %in% c("NA", "UK", "D", ""), NA_real_, suppressWarnings(as.numeric(x)))
}

diam1_numeric <- parse_values(first_year_diam1)
diam2_numeric <- parse_values(first_year_diam2)
height_numeric <- parse_values(first_year_height)

# Check for valid numeric measurements
n_valid_diam1 <- sum(!is.na(diam1_numeric))
n_valid_diam2 <- sum(!is.na(diam2_numeric))
n_valid_height <- sum(!is.na(height_numeric))

cat("First year measurement validity:\n")
cat(sprintf("  Diam1: %d/%d valid (%.1f%%)\n",
            n_valid_diam1, nrow(coral_raw), n_valid_diam1/nrow(coral_raw)*100))
cat(sprintf("  Diam2: %d/%d valid (%.1f%%)\n",
            n_valid_diam2, nrow(coral_raw), n_valid_diam2/nrow(coral_raw)*100))
cat(sprintf("  Height: %d/%d valid (%.1f%%)\n",
            n_valid_height, nrow(coral_raw), n_valid_height/nrow(coral_raw)*100))

# Check for negative values
negative_count <- sum(diam1_numeric < 0 | diam2_numeric < 0 | height_numeric < 0, na.rm = TRUE)
if (negative_count == 0) {
  cat("✓ No negative measurements in first year\n")
} else {
  cat("✗", negative_count, "negative measurements found\n")
  issues$negative_measurements <- negative_count
}

# Measurement ranges
cat("\nMeasurement ranges (first year):\n")
cat(sprintf("  Diam1: %.2f - %.2f cm\n",
            min(diam1_numeric, na.rm = TRUE), max(diam1_numeric, na.rm = TRUE)))
cat(sprintf("  Diam2: %.2f - %.2f cm\n",
            min(diam2_numeric, na.rm = TRUE), max(diam2_numeric, na.rm = TRUE)))
cat(sprintf("  Height: %.2f - %.2f cm\n",
            min(height_numeric, na.rm = TRUE), max(height_numeric, na.rm = TRUE)))

validation_results$measurement_ranges <- list(
  diam1 = range(diam1_numeric, na.rm = TRUE),
  diam2 = range(diam2_numeric, na.rm = TRUE),
  height = range(height_numeric, na.rm = TRUE)
)

cat("\n")

# ============================================================================
# 8. SUMMARY
# ============================================================================
print_header("VALIDATION SUMMARY")

if (length(issues) == 0) {
  cat("✓✓✓ ALL VALIDATION CHECKS PASSED ✓✓✓\n")
  validation_status <- "PASS"
} else {
  cat("⚠⚠⚠ DATA QUALITY ISSUES DETECTED ⚠⚠⚠\n")
  cat("Number of issue categories:", length(issues), "\n\n")
  cat("Issues detected:\n")
  for (issue_name in names(issues)) {
    cat("  -", issue_name, "\n")
  }
  validation_status <- "WARN"
}

cat("\n")
cat("Dataset Summary:\n")
cat("  Total colonies:", nrow(coral_raw), "\n")
cat("  Total columns:", ncol(coral_raw), "\n")
cat("  Genera:", paste(genus_counts$genus, collapse = ", "), "\n")
cat("  Transects:", paste(transect_counts$transect, collapse = ", "), "\n")
cat("  Validation status:", validation_status, "\n")

# Save validation results
validation_summary <- list(
  date = Sys.Date(),
  status = validation_status,
  n_rows = nrow(coral_raw),
  n_cols = ncol(coral_raw),
  results = validation_results,
  issues = issues
)

saveRDS(validation_summary, here("outputs/reports/validation_results.rds"))
cat("\n✓ Validation results saved to outputs/reports/validation_results.rds\n")

# ============================================================================
# 9. GENERATE HTML REPORT
# ============================================================================
cat("\nGenerating HTML quality report...\n")

html_content <- sprintf('
<!DOCTYPE html>
<html>
<head>
  <title>Coral Data Quality Report</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 900px; margin: 40px auto; padding: 20px; }
    h1 { color: #2c3e50; border-bottom: 3px solid #3498db; padding-bottom: 10px; }
    h2 { color: #34495e; margin-top: 30px; }
    .pass { color: green; font-weight: bold; }
    .warn { color: orange; font-weight: bold; }
    .fail { color: red; font-weight: bold; }
    table { border-collapse: collapse; width: 100%%; margin: 15px 0; }
    th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
    th { background-color: #3498db; color: white; }
    tr:nth-child(even) { background-color: #f9f9f9; }
    .summary { background-color: #ecf0f1; padding: 20px; border-radius: 5px; margin: 20px 0; }
    .summary p { margin: 8px 0; }
  </style>
</head>
<body>
  <h1>Coral Data Quality Report</h1>

  <div class="summary">
    <p><strong>Date:</strong> %s</p>
    <p><strong>Dataset:</strong> LTER 1 Back Reef Transects 1-2 (2013-2024)</p>
    <p><strong>Colonies:</strong> %d</p>
    <p><strong>Columns:</strong> %d</p>
    <p><strong>Validation Status:</strong> <span class="%s">%s</span></p>
  </div>

  <h2>Genus Distribution</h2>
  <table>
    <tr><th>Genus</th><th>Full Name</th><th>Count</th><th>Percent</th></tr>
    %s
  </table>

  <h2>Transect Distribution</h2>
  <table>
    <tr><th>Transect</th><th>Count</th></tr>
    %s
  </table>

  <h2>Spatial Ranges</h2>
  <table>
    <tr><th>Coordinate</th><th>Min</th><th>Max</th></tr>
    <tr><td>X</td><td>%.3f m</td><td>%.3f m</td></tr>
    <tr><td>Y</td><td>%.3f m</td><td>%.3f m</td></tr>
    <tr><td>Z</td><td>%.3f m</td><td>%.3f m</td></tr>
  </table>

  <h2>Issues Detected</h2>
  %s

  <hr>
  <p><em>Generated by scripts/R/01_validate_data.R on %s</em></p>
</body>
</html>
',
format(Sys.Date(), "%%Y-%%m-%%d"),
nrow(coral_raw),
ncol(coral_raw),
tolower(validation_status),
validation_status,
paste(sprintf("<tr><td>%s</td><td>%s</td><td>%d</td><td>%.1f%%</td></tr>",
              genus_counts$genus, genus_counts$full_name, genus_counts$n, genus_counts$percent),
      collapse = "\n    "),
paste(sprintf("<tr><td>%s</td><td>%d</td></tr>",
              transect_counts$transect, transect_counts$n),
      collapse = "\n    "),
x_range[1], x_range[2],
y_range[1], y_range[2],
z_range[1], z_range[2],
if (length(issues) == 0) {
  '<p class="pass">No issues detected ✓</p>'
} else {
  paste("<ul>", paste(sprintf("<li><span class='warn'>%s</span></li>", names(issues)), collapse = "\n"), "</ul>")
},
format(Sys.time(), "%%Y-%%m-%%d %%H:%%M:%%S")
)

writeLines(html_content, REPORT_PATH)
cat("✓ HTML report saved to:", REPORT_PATH, "\n")

cat("\n✓ Validation complete!\n")
