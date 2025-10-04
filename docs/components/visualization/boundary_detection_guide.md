# Boundary Detection System Guide

## Overview

The boundary detection system in the Apostles Model determines which zones a data point can be reassigned to when it's positioned on or near zone boundaries. This system handles multiple complex scenarios where different zones meet.

## Core Purpose

When a user clicks on a data point, the InfoBox shows reassignment options based on the point's position relative to zone boundaries. The system must accurately detect which neighboring zones are valid reassignment targets.

---

## Boundary Detection Scenarios

### 1. Standard Quadrant Boundaries (Midpoint Lines)

**Purpose:** Handle transitions between the four main quadrants (Loyalists, Mercenaries, Hostages, Defectors).

**Example:** For midpoint at (3, 5.5):
```
   1 2 3 4 5 ← satisfaction  
10 H H | L L ← loyalty
 9 H H | L L
 8 H H | L L
 7 H H | L L
 6 H H | L L (5.5 midpoint line)
 5 M M | M M
 4 M M | M M
 3 D D | M M
 2 D D | M M
 1 D D | M M

H=Hostages, L=Loyalists, M=Mercenaries, D=Defectors
| = vertical midpoint boundary at satisfaction=3
```

**Detection Logic:**
- Points exactly ON the satisfaction midpoint line (satisfaction = 3) can be reassigned to adjacent left/right quadrants
- Points exactly ON the loyalty midpoint line (loyalty = 5.5) can be reassigned to adjacent up/down quadrants
- Points at the intersection (3, 5.5) can be reassigned to all four quadrants

**Expected Reassignment Options:**
- Point (3, 7): Hostages ↔ Loyalists
- Point (2, 5.5): Hostages ↔ Defectors  
- Point (3, 5.5): All four quadrants

---

### 2. Special Zone Inner Boundaries (Zone to Zone)

**Purpose:** Handle transitions between special zones and their near-zones.

**Example:** Apostles zone (4-5, 9-10) with near-apostles:
```
   1 2 3 4 5 ← satisfaction
10 . . N A A ← loyalty  
 9 . . N A A
 8 . . . . .

A=Apostles, N=Near-Apostles
```

**Detection Logic:**
- Points on the boundary between apostles and near-apostles should show both as options
- This allows users to move points between the main zone and its buffer zone

**Expected Reassignment Options:**
- Point (4, 9): Apostles ↔ Near-Apostles
- Point (4, 10): Apostles ↔ Near-Apostles

---

### 3. Special Zone Outer Boundaries (Zone to Standard Quadrant)

**Purpose:** Handle transitions between special zones and standard quadrants.

**Example:** Near-apostles outer edge meeting standard quadrants:
```
   1 2 3 4 5 ← satisfaction
10 H H N A A ← loyalty
 9 H H N A A  
 8 . . . . .

H=Hostages, N=Near-Apostles, A=Apostles
```

**Detection Logic:**
- Points on the outer edge of near-apostles should show reassignment to adjacent standard quadrants
- This is the most complex scenario as it involves special zone logic + standard quadrant logic

**Expected Reassignment Options:**
- Point (3, 9): Near-Apostles ↔ Hostages
- Point (3, 10): Near-Apostles ↔ Hostages
- Point (4, 8): Near-Apostles ↔ Loyalists (if 8 is below midpoint) or Near-Apostles ↔ Mercenaries

---

### 4. Grid Edge Boundaries (Edge of Visualization)

**Purpose:** Handle points at the very edge of the visualization grid that are NOT in special zones.

**Example:** Points at the visualization boundaries:
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

**Detection Logic:**
- Points at satisfaction=1 (left edge), satisfaction=maxSat (right edge), loyalty=1 (bottom edge), or loyalty=maxLoy (top edge)
- ONLY applies to points in standard quadrants, NOT special zones
- Tests "inward" from the edge to find adjacent zones

**Expected Reassignment Options:**
- Point (1, 7) in hostages: Should test right (2, 7) and potentially show loyalists if crossing midpoint
- Point (5, 3) in mercenaries: Should test left (4, 3) and potentially show defectors if crossing midpoint

---

### 5. Corner Cases (Multiple Boundaries)

**Purpose:** Handle complex intersections where multiple zone boundaries meet.

**Example:** Corner of near-apostles L-shape:
```
   1 2 3 4 5 ← satisfaction
10 . . N A A ← loyalty
 9 . . N A A
 8 . . X . . ← X is at corner (3,8)
 7 . . . . .

X can potentially be reassigned to: Near-Apostles, Hostages, Loyalists
```

**Detection Logic:**
- Points at corners where multiple zones meet should show all valid adjacent zones
- Requires testing multiple directions (horizontal, vertical, diagonal)
- Must handle both special zone logic and standard quadrant logic

**Expected Reassignment Options:**
- Point (3, 8): Near-Apostles, Hostages, and possibly Loyalists (depending on midpoint position)

---

## Current Implementation Issues

### The Problem: Grid Edge Detection Interference

**Issue:** Points in special zones that happen to be at grid edges are incorrectly triggering grid edge detection logic.

**Specific Case:** 
- Point (3, 10) in near-apostles
- `loyalty = 10` equals `maxLoy = 10` (top edge of grid)
- **Current logic incorrectly applies grid edge detection**
- **Grid edge test goes to (3, 9.9) → Loyalists**
- **Result: Point shows Near-Apostles, Hostages, AND Loyalists (incorrect)**

### The Root Cause

```typescript
// Current problematic logic:
const isOnOuterBoundary = point.satisfaction === maxSat || point.loyalty === maxLoy;
if (isOnOuterBoundary) {
  // This runs for ALL points at grid edges, including special zone points
  // This is wrong - should only run for standard quadrant points
}
```

### The Priority Order (Should Be)

1. **Special Zone Logic First** - Handle inner/outer edges of special zones
2. **Standard Quadrant Logic** - Handle midpoint boundaries  
3. **Grid Edge Logic ONLY if not in special zones** - Handle visualization edges

---

## Expected Behavior Summary

| Point Location | Zone | Expected Reassignment Options |
|---------------|------|------------------------------|
| (3, 9) | Near-Apostles | Near-Apostles, Hostages |
| (3, 10) | Near-Apostles | Near-Apostles, Hostages |
| (4, 9) | Apostles | Apostles, Near-Apostles |
| (3, 5.5) | Midpoint | All four standard quadrants |
| (1, 7) | Hostages (grid edge) | Hostages, potentially Loyalists |
| (3, 8) | Corner | Near-Apostles, Hostages, potentially Loyalists |

---

## Fix Strategy

The fix should ensure that:

1. **Special zone points** are handled by special zone boundary logic only
2. **Grid edge detection** only applies to standard quadrant points
3. **Priority order** is maintained: Special zones → Standard quadrants → Grid edges
4. **All existing functionality** for legitimate boundary cases is preserved

---

*Document Version: 1.0*  
*Last Updated: January 2025*  
*Purpose: Reference guide for boundary detection system debugging and maintenance*