# Utility Functions for Coral Ontogeny Analysis
# Common helper functions used across analysis scripts

library(tidyverse)
library(here)

#' Parse measurement values and handle missing data codes
#'
#' @param x Measurement value (can be numeric or character)
#' @return Numeric value or NA
#' @details Handles special codes: "Na", "UK", "D" -> NA
parse_measurement <- function(x) {
  if (is.na(x)) return(NA_real_)
  if (is.numeric(x)) return(x)

  # Handle text codes
  x_clean <- str_trim(toupper(as.character(x)))
  if (x_clean %in% c("NA", "UK", "D", "")) {
    return(NA_real_)
  }

  # Convert to numeric
  as.numeric(x)
}

#' Calculate geometric mean of two values
#'
#' @param x First value
#' @param y Second value
#' @return Geometric mean (sqrt(x*y))
geometric_mean <- function(x, y) {
  if (is.na(x) | is.na(y)) return(NA_real_)
  if (x < 0 | y < 0) return(NA_real_)
  sqrt(x * y)
}

#' Calculate volume proxy for coral colonies
#'
#' @param diam1 First diameter measurement (cm)
#' @param diam2 Second diameter measurement (cm)
#' @param height Height measurement (cm)
#' @return Volume proxy (diam1 * diam2 * height / 6)
#' @details Assumes ellipsoid shape approximation
calc_volume_proxy <- function(diam1, diam2, height) {
  if (any(is.na(c(diam1, diam2, height)))) return(NA_real_)
  if (any(c(diam1, diam2, height) < 0)) return(NA_real_)
  (diam1 * diam2 * height) / 6
}

#' Calculate growth rate between time points
#'
#' @param size_t0 Size at time t
#' @param size_t1 Size at time t+1
#' @param method Method: "proportional" (default) or "absolute"
#' @return Growth rate
calc_growth_rate <- function(size_t0, size_t1, method = "proportional") {
  if (is.na(size_t0) | is.na(size_t1)) return(NA_real_)
  if (size_t0 <= 0) return(NA_real_)

  if (method == "proportional") {
    log(size_t1 / size_t0)  # Log growth rate
  } else if (method == "absolute") {
    size_t1 - size_t0
  } else {
    stop("Method must be 'proportional' or 'absolute'")
  }
}

#' Identify biologically implausible measurements
#'
#' @param data Data frame with size measurements
#' @param diam_max Maximum plausible diameter (default 200 cm)
#' @param height_max Maximum plausible height (default 100 cm)
#' @return Logical vector indicating implausible measurements
flag_implausible <- function(data, diam_max = 200, height_max = 100) {
  flags <- data %>%
    mutate(
      flag = case_when(
        diam1 < 0 | diam2 < 0 | height < 0 ~ TRUE,
        diam1 > diam_max | diam2 > diam_max ~ TRUE,
        height > height_max ~ TRUE,
        TRUE ~ FALSE
      )
    ) %>%
    pull(flag)

  flags
}

#' Create log-spaced size bins for histograms
#'
#' @param sizes Vector of size measurements
#' @param n_bins Number of bins
#' @return Numeric vector of bin breaks
log_bins <- function(sizes, n_bins = 20) {
  sizes_pos <- sizes[sizes > 0 & !is.na(sizes)]
  if (length(sizes_pos) == 0) return(NULL)

  log_min <- log10(min(sizes_pos))
  log_max <- log10(max(sizes_pos))

  10^seq(log_min, log_max, length.out = n_bins + 1)
}

#' Calculate standard error
#'
#' @param x Numeric vector
#' @return Standard error
se <- function(x) {
  sd(x, na.rm = TRUE) / sqrt(sum(!is.na(x)))
}

#' Calculate 95% confidence interval
#'
#' @param x Numeric vector
#' @return Named vector with lower and upper CI bounds
ci_95 <- function(x) {
  m <- mean(x, na.rm = TRUE)
  s <- se(x)
  c(lower = m - 1.96 * s, upper = m + 1.96 * s)
}

#' Format p-values for display
#'
#' @param p P-value
#' @return Formatted string
format_pval <- function(p) {
  if (p < 0.001) {
    return("p < 0.001")
  } else if (p < 0.01) {
    return(sprintf("p = %.3f", p))
  } else {
    return(sprintf("p = %.2f", p))
  }
}

#' Generate color palette for genera
#'
#' @param genus Vector of genus names
#' @return Named vector of colors
genus_colors <- function() {
  c(
    "Pocillopora" = "#E41A1C",  # Red
    "Porites" = "#377EB8",      # Blue
    "Acropora" = "#4DAF4A",     # Green
    "Millepora" = "#984EA3"     # Purple
  )
}

#' Generate color palette for fates
#'
#' @return Named vector of colors
fate_colors <- function() {
  c(
    "Growth" = "#4DAF4A",      # Green
    "Shrinkage" = "#FF7F00",   # Orange
    "Death" = "#E41A1C",       # Red
    "Recruitment" = "#984EA3", # Purple
    "Fission" = "#377EB8",     # Blue
    "Fusion" = "#A65628"       # Brown
  )
}

#' Validate data frame schema
#'
#' @param data Data frame to validate
#' @param required_cols Character vector of required column names
#' @return Logical indicating if valid
validate_schema <- function(data, required_cols) {
  missing_cols <- setdiff(required_cols, names(data))

  if (length(missing_cols) > 0) {
    warning("Missing required columns: ", paste(missing_cols, collapse = ", "))
    return(FALSE)
  }

  TRUE
}

#' Export data with metadata
#'
#' @param data Data frame to export
#' @param output_path Path to save file
#' @param format Format: "csv", "rds", or "parquet"
#' @param metadata List of metadata to save as attributes
export_data <- function(data, output_path, format = "csv", metadata = NULL) {
  # Add metadata as attributes
  if (!is.null(metadata)) {
    for (key in names(metadata)) {
      attr(data, key) <- metadata[[key]]
    }
  }

  # Export based on format
  if (format == "csv") {
    write_csv(data, output_path)
  } else if (format == "rds") {
    saveRDS(data, output_path)
  } else if (format == "parquet") {
    arrow::write_parquet(data, output_path)
  } else {
    stop("Format must be 'csv', 'rds', or 'parquet'")
  }

  message("Data exported to: ", output_path)
}

#' Print analysis header
#'
#' @param title Analysis title
print_header <- function(title) {
  width <- 80
  cat("\n")
  cat(strrep("=", width), "\n")
  cat(str_pad(title, width = width, side = "both"), "\n")
  cat(strrep("=", width), "\n")
  cat("Date:", format(Sys.Date(), "%Y-%m-%d"), "\n")
  cat(strrep("=", width), "\n\n")
}
