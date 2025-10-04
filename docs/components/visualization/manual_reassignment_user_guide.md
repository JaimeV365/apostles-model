# Manual Reassignment System - User Guide

## Overview

The Manual Reassignment System allows users to override the automatic classification of data points when they are positioned on boundary lines between quadrants. This feature is designed to handle ambiguous cases where a point could reasonably belong to multiple zones.

## When Manual Reassignment is Available

### Boundary Points Only
Manual reassignment is **only available for points that sit on boundaries** between zones. This includes:

1. **Midpoint Intersection**: Points exactly at the midpoint can be assigned to any of the 4 quadrants
2. **Zone Boundaries**: Points on the line between two adjacent zones
3. **Special Zone Boundaries**: Points on the edges of Apostles/Terrorists zones
4. **Grid Boundaries**: Points at the edges of the chart where multiple zones meet

### Not Available For
- Points clearly within a single zone
- Points far from any boundary
- Points that have been moved away from boundaries after midpoint changes

## How to Use Manual Reassignment

### Step 1: Click on a Data Point
- Click on any data point to open the information box
- The InfoBox will display the point's current classification and details

### Step 2: Check for Reassignment Options
- If the point is on a boundary, you'll see reassignment buttons at the bottom
- The buttons show the available zones the point can be assigned to
- The current assignment is highlighted

### Step 3: Select New Assignment
- Click on the desired zone button
- The point will immediately change color to reflect the new assignment
- The change is saved automatically

### Step 4: Verify the Change
- The point maintains its new classification
- The InfoBox updates to show the new assignment
- Distribution charts update to reflect the change

## Understanding the InfoBox

### Information Displayed
- **Point Name/ID**: Identifier of the selected point
- **Current Classification**: The zone the point is currently assigned to
- **Satisfaction & Loyalty Values**: The point's coordinates
- **Frequency**: How many points share the same position (if applicable)

### Reassignment Buttons
- **Available when**: Point is on a boundary between zones
- **Button Colors**: Match the colors of the respective zones
- **Current Selection**: Highlighted with zone color background
- **Missing when**: Point is not on a boundary

### Visual Feedback
- **Point Color**: Changes immediately when reassigned
- **InfoBox Color**: Border and text colors update to match new assignment
- **Distribution Update**: Charts automatically reflect the change

## Automatic Validation

### When Assignments Are Kept
Manual assignments persist when:
- The point remains on a boundary after changes
- The assigned zone is still adjacent to the point's position
- The midpoint or zone boundaries haven't moved the point away from the boundary

### When Assignments Are Removed
The system automatically removes manual assignments when:
- The point is no longer on a boundary
- The assigned zone is no longer adjacent to the point
- Midpoint changes make the assignment invalid
- Zone size changes affect boundary positions

### What Happens When Removed
- The point reverts to its natural classification
- The point color updates to match the new zone
- No user action is required - this is automatic

## Common Scenarios

### Scenario 1: Midpoint Intersection
**Situation**: Point is exactly at the midpoint (e.g., 3,3 on a 5-point scale)
**Options**: Can be assigned to any of the 4 quadrants (Loyalists, Mercenaries, Hostages, Defectors)
**Use Case**: When you want to emphasize a particular interpretation of a neutral response

### Scenario 2: Zone Boundary
**Situation**: Point sits on the line between two zones
**Options**: Can be assigned to either adjacent zone
**Use Case**: When contextual knowledge suggests the point belongs to a specific zone

### Scenario 3: Special Zone Boundary
**Situation**: Point is on the edge of Apostles or Terrorists zones
**Options**: Can be assigned to the special zone or adjacent standard quadrant
**Use Case**: When deciding whether a high-scoring point qualifies as an "Apostle"

### Scenario 4: After Midpoint Changes
**Situation**: You move the midpoint and some manual assignments become invalid
**Result**: Invalid assignments are automatically removed
**Action**: Points revert to natural classification - no user intervention needed

## Best Practices

### When to Use Manual Reassignment
1. **Contextual Knowledge**: You have additional information about the respondent
2. **Interpretation Preference**: You want to emphasize a particular perspective
3. **Boundary Disambiguation**: The automatic classification seems incorrect
4. **Consistency**: You want similar responses to be in the same zone

### When Not to Use Manual Reassignment
1. **Points Clearly in Zones**: Don't reassign points that are clearly in one zone
2. **Large Scale Changes**: Don't try to reassign many points - consider adjusting the midpoint instead
3. **Temporary Fixes**: Don't use reassignment to fix fundamental classification issues

### Workflow Recommendations
1. **Set Midpoint First**: Get the basic classification right before manual adjustments
2. **Use Sparingly**: Focus on truly ambiguous cases
3. **Document Decisions**: Keep track of why you made specific reassignments
4. **Review After Changes**: Check that manual assignments still make sense after midpoint adjustments

## Troubleshooting

### Problem: Reassignment Buttons Not Showing
**Possible Causes**:
- Point is not on a boundary
- Point was moved away from boundary by midpoint changes
- System error in boundary detection

**Solutions**:
- Verify the point is actually on a boundary line
- Try adjusting the midpoint to bring the point back to a boundary
- Click on a different point and back to refresh the InfoBox

### Problem: Assignment Disappeared
**Possible Causes**:
- Midpoint was moved, invalidating the assignment
- Zone boundaries changed, making the assignment invalid
- Point is no longer on a boundary

**Solutions**:
- This is normal behavior - the system automatically cleans up invalid assignments
- If you want to reassign, move the midpoint back or adjust zone boundaries
- The point will now show its natural classification

### Problem: InfoBox Keeps Moving
**Possible Causes**:
- InfoBox repositioning logic to avoid screen edges
- Content changes affecting InfoBox size

**Solutions**:
- This is normal behavior to keep the InfoBox visible
- The position changes are animated for smooth user experience
- InfoBox always stays near the original point location

## Technical Details

### How Manual Assignments Are Stored
- Assignments are stored in memory during the session
- Each assignment links a point ID to a specific zone
- Assignments are validated whenever boundaries change

### Validation Process
- Runs automatically when midpoint or zones change
- Checks if each manual assignment is still valid
- Removes invalid assignments without user intervention

### Performance Considerations
- Manual assignments are processed efficiently
- Boundary detection is optimized for speed
- InfoBox updates are immediate and responsive

## Data Export

### Including Manual Assignments
- Manual assignments are included in exported data
- Export shows both original and assigned classifications
- Distribution statistics reflect manual assignments

### Reproducing Results
- Save your midpoint settings along with data
- Manual assignments will be recreated when data is reloaded
- Zone settings also affect assignment validity

## Limitations

### Current Limitations
- Manual reassignment only works for boundary points
- Assignments don't persist between sessions (unless exported)
- No batch reassignment capabilities
- No assignment history or undo functionality

### Future Enhancements
Potential future features include:
- Batch reassignment for multiple points
- Assignment persistence across sessions
- Undo/redo functionality for reassignments
- Custom boundary definitions

## Conclusion

The Manual Reassignment System provides a powerful tool for refining data point classifications in ambiguous cases. By focusing on boundary points and providing automatic validation, the system ensures that manual assignments enhance rather than complicate the analysis process.

Remember that manual reassignment is designed for boundary disambiguation, not wholesale reclassification. Use it thoughtfully to handle genuinely ambiguous cases while relying on midpoint adjustments for broader classification changes.
