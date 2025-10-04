# Proximity Reports - Complete Implementation Guide

## Executive Summary

This document outlines the **complete redesign** of the Proximity Reports system using a **grey area approach with layered special zone handling**. We're replacing the broken current implementation with a reliable system that leverages the QuadrantAssignmentContext and uses simple geometric filtering.

---

## Core Approach: Count by Colours First

### **Final Logic Flow**
1. **Group customers by their context-assigned colours** (loyalists, apostles, etc.)
2. **Calculate with no special areas first** (basic 4 quadrants)  
3. **Add layers when zones are active** (subtract special zones from base quadrants)
4. **Apply grey area filtering to each group separately**

### **Why This Approach**
✅ **Context is authoritative** - no guessing about zone boundaries  
✅ **Handles edge cases** - manual assignments, boundary customers, complex shapes  
✅ **No coordinate conflicts** - we don't care about positions, just assignments  
✅ **Simpler logic** - no zone overlap calculations needed  
✅ **Layered calculation** - handle special zones as subtraction from base quadrants

---

## Grey Area Concept

### **IMPORTANT: Conceptual Only**
- The "grey area" is **filtering logic only**, NOT a visual element
- **No grey overlay** or visual indication on the chart
- We simply **skip customers** in these coordinates when counting proximity customers
- **Geometric filtering** - exclude coordinates in far corner of each quadrant

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
- **If quadrant too small for grey area**: No proximity circles for that quadrant
- **Graceful degradation**: Clear user feedback when quadrants are too small
- **Independent handling**: Each quadrant handled separately

---

## Special Zones Integration

### **Settings Connection**
- **Connected to main visualisation chart settings** (not independent)
- **No "near terrorists"** - that doesn't exist
- **Dynamic updates** when zones are enabled/disabled

### **Three Scenarios**

#### **Scenario 1: Special Zones OFF**
✅ Works exactly as described - basic 4 quadrants with grey area approach

#### **Scenario 2: Main Areas ON**
- **Apostles zone exists** (top-right corner of Loyalists)
- **Terrorists zone exists** (bottom-left corner of Defectors)  
- **Solution**: Calculate layered - subtract special zones from base quadrants
- **Grey area logic**: Exclude special zone coordinates from grey area calculations

#### **Scenario 3: All Areas ON (Main + Near)**
- **Previous scenario** + Near Apostles zone
- **Three separate calculations** needed:
  1. Base quadrants (loyalists, mercenaries, hostages, defectors)
  2. Main special zones (apostles, terrorists)  
  3. Near zones (near_apostles)

### **Layered Calculation Logic**
```typescript
// Step 1: Group by context assignments
const loyalists = data.filter(point => getQuadrantForPoint(point) === 'loyalists');
const apostles = data.filter(point => getQuadrantForPoint(point) === 'apostles');
const near_apostles = data.filter(point => getQuadrantForPoint(point) === 'near_apostles');

// Step 2: Handle layers based on settings
if (specialZonesOff) {
  // Use all loyalists
  const loyalistsForCalculation = loyalists;
} else if (mainAreasOn) {
  // Loyalists minus apostles
  const loyalistsForCalculation = loyalists; // Context already excludes apostles
} else if (allAreasOn) {
  // Loyalists minus apostles minus near_apostles  
  const loyalistsForCalculation = loyalists; // Context already excludes both
}

// Step 3: Apply grey area filtering
const loyalistsProximity = loyalistsForCalculation.filter(customer => 
  !isInGreyArea(customer, 'loyalists')
);
```

---

## UI Components & Visual Design

### **Visual Reference**
*See uploaded image in the chat "Proximity Reports System Implementation" for current visual layout - this shows the general structure we want to maintain while fixing the underlying functionality. The image shows the 2x2 grid distribution layout on the left and the ranked proximity details list on the right.*

### **Proximity Distribution (ProximityAnalysis.tsx)**
**Current Issues to Fix:**
- ❌ **Hover jumping**: Numbers jump on hover (CSS transform fix needed)
- ❌ **Corner colours**: Don't match main visualisation background colours
- ❌ **Mismatched numbers**: Don't use context data

**Required Changes:**
1. **Fix corner colours** to match QuadrantRenderer background colours:
   - Near Apostles corner: #C5E0B4 (same as Loyalists background)
   - Near Terrorists corner: #E69999 (same as Defectors background)
2. **Connect to context** instead of custom calculations
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
- **Same as distribution report**: Show/hide entire settings menu
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

### **Data Flow Architecture**
1. **Context provides**: Real-time quadrant assignments for all customers
2. **Space calculation**: Determine available space in each quadrant  
3. **Grey area validation**: Check if quadrant can fit required grey area
4. **Proximity classification**: Customers outside grey area = proximity customers
5. **Grouping logic**: Sort proximity customers by which boundary they're near
6. **Display updates**: Automatic recalculation when context changes

### **Context Integration**  
**Everything we need is already available:**
- `data: DataPoint[]` - All customer data with coordinates
- `getQuadrantForPoint(point)` - Real-time quadrant assignment  
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
**Objective**: Fix visual issues and implement basic grey area logic

**Tasks:**
1. **Fix hover jumping issue** (ProximityAnalysis.css transform fix)
2. **Fix corner colours** (use QuadrantRenderer background colours)  
3. **Build space calculator** (quadrant size calculation)
4. **Build grey area calculator** (geometric zone detection)
5. **Connect Proximity Distribution** to grey area system

**Deliverables:**
- Fixed visual issues
- Working grey area proximity calculations for Distribution
- Numbers that match main visualisation totals
- Proper handling when quadrants too small

### **Phase 2: Detailed Lists & Configuration (Week 2)**  
**Objective**: Build proximity customer lists and user configuration

**Tasks:**
1. **Extend grey area logic** to generate detailed customer lists
2. **Build proximity grouping** (hostages near loyalists, etc.)
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
1. **Add special zones support** (layered calculation approach)
2. **Connect to main chart settings** (special zones on/off)
3. **Premium configuration** (grey area sizes, thresholds)
4. **Settings persistence** (save user preferences)  
5. **Export functionality** (CSV customer lists)

**Deliverables:**
- Full special zones integration
- Complete premium feature set
- Settings persistence working
- Export capabilities

---

## Success Criteria

### **Functional Requirements**
1. ✅ **Number Accuracy**: Proximity totals always match visualisation totals
2. ✅ **Dynamic Updates**: All changes trigger appropriate recalculations  
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
**Overall Complexity: 3/10** (Premium features don't add significant complexity)

**Why It Remains Simple:**
- ✅ **Geometric filtering**: Basic coordinate comparisons
- ✅ **Context handles complexity**: Dynamic updates already solved
- ✅ **Simple space calculation**: Basic arithmetic  
- ✅ **Premium pattern reuse**: Same show/hide approach as other reports
- ✅ **Graceful degradation**: Clear rules for edge cases

---

## Files to Modify

### **Core Components**
1. **ProximityAnalysis.tsx**: Connect to grey area system
2. **ProximityList.tsx**: Add bi-colour bars and detailed lists  
3. **ProximityAnalysis.css**: Fix hover jumping, update corner colours

### **New Services Needed**
1. **GreyAreaCalculator**: Geometric zone calculations and space validation
2. **ProximityClassifier**: Customer classification logic
3. **ProximityGrouper**: Generate detailed customer lists by relationship  
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
- Test customer classification edge cases
- Test strategic indicator logic with various percentages

### **Integration Testing**
- Test with all scale combinations (1-3, 1-5, 1-7, 1-10, 0-10)
- Test with midpoint changes across full range
- Test with manual assignments and data changes
- Test user configuration changes and persistence

### **User Acceptance Testing**  
- Verify numbers match main visualisation across all scenarios
- Verify graceful degradation when quadrants too small
- Verify user configuration works intuitively
- Verify strategic indicators appear appropriately

---

## Risk Mitigation

### **Technical Risks**
- **Risk**: Space calculation edge cases with extreme midpoints  
  **Mitigation**: Comprehensive testing with boundary positions
- **Risk**: Performance with large datasets and frequent updates  
  **Mitigation**: Simple calculations should be fast, but monitor performance

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
- **Reuse existing context logic** - don't duplicate QuadrantAssignmentContext calculations
- **Create shared utility functions** for grey area calculations across components
- **Centralise colour definitions** - reuse quadrant colours from existing system
- **Abstract common patterns** - grey area filtering logic should be reusable

### **Modularisation Principles**
- **Keep files under 300 lines** where possible - split into smaller modules if growing beyond this
- **Single responsibility** - each service/utility should have one clear purpose
- **Clear separation of concerns**:
  - GreyAreaCalculator: Geometric calculations only
  - ProximityClassifier: Customer classification logic
  - ProximityGrouper: List generation and grouping
  - ProximitySettings: Configuration management only

### **Component Architecture**
- **Leverage existing context system** - don't recreate functionality
- **Build on proven patterns** - use same premium feature approach as distribution report
- **Maintain consistent interfaces** - follow existing prop patterns and naming conventions
- **Avoid tight coupling** - services should be testable independently

### **British Spelling**
- Use "grey" not "gray" throughout codebase
- Use "colour" not "color" in user-facing text
- Maintain consistency with existing codebase

### **Code Quality**
- Give exact find-replace instructions for all code changes
- Maintain existing UI design - enhance, don't redesign
- Test logic thoroughly before suggesting changes
- Follow modularisation principles
- Keep files under 300 lines where possible

### **Final Complexity Assessment**
**3/10 complexity** - Much simpler than originally estimated because:
- Context provides all the heavy lifting
- Grey area filtering is basic coordinate comparisons  
- Premium features follow established patterns
- Layered approach eliminates zone conflict complexity

This approach balances sophistication with simplicity, providing powerful proximity intelligence while maintaining easy implementation and intuitive user experience.