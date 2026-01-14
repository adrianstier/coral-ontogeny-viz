#!/usr/bin/env Rscript
# Export Complete Webapp JSON
# Creates a single JSON file with all coral observations for the webapp

library(tidyverse)
library(jsonlite)

cat("============================================================\n")
cat("EXPORT WEBAPP JSON\n")
cat("============================================================\n\n")

# Configuration
INPUT_PATH <- "data/processed/coral_long_format.csv"
OUTPUT_PATH <- "public/data/coral_webapp.json"

# Load processed data
cat("Loading processed data...\n")
coral_data <- read_csv(INPUT_PATH, show_col_types = FALSE)
cat("✓ Loaded", nrow(coral_data), "observations for", n_distinct(coral_data$coral_id), "colonies\n\n")

# Transform to webapp format
cat("Transforming data for webapp...\n")

# First, identify death year for each colony
death_years <- coral_data %>%
  filter(!is.na(status) & status == "D") %>%
  group_by(coral_id) %>%
  summarise(death_year = min(year), .groups = "drop")

webapp_records <- coral_data %>%
  # Join with death years
  left_join(death_years, by = "coral_id") %>%
  # CRITICAL FIX: Only include observations UP TO AND INCLUDING death year
  # After a coral dies, it should not appear in subsequent years
  filter(is.na(death_year) | year <= death_year) %>%
  mutate(
    # died should be TRUE only when status == "D" for THIS observation
    died_this_year = !is.na(status) & status == "D",

    # Keep numeric fields, convert NA to null
    diam1 = if_else(is.na(diam1), NA_real_, diam1),
    diam2 = if_else(is.na(diam2), NA_real_, diam2),
    height = if_else(is.na(height), NA_real_, height),
    geom_mean_diam = if_else(is.na(geom_mean_diam), NA_real_, geom_mean_diam),
    volume_proxy = if_else(is.na(volume_proxy), NA_real_, volume_proxy),

    # Round numeric values for smaller file size
    across(c(x, y, z), ~round(.x, 3)),
    across(c(diam1, diam2, height, geom_mean_diam, volume_proxy), ~if_else(is.na(.x), NA_real_, round(.x, 3)))
  ) %>%
  select(
    coral_id,
    year,
    transect,
    genus,
    genus_full,
    x, y, z,
    diam1, diam2, height,
    geom_mean_diam,
    volume_proxy,
    fate,
    is_recruit,
    died = died_this_year  # Use the corrected field
  ) %>%
  arrange(coral_id, year)

# Create output structure
webapp_data <- list(
  metadata = list(
    name = "MCR LTER Back Reef Transects",
    years = range(coral_data$year, na.rm = TRUE),
    n_colonies = n_distinct(coral_data$coral_id),
    genera = sort(unique(coral_data$genus_full)),
    transects = sort(unique(coral_data$transect)),
    generated = format(Sys.time(), "%Y-%m-%dT%H:%M:%SZ")
  ),
  records = webapp_records
)

# Write JSON
cat("Writing JSON...\n")
write_json(webapp_data, OUTPUT_PATH, auto_unbox = TRUE, na = "null")

# Verify and report
file_size_kb <- file.info(OUTPUT_PATH)$size / 1024
cat("✓ Webapp JSON saved:", OUTPUT_PATH, "\n")
cat("  Records:", nrow(webapp_records), "\n")
cat("  Unique colonies:", n_distinct(webapp_records$coral_id), "\n")
cat("  Years:", min(webapp_records$year), "-", max(webapp_records$year), "\n")
cat("  File size:", round(file_size_kb, 1), "KB\n\n")

# Validate the fix
cat("Validating death records...\n")
deaths_by_year <- webapp_records %>%
  filter(died == TRUE) %>%
  count(year) %>%
  arrange(year)

if (nrow(deaths_by_year) > 0) {
  cat("Deaths detected by year:\n")
  print(deaths_by_year, n = Inf)
} else {
  cat("⚠ Warning: No deaths detected in data\n")
}

# Check specific problematic colonies
test_colony_467 <- webapp_records %>% filter(coral_id == 467)
cat("\nTest colony 467 (should have died=TRUE only in death year):\n")
cat("  Year  | Died\n")
cat("  ------|------\n")
for (i in 1:nrow(test_colony_467)) {
  cat(sprintf("  %4d  | %s\n", test_colony_467$year[i], test_colony_467$died[i]))
}

cat("\n✓✓✓ Webapp JSON export complete! ✓✓✓\n")
