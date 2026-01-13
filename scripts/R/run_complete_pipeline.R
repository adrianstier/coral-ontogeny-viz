#!/usr/bin/env Rscript
# Master Analysis Pipeline Script
# Runs complete coral ontogeny analysis from raw data to final outputs

library(here)

cat("\n")
cat("╔════════════════════════════════════════════════════════════════════╗\n")
cat("║          CORAL ONTOGENY COMPLETE ANALYSIS PIPELINE                 ║\n")
cat("║                  MCR LTER Back Reef Transects                      ║\n")
cat("╚════════════════════════════════════════════════════════════════════╝\n")
cat("\n")
cat("Started:", format(Sys.time(), "%Y-%m-%d %H:%M:%S"), "\n\n")

# Track overall start time
pipeline_start <- Sys.time()

# ============================================================================
# STEP 1: Data Validation
# ============================================================================

cat("STEP 1: Data Validation\n")
cat(strrep("-", 70), "\n")

validation_start <- Sys.time()

tryCatch({
  source(here("scripts/R/01_validate_data.R"))
  validation_duration <- as.numeric(difftime(Sys.time(), validation_start, units = "secs"))
  cat("\n✓ Data validation complete (", round(validation_duration, 1), "s)\n\n", sep = "")
  validation_success <- TRUE
}, error = function(e) {
  cat("\n✗ Data validation failed:", conditionMessage(e), "\n\n")
  validation_success <- FALSE
})

# ============================================================================
# STEP 2: Data Transformation
# ============================================================================

cat("STEP 2: Data Transformation\n")
cat(strrep("-", 70), "\n")

transformation_start <- Sys.time()

tryCatch({
  source(here("scripts/R/02_transform_data.R"))
  transformation_duration <- as.numeric(difftime(Sys.time(), transformation_start, units = "secs"))
  cat("\n✓ Data transformation complete (", round(transformation_duration, 1), "s)\n\n", sep = "")
  transformation_success <- TRUE
}, error = function(e) {
  cat("\n✗ Data transformation failed:", conditionMessage(e), "\n\n")
  transformation_success <- FALSE
  stop("Cannot proceed without transformed data")
})

# ============================================================================
# STEP 3: Generate Publication Figures
# ============================================================================

cat("STEP 3: Generate Publication Figures\n")
cat(strrep("-", 70), "\n")

figures_start <- Sys.time()

tryCatch({
  source(here("scripts/R/04_generate_figures.R"))
  figures_duration <- as.numeric(difftime(Sys.time(), figures_start, units = "secs"))
  cat("\n✓ Figure generation complete (", round(figures_duration, 1), "s)\n\n", sep = "")
  figures_success <- TRUE
}, error = function(e) {
  cat("\n✗ Figure generation failed:", conditionMessage(e), "\n\n")
  figures_success <- FALSE
})

# ============================================================================
# STEP 4: Generate Analysis Reports
# ============================================================================

cat("STEP 4: Generate Analysis Reports\n")
cat(strrep("-", 70), "\n")

reports_start <- Sys.time()

tryCatch({
  source(here("scripts/R/05_generate_report.R"))
  reports_duration <- as.numeric(difftime(Sys.time(), reports_start, units = "secs"))
  cat("\n✓ Report generation complete (", round(reports_duration, 1), "s)\n\n", sep = "")
  reports_success <- TRUE
}, error = function(e) {
  cat("\n✗ Report generation failed:", conditionMessage(e), "\n\n")
  reports_success <- FALSE
})

# ============================================================================
# PIPELINE SUMMARY
# ============================================================================

pipeline_duration <- as.numeric(difftime(Sys.time(), pipeline_start, units = "secs"))

cat("\n")
cat("╔════════════════════════════════════════════════════════════════════╗\n")
cat("║                      PIPELINE SUMMARY                              ║\n")
cat("╚════════════════════════════════════════════════════════════════════╝\n")
cat("\n")

cat("Total Duration:", round(pipeline_duration, 1), "seconds\n\n")

cat("Step Results:\n")
cat("  1. Data Validation:      ", if(validation_success) "✓ Success" else "✗ Failed", "\n", sep = "")
cat("  2. Data Transformation:  ", if(transformation_success) "✓ Success" else "✗ Failed", "\n", sep = "")
cat("  3. Figure Generation:    ", if(figures_success) "✓ Success" else "✗ Failed", "\n", sep = "")
cat("  4. Report Generation:    ", if(reports_success) "✓ Success" else "✗ Failed", "\n", sep = "")

cat("\nOutputs Generated:\n")

# Check outputs
outputs <- list(
  "Processed CSV" = here("data/processed/coral_long_format.csv"),
  "Processed Parquet" = here("data/processed/coral_enriched.parquet"),
  "Quality Report" = here("outputs/reports/data_quality_report.html"),
  "Analysis Index" = here("outputs/reports/index.html"),
  "Executive Summary" = here("outputs/reports/executive_summary.html")
)

for (name in names(outputs)) {
  path <- outputs[[name]]
  exists <- file.exists(path)
  size <- if(exists) file.info(path)$size / 1024 else 0

  cat(sprintf("  %-20s %s %s\n",
              paste0(name, ":"),
              if(exists) "✓" else "✗",
              if(exists) paste0("(", round(size, 1), " KB)") else "(not found)"))
}

# Count figures
fig_dir <- here("outputs/figures")
if (dir.exists(fig_dir)) {
  fig_files <- list.files(fig_dir, pattern = "\\.(png|pdf)$")
  cat("  Figures:             ✓", length(fig_files), "files\n")
}

# Overall status
all_success <- validation_success && transformation_success && figures_success && reports_success

cat("\n")
if (all_success) {
  cat("✓✓✓ COMPLETE ANALYSIS PIPELINE FINISHED SUCCESSFULLY! ✓✓✓\n")
  cat("\nTo view results:\n")
  cat("  1. Open in browser: file://", normalizePath(here("outputs/reports/index.html")), "\n", sep = "")
  cat("  2. Browse figures: ", normalizePath(here("outputs/figures")), "\n", sep = "")
  cat("  3. Load data: ", normalizePath(here("data/processed/coral_long_format.csv")), "\n", sep = "")
} else {
  cat("⚠ PIPELINE COMPLETED WITH SOME ERRORS\n")
  cat("Review error messages above for details\n")
}

cat("\n")
cat("Completed:", format(Sys.time(), "%Y-%m-%d %H:%M:%S"), "\n")
cat("\n")
