import React, { useState, useEffect } from 'react';
import { ChevronsUpDown } from 'lucide-react';
import { GridDimensions } from '@/types/base';
import './ResizeHandle.css';

interface ResizeHandleProps {
  dimensions: GridDimensions;
  apostlesZoneSize: number;
  terroristsZoneSize: number;
  onZoneResize: (zone: 'apostles' | 'terrorists', newSize: number) => void;
  isAdjustable: boolean;
}

const ResizeHandle: React.FC<ResizeHandleProps> = ({
  dimensions,
  apostlesZoneSize,
  terroristsZoneSize,
  onZoneResize,
  isAdjustable
}) => {
  const { cellWidth, cellHeight } = dimensions;

  // Define helper functions first
  const calculateMaxSize = (zone: 'apostles' | 'terrorists'): number => {
    const midCol = dimensions.midpointCol;
    const midRow = dimensions.midpointRow;
    
    if (zone === 'apostles') {
      // For apostles, must stay 1 grid away from midpoint
      const spaceToMidpointX = dimensions.totalCols - midCol - 1;
      const spaceToMidpointY = dimensions.totalRows - midRow - 1;
      
      // Round down to nearest 0.5 to never exceed limit
      return Math.max(1, Math.min(
        Math.floor(spaceToMidpointX * 2) / 2,
        Math.floor(spaceToMidpointY * 2) / 2
      ));
    } else {
      // For terrorists, must not exceed midpoint
      return Math.max(1, Math.min(
        Math.floor(midCol * 2) / 2,
        Math.floor(midRow * 2) / 2
      ));
    }
  };

  const enforceLimit = (size: number, zone: 'apostles' | 'terrorists'): number => {
    const maxSize = calculateMaxSize(zone);
    return Math.max(1, Math.min(size, maxSize));
  };

  // Then declare state
  const [isDragging, setIsDragging] = useState(false);
  const [isExpanding, setIsExpanding] = useState(true);

  // Then use effects
  useEffect(() => {
    const enforceCurrentLimits = (zone: 'apostles' | 'terrorists') => {
      const currentSize = zone === 'apostles' ? apostlesZoneSize : terroristsZoneSize;
      const maxSize = calculateMaxSize(zone);
      if (currentSize > maxSize) {
        onZoneResize(zone, maxSize);
      }
    };
  
    enforceCurrentLimits('apostles');
    enforceCurrentLimits('terrorists');
  }, [dimensions, apostlesZoneSize, terroristsZoneSize, calculateMaxSize, onZoneResize]);
  
  if (!isAdjustable) {
  console.log(`🔧 ResizeHandle: Not adjustable, not rendering`);
  return null;
}

console.log(`🔧 ResizeHandle: Rendering with apostlesZoneSize=${apostlesZoneSize}, terroristsZoneSize=${terroristsZoneSize}, isAdjustable=${isAdjustable}`);

  const getNextSize = (currentSize: number, zone: 'apostles' | 'terrorists', expanding: boolean) => {
    const maxSize = calculateMaxSize(zone);
    const midpointPos = zone === 'apostles' 
      ? { col: dimensions.midpointCol, row: dimensions.midpointRow }
      : { col: dimensions.midpointCol, row: dimensions.midpointRow };

    // Check if midpoint is at a half position
    const isHalfGrid = 
      Math.round(midpointPos.col * 2) % 2 !== 0 || 
      Math.round(midpointPos.row * 2) % 2 !== 0;

    let newSize;
    if (expanding) {
      if (currentSize >= maxSize) {
        newSize = currentSize - (isHalfGrid ? 0.5 : 1);
      } else {
        const remainingSpace = maxSize - currentSize;
        newSize = currentSize + (isHalfGrid && remainingSpace < 1 ? 0.5 : 1);
      }
    } else {
      if (currentSize <= 1) {
        newSize = currentSize + 1;
      } else {
        const hasHalf = currentSize % 1 !== 0;
        newSize = currentSize - (hasHalf ? 0.5 : 1);
      }
    }

    return enforceLimit(newSize, zone);
  };

  const handleClick = (zone: 'apostles' | 'terrorists', e: React.MouseEvent) => {
  console.log(`🔧 ResizeHandle handleClick: ${zone} - START`);
  console.log(`🔧 ResizeHandle: Event target:`, e.target);
  console.log(`🔧 ResizeHandle: Current target:`, e.currentTarget);
  console.log(`🔧 ResizeHandle: Mouse position:`, e.clientX, e.clientY);
  console.log(`🔧 ResizeHandle: isDragging=${isDragging}, isExpanding=${isExpanding}`);
  
  e.preventDefault();
  e.stopPropagation();

  if (isDragging) {
    console.log(`⚠️ ResizeHandle: Ignoring click because isDragging=${isDragging}`);
    return;
  }

  const currentSize = zone === 'apostles' ? apostlesZoneSize : terroristsZoneSize;
  console.log(`🔧 ResizeHandle: Current ${zone} size: ${currentSize}`);
  
  const newSize = getNextSize(currentSize, zone, isExpanding);
  console.log(`🔧 ResizeHandle: Calculated new size: ${newSize}`);
  
  if (newSize !== currentSize) {
    console.log(`🔧 ResizeHandle: Calling onZoneResize(${zone}, ${newSize}) - EXECUTING RESIZE`);
    onZoneResize(zone, newSize);
    if ((isExpanding && newSize < currentSize) || (!isExpanding && newSize > currentSize)) {
      console.log(`🔧 ResizeHandle: Toggling isExpanding from ${isExpanding} to ${!isExpanding}`);
      setIsExpanding(!isExpanding);
    }
    console.log(`🔧 ResizeHandle: Resize completed successfully ✅`);
  } else {
    console.log(`🔧 ResizeHandle: No size change needed`);
  }
  
  console.log(`🔧 ResizeHandle handleClick: ${zone} - END`);
};

  const handleMouseDown = (zone: 'apostles' | 'terrorists') => (e: React.MouseEvent) => {
  console.log(`🔧 ResizeHandle handleMouseDown: ${zone}`);
  e.preventDefault();
  e.stopPropagation();
  
  if (e.target instanceof HTMLElement && e.target.dataset.clicking === 'true') {
    console.log(`🔧 ResizeHandle: Detected click event, calling handleClick`);
    handleClick(zone, e);
    return;
  }

    const container = e.currentTarget.parentElement;
    if (!container) return;
    
    const containerRect = container.getBoundingClientRect();
    const startX = e.clientX;
    const startY = e.clientY;
    const startSize = zone === 'apostles' ? apostlesZoneSize : terroristsZoneSize;
    let hasMoved = false;
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      moveEvent.preventDefault();
      moveEvent.stopPropagation();
      
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      
      if (!hasMoved && (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5)) {
        hasMoved = true;
        setIsDragging(true);
      }
      
      if (!hasMoved) return;
      
      const diagonalMovement = zone === 'apostles' ?
        -(deltaX + deltaY) / 2 :
        (deltaX + deltaY) / 2;
      
      const cellSize = Math.min(
        containerRect.width / dimensions.totalCols,
        containerRect.height / dimensions.totalRows
      );

      // Allow half-cell movements
      const deltaCells = (Math.round(Math.abs(diagonalMovement) / (cellSize / 2)) / 2);
      const dragExpanding = diagonalMovement > 0;
      
      const newSizeRaw = startSize + (dragExpanding ? deltaCells : -deltaCells);
      const newSize = enforceLimit(newSizeRaw, zone);

      if (newSize !== startSize) {
        onZoneResize(zone, newSize);
        setIsExpanding(dragExpanding);
      }
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'default';
      
      if (!hasMoved) {
        handleClick(zone, e);
      }
      
      setTimeout(() => setIsDragging(false), 0);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'nesw-resize';
  };

  const maxApostlesSize = calculateMaxSize('apostles');
const maxTerroristsSize = calculateMaxSize('terrorists');

console.log(`🔧 ResizeHandle: Max sizes calculated - apostles: ${maxApostlesSize}, terrorists: ${maxTerroristsSize}`);
console.log(`🔧 ResizeHandle: About to render handles`);
console.log(`🔧 ResizeHandle: Current sizes - apostles: ${apostlesZoneSize}, terrorists: ${terroristsZoneSize}`);
console.log(`🔧 ResizeHandle: Visibility check - apostles: ${apostlesZoneSize >= 1 && apostlesZoneSize <= maxApostlesSize}, terrorists: ${terroristsZoneSize >= 1 && terroristsZoneSize <= maxTerroristsSize}`);
  

  return (
    <div className="resize-handles">
      {/* Apostles handle */}
      <div
        className="resize-handle apostles-handle"
        title="Click to resize or drag diagonally"
        style={{
          ...{
            left: `${100 - (apostlesZoneSize * cellWidth)}%`,
            top: `${apostlesZoneSize * cellHeight}%`
          },
          visibility: apostlesZoneSize >= 1 && apostlesZoneSize <= maxApostlesSize ? 'visible' : 'hidden'
        }}
        data-clicking="true"
        onMouseDown={handleMouseDown('apostles')}
        onClick={(e) => {
          console.log(`🔧 ResizeHandle: Direct onClick for apostles`);
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <ChevronsUpDown size={16} />
      </div>
      
      {/* Terrorists handle */}
      <div
        className="resize-handle terrorists-handle"
        title="Click to resize or drag diagonally"
        style={{
          ...{
            left: `${terroristsZoneSize * cellWidth}%`,
            top: `${100 - (terroristsZoneSize * cellHeight)}%`
          },
          visibility: terroristsZoneSize >= 1 && terroristsZoneSize <= maxTerroristsSize ? 'visible' : 'hidden'
        }}
        data-clicking="true"
        onMouseDown={handleMouseDown('terrorists')}
        onClick={(e) => {
          console.log(`🔧 ResizeHandle: Direct onClick for terrorists`);
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <ChevronsUpDown size={16} />
      </div>
    </div>
  );
};

export default ResizeHandle;