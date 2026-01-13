#!/usr/bin/env Rscript
# Publication Figure Generation Script
# Generates all publication-quality figures from processed data

library(here)
library(tidyverse)
library(patchwork)
library(scales)
library(survival)
library(survminer)

source(here("scripts/R/utils.R"))

print_header("PUBLICATION FIGURE GENERATION")

# Configuration
DATA_PATH <- here("data/processed/coral_long_format.csv")
FIG_DIR <- here("outputs/figures")

# Create output directory
dir.create(FIG_DIR, recursive = TRUE, showWarnings = FALSE)

# Load data
cat("Loading processed data...\n")
coral_data <- read_csv(DATA_PATH, show_col_types = FALSE)
cat("✓ Loaded", nrow(coral_data), "observations\n\n")

# ============================================================================
# FIGURE 1: Population Dynamics Overview (4-panel)
# ============================================================================
cat("Generating Figure 1: Population Dynamics Overview...\n")

# Panel A: Total population over time
pop_total <- coral_data %>%
  filter(!is.na(status), status != "D") %>%
  count(year) %>%
  ggplot(aes(x = year, y = n)) +
  geom_line(linewidth = 1.2, color = "steelblue") +
  geom_point(size = 3, color = "steelblue") +
  scale_x_continuous(breaks = seq(2013, 2024, 2)) +
  labs(title = "A. Total Population",
       x = NULL, y = "Live Colonies") +
  theme_minimal(base_size = 12) +
  theme(panel.grid.minor = element_blank())

# Panel B: Population by genus
pop_genus <- coral_data %>%
  filter(!is.na(status), status != "D") %>%
  count(year, genus) %>%
  ggplot(aes(x = year, y = n, color = genus)) +
  geom_line(linewidth = 1.2) +
  geom_point(size = 2.5) +
  scale_color_manual(values = genus_colors()) +
  scale_x_continuous(breaks = seq(2013, 2024, 2)) +
  labs(title = "B. Population by Genus",
       x = NULL, y = "Live Colonies", color = "Genus") +
  theme_minimal(base_size = 12) +
  theme(panel.grid.minor = element_blank(),
        legend.position = "bottom")

# Panel C: Recruitment vs mortality
demog_data <- coral_data %>%
  filter(!is.na(status)) %>%
  group_by(coral_id) %>%
  summarise(
    first_year = min(year),
    last_year = max(year),
    died = any(status == "D"),
    .groups = "drop"
  )

recruitment <- demog_data %>%
  filter(first_year > 2013) %>%
  count(year = first_year, name = "recruits")

mortality <- demog_data %>%
  filter(died) %>%
  count(year = last_year, name = "deaths")

demog_combined <- full_join(recruitment, mortality, by = "year") %>%
  replace_na(list(recruits = 0, deaths = 0)) %>%
  pivot_longer(cols = c(recruits, deaths), names_to = "event", values_to = "count")

pop_demog <- ggplot(demog_combined, aes(x = year, y = count, fill = event)) +
  geom_col(position = "dodge") +
  scale_fill_manual(values = c(recruits = "darkgreen", deaths = "darkred"),
                    labels = c("Deaths", "Recruits")) +
  labs(title = "C. Demographic Rates",
       x = NULL, y = "Count", fill = "Event") +
  theme_minimal(base_size = 12) +
  theme(legend.position = "bottom")

# Panel D: Mean colony size over time
mean_size <- coral_data %>%
  filter(!is.na(geom_mean_diam)) %>%
  group_by(year, genus) %>%
  summarise(
    mean_diam = mean(geom_mean_diam, na.rm = TRUE),
    se_diam = sd(geom_mean_diam, na.rm = TRUE) / sqrt(n()),
    .groups = "drop"
  )

pop_size <- ggplot(mean_size, aes(x = year, y = mean_diam, color = genus)) +
  geom_line(linewidth = 1.2) +
  geom_ribbon(aes(ymin = mean_diam - se_diam, ymax = mean_diam + se_diam,
                  fill = genus), alpha = 0.2, color = NA) +
  scale_color_manual(values = genus_colors()) +
  scale_fill_manual(values = genus_colors()) +
  labs(title = "D. Mean Colony Size",
       x = "Year", y = "Mean Diameter (cm)", color = "Genus", fill = "Genus") +
  theme_minimal(base_size = 12) +
  theme(legend.position = "bottom")

# Combine panels
fig1 <- (pop_total + pop_genus) / (pop_demog + pop_size) +
  plot_annotation(
    title = "Population Dynamics Overview (2013-2024)",
    subtitle = "MCR LTER Back Reef Transects 1-2",
    theme = theme(plot.title = element_text(size = 16, face = "bold"))
  )

ggsave(here(FIG_DIR, "figure_1_population_dynamics_overview.png"),
       fig1, width = 14, height = 10, dpi = 300)
ggsave(here(FIG_DIR, "figure_1_population_dynamics_overview.pdf"),
       fig1, width = 14, height = 10)

cat("✓ Figure 1 saved\n\n")

# ============================================================================
# FIGURE 2: Growth Rate Distributions
# ============================================================================
cat("Generating Figure 2: Growth Rate Distributions...\n")

growth_data <- coral_data %>%
  filter(!is.na(growth_rate_diam), abs(growth_rate_diam) < 1) %>%  # Filter extreme outliers
  mutate(growth_pct = (exp(growth_rate_diam) - 1) * 100)  # Convert to %

# Panel A: Distributions by genus
fig2a <- ggplot(growth_data, aes(x = growth_pct, fill = genus)) +
  geom_histogram(bins = 50, alpha = 0.7) +
  facet_wrap(~genus, scales = "free_y", ncol = 2) +
  geom_vline(xintercept = 0, linetype = "dashed", color = "red") +
  scale_fill_manual(values = genus_colors()) +
  labs(title = "A. Growth Rate Distributions by Genus",
       x = "Annual Growth Rate (%)", y = "Count") +
  theme_minimal(base_size = 12) +
  theme(legend.position = "none")

# Panel B: Violin plots
growth_summary <- growth_data %>%
  group_by(genus) %>%
  summarise(
    median_growth = median(growth_pct, na.rm = TRUE),
    .groups = "drop"
  )

fig2b <- ggplot(growth_data, aes(x = genus, y = growth_pct, fill = genus)) +
  geom_violin(alpha = 0.7, draw_quantiles = c(0.25, 0.5, 0.75)) +
  geom_hline(yintercept = 0, linetype = "dashed", color = "red") +
  scale_fill_manual(values = genus_colors()) +
  labs(title = "B. Growth Rate Comparison",
       x = "Genus", y = "Annual Growth Rate (%)") +
  theme_minimal(base_size = 12) +
  theme(legend.position = "none")

fig2 <- fig2a + fig2b +
  plot_annotation(
    title = "Colony Growth Rate Analysis",
    subtitle = "Proportional change in diameter between consecutive years",
    theme = theme(plot.title = element_text(size = 16, face = "bold"))
  )

ggsave(here(FIG_DIR, "figure_2_growth_rates.png"),
       fig2, width = 14, height = 8, dpi = 300)
ggsave(here(FIG_DIR, "figure_2_growth_rates.pdf"),
       fig2, width = 14, height = 8)

cat("✓ Figure 2 saved\n\n")

# ============================================================================
# FIGURE 3: Size-Frequency Distributions
# ============================================================================
cat("Generating Figure 3: Size-Frequency Distributions...\n")

size_data <- coral_data %>%
  filter(!is.na(geom_mean_diam), geom_mean_diam > 0)

# Overall distribution
fig3a <- ggplot(size_data, aes(x = geom_mean_diam, fill = genus)) +
  geom_histogram(bins = 40, alpha = 0.7, position = "identity") +
  scale_fill_manual(values = genus_colors()) +
  scale_x_log10(labels = label_number()) +
  labs(title = "A. Overall Size Distribution (All Years)",
       x = "Colony Diameter (cm, log scale)", y = "Count",
       fill = "Genus") +
  theme_minimal(base_size = 12) +
  theme(legend.position = "bottom")

# By year (faceted)
years_to_plot <- seq(2013, max(size_data$year), by = 2)
size_subset <- size_data %>% filter(year %in% years_to_plot)

fig3b <- ggplot(size_subset, aes(x = geom_mean_diam, fill = genus)) +
  geom_histogram(bins = 30, alpha = 0.7) +
  facet_wrap(~year, ncol = 3) +
  scale_fill_manual(values = genus_colors()) +
  scale_x_log10(labels = label_number()) +
  labs(title = "B. Size Distribution Over Time",
       x = "Colony Diameter (cm, log scale)", y = "Count",
       fill = "Genus") +
  theme_minimal(base_size = 10) +
  theme(legend.position = "bottom")

fig3 <- fig3a / fig3b +
  plot_annotation(
    title = "Colony Size-Frequency Distributions",
    theme = theme(plot.title = element_text(size = 16, face = "bold"))
  )

ggsave(here(FIG_DIR, "figure_3_size_distributions.png"),
       fig3, width = 14, height = 12, dpi = 300)
ggsave(here(FIG_DIR, "figure_3_size_distributions.pdf"),
       fig3, width = 14, height = 12)

cat("✓ Figure 3 saved\n\n")

# ============================================================================
# FIGURE 4: Survival Analysis
# ============================================================================
cat("Generating Figure 4: Survival Curves...\n")

# Prepare survival data
survival_data <- demog_data %>%
  left_join(coral_data %>%
              group_by(coral_id) %>%
              slice(1) %>%
              select(coral_id, genus, transect),
            by = "coral_id") %>%
  mutate(
    time = last_year - first_year,
    event = as.numeric(died)
  ) %>%
  filter(time >= 0, !is.na(genus))

# Fit Kaplan-Meier by genus
km_genus <- survfit(Surv(time, event) ~ genus, data = survival_data)

# Create survival plot
fig4 <- ggsurvplot(
  km_genus,
  data = survival_data,
  conf.int = TRUE,
  pval = TRUE,
  pval.method = TRUE,
  risk.table = TRUE,
  xlim = c(0, 11),
  break.x.by = 1,
  xlab = "Years in Study",
  ylab = "Survival Probability",
  title = "Kaplan-Meier Survival Curves by Genus",
  legend.title = "Genus",
  palette = unname(genus_colors()),
  ggtheme = theme_minimal(base_size = 12),
  risk.table.y.text = FALSE,
  tables.height = 0.3
)

# Save
ggsave(here(FIG_DIR, "figure_4_survival_curves.png"),
       print(fig4), width = 10, height = 10, dpi = 300)

# Also create PDF
pdf(here(FIG_DIR, "figure_4_survival_curves.pdf"), width = 10, height = 10)
print(fig4)
dev.off()

cat("✓ Figure 4 saved\n\n")

# ============================================================================
# FIGURE 5: Spatial Distribution
# ============================================================================
cat("Generating Figure 5: Spatial Distribution...\n")

current_year <- max(coral_data$year)
spatial_data <- coral_data %>%
  filter(year == current_year, !is.na(x), !is.na(y), !is.na(genus))

fig5 <- ggplot(spatial_data, aes(x = y, y = x, color = genus, size = geom_mean_diam)) +
  geom_point(alpha = 0.7) +
  facet_wrap(~transect, ncol = 2) +
  scale_color_manual(values = genus_colors()) +
  scale_size_continuous(range = c(2, 12), name = "Diameter (cm)") +
  coord_fixed(ratio = 5) +
  labs(title = paste("Spatial Distribution of Coral Colonies (", current_year, ")", sep = ""),
       subtitle = "Transects 1m × 5m",
       x = "Along-transect position (m)",
       y = "Across-transect position (m)",
       color = "Genus") +
  theme_minimal(base_size = 12) +
  theme(legend.position = "bottom")

ggsave(here(FIG_DIR, "figure_5_spatial_distribution.png"),
       fig5, width = 12, height = 6, dpi = 300)
ggsave(here(FIG_DIR, "figure_5_spatial_distribution.pdf"),
       fig5, width = 12, height = 6)

cat("✓ Figure 5 saved\n\n")

# ============================================================================
# SUPPLEMENTARY FIGURES
# ============================================================================
cat("Generating supplementary figures...\n")

# S1: Transect comparison
s1 <- coral_data %>%
  filter(!is.na(status), status != "D") %>%
  count(year, transect) %>%
  ggplot(aes(x = year, y = n, color = transect)) +
  geom_line(linewidth = 1.2) +
  geom_point(size = 3) +
  scale_color_brewer(palette = "Set1") +
  labs(title = "Population Dynamics by Transect",
       x = "Year", y = "Live Colonies", color = "Transect") +
  theme_minimal(base_size = 12)

ggsave(here(FIG_DIR, "supp_figure_S1_transect_comparison.png"),
       s1, width = 10, height = 6, dpi = 300)

# S2: Growth rates over time
s2 <- growth_data %>%
  group_by(year, genus) %>%
  summarise(
    mean_growth = mean(growth_pct, na.rm = TRUE),
    se_growth = sd(growth_pct, na.rm = TRUE) / sqrt(n()),
    .groups = "drop"
  ) %>%
  ggplot(aes(x = year, y = mean_growth, color = genus)) +
  geom_line(linewidth = 1.2) +
  geom_point(size = 3) +
  geom_ribbon(aes(ymin = mean_growth - se_growth,
                  ymax = mean_growth + se_growth,
                  fill = genus), alpha = 0.2, color = NA) +
  geom_hline(yintercept = 0, linetype = "dashed") +
  scale_color_manual(values = genus_colors()) +
  scale_fill_manual(values = genus_colors()) +
  labs(title = "Mean Growth Rates Over Time",
       x = "Year", y = "Mean Growth Rate (%)",
       color = "Genus", fill = "Genus") +
  theme_minimal(base_size = 12)

ggsave(here(FIG_DIR, "supp_figure_S2_growth_temporal.png"),
       s2, width = 10, height = 6, dpi = 300)

cat("✓ Supplementary figures saved\n\n")

# ============================================================================
# SUMMARY
# ============================================================================
cat(strrep("=", 70), "\n")
cat("FIGURE GENERATION COMPLETE\n")
cat(strrep("=", 70), "\n\n")

cat("Main Figures Generated:\n")
cat("  Figure 1: Population dynamics overview (4-panel)\n")
cat("  Figure 2: Growth rate distributions\n")
cat("  Figure 3: Size-frequency distributions\n")
cat("  Figure 4: Survival curves by genus\n")
cat("  Figure 5: Spatial distribution\n\n")

cat("Supplementary Figures:\n")
cat("  S1: Transect comparison\n")
cat("  S2: Growth rates over time\n\n")

cat("Output directory:", FIG_DIR, "\n")
cat("Formats: PNG (300 DPI) and PDF\n\n")

# List all generated figures
fig_files <- list.files(FIG_DIR, pattern = "^figure", full.names = FALSE)
cat("Generated files (", length(fig_files), "):\n", sep = "")
cat(paste("  -", fig_files), sep = "\n")

cat("\n✓✓✓ All publication figures generated successfully! ✓✓✓\n")
