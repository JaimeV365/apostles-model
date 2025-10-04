import React from 'react';
import { useDrag, useDrop } from 'react-dnd';
import type { QuadrantType } from '../../types';

interface DraggableQuadrantProps {
  type: QuadrantType;
  index: number;
  value: number;
  total: number;
  isPremium: boolean;
  moveQuadrant: (from: number, to: number) => void;
  className?: string;
  onClick?: () => void;
  children?: React.ReactNode;
}

export const DraggableQuadrant: React.FC<DraggableQuadrantProps> = ({
  type,
  index,
  value,
  total,
  isPremium,
  moveQuadrant,
  className = '',
  onClick,
  children
}) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'QUADRANT',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    }),
    canDrag: () => isPremium
  });

  const [, drop] = useDrop({
    accept: 'QUADRANT',
    hover: (item: { index: number }) => {
      if (item.index !== index) {
        moveQuadrant(item.index, index);
        item.index = index;
      }
    }
  });

  return (
    <div
      ref={(node) => drag(drop(node))}
      className={`report-quadrant-cell ${className} 
        ${isPremium ? 'cursor-move' : ''} 
        ${isDragging ? 'opacity-50' : 'opacity-100'}
        transition-all duration-200 ease-in-out
        rounded-lg border hover:shadow-md`}
      onClick={onClick}
    >
      {children || (
        <div className="p-4 text-center">
          <h4 className="font-semibold capitalize">{type}</h4>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm text-gray-600">
            {((value / total) * 100).toFixed(1)}%
          </p>
          {isPremium && (
            <div className="text-xs text-gray-500 mt-1">
              Drag to reorder
            </div>
          )}
        </div>
      )}
    </div>
  );
};