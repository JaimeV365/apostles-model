# GridSystem Component

## Overview
The GridSystem component manages the visualization's underlying grid structure, scale markers, and axis labels. It provides a fixed-size grid foundation for data point positioning and visual reference points in the Apostles Model.

## Features
- Fixed-size grid layout
- Scale marker display
- Axis labeling
- Half-grid support
- Scale number display
- Legend management
- Stable positioning

## Container Management

### Fixed Grid Size
- Grid maintains constant size regardless of container adjustments
- Only padding adjusts for scale numbers and legends
- Cell sizes remain consistent for accurate data point positioning

### Padding System
```css
/* Base container size */
padding: 20px 40px 20px 20px;

/* When scale numbers are shown */
padding-left: 40px;
padding-bottom: 40px;

/* When legends are shown */
padding-left: 60px;
padding-bottom: 60px;

/* When both are shown */
padding-left: 80px;
padding-bottom: 80px;
```

### Grid Area
- Fixed positioning within container
- Consistent right-side gap (40px)
- Top and left edges maintain stable spacing (20px)

## Scale and Legend Management
- Scale numbers positioned closer to grid
- Legends positioned outside scale numbers when both visible
- Non-overlapping placement with automatic spacing
- Maintains readability regardless of visibility combinations

[Rest of the document remains the same...]