#!/usr/bin/env Rscript
# Data Exploration Script - Understand the actual Excel structure
# Run this first to understand the data format before transformation

library(here)
library(tidyverse)
library(readxl)

cat("=" %>% rep(70) %>% paste(collapse=""), "\n")
cat("CORAL DATA EXPLORATION\n")
cat("=" %>% rep(70) %>% paste(collapse=""), "\n\n")

# Configuration
RAW_DATA_PATH <- here("data/raw/LTER_1_Back_Reef_Transects_1-2_2013-2024.xlsx")

# Load raw data without column names
cat("Loading raw data (no headers)...\n")
data_raw <- read_excel(RAW_DATA_PATH, col_names = FALSE)
cat("Dimensions:", nrow(data_raw), "rows x", ncol(data_raw), "columns\n\n")

# Show first 10 rows to understand structure
cat("First 10 rows of data:\n")
cat("-" %>% rep(70) %>% paste(collapse=""), "\n")
print(as.data.frame(data_raw[1:10, 1:15]))

cat("\n\nColumn analysis:\n")
cat("-" %>% rep(70) %>% paste(collapse=""), "\n")

# Analyze column patterns
for (i in 1:min(20, ncol(data_raw))) {
  col_data <- data_raw[[i]]
  unique_vals <- unique(col_data[!is.na(col_data)])
  n_unique <- length(unique_vals)
  sample_vals <- head(unique_vals, 5)

  cat(sprintf("Col %2d: %d unique values. Sample: %s\n",
              i, n_unique, paste(sample_vals, collapse=", ")))
}

cat("\n\nInferred column structure:\n")
cat("-" %>% rep(70) %>% paste(collapse=""), "\n")
cat("Based on data patterns, columns appear to be:\n")
cat("  Col 1: Coral ID (unique identifier)\n")
cat("  Col 2: Site (LTER1)\n")
cat("  Col 3: Habitat (BR = Back Reef)\n")
cat("  Col 4: Transect (T01, T02)\n")
cat("  Col 5: Genus (Poc, Por, Acr, Mil)\n")
cat("  Col 6: X coordinate\n")
cat("  Col 7: Y coordinate\n")
cat("  Col 8: Z coordinate\n")
cat("  Col 9+: Year-by-year measurements (Diam1, Diam2, Height, Observer, Status, Fate, etc.)\n")

# Count observations per transect and genus
cat("\n\nData summary:\n")
cat("-" %>% rep(70) %>% paste(collapse=""), "\n")

# Transect distribution
transect_counts <- table(data_raw[[4]])
cat("\nTransect distribution:\n")
print(transect_counts)

# Genus distribution
genus_counts <- table(data_raw[[5]])
cat("\nGenus distribution:\n")
print(genus_counts)

# Coordinate ranges
cat("\nCoordinate ranges:\n")
x_vals <- as.numeric(data_raw[[6]])
y_vals <- as.numeric(data_raw[[7]])
z_vals <- as.numeric(data_raw[[8]])

cat(sprintf("  X: %.3f - %.3f\n", min(x_vals, na.rm=TRUE), max(x_vals, na.rm=TRUE)))
cat(sprintf("  Y: %.3f - %.3f\n", min(y_vals, na.rm=TRUE), max(y_vals, na.rm=TRUE)))
cat(sprintf("  Z: %.3f - %.3f\n", min(z_vals, na.rm=TRUE), max(z_vals, na.rm=TRUE)))

cat("\n\nExploration complete!\n")
