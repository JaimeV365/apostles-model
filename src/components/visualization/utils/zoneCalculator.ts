import { GridDimensions, Position, SpecialZoneBoundaries } from '../../../types/base';

export function calculateAvailableSpace(position: Position, dimensions: GridDimensions) {
  const midpointCellX = Math.round(position.x / dimensions.cellWidth);
  const midpointCellY = Math.round(position.y / dimensions.cellHeight);
  
  const maxAllowedX = dimensions.totalCols - midpointCellX - 1;
  const maxAllowedY = dimensions.totalRows - midpointCellY - 1;
  
  return {
    apostlesMaxSize: Math.min(maxAllowedX, maxAllowedY),
    terroristsMaxSize: Math.min(midpointCellX, midpointCellY),
    availableCells: Math.min(maxAllowedX, maxAllowedY)
  };
}

export function calculateSpecialZoneBoundaries(
  apostlesZoneSize: number,
  terroristsZoneSize: number,
  satisfactionScale: string,
  loyaltyScale: string
): SpecialZoneBoundaries {
  // Parse scale ranges to get min/max values
  const [satMin, satMax] = satisfactionScale.split('-').map(Number);
  const [loyMin, loyMax] = loyaltyScale.split('-').map(Number);
  
  console.log(`🔧 calculateSpecialZoneBoundaries: apostlesZoneSize=${apostlesZoneSize}, terroristsZoneSize=${terroristsZoneSize}, satisfactionScale=${satisfactionScale}, loyaltyScale=${loyaltyScale}`);
  console.log(`🔧 Parsed scales: satMin=${satMin}, satMax=${satMax}, loyMin=${loyMin}, loyMax=${loyMax}`);
  
  // APOSTLES ZONE CALCULATION
  // Start from top-right corner (satMax, loyMax)
  // Count one position down and one position left based on zone size
  // apostlesZoneSize=1 means 2x2 area: (6,9), (6,10), (7,9), (7,10) for 7x10 scale
  // apostlesZoneSize=2 means 3x3 area: (5,8), (5,9), (5,10), (6,8), (6,9), (6,10), (7,8), (7,9), (7,10) for 7x10 scale
  
  const apostlesEdgeVertixSat = satMax - apostlesZoneSize;  // For size=1: 7-1=6, for size=2: 7-2=5
  const apostlesEdgeVertixLoy = loyMax - apostlesZoneSize;  // For size=1: 10-1=9, for size=2: 10-2=8
  
  // TERRORISTS ZONE CALCULATION  
  // Start from bottom-left corner (satMin, loyMin)
  // Count positions right and up based on zone size
  // terroristsZoneSize=1 means 2x2 area: (1,0), (1,1), (2,0), (2,1) for 1-7/0-10 scale
  // terroristsZoneSize=2 means 3x3 area: (1,0), (1,1), (1,2), (2,0), (2,1), (2,2), (3,0), (3,1), (3,2) for 1-7/0-10 scale
  
  const terroristsEdgeVertixSat = satMin + terroristsZoneSize;
  const terroristsEdgeVertixLoy = loyMin + terroristsZoneSize;
  
  const boundaries = {
    apostles: {
      edgeVertixSat: apostlesEdgeVertixSat,
      edgeVertixLoy: apostlesEdgeVertixLoy
    },
    terrorists: {
      edgeVertixSat: terroristsEdgeVertixSat,
      edgeVertixLoy: terroristsEdgeVertixLoy
    }
  };
  
  console.log(`🔧 Calculated boundaries:`, boundaries);
  console.log(`🔧 Apostles zone: satisfaction >= ${apostlesEdgeVertixSat}, loyalty >= ${apostlesEdgeVertixLoy}`);
  console.log(`🔧 Terrorists zone: satisfaction <= ${terroristsEdgeVertixSat}, loyalty <= ${terroristsEdgeVertixLoy}`);
  
  return boundaries;
}

export function calculateNearApostlesPositions(
  showNearApostles: boolean,
  apostlesSize: number,
  dimensions: GridDimensions
): Array<{
  bottom: string;
  right: string;
  width: string;
  height: string;
  label?: string;
}> {
  if (!showNearApostles) return [];

  const { cellWidth, cellHeight, totalRows } = dimensions;
  const positions = [];

  if (apostlesSize === 1) {
    // For 1x1 Apostles in D1:
    positions.push(
      // C1 position (left of Apostles)
      {
        bottom: `${(totalRows - 2) * cellHeight}%`,
        right: `${cellWidth}%`,
        width: `${cellWidth}%`,
        height: `${cellHeight}%`
      },
      // D2 position (below Apostles)
      {
        bottom: `${(totalRows - 3) * cellHeight}%`,
        right: '0%',
        width: `${cellWidth}%`,
        height: `${cellHeight}%`
      },
      // C2 position (corner) - gets the label
      {
        bottom: `${(totalRows - 3) * cellHeight}%`,
        right: `${cellWidth}%`,
        width: `${cellWidth}%`,
        height: `${cellHeight}%`,
        label: 'Near-apostles'
      }
    );
  } else {
    // Multi-cell Apostles
    // Left column
    for (let i = 0; i < apostlesSize; i++) {
      positions.push({
        bottom: `${(totalRows - 2 - i) * cellHeight}%`,
        right: `${apostlesSize * cellWidth}%`,
        width: `${cellWidth}%`,
        height: `${cellHeight}%`
      });
    }

    // Bottom row
    for (let i = 0; i < apostlesSize; i++) {
      positions.push({
        bottom: `${(totalRows - 2 - apostlesSize) * cellHeight}%`,
        right: `${i * cellWidth}%`,
        width: `${cellWidth}%`,
        height: `${cellHeight}%`
      });
    }

    // Corner position with label
    positions.push({
      bottom: `${(totalRows - 2 - apostlesSize) * cellHeight}%`,
      right: `${apostlesSize * cellWidth}%`,
      width: `${cellWidth}%`,
      height: `${cellHeight}%`,
      label: 'Near-apostles'
    });
  }

  // Filter out any overlaps
  return positions.filter(pos => {
    const rightPos = parseFloat(pos.right);
    const bottomPos = parseFloat(pos.bottom);
    return !(rightPos < apostlesSize * cellWidth && 
             bottomPos > (totalRows - apostlesSize - 2) * cellHeight);
  });
}