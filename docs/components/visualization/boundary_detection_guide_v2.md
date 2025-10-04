# Boundary Detection System Guide v2.0

## Overview

The boundary detection system in the Apostles Model determines which zones a data point can be reassigned to when it's positioned on or near zone boundaries. This system handles multiple complex scenarios where different zones meet and provides the InfoBox with accurate reassignment options.

## 🎯 Core Purpose

When a user clicks on a data point, the InfoBox shows reassignment options based on the point's position relative to zone boundaries. The system must accurately detect which neighboring zones are valid reassignment targets.

**Key Function**: `getBoundaryOptions(point: DataPoint): QuadrantOption[]`

---

## 🏗️ System Architecture

### Priority-Based Processing Order

The boundary detection follows a **strict priority order** to prevent conflicts:

1. **🟣 Midpoint Intersection Logic** (Highest Priority)
   - Points exactly on midpoint intersection
   - Shows all four standard quadrants
   - Bypasses all other detection logic

2. **🔴 Special Zone Boundary Logic** (High Priority)
   - Near-apostles inner/outer edges
   - Near-terrorists inner/outer edges  
   - Apostles zone boundaries
   - Terrorists zone boundaries

3. **🟡 Standard Quadrant Logic** (Medium Priority)
   - Midpoint line boundaries (satisfaction/loyalty)
   - Cross-quadrant transitions

4. **🟢 Grid Edge Logic** (Lowest Priority)
   - Only for standard quadrant points
   - Visualization boundary handling

### 🚨 Critical Implementation Detail

**EARLY RETURN FOR SPECIAL ZONES**: The most important aspect of the system is that when processing special zones (near-apostles, near-terrorists), the function **returns immediately** and **never executes** the standard boundary logic:

```typescript
// After processing near-apostles/near-terrorists
return Array.from(neighbors).map(quadrant => ({
  quadrant,
  color: getColorForQuadrant(quadrant)
}));
```

This prevents grid edge detection from contaminating special zone boundary results.

---

## 📍 Boundary Detection Scenarios

### 0. Midpoint Intersection (Highest Priority)

**Purpose**: Points exactly on midpoint intersection show all four standard quadrants, regardless of special zone overlaps.

**Priority**: **Highest** - takes precedence over all other boundary logic, including special zones.

**Example**: Point (2,6) on 3-7 scale with midpoint at (2,6):
```
   1 2 3 ← satisfaction
7  H A A ← loyalty
6  H X A ← X = midpoint intersection (2,6)
5  M M M
4  M M M
3  M M M
2  T T M
1  T T M

H=Hostages, A=Apostles, M=Mercenaries, T=Terrorists
X=Point at midpoint intersection
```

**Detection Logic**:
- `point.satisfaction === midpoint.sat AND point.loyalty === midpoint.loy`
- Returns all four standard quadrants immediately: ["Loyalists", "Mercenaries", "Hostages", "Defectors"]
- **Bypasses all other boundary detection** including special zone logic

**Expected Results**:
- Point (2,6) on 3-7 scale with midpoint (2,6): All four quadrants ✅
- Point (3,5.5) on 5-10 scale with midpoint (3,5.5): All four quadrants ✅
- Point (2.5,4) on 5-7 scale with midpoint (2.5,4): All four quadrants ✅

**Why This Takes Priority**: Midpoint intersections are the most fundamental boundary points in the system - they represent the core division between all four standard quadrants and should always offer complete flexibility regardless of special zone configurations.

---

### 1. Near-Apostles Boundaries

#### **Inner Edges (Near-Apostles → Apostles)**

**Purpose**: Allow reassignment between near-apostles and apostles zones.

**Example**: With apostles at (4-5, 9-10), near-apostles at (3, 9-10) and (4-5, 8):
```
   1 2 3 4 5 ← satisfaction
10 . . N A A ← loyalty  
 9 . . N A A
 8 . . N N N
 7 . . . . .

A=Apostles, N=Near-Apostles
```

**Detection Logic**:
- `isOnInnerSatEdge`: `point.satisfaction === apostlesMinSat` (edge between near-apostles and apostles)
- `isOnInnerLoyEdge`: `point.loyalty === apostlesMinLoy` (edge between near-apostles and apostles)

**Test Directions**:
- If on inner sat edge: Test RIGHT (`+1` satisfaction)
- If on inner loy edge: Test UP (`+1` loyalty)

**Expected Results**:
- Point (4,9): Near-Apostles ↔ Apostles ✅
- Point (4,10): Near-Apostles ↔ Apostles ✅

#### **Outer Edges (Near-Apostles → Standard Quadrants)**

**Purpose**: Allow reassignment from near-apostles to adjacent standard quadrants.

**Example**: Near-apostles outer edge meeting hostages:
```
   1 2 3 4 5 ← satisfaction
10 H H N A A ← loyalty
 9 H H N A A  
 8 . . N N N
 7 . . . . .

H=Hostages, N=Near-Apostles, A=Apostles
```

**Detection Logic**:
- `isOnOuterSatEdge`: `point.satisfaction === nearApostlesMinSat` (left edge of L-shape)
- `isOnOuterLoyEdge`: `point.loyalty === nearApostlesMinLoy` (bottom edge of L-shape)

**Test Directions**:
- If on outer sat edge: Test LEFT (`-0.1` satisfaction) toward standard quadrants
- If on outer loy edge: Test DOWN (`-0.1` loyalty) toward standard quadrants
  - **Important**: Only test DOWN if `point.loyalty > midpoint.loy` to prevent incorrect cross-midpoint detection

**Expected Results**:
- Point (3,9): Near-Apostles ↔ Hostages ✅
- Point (3,10): Near-Apostles ↔ Hostages ✅
- Point (4,8): Near-Apostles ↔ (appropriate standard quadrant based on midpoint) ✅

### 2. Apostles Zone Boundaries

**Purpose**: Handle transitions between apostles and near-apostles (when enabled) or apostles and standard quadrants (when near-apostles disabled).

**Detection Logic**:
- `isOnInnerSatBoundary`: Left edge of apostles zone
- `isOnInnerLoyBoundary`: Bottom edge of apostles zone

**Behavior**:
- **If near-apostles enabled**: Show apostles ↔ near-apostles options
- **If near-apostles disabled**: Show apostles ↔ appropriate standard quadrant options

### 3. Standard Quadrant Boundaries (Midpoint Lines)

**Purpose**: Handle transitions between the four main quadrants (Loyalists, Mercenaries, Hostages, Defectors).

#### **Midpoint On Grid Points**

**Example**: Midpoint at (3, 6) on 1-5 scale:
```
   1 2 3 4 5 ← satisfaction  
10 H H | L L ← loyalty
 9 H H | L L
 8 H H | L L
 7 H H | L L
 6 H H | L L ← loyalty midpoint line
 5 M M | M M
 4 M M | M M
 3 D D | M M
 2 D D | M M
 1 D D | M M

H=Hostages, L=Loyalists, M=Mercenaries, D=Defectors
| = satisfaction midpoint line at 3
```

**Detection Logic**:
- Points exactly ON satisfaction midpoint: Can reassign left/right
- Points exactly ON loyalty midpoint: Can reassign up/down  
- Points at intersection: Can reassign to all four quadrants

**Expected Results**:
- Point (3, 7): Hostages ↔ Loyalists
- Point (2, 6): Hostages ↔ Defectors
- Point (3, 6): All four quadrants

#### **Midpoint Between Grid Points**

**Example**: Midpoint at (3, 5.5) on 1-5 scale:
```
   1 2 3 4 5 ← satisfaction  
10 H H | L L ← loyalty
 9 H H | L L
 8 H H | L L
 7 H H | L L
 6 H H | L L
5.5 ---- ---- ← loyalty midpoint line (between grid points)
 5 M M | M M
 4 M M | M M
 3 D D | M M
 2 D D | M M
 1 D D | M M
```

**Detection Logic**:
- Points exactly ON satisfaction midpoint (3): Can reassign left/right
- No points exactly ON loyalty midpoint (5.5 is between grid points)
- Uses `< midpoint.loy` vs `>= midpoint.loy` for loyalty classification

**Expected Results**:
- Point (3, 6): Hostages ↔ Loyalists  
- Point (3, 5): Defectors ↔ Mercenaries
- No point exactly on loyalty midpoint

### 4. Grid Edge Boundaries (Visualization Edges)

**Purpose**: Handle points at the very edge of the visualization grid that are **NOT in special zones**.

**Critical Rule**: Only applies to **standard quadrant points**. Special zone points use early return and never reach this logic.

**Example**: Points at visualization boundaries:
```
   1 2 3 4 5 ← satisfaction
10 ? ? ? ? ? ← loyalty (top edge)
 9 . . . . .
 8 . . . . .
 ...
 1 ? ? ? ? ? (bottom edge)
   ↑
   left edge
```

**Detection Logic**:
- `isOnGridEdge`: satisfaction=1, satisfaction=maxSat, loyalty=1, or loyalty=maxLoy
- `isInSpecialZone`: Must be false for this logic to run
- Tests "inward" from edge to find adjacent zones

**Expected Results**:
- Point (1, 7) in hostages: Hostages + potentially Loyalists if crossing midpoint
- Point (5, 3) in mercenaries: Mercenaries + potentially Defectors if crossing midpoint

### 5. Near-Terrorists Boundaries

**Purpose**: Handle L-shaped near-terrorists zone (when enabled and space available).

**Similar Logic** to near-apostles but in bottom-left area:
- **Inner edges**: Near-terrorists → Terrorists  
- **Outer edges**: Near-terrorists → Standard quadrants
- **Same early return** prevents interference with other boundary logic

---

## 🔧 Implementation Details

### The Early Return Fix

**Location**: `getNeighboringZones()` in QuadrantAssignmentContext.tsx

**The Critical Code**:
```typescript
// PRIORITY 1: Midpoint intersection (highest priority)
if (point.satisfaction === midpoint.sat && point.loyalty === midpoint.loy) {
  console.log(`🎯 Point (${point.satisfaction},${point.loyalty}) is exactly on midpoint intersection - showing all 4 quadrants`);
  const allQuadrants = ['loyalists', 'mercenaries', 'hostages', 'defectors'];
  allQuadrants.forEach(quadrant => {
    addOption(quadrant as QuadrantType, getColorForQuadrant(quadrant as QuadrantType));
  });
  return options;
}

// PRIORITY 2: Special zone boundaries
// For near-zones, we need to distinguish between inner and outer edges
if (currentQuadrant === 'near_apostles' || currentQuadrant === 'near_terrorists') {
  // ... process near-zone boundaries ...
  
  // 🎯 THE CRITICAL FIX: Early return prevents standard boundary logic
  return Array.from(neighbors).map(quadrant => ({
    quadrant,
    color: getColorForQuadrant(quadrant)
  }));
}
```

**Why This Matters**:
- **Before fix**: Near-apostles processing → continued to standard logic → grid edge detection added wrong options
- **After fix**: Midpoint intersection → immediate return with all 4 quadrants ✅
- **After fix**: Near-apostles processing → immediate return → clean results ✅

### Test Movement Precision

**Small Increments**: The system uses small decimal increments (0.1) for testing adjacent zones:
```typescript
// Test positions
outerTestPositions.push({ sat: point.satisfaction - 0.1, loy: point.loyalty });
```

**Reasoning**: Small increments ensure we test the immediately adjacent cell without jumping too far and missing nearby zones.

### Boundary Validation

**Grid Bounds Check**: All test positions are validated:
```typescript
if (testPos.sat >= 1 && testPos.sat <= maxSat && testPos.loy >= 1 && testPos.loy <= maxLoy) {
  // Process test position
}
```

---

## 📊 Expected Behavior Matrix

| Point Location | Zone | Scale | Midpoint | Expected Options |
|---------------|------|-------|----------|------------------|
| (2, 6) | Midpoint | 1-3, 1-7 | (2, 6) | All four quadrants |
| (3, 5.5) | Midpoint | 1-5, 1-10 | (3, 5.5) | All four quadrants |
| (3, 9) | Near-Apostles | 1-5, 1-10 | (3, 5.5) | Near-Apostles, Hostages |
| (3, 10) | Near-Apostles | 1-5, 1-10 | (3, 5.5) | Near-Apostles, Hostages |
| (4, 9) | Apostles | 1-5, 1-10 | (3, 5.5) | Apostles, Near-Apostles |
| (4, 8) | Near-Apostles | 1-5, 1-10 | (3, 5.5) | Near-Apostles, Loyalists |
| (3, 7) | Hostages | 1-5, 1-10 | (3, 5.5) | Hostages, Loyalists |
| (3, 6) | Hostages | 1-5, 1-10 | (3, 5.5) | Hostages, Loyalists |
| (2, 5.5) | Hostages | 1-5, 1-10 | (3, 5.5) | Hostages, Defectors |
| (1, 7) | Hostages | 1-5, 1-10 | (3, 5.5) | Hostages (+Loyalists if crossing) |

---

## 🐛 Troubleshooting Guide

### Problem: Point shows too many options (e.g., 3 instead of 2)

**Diagnosis**: Check if special zone early return is working
```typescript
// Look for this in console logs
console.log(`🔍 getBoundaryOptions result: ${options.length} options:`, options.map(o => o.group));
```

**Fix**: Ensure early return is present after special zone processing

### Problem: Near-apostles points show standard quadrant options incorrectly

**Root Cause**: Grid edge detection running for special zone points
**Solution**: Verify early return prevents fall-through to standard logic

### Problem: Standard quadrant boundaries not working

**Diagnosis**: Check if points are incorrectly classified as special zones
**Solution**: Verify classification logic and special zone boundaries

### Problem: Midpoint boundaries inconsistent

**Check**:
1. Midpoint position (on grid vs between grid)
2. Scale ranges
3. Classification logic using correct midpoint values

---

## 🔬 Testing Strategies

### Unit Tests

**Test Categories**:
1. **Near-zone boundaries**: All L-shape edges and corners
2. **Standard boundaries**: Midpoint lines and intersections  
3. **Grid edges**: Only for non-special zone points
4. **Early return**: Verify special zones don't continue to standard logic

### Manual Testing

**Test Matrix**: For each combination:
- Scales: 1-5, 1-7, 1-10
- Zone sizes: 0.5, 1, 2
- Midpoint positions: On grid, between grid
- Near-apostles: Enabled/disabled

**Validation**: Each click should show exactly the expected options, no more, no less.

### Debug Logging

**Key Console Logs**:
```typescript
🔍 getBoundaryOptions for point (3,9)
🔍 showSpecialZones: true
🔍 showNearApostles: true  
🔍 Current quadrant: near_apostles
🔍 getBoundaryOptions result: 2 options: ["Near-Apostles", "Hostages"]
```

---

## 📚 Maintenance Guidelines

### When Adding New Special Zones

1. **Add to early return condition**:
```typescript
if (currentQuadrant === 'near_apostles' || currentQuadrant === 'near_terrorists' || currentQuadrant === 'new_special_zone') {
```

2. **Implement zone-specific boundary logic**
3. **Add to special zone classification check**
4. **Update documentation and tests**

### When Modifying Standard Boundaries

- Changes only affect standard quadrant points
- Special zones remain isolated due to early return
- Test cross-midpoint transitions thoroughly

### Performance Considerations

- Early return improves performance by avoiding unnecessary processing
- Boundary calculations are lightweight (simple arithmetic)
- Consider memoization only for very large datasets

---

## 🎯 Success Metrics

### ✅ System Working Correctly When:

1. **No Contamination**: Special zone points show only appropriate options
2. **Clean Separation**: Standard and special boundary logic don't interfere  
3. **Consistent Results**: Same inputs always produce same outputs
4. **Scale Independence**: Works correctly on any satisfaction/loyalty scale
5. **Midpoint Flexibility**: Handles both on-grid and between-grid midpoints

### ❌ Warning Signs:

1. Points showing too many reassignment options
2. Special zone points offering standard quadrant options incorrectly
3. Inconsistent results when changing zones or midpoint
4. Grid edge detection affecting special zone points

---

## 📖 Related Documentation

- [Apostles Model Classification System - Complete Documentation.md](./classification-system.md)
- [QuadrantAssignmentContext.tsx](../context/QuadrantAssignmentContext.tsx)
- [Special Areas Control System](./special-areas-control.md)

---

*Document Version: 2.0*  
*Last Updated: January 2025*  
*Status: Production Ready ✅*  
*Critical Fix: Early return for special zones implemented ✅*