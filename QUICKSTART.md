# Quick Start Guide

## You're All Set! 🎉

The project has been successfully set up with all the foundational code. Here's what's been completed:

### ✅ Completed

1. **Project Structure**: Full React + TypeScript + Vite setup
2. **Type Definitions**: Complete TypeScript interfaces for coral data
3. **Data Pipeline**: Excel parsing and transformation utilities
4. **State Management**: Zustand store with filters, UI state, and actions
5. **Components**:
   - FilterPanel (genus, transect, year range, size filters)
   - YearSlider (with play/pause animation)
   - App layout with header and footer
6. **Utilities**:
   - Color schemes for genera and fates
   - Statistical functions (aggregation, Kaplan-Meier)
   - Data transformation (wide to long format)

### 🚀 Running the Application

```bash
cd ~/coral-ontogeny-viz
npm run dev
```

The app will open at http://localhost:3000

### 📁 Data File

Your data file is already in place at:
```
/Users/adrianstier/coral-ontogeny-viz/data/LTER 1 Back Reef Transects 1-2_2013-2024.xlsx
```

The app will attempt to load it from `/data/LTER_1_Back_Reef_Transects_1-2_2013-2024.xlsx`.

**Important**: You'll need to either:
1. Rename the file to match: `LTER_1_Back_Reef_Transects_1-2_2013-2024.xlsx` (with underscores)
2. Or update the path in [src/hooks/useCoralData.ts](src/hooks/useCoralData.ts:10)

### 📊 Current Status

The application has a working foundation with:
- ✅ Data loading system
- ✅ Filter controls (genus, transect, year, size)
- ✅ Year animation slider with play/pause
- ✅ Responsive dark-themed UI
- ⏳ TransectMap (placeholder - needs D3 implementation)
- ⏳ SizeDistribution (placeholder - needs D3 histogram)
- ⏳ PopulationTimeSeries (not yet created)
- ⏳ SurvivalCurve (not yet created)

### 🎯 Next Steps

To complete the visualization system, you need to implement:

#### Phase 1 (MVP) - Priority Components

1. **TransectMap Component** ([src/components/TransectMap.tsx](src/components/TransectMap.tsx))
   - 2D spatial view showing coral positions
   - Symbol shapes by genus (circle, square, triangle, diamond)
   - Color by fate or genus
   - Size by coral diameter
   - Interactive hover and click

2. **SizeDistribution Component** ([src/components/SizeDistribution.tsx](src/components/SizeDistribution.tsx))
   - Histogram with log-scaled bins
   - Stacked by genus
   - Updates with year changes

#### Phase 2 - Analytics

3. **PopulationTimeSeries** - Line chart showing colony counts over time
4. **IndividualTrajectory** - Growth trajectory for selected corals
5. **SurvivalCurve** - Kaplan-Meier survival analysis

#### Phase 3 - Advanced Features

6. Fission/fusion relationship visualization
7. Export functionality (PNG/SVG/CSV)
8. Spatial analysis tools

### 📚 Key Files to Know

- **[src/types/coral.ts](src/types/coral.ts)** - All TypeScript type definitions
- **[src/store/useStore.ts](src/store/useStore.ts)** - Global state management
- **[src/utils/dataTransform.ts](src/utils/dataTransform.ts)** - Data parsing logic
- **[src/utils/colors.ts](src/utils/colors.ts)** - Color schemes
- **[src/App.tsx](src/App.tsx)** - Main application component
- **[IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md)** - Detailed implementation roadmap
- **[CLAUDE.md](CLAUDE.md)** - Technical implementation guide

### 🐛 Troubleshooting

**Data not loading?**
- Check that the data file name matches in [src/hooks/useCoralData.ts](src/hooks/useCoralData.ts:10)
- Open browser console (F12) to see error messages
- Verify the file is in the `data/` directory

**Filters not working?**
- Make sure data has loaded successfully
- Check browser console for errors
- Verify data has observations for the selected year

**Animation not starting?**
- Click the "Play" button in the year slider
- Check that `playAnimation` state is updating in Zustand store

### 📖 Documentation

- [PRD.md](PRD.md) - Product requirements and feature specifications
- [CLAUDE.md](CLAUDE.md) - Implementation guide with code examples
- [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) - 3-phase development roadmap
- [README.md](README.md) - Project overview and setup instructions

### 💡 Development Tips

1. **Start the dev server**: `npm run dev`
2. **Check types**: `npm run type-check`
3. **Hot reload**: Vite provides instant hot module replacement
4. **State inspection**: Use React DevTools and Zustand DevTools
5. **D3 integration**: Import D3 modules as needed in components

### 🎨 Color Schemes (Already Configured)

```typescript
Genera:
- Pocillopora: #E64B35 (red-orange)
- Porites: #4DBBD5 (cyan)
- Acropora: #00A087 (teal)
- Millepora: #8B4513 (brown)

Fates:
- Growth: #2ECC71 (green)
- Recruitment: #9B59B6 (purple)
- Death: #E74C3C (red)
- Fission: #3498DB (blue)
```

### 🚀 Ready to Build!

You now have a solid foundation. The next priority is implementing the **TransectMap** component to visualize coral spatial distribution. Refer to [CLAUDE.md](CLAUDE.md) for detailed implementation guidance.

Happy coding! 🐠🪸
