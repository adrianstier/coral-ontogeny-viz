#!/usr/bin/env Rscript
# Export Data for Web Application
# Creates optimized datasets for the React/D3 visualization

library(here)
library(tidyverse)
library(jsonlite)

source(here("scripts/R/utils.R"))

print_header("DATA EXPORT FOR WEB APPLICATION")

# Configuration
INPUT_PATH <- here("data/processed/coral_long_format.csv")
OUTPUT_DIR <- here("public/data")
PROCESSED_DIR <- here("data/processed")

# Create output directory
dir.create(OUTPUT_DIR, recursive = TRUE, showWarnings = FALSE)

# Load processed data
cat("Loading processed data...\n")
coral_data <- read_csv(INPUT_PATH, show_col_types = FALSE)
cat("✓ Loaded", nrow(coral_data), "observations\n\n")

# ============================================================================
# 1. Export Summary Statistics (JSON)
# ============================================================================

cat("1. Generating summary statistics JSON...\n")

summary_stats <- list(
  dataset = list(
    name = "MCR LTER Back Reef Transects 1-2",
    years = range(coral_data$year, na.rm = TRUE),
    n_colonies = n_distinct(coral_data$coral_id),
    n_observations = nrow(coral_data),
    transects = unique(coral_data$transect) %>% sort(),
    genera = unique(coral_data$genus) %>% sort()
  ),

  population = coral_data %>%
    filter(!is.na(status), status != "D") %>%
    count(year, name = "live_colonies") %>%
    mutate(year = as.integer(year),
           live_colonies = as.integer(live_colonies)) %>%
    arrange(year) %>%
    as.list() %>%
    transpose(),

  population_by_genus = coral_data %>%
    filter(!is.na(status), status != "D") %>%
    count(year, genus) %>%
    mutate(year = as.integer(year),
           count = as.integer(n)) %>%
    select(-n) %>%
    arrange(year, genus) %>%
    split(.$genus) %>%
    map(~select(.x, -genus) %>% as.list() %>% transpose()),

  size_distribution = coral_data %>%
    filter(!is.na(geom_mean_diam)) %>%
    group_by(genus) %>%
    summarise(
      mean = mean(geom_mean_diam, na.rm = TRUE),
      median = median(geom_mean_diam, na.rm = TRUE),
      sd = sd(geom_mean_diam, na.rm = TRUE),
      min = min(geom_mean_diam, na.rm = TRUE),
      max = max(geom_mean_diam, na.rm = TRUE),
      .groups = "drop"
    ) %>%
    split(.$genus) %>%
    map(~as.list(.x[-1]))
)

# Write JSON
json_path <- file.path(OUTPUT_DIR, "summary_statistics.json")
write_json(summary_stats, json_path, pretty = TRUE, auto_unbox = TRUE)
cat("✓ Summary statistics saved:", json_path, "\n")
cat("  Size:", file.info(json_path)$size / 1024, "KB\n\n")

# ============================================================================
# 2. Export Time Series Data (CSV)
# ============================================================================

cat("2. Generating time series CSV...\n")

timeseries_data <- coral_data %>%
  filter(!is.na(status), status != "D") %>%
  group_by(year, genus, transect) %>%
  summarise(
    count = n(),
    mean_diameter = mean(geom_mean_diam, na.rm = TRUE),
    mean_height = mean(height, na.rm = TRUE),
    mean_volume = mean(volume_proxy, na.rm = TRUE),
    .groups = "drop"
  ) %>%
  arrange(year, genus, transect)

ts_path <- file.path(OUTPUT_DIR, "timeseries.csv")
write_csv(timeseries_data, ts_path)
cat("✓ Time series saved:", ts_path, "\n")
cat("  Rows:", nrow(timeseries_data), "\n")
cat("  Size:", file.info(ts_path)$size / 1024, "KB\n\n")

# ============================================================================
# 3. Export Spatial Data by Year (JSON)
# ============================================================================

cat("3. Generating spatial data by year...\n")

spatial_by_year <- coral_data %>%
  filter(!is.na(x), !is.na(y), !is.na(genus)) %>%
  select(year, coral_id, genus, transect, x, y, geom_mean_diam, status, fate) %>%
  mutate(
    alive = !is.na(status) & status != "D",
    diameter = round(geom_mean_diam, 2)
  ) %>%
  select(-geom_mean_diam) %>%
  split(.$year) %>%
  map(~select(.x, -year) %>%
        mutate(across(where(is.numeric), ~round(.x, 3))) %>%
        as.list() %>%
        transpose())

# Write JSON (one file per year for performance)
for (yr in names(spatial_by_year)) {
  json_path <- file.path(OUTPUT_DIR, paste0("spatial_", yr, ".json"))
  write_json(spatial_by_year[[yr]], json_path, auto_unbox = TRUE)
}

cat("✓ Spatial data saved:", length(spatial_by_year), "files\n")
cat("  Format: spatial_YYYY.json\n\n")

# ============================================================================
# 4. Export Demographic Events (JSON)
# ============================================================================

cat("4. Generating demographic events data...\n")

# Recruitment events
recruitment_events <- coral_data %>%
  filter(is_recruit == TRUE, !is.na(first_year)) %>%
  group_by(coral_id) %>%
  slice(1) %>%
  ungroup() %>%
  select(coral_id, year = first_year, genus, transect, x, y) %>%
  mutate(event = "recruitment") %>%
  arrange(year)

# Mortality events (identified by fate = "death")
mortality_events <- coral_data %>%
  filter(fate == "death") %>%
  group_by(coral_id) %>%
  slice(1) %>%
  ungroup() %>%
  select(coral_id, year, genus, transect, x, y) %>%
  mutate(event = "mortality") %>%
  arrange(year)

# Combine
demographic_events <- bind_rows(recruitment_events, mortality_events) %>%
  mutate(across(where(is.numeric), ~round(.x, 3))) %>%
  split(.$event) %>%
  map(~split(.x, .x$year) %>%
        map(~select(.x, -event, -year) %>%
              as.list() %>%
              transpose()))

demog_path <- file.path(OUTPUT_DIR, "demographic_events.json")
write_json(demographic_events, demog_path, pretty = TRUE, auto_unbox = TRUE)
cat("✓ Demographic events saved:", demog_path, "\n")
cat("  Recruitment events:", nrow(recruitment_events), "\n")
cat("  Mortality events:", nrow(mortality_events), "\n")
cat("  Size:", file.info(demog_path)$size / 1024, "KB\n\n")

# ============================================================================
# 5. Export Size-Frequency Data (JSON)
# ============================================================================

cat("5. Generating size-frequency data...\n")

# Create size bins (log scale)
size_data <- coral_data %>%
  filter(!is.na(geom_mean_diam), geom_mean_diam > 0)

bins <- log_bins(size_data$geom_mean_diam, n_bins = 20)

size_freq <- size_data %>%
  mutate(
    size_bin = cut(geom_mean_diam, breaks = bins, include.lowest = TRUE, dig.lab = 4)
  ) %>%
  group_by(year, genus, size_bin) %>%
  summarise(count = n(), .groups = "drop") %>%
  mutate(
    bin_min = as.numeric(sub("\\[(.*),.*\\]", "\\1", size_bin)),
    bin_max = as.numeric(sub("\\[.*,(.*)\\]", "\\1", size_bin)),
    bin_mid = (bin_min + bin_max) / 2
  ) %>%
  select(-size_bin) %>%
  split(.$year) %>%
  map(~select(.x, -year) %>%
        split(.$genus) %>%
        map(~select(.x, -genus) %>%
              as.list() %>%
              transpose()))

size_path <- file.path(OUTPUT_DIR, "size_frequency.json")
write_json(size_freq, size_path, auto_unbox = TRUE)
cat("✓ Size-frequency data saved:", size_path, "\n")
cat("  Size:", file.info(size_path)$size / 1024, "KB\n\n")

# ============================================================================
# 6. Export Color Schemes (JSON)
# ============================================================================

cat("6. Generating color scheme definitions...\n")

color_schemes <- list(
  genus = as.list(genus_colors()),
  fate = as.list(fate_colors())
)

color_path <- file.path(OUTPUT_DIR, "color_schemes.json")
write_json(color_schemes, color_path, pretty = TRUE, auto_unbox = TRUE)
cat("✓ Color schemes saved:", color_path, "\n\n")

# ============================================================================
# 7. Export Data Dictionary (JSON)
# ============================================================================

cat("7. Generating data dictionary...\n")

data_dict <- list(
  variables = list(
    coral_id = "Unique colony identifier",
    year = "Survey year (2013-2024)",
    genus = "Coral genus (Pocillopora, Porites, Acropora, Millepora)",
    transect = "Transect ID (T01, T02)",
    x = "Cross-transect position (m, 0-1)",
    y = "Along-transect position (m, 0-5)",
    z = "Vertical position (m)",
    diam1 = "Maximum diameter (cm)",
    diam2 = "Perpendicular diameter (cm)",
    height = "Colony height (cm)",
    geom_mean_diam = "Geometric mean diameter: sqrt(diam1 × diam2)",
    volume_proxy = "Volume approximation: (diam1 × diam2 × height) / 6",
    status = "Colony status code",
    fate = "Demographic event",
    growth_rate_diam = "Log growth rate",
    is_recruit = "Appeared after 2013 baseline",
    died = "Colony died during study"
  ),

  missing_codes = list(
    Na = "Not applicable (colony not present)",
    UK = "Unknown or not recorded",
    D = "Dead"
  ),

  units = list(
    spatial = "meters",
    size = "centimeters",
    volume = "cubic centimeters"
  )
)

dict_path <- file.path(OUTPUT_DIR, "data_dictionary.json")
write_json(data_dict, dict_path, pretty = TRUE, auto_unbox = TRUE)
cat("✓ Data dictionary saved:", dict_path, "\n\n")

# ============================================================================
# 8. Create Manifest File
# ============================================================================

cat("8. Generating manifest file...\n")

manifest <- list(
  generated = format(Sys.time(), "%Y-%m-%d %H:%M:%S %Z"),
  version = "1.0.0",
  dataset = "MCR LTER Back Reef Transects 1-2 (2013-2024)",
  files = list(
    summary_statistics = list(
      filename = "summary_statistics.json",
      description = "Overall dataset statistics and population summaries",
      format = "JSON"
    ),
    timeseries = list(
      filename = "timeseries.csv",
      description = "Population time series by year, genus, and transect",
      format = "CSV"
    ),
    spatial = list(
      filename = "spatial_YYYY.json",
      description = "Spatial colony positions for each year (one file per year)",
      format = "JSON",
      count = length(spatial_by_year)
    ),
    demographic_events = list(
      filename = "demographic_events.json",
      description = "Recruitment and mortality events by year",
      format = "JSON"
    ),
    size_frequency = list(
      filename = "size_frequency.json",
      description = "Size-frequency distributions by year and genus",
      format = "JSON"
    ),
    color_schemes = list(
      filename = "color_schemes.json",
      description = "Color mappings for genera and fates",
      format = "JSON"
    ),
    data_dictionary = list(
      filename = "data_dictionary.json",
      description = "Variable definitions and metadata",
      format = "JSON"
    )
  ),

  usage = list(
    load_all = "Fetch all files on initialization for complete dataset",
    lazy_load = "Fetch spatial data per-year as needed for better performance",
    recommended = "Load summary + timeseries on init, fetch spatial on demand"
  )
)

manifest_path <- file.path(OUTPUT_DIR, "manifest.json")
write_json(manifest, manifest_path, pretty = TRUE, auto_unbox = TRUE)
cat("✓ Manifest saved:", manifest_path, "\n\n")

# ============================================================================
# Summary
# ============================================================================

cat(strrep("=", 70), "\n")
cat("DATA EXPORT FOR WEB APPLICATION COMPLETE\n")
cat(strrep("=", 70), "\n\n")

cat("Output directory:", OUTPUT_DIR, "\n\n")

cat("Files generated:\n")

output_files <- list.files(OUTPUT_DIR, full.names = FALSE)
file_sizes <- list.files(OUTPUT_DIR, full.names = TRUE) %>%
  map_dbl(~file.info(.x)$size / 1024)

for (i in seq_along(output_files)) {
  cat(sprintf("  %-30s %6.1f KB\n", output_files[i], file_sizes[i]))
}

total_size <- sum(file_sizes)
cat(sprintf("\nTotal size: %.1f KB\n", total_size))

cat("\nUsage in React app:\n")
cat("  1. Fetch manifest: fetch('/data/manifest.json')\n")
cat("  2. Load summary: fetch('/data/summary_statistics.json')\n")
cat("  3. Load spatial for year: fetch('/data/spatial_2023.json')\n")
cat("  4. See manifest.json for complete API\n\n")

cat("✓✓✓ Web app data export complete! ✓✓✓\n")
