# Proximity Analysis Rules - Reference Guide

## Core Rules Overview

### Rule 1: Scale-Aware Thresholds
- **1-3 scales**: ❌ No proximity analysis (scale too small)
- **1-5 scales**: ✅ **1.5 points** from boundary = "near"  
- **1-7 scales**: ✅ **2.0 points** from boundary = "near"
- **1-10 or 0-10 scales**: ✅ **2.0 points** from boundary = "near"

### Rule 2: Maximum Distance Cap
- **Up to 2.5 points** from any boundary (accommodates mid-position midpoints)
- **Whatever comes first** - if threshold < 2.5, use threshold; if threshold > 2.5, cap at 2.5

### Rule 3: Special Zone Constraint  
- **Stop at any other area boundary** (apostles, near-apostles, terrorists)
- **Special zones take precedence** - if you hit a special zone before reaching threshold, the special zone wins

### Rule 4: Multiple Classifications Allowed
- ✅ **A customer can be close to multiple boundaries simultaneously** 
- Example: Loyalist at (3.1, 5.6) can be both "near hostages" AND "near mercenaries"
- **Corner customers = highest risk** (flagged for multiple proximity types)

### Rule 5: Subset Relationship
- **"Near" customers are always a subset of their main quadrant**
- Example: "Loyalists near mercenaries" are still loyalists, just at risk of moving

### Rule 6: Expected Behavior
- **Proximity numbers < main quadrant totals** (not everyone is near boundaries)
- **Numbers change when midpoint moves** (boundaries shift)
- **Add up to reasonable %** (maybe 30-60% of total customers)
- **Show 0 for empty quadrants** or customers far from boundaries

---

## Practical Examples

### 1-5 × 1-10 Scale (midpoint: sat=3, loy=5.5, threshold=1.5)

#### Loyalists Near Mercenaries (Horizontal Boundary)
- ✅ **loy=6.0** → Distance = 0.5 ← **NEAR**
- ✅ **loy=7.0** → Distance = 1.5 ← **NEAR** (exactly at threshold)
- ❌ **loy=8.0** → Distance = 2.5 ← **SAFE**

#### Loyalists Near Hostages (Vertical Boundary)
- ✅ **sat=3.0** → Distance = 0.0 ← **NEAR** (on boundary)
- ✅ **sat=3.5** → Distance = 0.5 ← **NEAR**
- ✅ **sat=4.0** → Distance = 1.0 ← **NEAR**
- ✅ **sat=4.5** → Distance = 1.5 ← **NEAR** (exactly at threshold)
- ❌ **sat=5.0** → Distance = 2.0 ← **SAFE**

#### Multiple Proximity Example
**Loyalist at (3.2, 6.1):**
- Distance to Hostages: |3.2 - 3.0| = 0.2 ← **NEAR**
- Distance to Mercenaries: |6.1 - 5.5| = 0.6 ← **NEAR**
- **Result:** Appears in BOTH proximity categories (highest risk customer)

---

## Testing Checklist

### ✅ Numbers Validation
- [ ] Proximity totals ≤ main quadrant totals
- [ ] Corner customers counted in multiple categories
- [ ] Customers exactly on boundaries (distance = 0) are always "near"
- [ ] Customers beyond threshold are never "near"

### ✅ Dynamic Behavior
- [ ] Numbers change when midpoint moves
- [ ] Numbers update when customers are manually reassigned
- [ ] Special zones affect proximity calculations when enabled
- [ ] Scale changes update thresholds correctly

### ✅ Edge Cases
- [ ] Empty quadrants show 0 proximity
- [ ] Very small scales (1-3) show "unavailable"
- [ ] Mid-position midpoints (like 3.5) work correctly
- [ ] Maximum 2.5 distance cap applies

### ✅ Red Flags (These indicate bugs)
- ❌ Proximity numbers > main quadrant totals
- ❌ Numbers don't change when moving midpoint significantly
- ❌ All customers marked as "near boundary"
- ❌ Numbers stay same when manually reassigning customers

---

## Quick Reference: Distance Calculations

### Basic Formula
```
Distance to boundary = |customer_coordinate - midpoint_coordinate|
```

### Quadrant-Specific Adjacent Boundaries
- **Loyalists**: Adjacent to Hostages (left) and Mercenaries (bottom)
- **Mercenaries**: Adjacent to Loyalists (top) and Defectors (bottom)
- **Hostages**: Adjacent to Defectors (left) and Loyalists (right)
- **Defectors**: Adjacent to Hostages (top) and Mercenaries (right)

### Special Zones Override
When special zones (apostles, near-apostles) are enabled:
- **Proximity stops at special zone boundaries**
- **Special zone customers may have different proximity rules**
- **Context handles zone assignments automatically**

---

This reference guide captures all the rules we defined from Prompt.docx and our discussions. Use it to verify your testing results!