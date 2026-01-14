# Year Navigation Test Screenshots Index

## Quick Reference

This directory contains automated test screenshots from Playwright testing of the year navigation functionality.

---

## Screenshot Details

### test-01-initial-load.png
- **Year**: 2013 (default/minimum)
- **Purpose**: Verify initial page load and default state
- **Shows**: Full page with header, filters, and colony visualization
- **Colony Count**: 387 colonies visible
- **File Size**: ~562 KB

### test-02-year-middle.png
- **Year**: 2018 (middle of range)
- **Purpose**: Test slider movement to mid-point
- **Shows**: Visualization state after moving slider to 2018
- **Action**: Slider moved from 2013 to 2018
- **File Size**: ~564 KB

### test-03-year-max.png
- **Year**: 2023 (maximum)
- **Purpose**: Test slider at maximum year
- **Shows**: Latest year in dataset
- **Action**: Slider moved to maximum value
- **File Size**: ~566 KB

### test-04-year-min.png
- **Year**: 2013 (minimum, return test)
- **Purpose**: Verify bidirectional navigation works
- **Shows**: Return to starting year
- **Action**: Slider moved back to minimum from maximum
- **File Size**: ~565 KB

### test-07-final-state.png
- **Year**: 2013 (final verification)
- **Purpose**: Document final test state
- **Shows**: Stable UI after all navigation tests
- **File Size**: ~565 KB

---

## What to Look For

### Header Area
- Year range display: "2013–2024"
- Colony count: "387 Colonies"
- Project title: "Hunter Lenihan Time Series • Mo'orea LTER"

### Year Slider Control
- Located in header/controls area (not footer)
- Range input slider
- Min: 2013, Max: 2023
- Should be visible and interactive

### Visualization Area
- SVG-based colony display
- 387 circular elements representing coral colonies
- Visual distribution across transect space
- Elements should update when year changes

### Filter Panel
- Should be visible on left side
- Genus filters (Pocillopora, Porites, Acropora, Millepora)
- Status filters (alive, dead, etc.)

---

## Test Validation Points

✅ **Page loads successfully** - test-01 shows complete UI  
✅ **Year slider is present** - Located in header area  
✅ **Slider accepts input** - Tests 02-04 show year changes  
✅ **Visualization updates** - Different years show in screenshots  
✅ **No crashes or errors** - All screenshots captured successfully  
✅ **Data loads correctly** - 387 colonies displayed  

---

## How to View

Screenshots are full-page captures and can be opened with any image viewer:

```bash
# View on macOS
open outputs/test-01-initial-load.png

# View all screenshots
open outputs/test-*.png

# View in browser
# Simply drag and drop files into browser window
```

---

## Regenerating Screenshots

To regenerate these screenshots:

```bash
# Run the Playwright test
npx playwright test test-year-navigation.spec.ts

# Screenshots will be automatically saved to outputs/ directory
```

---

**Generated**: 2026-01-13  
**Test Status**: All tests passed ✅  
**Total Screenshots**: 5 files (~2.8 MB total)
