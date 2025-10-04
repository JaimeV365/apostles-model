# Boundary Detection System Guide - Final Version

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
console.log(`🔍 Near-zone early return for (${point.satisfaction},${point.loyalty}): found ${neighbors.size} neighbors:`, Array.from(neighbors));
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

**Example**: Point (4,7) on 7x10 scale with midpoint at (4,7):
```
   1 2 3 4 5 6 7 ← satisfaction
10 H H H L L L L ← loyalty
 9 H H H L L L L
 8 H H H L L L L
 7 H H H X L L L ← X = midpoint intersection (4,7)
 6 M M M M M M M
 5 M M M M M M M
 4 M M M M M M M
 3 D D D M M M M
 2 D D D M M M M
 1 D D D M M M M

H=Hostages, L=Loyalists, M=Mercenaries, D=Defectors
X=Point at midpoint intersection
```

**Detection Logic**:
- `point.satisfaction === midpoint.sat AND point.loyalty === midpoint.loy`
- Returns all four standard quadrants immediately: ["Loyalists", "Mercenaries", "Hostages", "Defectors"]
- **Bypasses all other boundary detection** including special zone logic

**Expected Results**:
- Point (4,7) on 7x10 scale with midpoint (4,7): All four quadrants ✅
- Point (3,5.5) on 5x10 scale with midpoint (3,5.5): All four quadrants ✅

**Why This Takes Priority**: Midpoint intersections are the most fundamental boundary points in the system - they represent the core division between all four standard quadrants and should always offer complete flexibility regardless of special zone configurations.

---

### 1. Near-Apostles Boundaries

#### **Inner Edges (Near-Apostles → Apostles)**

**Purpose**: Allow reassignment between near-apostles and apostles zones.

**Example**: With apostles at (5-7, 8-10), near-apostles L-shape at (4, 8-10) and (5-7, 7):
```
   1 2 3 4 5 6 7 ← satisfaction
10 . . . N A A A ← loyalty  
 9 . . . N A A A
 8 . . . N A A A  
 7 . . . N N N N  ← near-apostles bottom edge
 6 . . . . . . .

A=Apostles, N=Near-Apostles
```

**Detection Logic**:
- `isOnInnerSatEdge`: `point.satisfaction === apostlesMinSat` (edge between near-apostles and apostles)
- `isOnInnerLoyEdge`: `point.loyalty === apostlesMinLoy` (edge between near-apostles and apostles)

**Test Directions**:
- If on inner sat edge: Test RIGHT (`+0.1` satisfaction)
- If on inner loy edge: Test UP (`+0.1` loyalty)

**Expected Results**:
- Point (5,8): Near-Apostles ↔ Apostles ✅
- Point (5,9): Near-Apostles ↔ Apostles ✅

#### **Outer Edges (Near-Apostles → Standard Quadrants)**

**Purpose**: Allow reassignment from near-apostles to adjacent standard quadrants.

**Example**: Near-apostles outer edge meeting hostages and loyalists:
```
   1 2 3 4 5 6 7 ← satisfaction
10 H H H N A A A ← loyalty
 9 H H H N A A A  
 8 H H H N A A A
 7 L L L N N N N  ← near-apostles bottom edge meets loyalists
 6 L L L L L L L

H=Hostages, N=Near-Apostles, A=Apostles, L=Loyalists
```

**Detection Logic**:
- `isOnOuterSatEdge`: `point.satisfaction === nearApostlesMinSat` (left edge of L-shape)
- `isOnOuterLoyEdge`: `point.loyalty === nearApostlesMinLoy` (bottom edge of L-shape)

**Test Directions**:
- If on outer sat edge: Test LEFT (`-0.1` satisfaction) toward standard quadrants
- If on outer loy edge: Test DOWN (`-0.1` loyalty) toward standard quadrants

**Expected Results**:
- Point (4,9): Near-Apostles ↔ Hostages ✅
- Point (5,7): Near-Apostles ↔ Loyalists ✅

**🔧 Critical Fix Applied**: Removed the problematic midpoint condition that was preventing bottom boundary detection in 2x2 scenarios. Now all points on the bottom edge can properly test DOWN regardless of midpoint position.

### 2. Apostles Zone Boundaries

**Purpose**: Handle transitions between apostles and near-apostles (when enabled) or apostles and standard quadrants (when near-apostles disabled).

**Detection Logic**:
- `isOnInnerSatBoundary`: Left edge of apostles zone
- `isOnInnerLoyBoundary`: Bottom edge of apostles zone

**Behavior**:
- **If near-apostles enabled**: Show apostles ↔ near-apostles options
- **If near-apostles disabled**: Show apostles ↔ appropriate standard quadrant options

**🚨 Major Bug Fix**: The horizontal boundary logic was completely rewritten to fix the mercenaries/loyalists confusion:

**Before (Buggy)**:
```typescript
if (point.loyalty === apostlesMinLoy) {
  // On bottom boundary - what's below depends on midpoint  
  if (point.satisfaction >= midpoint.sat) {
    neighbors.add('mercenaries');  // ❌ WRONG!
  } else {
    neighbors.add('defectors');   // ❌ WRONG!
  }
}
```

**After (Fixed)**:
```typescript
if (point.loyalty === apostlesMinLoy) {
  // On bottom boundary - test what's actually below
  const testDown: DataPoint = {
    ...point,
    loyalty: point.loyalty - 0.1
  };
  const downQuadrant = getQuadrantForPoint(testDown);
  if (downQuadrant !== currentQuadrant) {
    neighbors.add(downQuadrant);
  }
}
```

**Why This Matters**: The original logic incorrectly hardcoded quadrant relationships, causing points like (5,8) in apostles to show "mercenaries" when they should show "loyalists". The new logic actually tests the adjacent point and determines its quadrant correctly.

### 3. Standard Quadrant Boundaries (Midpoint Lines)

**Purpose**: Handle transitions between the four main quadrants (Loyalists, Mercenaries, Hostages, Defectors).

#### **Midpoint On Grid Points**

**Example**: Midpoint at (4, 7) on 7x10 scale:
```
   1 2 3 4 5 6 7 ← satisfaction  
10 H H H | L L L ← loyalty
 9 H H H | L L L
 8 H H H | L L L
 7 H H H | L L L ← loyalty midpoint line
 6 M M M | M M M
 5 M M M | M M M
 4 D D D | M M M
 3 D D D | M M M
 2 D D D | M M M
 1 D D D | M M M

H=Hostages, L=Loyalists, M=Mercenaries, D=Defectors
| = satisfaction midpoint line at 4
```

**Detection Logic**:
- Points exactly ON satisfaction midpoint: Can reassign left/right
- Points exactly ON loyalty midpoint: Can reassign up/down  
- Points at intersection: Can reassign to all four quadrants

**Expected Results**:
- Point (4, 8): Hostages ↔ Loyalists
- Point (3, 7): Hostages ↔ Defectors
- Point (4, 7): All four quadrants

#### **Midpoint Between Grid Points**

**Example**: Midpoint at (3, 5.5) on 5x10 scale:
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
   1 2 3 4 5 6 7 ← satisfaction
10 ? ? ? ? ? ? ? ← loyalty (top edge)
 9 . . . . . . .
 8 . . . . . . .
 ...
 1 ? ? ? ? ? ? ? (bottom edge)
   ↑
   left edge
```

**Detection Logic**:
- `isOnGridEdge`: satisfaction=1, satisfaction=maxSat, loyalty=1, or loyalty=maxLoy
- `isInSpecialZone`: Must be false for this logic to run
- Tests "inward" from edge to find adjacent zones

**Expected Results**:
- Point (1, 8) in hostages: Hostages + potentially Loyalists if crossing midpoint
- Point (7, 3) in mercenaries: Mercenaries + potentially Defectors if crossing midpoint

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
// For near-zones, we need to distinguish between inner and outer edges
if (currentQuadrant === 'near_apostles' || currentQuadrant === 'near_terrorists') {
  // ... process near-zone boundaries ...
  
  // 🎯 THE CRITICAL FIX: Early return prevents standard boundary logic
  console.log(`🔍 Near-zone early return for (${point.satisfaction},${point.loyalty}): found ${neighbors.size} neighbors:`, Array.from(neighbors));
  return Array.from(neighbors).map(quadrant => ({
    quadrant,
    color: getColorForQuadrant(quadrant)
  }));
}
```

**Why This Matters**:
- **Before fix**: Near-apostles processing → continued to standard logic → grid edge detection added wrong options
- **After fix**: Near-apostles processing → immediate return → clean results ✅

### Test Movement Precision

**Small Increments**: The system uses small decimal increments (0.1) for testing adjacent zones:
```typescript
// Test positions
outerTestPositions.push({ sat: point.satisfaction - 0.1, loy: point.loyalty });
```

**Reasoning**: Small increments ensure we test the immediately adjacent cell without jumping too far and missing nearby zones.

### Comprehensive Debug Logging

The system includes extensive logging for troubleshooting:

```typescript
console.log(`🔍 Near-apostles outer edge test: isOnOuterSatEdge=${isOnOuterSatEdge}, isOnOuterLoyEdge=${isOnOuterLoyEdge} for point (${point.satisfaction},${point.loyalty})`);
console.log(`🔍 Testing DOWN from (${point.satisfaction},${point.loyalty}) -> (${point.satisfaction},${point.loyalty - 0.1})`);
console.log(`🔍 Outer test (${testPos.sat},${testPos.loy}) -> ${neighborQuadrant}`);
console.log(`✅ Added neighbor: ${neighborQuadrant}`);
```

---

## 🐛 Major Bugs Fixed

### 1. Near-Apostles Bottom Boundary Issue (2x2 Scenarios)

**Problem**: In 2x2 + near-apostles scenarios, bottom boundary points weren't showing reassignment options.

**Root Cause**: The `isOnOuterLoyEdge` condition was too restrictive: 
```typescript
// Before: Too restrictive
const isOnOuterLoyEdge = point.loyalty === nearApostlesMinLoy && point.satisfaction >= apostlesMinSat;

// After: Correct
const isOnOuterLoyEdge = point.loyalty === nearApostlesMinLoy;
```

**Plus**: Removed the problematic midpoint condition that prevented testing in 2x2 scenarios.

**Fix Applied**: Made the boundary detection more permissive and removed the midpoint restriction.

### 2. Apostles Horizontal Boundary Issue (All Scenarios)

**Problem**: When near-apostles was OFF, horizontal boundaries from apostles zone incorrectly showed "mercenaries" instead of "loyalists".

**Root Cause**: Hardcoded logic incorrectly assumed quadrant relationships:
```typescript
// Before: Hardcoded and wrong
if (point.satisfaction >= midpoint.sat) {
  neighbors.add('mercenaries');  // ❌ WRONG!
}

// After: Actually test the point
const downQuadrant = getQuadrantForPoint(testDown);
if (downQuadrant !== currentQuadrant) {
  neighbors.add(downQuadrant);  // ✅ CORRECT!
}
```

**Why This Only Affected Horizontal**: Vertical boundaries already used the correct testing approach, while horizontal boundaries used flawed hardcoded logic.

**Fix Applied**: Replaced hardcoded logic with actual point testing, making horizontal boundaries work the same way as vertical boundaries.

---

## 🎯 Success Metrics

### ✅ System Working Correctly When:

1. **No Contamination**: Special zone points show only appropriate options
2. **Clean Separation**: Standard and special boundary logic don't interfere  
3. **Consistent Results**: Same inputs always produce same outputs
4. **Scale Independence**: Works correctly on any satisfaction/loyalty scale
5. **Midpoint Flexibility**: Handles both on-grid and between-grid midpoints
6. **Direction Independence**: Horizontal and vertical boundaries work identically
7. **Near-Zone Flexibility**: Works correctly with near-apostles enabled/disabled

### ❌ Warning Signs Fixed:

1. ~~Points showing too many reassignment options~~ ✅ **FIXED**
2. ~~Special zone points offering standard quadrant options incorrectly~~ ✅ **FIXED**
3. ~~Horizontal boundaries showing wrong options~~ ✅ **FIXED**
4. ~~Near-apostles bottom boundaries not working in 2x2~~ ✅ **FIXED**

---

## 🔬 Testing Strategies

### Comprehensive Test Matrix

**Grid Sizes Tested**: 2x2, 3x3, 4x4, 5x5 with various midpoint positions
**Near-Apostles**: Both enabled and disabled
**Boundary Types**: All boundary types (inner, outer, horizontal, vertical)

**Specific Scenarios Validated**:
- 2x2 + near-apostles: Bottom boundary reassignment ✅
- 4x4 + near-apostles OFF: Interior horizontal boundaries ✅  
- 3x3 + near-apostles OFF: Bottom boundary loyalists/apostles ✅
- All vertical boundaries: Working in all scenarios ✅

### Debug Logging Strategy

Use console logs to trace boundary detection:
```typescript
🔍 getBoundaryOptions for point (5,8)
🔍 showSpecialZones: true
🔍 showNearApostles: false  
🔍 Current quadrant: apostles
🔍 Outer test (5,7.9) -> loyalists
✅ Added neighbor: loyalists
🔍 getBoundaryOptions result: 2 options: ["Apostles", "Loyalists"]
```

---

## 📚 Maintenance Guidelines

### When Adding New Special Zones

1. **Add to early return condition**:
```typescript
if (currentQuadrant === 'near_apostles' || currentQuadrant === 'near_terrorists' || currentQuadrant === 'new_special_zone') {
```

2. **Implement zone-specific boundary logic**
3. **Add comprehensive logging**
4. **Test both enabled/disabled states**

### When Modifying Boundary Logic

- **Always use point testing over hardcoded logic**
- **Maintain early return for special zones**
- **Test both horizontal and vertical boundaries**
- **Validate with multiple grid sizes**

### Performance Considerations

- Early return improves performance by avoiding unnecessary processing
- Boundary calculations are lightweight (simple arithmetic)
- Debug logging can be extensive but is valuable for troubleshooting

---

## 🏆 Final Implementation Status

### ✅ Fully Working Features

1. **Special Zone Boundaries**: All near-apostles and apostles boundaries work correctly
2. **Standard Quadrant Boundaries**: All midpoint-based boundaries work correctly  
3. **Grid Edge Boundaries**: All visualization edge boundaries work correctly
4. **Midpoint Intersections**: All four-quadrant intersections work correctly
5. **Scale Independence**: Works on any satisfaction/loyalty scale combination
6. **Near-Zone Flexibility**: Works with near-apostles both enabled and disabled

### 🎯 Key Achievements

- **2x2 + Near-Apostles**: Now shows correct reassignment options ✅
- **Horizontal Boundaries**: Now show correct quadrants (loyalists, not mercenaries) ✅
- **Vertical Boundaries**: Continue to work perfectly ✅
- **All Grid Sizes**: 2x2, 3x3, 4x4, 5x5+ all work correctly ✅

---

## 📖 Related Documentation

- [Apostles Model Classification System - Complete Documentation](./classification-system-final.md)
- [QuadrantAssignmentContext.tsx](../context/QuadrantAssignmentContext.tsx)

---

*Document Version: Final*  
*Last Updated: January 2025*  
*Status: Production Ready ✅*  
*All Critical Issues: Resolved ✅*