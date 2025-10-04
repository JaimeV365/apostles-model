# Diagonal Proximity Analysis Rules - Complete Reference Guide

## Overview

This document provides the authoritative reference for **diagonal proximity analysis** calculations in the customer segmentation tool. Diagonal proximity identifies customers at risk of dramatic quadrant shifts to **opposite quadrants**, representing the highest-risk customer transformations.

**Diagonal relationships analyzed:**
- **Defectors ↔ Loyalists** (opposite corners - "Redemption" and "Crisis" diagonals)
- **Mercenaries ↔ Hostages** (opposite corners - "Disappointment" and "Switching" diagonals)

**Important**: This system is completely separate from **lateral proximity** (adjacent quadrants) and uses different calculation rules.

---

## Core Diagonal Proximity Rules

### Rule 1: Diagonal Distance Calculation
- **Distance metric**: **Chebyshev distance** (also known as maximum metric)
- **Formula**: `max(|x2-x1|, |y2-y1|)`
- **Fixed threshold**: **2.0** for all diagonal relationships
- **Examples**:
  - (2,2) to (3,3) = max(1,1) = 1 ✅ (qualifies)
  - (6,6) to (4,4) = max(2,2) = 2 ✅ (qualifies)  
  - (1,1) to (4,4) = max(3,3) = 3 ❌ (exceeds threshold)

### Rule 2: Two-Step Algorithm Process

#### Step 1: Calculate Potential Search Area

**A. Define quadrant potential space** (from current midpoint to scale edges):

**Example for 1-7 × 0-10, midpoint (4,5)**:
- **Defectors**: sat ∈ {1,2,3,4} (4 positions), loy ∈ {0,1,2,3,4,5} (6 positions)
- **Mercenaries**: sat ∈ {4,5,6,7} (4 positions), loy ∈ {0,1,2,3,4,5} (6 positions)
- **Loyalists**: sat ∈ {4,5,6,7} (4 positions), loy ∈ {5,6,7,8,9,10} (6 positions)
- **Hostages**: sat ∈ {1,2,3,4} (4 positions), loy ∈ {5,6,7,8,9,10} (6 positions)

**B. Apply space cap to limit search area**:

**Space cap rule**:
- **≤3 positions available** → examine only **1 position** (closest to boundary)
- **>3 positions available** → examine only **2 positions** (closest to boundary)

**Applied to defectors example**:
- **Satisfaction**: 4 positions available → cap to 2 → examine sat ∈ {3,4}
- **Loyalty**: 6 positions available → cap to 2 → examine loy ∈ {4,5}
- **Potential search area**: positions where sat ∈ {3,4} AND loy ∈ {4,5}

#### Step 2: Filter What Actually Qualifies

Within the potential search area, apply all qualification filters:

**Filter A: Quadrant Assignment Check**
- Include: Positions actually assigned to the source quadrant
- Include: Boundary positions that can be reassigned to source quadrant
- Exclude: Positions assigned to other quadrants

**Filter B: Midpoint Exclusion**
- Exclude: Positions exactly at current midpoint coordinates

**Filter C: Special Zones Exclusion**
- Exclude: Positions within apostles areas
- Exclude: Positions within near-apostles areas
- Exclude: Positions within terrorists areas

**Filter D: Distance Threshold Check**
- Exclude: Positions with diagonal distance > 2.0 to target quadrant

**Filter E: Final Cap Enforcement**
- Stop counting once space cap limit (1 or 2) is reached
- Prioritize positions closest to boundary first

### Rule 3: Decimal Midpoint Handling

**Special logic for non-integer midpoints** (e.g., 5.5):

**Boundary exclusion for decimal midpoints**:
- **Midpoint 5.5**: Exclude positions at integer 5 and 6 (both boundary positions)
- **Reason**: Both positions are equally distant from decimal midpoint
- **Example**: For loy midpoint 5.5, exclude customers at loy=5 and loy=6 from search areas

### Rule 4: Scale-Dependent Implementation

**All scale combinations with their space caps**:

**Small scales** (more restrictive):
- **1-3 × Any**: All dimensions ≤3 → 1 position cap each direction
- **1-5 × 1-5**: All dimensions ≤3 → 1 position cap each direction

**Medium scales** (moderate):
- **1-5 × 0-10**: Mixed dimensions → 1-2 position caps per direction
- **1-7 × 1-7**: All dimensions 4 → 2 position caps each direction

**Large scales** (most generous):
- **1-7 × 0-10**: Larger dimensions → 2 position caps each direction
- **1-7 × 1-10**: Larger dimensions → 2 position caps each direction

---

## Complete Algorithm Example

### Scenario: 1-7 × 1-10, Midpoint (4, 5.5), Defectors → Loyalists

#### Step 1: Calculate Search Area

**A. Quadrant definitions**:
- **Defectors**: sat < 4 AND loy < 5.5

**B. Potential space calculation**:
- **Defectors satisfaction range**: {1,2,3,4} → 4 positions → cap to 2 → examine {3,4}
- **Defectors loyalty range**: {1,2,3,4,5} → 5 positions → cap to 2 → examine {4,5}
- **Note**: loy=5 excluded due to decimal midpoint boundary rule (5.5)

**C. Search area**: positions where sat ∈ {3,4} AND loy ∈ {4}
- **Initial candidates**: (3,4), (4,4)

#### Step 2: Apply All Filters

**(3,4) evaluation**:
- ✅ In search area
- ✅ Assigned to defectors (sat=3 < 4, loy=4 < 5.5)
- ✅ Not midpoint (midpoint is 4, 5.5)
- ✅ Not in special zones (assume none)
- ✅ Distance check: max(|4-3|, |5.5-4|) = max(1,1.5) = 1.5 ≤ 2.0
- ✅ **QUALIFIES**

**(4,4) evaluation**:
- ✅ In search area
- ⚠️ Boundary position (sat=4 = midpoint)
- ✅ Could be reassigned to defectors
- ✅ Not exact midpoint (midpoint is 4, 5.5)
- ✅ Not in special zones
- ✅ Distance check: max(|4-4|, |5.5-4|) = max(0,1.5) = 1.5 ≤ 2.0
- ✅ **QUALIFIES** (if reassigned to defectors)

#### Final Result
- **Definite qualifiers**: (3,4)
- **Boundary qualifiers**: (4,4) if reassigned
- **Expected count**: 1-2 positions

---

## Business Intelligence Value

### Strategic Customer Categories

**Defectors → Loyalists (Redemption Diagonal)**
- **Business meaning**: Customers with maximum recovery potential
- **Action**: Intensive redemption programs
- **Priority**: High ROI opportunity for transformation

**Loyalists → Defectors (Crisis Diagonal)**  
- **Business meaning**: Highest value customers at risk of complete defection
- **Action**: Emergency intervention required
- **Priority**: Critical - prevent total loss

**Mercenaries → Hostages (Disappointment Diagonal)**
- **Business meaning**: Satisfied but disloyal customers becoming trapped
- **Action**: Loyalty improvement focus
- **Priority**: Moderate - prevent switching to competitors

**Hostages → Mercenaries (Switching Diagonal)**
- **Business meaning**: Loyal but dissatisfied customers who might break free
- **Action**: Satisfaction improvement focus
- **Priority**: Moderate - retain loyalty while improving experience

### Crossroads Customers Analysis

**Multiple diagonal proximities indicate "Crossroads Customers":**
- **Definition**: Customers at risk of multiple dramatic transformations
- **Business value**: Highest strategic importance for intervention
- **Example**: Customer qualifying for both loyalists→defectors AND hostages→mercenaries
- **Action**: Multi-faceted intervention strategy required

---

## Technical Implementation Details

### Architecture Integration

**Context Integration**:
- **QuadrantAssignmentContext**: Provides authoritative quadrant assignments
- **Special zones handling**: Automatic exclusion when zones are enabled
- **Dynamic midpoint**: Calculations adapt automatically to midpoint changes

**Distance Calculation Service**:
- **Separate from lateral proximity**: Uses different algorithm and thresholds
- **Chebyshev distance**: Implemented as max(|x2-x1|, |y2-y1|)
- **Space cap application**: Applied to potential ranges before distance filtering

**Two-Step Processing**:
1. **Potential search area**: Calculate based on quadrant space + caps
2. **Final qualification**: Apply all filters to determine actual qualifiers

### Performance Considerations

**Optimization strategies**:
- **Pre-calculate search areas**: Cache quadrant space calculations
- **Filter early**: Apply cheapest filters first (assignment check before distance)
- **Boundary position handling**: Efficient reassignment logic

---

## Testing and Validation

### Expected Behavior Validation

**✅ Core functionality**:
- [ ] Diagonal proximity numbers ≤ main quadrant totals (subset relationship)
- [ ] Results change when midpoint moves significantly
- [ ] Scale changes update space caps correctly
- [ ] Manual customer reassignments affect diagonal calculations
- [ ] Special zones exclude positions properly when enabled

**✅ Distance calculations**:
- [ ] Chebyshev distance calculated correctly: max(|x2-x1|, |y2-y1|)
- [ ] 2.0 threshold applied consistently across all diagonal relationships
- [ ] Decimal midpoint boundaries handled correctly (exclude integer boundaries)

**✅ Space cap application**:
- [ ] ≤3 positions → 1 position cap enforced
- [ ] >3 positions → 2 position cap enforced
- [ ] Positions closest to boundary selected first
- [ ] Independent calculation per dimension (satisfaction vs loyalty)

### Edge Case Handling

**✅ Special scenarios**:
- [ ] Empty quadrants show 0 diagonal proximity relationships
- [ ] Very small scales (1-3) handle caps correctly
- [ ] Decimal midpoints (like 4.5, 5.5) exclude boundary integers
- [ ] Maximum 2 positions per dimension cap enforced
- [ ] Boundary reassignment logic works correctly

### Red Flags (Indicate Implementation Issues)

**❌ These indicate bugs**:
- ❌ Diagonal proximity numbers > main quadrant totals
- ❌ Results unchanged when moving midpoint significantly  
- ❌ Including positions beyond space cap limits (>2 per dimension)
- ❌ Wrong distance calculation (not using Chebyshev/max formula)
- ❌ Including positions assigned to wrong quadrants
- ❌ Including midpoint positions when they should be excluded

### Success Indicators

**✅ Correct implementation shows**:
- ✅ Results match comprehensive position mapping (reference: Proximity Points.pdf)
- ✅ Dramatic movement intelligence without false positives
- ✅ Strategic customer insights for intervention priorities
- ✅ Clean separation from lateral proximity system
- ✅ Professional interface supporting critical decision-making

---

## Comparison with Lateral Proximity

### Key Differences

**Relationship types**:
- **Diagonal**: Opposite quadrants (Defectors ↔ Loyalists, Mercenaries ↔ Hostages)
- **Lateral**: Adjacent quadrants (Loyalists → Mercenaries, Loyalists → Hostages, etc.)

**Distance calculation**:
- **Diagonal**: Chebyshev distance with 2.0 threshold
- **Lateral**: Manhattan distance with 2.0 threshold

**Business significance**:
- **Diagonal**: Dramatic transformation risk/opportunity (highest strategic value)
- **Lateral**: Gradual movement risk (moderate strategic value)

**Space cap rules**:
- **Diagonal**: 1-2 position caps based on quadrant potential space
- **Lateral**: Space-based threshold calculation (different methodology)

**Implementation**:
- **Diagonal**: Two-step process (potential area → qualification filters)
- **Lateral**: Direct distance-based calculation from boundaries

---

## Quick Reference

### Algorithm Summary
1. **Calculate potential search area** per quadrant (space caps applied)
2. **Filter by quadrant assignment** (include reassignable boundary positions)
3. **Apply distance threshold** (2.0 using Chebyshev distance)
4. **Exclude special positions** (midpoint, special zones)
5. **Enforce final caps** (stop at 1-2 positions per quadrant)

### Distance Formula
```
diagonal_distance = max(|x2-x1|, |y2-y1|)
qualifies = diagonal_distance <= 2.0
```

### Space Cap Rule
```
available_positions <= 3 → examine 1 position (closest to boundary)
available_positions > 3  → examine 2 positions (closest to boundary)
```

### Business Value
- **Crisis detection**: Loyalists at risk of defection
- **Opportunity identification**: Defectors with redemption potential
- **Strategic intervention**: Highest ROI customer transformation initiatives
- **Crossroads analysis**: Multi-directional transformation risks

---

This reference guide provides everything needed to understand, implement, test, and maintain the diagonal proximity analysis system. Use it to validate test results and ensure proper strategic customer intelligence delivery.