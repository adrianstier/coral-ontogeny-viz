# Unit Tests for Coral Analysis Utility Functions
# Run with: testthat::test_file("tests/unit/test_utils.R")

library(testthat)
library(here)

source(here("scripts/R/utils.R"))

# ============================================================================
# Test parse_measurement()
# ============================================================================

test_that("parse_measurement handles numeric values", {
  expect_equal(parse_measurement(10.5), 10.5)
  expect_equal(parse_measurement(0), 0)
  expect_equal(parse_measurement(100.123), 100.123)
})

test_that("parse_measurement handles missing data codes", {
  expect_true(is.na(parse_measurement("Na")))
  expect_true(is.na(parse_measurement("UK")))
  expect_true(is.na(parse_measurement("D")))
  expect_true(is.na(parse_measurement("")))
  expect_true(is.na(parse_measurement(NA)))
})

test_that("parse_measurement is case insensitive", {
  expect_true(is.na(parse_measurement("na")))
  expect_true(is.na(parse_measurement("uk")))
  expect_true(is.na(parse_measurement("d")))
})

test_that("parse_measurement converts character numbers", {
  expect_equal(parse_measurement("10.5"), 10.5)
  expect_equal(parse_measurement("0"), 0)
})

# ============================================================================
# Test geometric_mean()
# ============================================================================

test_that("geometric_mean calculates correctly", {
  expect_equal(geometric_mean(4, 9), 6)
  expect_equal(geometric_mean(16, 16), 16)
  expect_equal(geometric_mean(1, 100), 10)
})

test_that("geometric_mean handles NA values", {
  expect_true(is.na(geometric_mean(NA, 10)))
  expect_true(is.na(geometric_mean(10, NA)))
  expect_true(is.na(geometric_mean(NA, NA)))
})

test_that("geometric_mean handles negative values", {
  expect_true(is.na(geometric_mean(-4, 9)))
  expect_true(is.na(geometric_mean(4, -9)))
})

# ============================================================================
# Test calc_volume_proxy()
# ============================================================================

test_that("calc_volume_proxy calculates correctly", {
  # Volume = (d1 * d2 * h) / 6
  expect_equal(calc_volume_proxy(6, 6, 6), 36)
  expect_equal(calc_volume_proxy(10, 20, 30), 1000)
})

test_that("calc_volume_proxy handles NA values", {
  expect_true(is.na(calc_volume_proxy(NA, 10, 10)))
  expect_true(is.na(calc_volume_proxy(10, NA, 10)))
  expect_true(is.na(calc_volume_proxy(10, 10, NA)))
})

test_that("calc_volume_proxy handles negative values", {
  expect_true(is.na(calc_volume_proxy(-10, 10, 10)))
  expect_true(is.na(calc_volume_proxy(10, -10, 10)))
  expect_true(is.na(calc_volume_proxy(10, 10, -10)))
})

# ============================================================================
# Test calc_growth_rate()
# ============================================================================

test_that("calc_growth_rate proportional method", {
  # log(20/10) = log(2) ≈ 0.693
  expect_equal(calc_growth_rate(10, 20, "proportional"), log(2), tolerance = 1e-6)

  # log(10/10) = log(1) = 0
  expect_equal(calc_growth_rate(10, 10, "proportional"), 0, tolerance = 1e-6)

  # log(5/10) = log(0.5) ≈ -0.693
  expect_equal(calc_growth_rate(10, 5, "proportional"), log(0.5), tolerance = 1e-6)
})

test_that("calc_growth_rate absolute method", {
  expect_equal(calc_growth_rate(10, 20, "absolute"), 10)
  expect_equal(calc_growth_rate(10, 10, "absolute"), 0)
  expect_equal(calc_growth_rate(10, 5, "absolute"), -5)
})

test_that("calc_growth_rate handles NA values", {
  expect_true(is.na(calc_growth_rate(NA, 10)))
  expect_true(is.na(calc_growth_rate(10, NA)))
})

test_that("calc_growth_rate handles zero/negative initial size", {
  expect_true(is.na(calc_growth_rate(0, 10)))
  expect_true(is.na(calc_growth_rate(-10, 20)))
})

# ============================================================================
# Test flag_implausible()
# ============================================================================

test_that("flag_implausible identifies negative values", {
  data <- data.frame(diam1 = c(10, -5), diam2 = c(10, 10), height = c(5, 5))
  flags <- flag_implausible(data)
  expect_equal(flags, c(FALSE, TRUE))
})

test_that("flag_implausible identifies large diameters", {
  data <- data.frame(diam1 = c(10, 250), diam2 = c(10, 10), height = c(5, 5))
  flags <- flag_implausible(data, diam_max = 200)
  expect_equal(flags, c(FALSE, TRUE))
})

test_that("flag_implausible identifies large heights", {
  data <- data.frame(diam1 = c(10, 10), diam2 = c(10, 10), height = c(5, 150))
  flags <- flag_implausible(data, height_max = 100)
  expect_equal(flags, c(FALSE, TRUE))
})

# ============================================================================
# Test statistical functions
# ============================================================================

test_that("se calculates standard error correctly", {
  x <- c(1, 2, 3, 4, 5)
  expected_se <- sd(x) / sqrt(5)
  expect_equal(se(x), expected_se, tolerance = 1e-6)
})

test_that("se handles NA values", {
  x <- c(1, 2, NA, 4, 5)
  expected_se <- sd(x, na.rm = TRUE) / sqrt(4)
  expect_equal(se(x), expected_se, tolerance = 1e-6)
})

test_that("ci_95 calculates confidence interval", {
  x <- c(10, 12, 14, 16, 18)
  ci <- ci_95(x)

  expect_true("lower" %in% names(ci))
  expect_true("upper" %in% names(ci))
  expect_true(ci["lower"] < mean(x))
  expect_true(ci["upper"] > mean(x))
})

# ============================================================================
# Test color functions
# ============================================================================

test_that("genus_colors returns named vector", {
  colors <- genus_colors()

  expect_true(is.character(colors))
  expect_true("Pocillopora" %in% names(colors))
  expect_true("Porites" %in% names(colors))
  expect_true("Acropora" %in% names(colors))
  expect_true("Millepora" %in% names(colors))
})

test_that("fate_colors returns named vector", {
  colors <- fate_colors()

  expect_true(is.character(colors))
  expect_true("Growth" %in% names(colors))
  expect_true("Death" %in% names(colors))
  expect_true("Recruitment" %in% names(colors))
})

# ============================================================================
# Test validation functions
# ============================================================================

test_that("validate_schema detects missing columns", {
  data <- data.frame(col1 = 1:5, col2 = 6:10)
  required <- c("col1", "col2", "col3")

  expect_false(validate_schema(data, required))
})

test_that("validate_schema passes with all columns", {
  data <- data.frame(col1 = 1:5, col2 = 6:10, col3 = 11:15)
  required <- c("col1", "col2", "col3")

  expect_true(validate_schema(data, required))
})

# ============================================================================
# Run all tests
# ============================================================================

cat("\n")
cat("========================================\n")
cat("  UNIT TEST RESULTS\n")
cat("========================================\n")
test_results <- test_file(here("tests/unit/test_utils.R"))
print(test_results)
