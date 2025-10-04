# Proximity Reports - Complete Implementation Guide - CORRECTED

## Executive Summary

This document outlines the **complete redesign** of the Proximity Reports system using a **grey area approach with QuadrantAssignmentContext integration**. Based on the successful DistributionSection fix, this approach leverages the proven context architecture rather than duplicating calculation logic.

---

## Core Approach: Trust the Context

### **Proven Logic Flow (Based on DistributionSection Success)**
1. **QuadrantAssignmentContext is authoritative** - provides correct quadrant assignments for all customers
2. **Apply grey area filtering** to context-provided assignments (don't recalculate assignments)
3. **Group proximity customers** by their context-assigned quadrants
4. **Display what context provides** - no manual layering calculations

### **Why This Approach Works**
✅ **Context is proven reliable** - just fixed DistributionSection using this approach  
✅ **Handles edge cases** - manual assignments, boundary customers, all scale combinations  
✅ **No duplicate logic** - proximity builds on distribution, doesn't replace it  
✅ **Consistent with architecture** - same pattern as successful DistributionSection fix  
✅ **Real-time updates** - context handles all data/settings changes automatically

---

## Grey Area Concept

### **IMPORTANT: Filtering Logic Only**
- The "grey area" is **post-processing filter only**, NOT a replacement for context assignments
- **No grey overlay** or visual indication on the chart
- We **filter out customers** in safe coordinates from proximity calculations
- **Geometric filtering** - exclude coordinates in far corner of each quadrant

### **Correct Data Flow**
```typescript
// CORRECT APPROACH (based on DistributionSection success):
const { distribution: contextDistribution, getQuadrantForPoint } = useQuadrantAssignment();

// Step 1: Get context assignments (authoritative)
const loyalistsFromContext = data.filter(point => getQuadrantForPoint(point) === 'loyalists');

// Step 2: Apply grey area filtering (proximity-specific logic)
const loyalistsProximity = loyalistsFromContext.filter(customer => 
  !isInGreyArea(customer, 'loyalists')
);

// WRONG APPROACH (what we fixed in DistributionSection):
// Don't manually recalculate who should be loyalists - context already knows
```

### **Grey Area Positioning**
- **Location**: Far corner (away from midpoint) of each quadrant
- **Purpose**: Customers in grey area = "safe" (not near any boundary)  
- **Proximity customers**: Everyone outside the grey area

### **Visual Example (1-5 scale, midpoint 3,3)**
```
Loyalists Quadrant: (3,3) to (5,5)
┌─────────────┐
│ P P │ G G │ ← Grey area (2x2)
│ P P │ G G │ ← Far from midpoint  
│ P P P P P │
└─────────────┘
      ↑ Midpoint boundary

P = Proximity customers (near boundaries)
G = Grey area (safe zone)
```

---

## Scale-Aware Rules

### **Fixed Rules (Free Users)**
- **1-3 scale**: No proximity report (quadrants too small)
- **1-5 scale**: 2x2 grey area (fixed)
- **1-7 scale**: 3x3 grey area (fixed)
- **1-10 scale**: 3x3 grey area (fixed)
- **0-10 scale**: 3x3 grey area (fixed)
- **Strategic indicators**: Fixed 15% threshold

### **Premium User Configuration**
**Settings Menu Available For:**
- **1-7 scale**: Choose 2x2 or 3x3 grey area  
- **1-10 scale**: Choose 2x2, 3x3, 4x4, or 5x5 grey area
- **0-10 scale**: Choose 2x2, 3x3, 4x4, or 5x5 grey area
- **All scales**: Custom strategic indicator threshold (5-50%)

### **Dynamic Space Handling**
When midpoint moves and creates uneven quadrant sizes:
- **If quadrant too small for grey area**: No proximity calculation for that quadrant
- **Graceful degradation**: Clear user feedback when quadrants are too small
- **Independent handling**: Each quadrant handled separately

---

## Special Zones Integration (CORRECTED)

### **Settings Connection**
- **Connected to main visualisation chart settings** (not independent)
- **No "near terrorists"** - that doesn't exist
- **Dynamic updates** when zones are enabled/disabled

### **Three Scenarios (Using Context Correctly)**

#### **Scenario 1: Special Zones OFF**
✅ **Context handles**: Automatically combines apostles → loyalists, terrorists → defectors  
✅ **Proximity logic**: Apply grey area filtering to context results
✅ **No manual calculation**: Context already provides correct grouping

#### **Scenario 2: Main Areas ON**
✅ **Context handles**: Separates apostles/terrorists from base quadrants automatically  
✅ **Proximity logic**: Apply grey area filtering to each group separately
✅ **Loyalists proximity**: Only includes pure loyalists (apostles handled separately)

#### **Scenario 3: All Areas ON (Main + Near)**
✅ **Context handles**: All zones separated automatically
✅ **Proximity logic**: Grey area filtering for each zone independently
✅ **Three separate calculations**: loyalists, apostles, near_apostles (all from context)

### **Corrected Calculation Logic**
```typescript
// CORRECT APPROACH (learned from DistributionSection fix):
const { distribution, getQuadrantForPoint } = useQuadrantAssignment();

// Get customers by their context assignments (authoritative)
const loyalistsFromContext = data.filter(point => getQuadrantForPoint(point) === 'loyalists');
const apostlesFromContext = data.filter(point => getQuadrantForPoint(point) === 'apostles');
const nearApostlesFromContext = data.filter(point => getQuadrantForPoint(point) === 'near_apostles');

// Apply grey area filtering to each group
const loyalistsProximity = loyalistsFromContext.filter(customer => !isInGreyArea(customer, 'loyalists'));
const apostlesProximity = apostlesFromContext.filter(customer => !isInGreyArea(customer, 'apostles'));
const nearApostlesProximity = nearApostlesFromContext.filter(customer => !isInGreyArea(customer, 'near_apostles'));

// Context automatically handles the layering - we just filter for proximity
```

---

## UI Components & Visual Design

### **Visual Reference**
*Maintain current visual layout while fixing the underlying functionality. The image shows the 2x2 grid distribution layout on the left and the ranked proximity details list on the right.*

### **Proximity Distribution (ProximityAnalysis.tsx)**
**Current Issues to Fix:**
- ❌ **Hover jumping**: Numbers jump on hover (CSS transform fix needed)
- ❌ **Corner colours**: Don't match main visualisation background colours
- ❌ **Mismatched numbers**: Must use context data (learned from DistributionSection)

**Required Changes:**
1. **Fix corner colours** to match QuadrantRenderer background colours:
   - Near Apostles corner: #C5E0B4 (same as Loyalists background)
   - Near Terrorists corner: #E69999 (same as Defectors background)
2. **Connect to context** instead of custom calculations (proven approach)
3. **Apply grey area filtering** to context-provided data

### **Proximity Details List (ProximityList.tsx)**
**Keep existing design** - just enhance it:

#### **Bi-Colour Bars**
- **Base colour**: Customer's current quadrant colour
- **Target colour**: Quadrant they're moving toward  
- **Design**: Clean rectangular bars with 2px gap (not rounded like pills)
- **Proportions**: 75% base colour / 25% target colour (or adjust based on proximity)

#### **Strategic Indicators**
- **CRISIS**: Red text, appears when ≥ threshold% moving toward negative quadrants
- **OPPORTUNITY**: Green text, appears when ≥ threshold% moving toward positive quadrants  
- **Thresholds**: 15% (free users), 5-50% configurable (premium users)
- **No emojis**: Professional text-only indicators

### **Business Value Display**
The Proximity Details list shows:
- **Action prioritisation**: Ranked by count (largest to smallest)
- **Resource allocation**: Specific customer counts for targeted campaigns
- **Strategic insights**: Pattern reveals business health

---

## Premium Features

### **Premium Implementation Pattern**
- **Same as distribution report**: Show/hide entire settings menu (proven approach)
- **Free users**: No settings menu visible, fixed grey area sizes, fixed 15% threshold
- **Premium users**: Full settings menu appears with all configuration options
- **No dual UI complexity**: Simple show/hide pattern

### **Premium Settings Menu Contents**
1. **Grey Area Size Configuration** (for scales that allow choice)
2. **Strategic Indicator Threshold** (5-50% range)  
3. **Advanced filtering options** (future feature)
4. **Export proximity customer lists** (CSV with customer details)

### **Settings UI Example**
```
Proximity Sensitivity:
○ Conservative (5x5 safe zone) - Fewer proximity alerts
○ Moderate (3x3 safe zone) - Balanced detection  
○ Sensitive (2x2 safe zone) - More proximity alerts

Strategic Indicators:
Threshold: [15]% (show CRISIS/OPPORTUNITY when group ≥ this percentage)
Range: 5% (very sensitive) to 50% (only major movements)
```

---

## Technical Implementation

### **Data Flow Architecture (CORRECTED)**
1. **Context provides**: Real-time quadrant assignments for all customers (authoritative)
2. **Space calculation**: Determine available space in each quadrant  
3. **Grey area validation**: Check if quadrant can fit required grey area
4. **Proximity classification**: Apply grey area filter to context assignments
5. **Grouping logic**: Sort proximity customers by their context-assigned quadrant
6. **Display updates**: Automatic recalculation when context changes

### **Context Integration (Proven Pattern)**  
**Everything we need is already available from the successful DistributionSection approach:**
- `data: DataPoint[]` - All customer data with coordinates
- `getQuadrantForPoint(point)` - Real-time quadrant assignment (authoritative)
- `distribution: object` - Pre-calculated totals by quadrant
- `midpoint: { sat: number; loy: number }` - Current boundary positions
- **Automatic updates** when midpoint/assignments/data change

### **Space Calculation Algorithm**
```typescript
function getQuadrantSpace(quadrant: QuadrantType, midpoint: {sat: number, loy: number}) {
  const bounds = getQuadrantBounds(quadrant, midpoint);
  return {
    width: bounds.maxSat - bounds.minSat + 1,
    height: bounds.maxLoy - bounds.minLoy + 1
  };
}

function canFitGreyArea(space: {width: number, height: number}, greyAreaSize: number) {
  return space.width >= greyAreaSize && space.height >= greyAreaSize;
}
```

### **Grey Area Positioning Algorithm**
```typescript
function calculateGreyArea(quadrant: QuadrantType, midpoint: {sat: number, loy: number}, greyAreaSize: number) {
  const bounds = getQuadrantBounds(quadrant, midpoint);
  
  // Grey area is in the corner furthest from midpoint
  const greyArea = {
    minSat: bounds.maxSat - greyAreaSize + 1,
    maxSat: bounds.maxSat,
    minLoy: bounds.maxLoy - greyAreaSize + 1,
    maxLoy: bounds.maxLoy
  };
  
  return greyArea;
}
```

---

## Implementation Phases

### **Phase 1: Foundation (Week 1)**
**Objective**: Fix visual issues and implement basic grey area logic using proven context approach

**Tasks:**
1. **Fix hover jumping issue** (ProximityAnalysis.css transform fix)
2. **Fix corner colours** (use QuadrantRenderer background colours)  
3. **Build space calculator** (quadrant size calculation)
4. **Build grey area calculator** (geometric zone detection)
5. **Connect Proximity Distribution** to context (use DistributionSection pattern)

**Deliverables:**
- Fixed visual issues
- Working grey area proximity calculations using context data
- Numbers that match main visualisation totals
- Proper handling when quadrants too small

### **Phase 2: Detailed Lists & Configuration (Week 2)**  
**Objective**: Build proximity customer lists and user configuration

**Tasks:**
1. **Extend grey area logic** to generate detailed customer lists from context data
2. **Build proximity grouping** (hostages near loyalists, etc.) using context assignments
3. **Add strategic indicators** (CRISIS/OPPORTUNITY tags)
4. **Implement user configuration** for 1-10 and 0-10 scales
5. **Add bi-colour bars** to ProximityList component

**Deliverables:**
- Complete proximity customer lists with actual customer details
- Strategic indicators working
- Premium settings menu (show/hide pattern)
- Bi-colour bars with proper proportions

### **Phase 3: Full Feature Set (Week 3)**
**Objective**: Complete special zones integration and premium features

**Tasks:**
1. **Add special zones support** (using context assignments - no manual calculation)
2. **Connect to main chart settings** (special zones on/off)
3. **Premium configuration** (grey area sizes, thresholds)
4. **Settings persistence** (save user preferences)  
5. **Export functionality** (CSV customer lists)

**Deliverables:**
- Full special zones integration using context
- Complete premium feature set
- Settings persistence working
- Export capabilities

---

## Success Criteria

### **Functional Requirements**
1. ✅ **Number Accuracy**: Proximity totals always match visualisation totals (using context)
2. ✅ **Dynamic Updates**: All changes trigger appropriate recalculations via context
3. ✅ **Scale Awareness**: Appropriate grey area sizes for each scale
4. ✅ **Space Handling**: Graceful degradation when quadrants too small
5. ✅ **Strategic Value**: CRISIS/OPPORTUNITY indicators help decision-making

### **User Experience Requirements**  
1. ✅ **Visual Consistency**: Bi-colour bars clearly show relationships
2. ✅ **No Jumping Elements**: Hover effects work smoothly
3. ✅ **Intuitive Configuration**: Settings are clear and purposeful
4. ✅ **Clear Feedback**: Users understand when proximity unavailable
5. ✅ **Strategic Clarity**: Crisis/opportunity indicators are actionable

### **Technical Complexity Assessment**
**Overall Complexity: 2/10** (Reduced from 3/10 due to context approach)

**Why It's Even Simpler Now:**
- ✅ **Context handles all complexity**: Assignment logic already solved and proven
- ✅ **Geometric filtering only**: Basic coordinate comparisons for grey area
- ✅ **No layering calculations**: Context provides correct groupings automatically
- ✅ **Proven architecture**: Same pattern as successful DistributionSection fix
- ✅ **No edge case handling**: Context manages boundary customers, manual assignments, etc.

---

## Files to Modify

### **Core Components**
1. **ProximityAnalysis.tsx**: Connect to context system (use DistributionSection pattern)
2. **ProximityList.tsx**: Add bi-colour bars and detailed lists using context data
3. **ProximityAnalysis.css**: Fix hover jumping, update corner colours

### **New Services Needed**
1. **GreyAreaCalculator**: Geometric zone calculations and space validation
2. **ProximityClassifier**: Apply grey area filtering to context assignments
3. **ProximityGrouper**: Generate detailed customer lists by context quadrant
4. **ProximitySettings**: User configuration management

### **Configuration Integration**
1. **Add proximity settings** to existing settings system
2. **Persist user preferences** for grey area size
3. **Settings UI components** for configuration panel

---

## Testing Strategy

### **Unit Testing**
- Test grey area calculations with various scales and midpoints
- Test space validation with extreme midpoint positions  
- Test context integration across all special zone scenarios
- Test strategic indicator logic with various percentages

### **Integration Testing**
- Test with all scale combinations (1-3, 1-5, 1-7, 1-10, 0-10)
- Test with midpoint changes across full range
- Test with manual assignments and data changes
- Test special zone setting changes (context integration)
- Test user configuration changes and persistence

### **User Acceptance Testing**  
- Verify numbers match main visualisation across all scenarios
- Verify graceful degradation when quadrants too small
- Verify user configuration works intuitively
- Verify strategic indicators appear appropriately

---

## Risk Mitigation

### **Technical Risks**
- **Risk**: Context integration complexity  
  **Mitigation**: Use proven DistributionSection pattern - already tested and working
- **Risk**: Performance with large datasets and frequent updates  
  **Mitigation**: Grey area filtering is simple geometry - should be fast

### **Business Risks**
- **Risk**: Users confused by dynamic availability of proximity analysis  
  **Mitigation**: Clear messaging and help documentation
- **Risk**: Configuration options overwhelming for users  
  **Mitigation**: Only show configuration for scales that benefit from it

---

## Future Enhancements

### **Potential Improvements**
1. **Visual grey area overlay** on main chart (educational feature)
2. **Proximity trend analysis** (historical tracking of boundary movements)  
3. **Advanced strategic rules** (industry-specific thresholds)
4. **Export proximity customer lists** (CSV with customer details)

### **Integration Opportunities**
1. **Actions Report**: Use proximity data for automated recommendations
2. **Customer Journey Mapping**: Track proximity changes over time
3. **Predictive Analytics**: Identify likely boundary crossers

---

## Code Quality & Development Principles

### **DRY (Don't Repeat Yourself) Principles**
- **Reuse context logic** - don't duplicate QuadrantAssignmentContext calculations (learned from DistributionSection)
- **Create shared utility functions** for grey area calculations across components
- **Centralise colour definitions** - reuse quadrant colours from existing system
- **Abstract common patterns** - grey area filtering logic should be reusable

### **Modularisation Principles**
- **Keep files under 300 lines** where possible - split into smaller modules if growing beyond this
- **Single responsibility** - each service/utility should have one clear purpose
- **Clear separation of concerns**:
  - **Context**: Authoritative quadrant assignment (don't duplicate)
  - **GreyAreaCalculator**: Geometric calculations only
  - **ProximityClassifier**: Apply filtering to context data
  - **ProximityGrouper**: List generation and grouping
  - **ProximitySettings**: Configuration management only

### **Component Architecture**
- **Leverage existing context system** - use proven DistributionSection pattern
- **Build on proven patterns** - use same premium feature approach as distribution report
- **Maintain consistent interfaces** - follow existing prop patterns and naming conventions
- **Avoid tight coupling** - services should be testable independently

### **Final Complexity Assessment**
**2/10 complexity** - Simpler than originally estimated because:
- Context provides all the heavy lifting (proven with DistributionSection)
- Grey area filtering is basic coordinate comparisons  
- Premium features follow established patterns
- No duplicate assignment logic needed

This approach balances sophistication with simplicity, providing powerful proximity intelligence while maintaining easy implementation and building on proven architectural patterns.