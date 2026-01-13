# Quick Start: Advanced Population Dynamics Analysis

> **⏱️ Time to Results**: 2-3 hours (initial run) | 10 minutes (cached)
> **💻 Requirements**: R 4.4+, 16GB RAM, 4 CPU cores
> **📊 Outputs**: Models, Figures, JSON data, HTML report

---

## 🚀 TL;DR - Run Everything Now

```bash
# 1. Install R packages (one-time setup, ~15 min)
Rscript -e "renv::restore()"

# 2. Run complete analysis pipeline (~2 hours first time)
Rscript scripts/R/06_advanced_population_models.R

# 3. Generate HTML report (~5 min)
Rscript -e "rmarkdown::render('notebooks/05_advanced_population_dynamics.Rmd')"

# 4. View results
open outputs/reports/05_advanced_population_dynamics.html
open outputs/figures/advanced_dynamics/
```

**That's it!** All models will be fitted, figures generated, and data exported for the web app.

---

## 📋 Prerequisites Checklist

### Required R Packages

The analysis uses these key packages:

```r
# Bayesian modeling
install.packages("brms")           # Bayesian regression models (requires C++ compiler)
install.packages("posterior")      # Posterior analysis
install.packages("bayesplot")      # Bayesian diagnostics
install.packages("loo")            # Cross-validation

# Data manipulation
install.packages("tidyverse")      # Data wrangling
install.packages("here")           # Path management

# Ecological models
install.packages("survival")       # Survival analysis
install.packages("mgcv")           # GAMs

# Visualization
install.packages("patchwork")      # Multi-panel plots
install.packages("viridis")        # Color palettes
install.packages("plotly")         # Interactive plots

# Reporting
install.packages("rmarkdown")      # R Markdown
install.packages("knitr")          # Report generation
```

### System Requirements

| Resource | Minimum | Recommended | Why |
|----------|---------|-------------|-----|
| **RAM** | 8 GB | 16 GB | Bayesian models use MCMC sampling |
| **CPU Cores** | 2 | 4+ | Models run 4 parallel chains |
| **Disk Space** | 2 GB | 5 GB | Model objects are large (~500 MB total) |
| **R Version** | 4.1+ | 4.4+ | brms requires recent R |
| **C++ Compiler** | Yes | Yes | Stan (brms backend) compiles models |

**Check C++ compiler**:
```r
pkgbuild::check_build_tools()
# Should return TRUE
```

**Mac**: Install Xcode Command Line Tools
```bash
xcode-select --install
```

**Windows**: Install [Rtools](https://cran.r-project.org/bin/windows/Rtools/)

---

## 🎯 What Happens When You Run the Pipeline

### Step-by-Step Execution

```
═══════════════════════════════════════════════════════════
  Advanced Population Dynamics Modeling Pipeline
═══════════════════════════════════════════════════════════

📊 Loading processed data...
   ✓ Loaded 4,257 observations from 387 colonies
   ✓ Population summaries created

🔬 Estimating measurement error...
   ✓ Measurement error SD: 0.234 cm (CV: 2.3%)

🧬 Fitting Bayesian survival model...
   Training on 3,845 observations
   Fitting hierarchical logistic regression (this may take 10-20 min)...
   [===========================] 4000 iterations
   ✓ Model fitted and cached
   ✓ Convergence: R-hat < 1.01 ✓

🌱 Fitting Bayesian growth model...
   Training on 785 observations
   Fitting heteroscedastic growth model (10-20 min)...
   [===========================] 4000 iterations
   ✓ Model fitted and cached

📈 Fitting state-space models for noise decomposition...
   Fitting for Poc...
   Fitting for Por...
   Fitting for Acr...
   Fitting for Mil...
   ✓ State-space models fitted for all genera

📊 Noise Decomposition Summary:
# A tibble: 4 × 5
  genus median_process_sd median_obs_sd ratio dominant
  <chr>             <dbl>         <dbl> <dbl> <chr>
1 Poc               0.15          0.08  1.88  Process
2 Por               0.12          0.07  1.71  Process
3 Acr               0.22          0.09  2.44  Process
4 Mil               0.18          0.15  1.20  Mixed

🔗 Building Integrated Population Models...
   Building IPM for Poc...
   Building IPM for Por...
   Building IPM for Acr...
   Building IPM for Mil...

🎯 Population Growth Rates (λ):
# A tibble: 4 × 4
  genus lambda log_lambda status
  <chr>  <dbl>      <dbl> <chr>
1 Poc    1.08       0.077 Stable
2 Por    1.02       0.020 Stable
3 Acr    0.89      -0.117 Declining
4 Mil    0.95      -0.051 Declining

💾 Exporting results to JSON...
   ✓ survival_predictions.json
   ✓ population_dynamics_summary.json
   ✓ uncertainty_quantification.json
   ✓ population_time_series.json
   ✓ measurement_error.json

📊 Generating publication figures...
   ✓ fig1_noise_decomposition.png
   ✓ fig2_population_growth_rates.png
   ✓ fig3_survival_curves.png
   ✓ fig4_population_trajectories.png

═══════════════════════════════════════════════════════════
  ✅ PIPELINE COMPLETE
═══════════════════════════════════════════════════════════

📁 Outputs generated:
   Models:     outputs/models/
   Figures:    outputs/figures/advanced_dynamics/
   Web data:   public/data/

💡 Next Steps:
   1. Review HTML report
   2. Implement frontend visualizations
   3. Validate predictions with new data
```

---

## 📂 Output Directory Structure

After running the pipeline:

```
coral-ontogeny-viz/
├── outputs/
│   ├── models/                          # Fitted Bayesian models (~500 MB)
│   │   ├── survival_bayesian_model.rds
│   │   ├── growth_bayesian_model.rds
│   │   ├── recruitment_bayesian_model.rds
│   │   ├── state_space_Poc.rds
│   │   ├── state_space_Por.rds
│   │   ├── state_space_Acr.rds
│   │   └── state_space_Mil.rds
│   │
│   ├── figures/advanced_dynamics/       # Publication figures (300 DPI)
│   │   ├── fig1_noise_decomposition.png
│   │   ├── fig2_population_growth_rates.png
│   │   ├── fig3_survival_curves.png
│   │   └── fig4_population_trajectories.png
│   │
│   └── reports/                         # HTML/PDF reports
│       └── 05_advanced_population_dynamics.html
│
└── public/data/                         # JSON for web app (~80 KB total)
    ├── survival_predictions.json
    ├── population_dynamics_summary.json
    ├── uncertainty_quantification.json
    ├── population_time_series.json
    └── measurement_error.json
```

---

## 🔍 How to Interpret Results

### 1. Population Growth Rate (λ)

**File**: `population_dynamics_summary.json`

```json
{
  "lambda_estimates": [
    {
      "genus": "Poc",
      "lambda": 1.08,
      "log_lambda": 0.077,
      "status": "Stable"
    }
  ]
}
```

**Interpretation**:
- λ = 1.08 → Population growing 8% per year
- λ = 1.0 → Stable (equilibrium)
- λ = 0.89 → Declining 11% per year

**What to look for**:
- Is λ significantly different from 1? (check credible intervals in `uncertainty_quantification.json`)
- Which genera are declining? (conservation priorities)

### 2. Noise Decomposition

**File**: `population_dynamics_summary.json` → `noise_decomposition`

```json
{
  "genus": "Poc",
  "median_process_sd": 0.15,
  "median_obs_sd": 0.08,
  "ratio": 1.88,
  "dominant": "Process"
}
```

**Interpretation**:
- Process SD > Obs SD → Demographic stochasticity more important than measurement error
- Ratio = 1.88 → Process noise is 1.88× larger
- **Implication**: Invest in understanding/managing demographic rates, not just better measurements

### 3. Survival Predictions

**File**: `survival_predictions.json`

```json
{
  "genus": "Poc",
  "size": 15.3,
  "survival_prob": 0.87,
  "survival_lower": 0.82,
  "survival_upper": 0.91
}
```

**Interpretation**:
- A 15.3 cm Pocillopora colony has 87% (82%-91%) chance of surviving to next year
- Use for: Risk assessment, size-refuge analysis

### 4. Uncertainty Quantification

**File**: `uncertainty_quantification.json`

```json
{
  "genus": "Acr",
  "lambda_median": 0.89,
  "lambda_q025": 0.76,
  "lambda_q975": 1.02,
  "prob_declining": 0.72,
  "prob_stable": 0.20,
  "prob_increasing": 0.08
}
```

**Interpretation**:
- 72% probability Acropora is declining
- 95% credible interval: 0.76 - 1.02 (includes 1 → some uncertainty)
- **Action**: High-priority for conservation (>50% prob declining)

---

## 🐛 Troubleshooting

### Issue 1: brms Installation Fails

**Error**: `Installation of package 'brms' had non-zero exit status`

**Solution**:
```r
# Install dependencies first
install.packages(c("Rcpp", "rstan"), type = "source")

# Configure C++ compiler
Sys.setenv(MAKEFLAGS = "-j4")  # Use 4 cores

# Retry brms
install.packages("brms")
```

### Issue 2: Model Fitting Takes Forever

**Symptoms**: Models running >4 hours

**Solutions**:
1. **Reduce iterations** (edit script):
   ```r
   # Change from:
   iter = 4000, warmup = 2000
   # To:
   iter = 2000, warmup = 1000
   ```

2. **Use more cores**:
   ```r
   cores = parallel::detectCores()  # Use all available
   ```

3. **Start with one genus**:
   ```r
   # Test with single genus first
   survival_data <- survival_data %>% filter(genus == "Poc")
   ```

### Issue 3: Convergence Warnings

**Warning**: `The largest R-hat is 1.05, indicating chains have not mixed`

**Solution**:
```r
# Increase adapt_delta (makes sampler more careful)
control = list(adapt_delta = 0.99, max_treedepth = 15)

# Or increase iterations
iter = 6000, warmup = 3000
```

### Issue 4: Out of Memory

**Error**: `cannot allocate vector of size X GB`

**Solutions**:
1. **Restart R** to clear memory:
   ```r
   .rs.restartR()
   ```

2. **Reduce posterior samples kept**:
   ```r
   # Keep every 2nd sample (thinning)
   thin = 2
   ```

3. **Process genera sequentially** instead of storing all in memory

### Issue 5: JSON Export Fails

**Error**: `argument is not a matrix`

**Cause**: Model predictions return unexpected format

**Solution**:
```r
# Check prediction structure
pred <- predict(survival_model, newdata = test_data, summary = TRUE)
str(pred)  # Should be matrix with columns: Estimate, Est.Error, Q2.5, Q97.5

# If it's a list, extract:
pred <- as.data.frame(pred)
```

---

## ⚡ Performance Optimization Tips

### Tip 1: Cache Models

Models are automatically cached in `outputs/models/*.rds`. **Don't delete these** unless you want to refit.

**To force refit**:
```bash
rm outputs/models/survival_bayesian_model.rds
Rscript scripts/R/06_advanced_population_models.R
```

### Tip 2: Parallel Chains

brms automatically uses 4 parallel chains. Maximize CPU usage:

```r
# In script, change to:
cores = 4  # Or parallel::detectCores()
```

**Mac/Linux**: Works by default
**Windows**: May need to set up parallel backend:
```r
library(parallel)
cl <- makeCluster(4)
# ... then use cores = cl
```

### Tip 3: Reduce Data for Testing

When testing pipeline changes:

```r
# At start of script, add:
if (Sys.getenv("TESTING") == "TRUE") {
  analysis_data <- analysis_data %>%
    filter(year >= 2018)  # Use recent years only
}
```

Run with:
```bash
TESTING=TRUE Rscript scripts/R/06_advanced_population_models.R
```

### Tip 4: Profile Memory Usage

```r
# Before fitting large model
gc()  # Garbage collection
mem_used <- pryr::mem_used()
print(mem_used)

# After fitting
mem_after <- pryr::mem_used()
print(mem_after - mem_used)  # Memory used by model
```

---

## 📊 Interpreting HTML Report

The R Markdown report (`05_advanced_population_dynamics.Rmd`) generates a ~250-page HTML document with:

### Sections

1. **Executive Summary** - Key findings at a glance
2. **Data Preparation** - Sample sizes, data structure
3. **Noise Decomposition** - Process vs observation error
4. **Hierarchical Models** - Survival, growth, recruitment
5. **State-Space Models** - Temporal dynamics
6. **IPM Analysis** - Population growth rates, elasticity
7. **Model Validation** - LOO-CV, posterior checks
8. **Sensitivity Analysis** - Robustness tests
9. **Exports** - Data for web app
10. **Summary** - Tables of key results

### How to Navigate

- **TOC** (table of contents) floats on left
- **Code folding**: Click "Code" buttons to show R code
- **Interactive plots**: Some figures are Plotly (hover, zoom)
- **Session info**: At bottom for reproducibility

### Key Plots to Check

1. **Figure 1**: Noise decomposition
   - Are violin plots visible for all genera?
   - Is process noise generally larger?

2. **Figure 2**: Lambda estimates
   - Do error bars overlap 1.0?
   - Any surprising genus rankings?

3. **Figure 3**: Survival curves
   - Smooth S-curves increasing with size?
   - Credible intervals not too wide?

4. **Posterior predictive checks**
   - Do blue lines (simulated) overlap dark line (observed)?
   - If not, model may be misspecified

5. **Trace plots**
   - Should look like "hairy caterpillars"
   - No trends, no stuck chains

---

## 🎨 Using Results in Frontend

### Loading JSON Data

```typescript
// In your React component
import { useEffect, useState } from 'react';

interface SurvivalPrediction {
  genus: string;
  size: number;
  survival_prob: number;
  survival_lower: number;
  survival_upper: number;
}

function useSurvivalPredictions() {
  const [data, setData] = useState<SurvivalPrediction[]>([]);

  useEffect(() => {
    fetch('/data/survival_predictions.json')
      .then(res => res.json())
      .then(setData);
  }, []);

  return data;
}
```

### Example Visualization

```typescript
import { Line } from 'recharts';

function SurvivalCurve({ genus }: { genus: string }) {
  const data = useSurvivalPredictions();
  const genusData = data.filter(d => d.genus === genus);

  return (
    <LineChart data={genusData} width={800} height={400}>
      <XAxis dataKey="size" label="Colony Size (cm)" />
      <YAxis label="Survival Probability" />
      <Line type="monotone" dataKey="survival_prob" stroke="#8884d8" />
      <Area type="monotone" dataKey="survival_lower" fill="#8884d8" opacity={0.2} />
      <Area type="monotone" dataKey="survival_upper" fill="#8884d8" opacity={0.2} />
    </LineChart>
  );
}
```

---

## 🧪 Validation Checklist

After running pipeline, verify:

### Statistical Quality

- [ ] All R-hat < 1.01 (convergence)
- [ ] All ESS > 400 (effective sample size)
- [ ] Posterior predictive p-values in [0.05, 0.95]
- [ ] No divergent transitions in MCMC
- [ ] Lambda estimates have credible intervals excluding 0

### Data Quality

- [ ] JSON files are valid (run through JSON validator)
- [ ] No NaN or Inf values in exports
- [ ] Array lengths match expectations (e.g., 4 genera)
- [ ] Figures render without errors

### Scientific Plausibility

- [ ] Lambda values in [0.5, 2.0] (coral range)
- [ ] Survival increases with size
- [ ] Process variance > 0
- [ ] Credible intervals not absurdly wide

---

## 📚 Further Reading

### Statistical Methods

- **Bayesian Workflow**: Gelman et al. (2020) "Bayesian Workflow" [arXiv:2011.01808]
- **IPM Theory**: Ellner et al. (2016) *Data-Driven Modelling of Structured Populations*
- **brms Guide**: Bürkner (2017) "brms: An R Package for Bayesian Multilevel Models"

### Coral Demography

- **Size-based models**: Madin et al. (2014) "Statistical approach to modeling coral demography"
- **Vital rates**: Edmunds (2010) "Population biology of Porites astreoides"

### Uncertainty Quantification

- **Variance decomposition**: de Valpine & Hastings (2002) "Fitting population models with process noise"
- **LOO-CV**: Vehtari et al. (2017) "Practical Bayesian model evaluation"

---

## 🆘 Getting Help

### If Models Don't Converge

1. Check [brms forums](https://discourse.mc-stan.org/c/interfaces/brms/36)
2. Post reprex (reproducible example)
3. Include: R version, brms version, operating system

### If Results Don't Make Sense

1. Review EDA notebook (`01_data_exploration.Rmd`)
2. Check for data quality issues in raw data
3. Consult with coral ecologist

### If Frontend Doesn't Load Data

1. Validate JSON: `jsonlint public/data/*.json`
2. Check browser console for errors
3. Verify paths are correct (relative vs absolute)

---

## 🎯 Next Steps After Running

1. **Review outputs** - Do results make ecological sense?

2. **Share HTML report** with collaborators for feedback

3. **Start frontend dev** - Begin with simplest visualization (Noise Dashboard)

4. **Write up methods** - Adapt R Markdown to manuscript

5. **Plan extensions**:
   - Add temperature covariates?
   - Spatial autocorrelation?
   - Multi-species models?

6. **Validate predictions** - Use next year's data when available

---

## ✅ Success Indicators

You'll know it worked if:

✅ Console shows "PIPELINE COMPLETE" with no errors
✅ 7 .rds files in `outputs/models/`
✅ 4 .png files in `outputs/figures/advanced_dynamics/`
✅ 5 .json files in `public/data/`
✅ HTML report renders and shows figures
✅ Lambda values are biologically plausible (0.5 - 2.0)
✅ No convergence warnings (R-hat < 1.01)

---

**Estimated Time Investment**:

| Task | First Time | Subsequent |
|------|------------|------------|
| Setup (install packages) | 30 min | 0 min |
| Run pipeline | 2-3 hours | 10 min (cached) |
| Review outputs | 30 min | 10 min |
| Understand methods | 2-4 hours | - |
| **TOTAL** | **5-8 hours** | **20 min** |

**ROI**: World-class demographic analysis with full uncertainty quantification 🎉

---

*Ready to run? Just execute:*

```bash
Rscript scripts/R/06_advanced_population_models.R
```

*Questions? See [ADVANCED_MODELS_SUMMARY.md](ADVANCED_MODELS_SUMMARY.md) for comprehensive documentation.*
