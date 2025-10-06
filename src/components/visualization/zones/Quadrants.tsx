import React from 'react';
import { Position } from '../../../types/base';
import { ZoneLabel } from './ZoneLabel';
import './Quadrants.css';

interface QuadrantsProps {
  position: Position;
  isClassicModel: boolean;
  showLabels: boolean;
  showQuadrantLabels: boolean;
  labelPositioning: 'above-dots' | 'below-dots';
}

export const Quadrants: React.FC<QuadrantsProps> = ({ 
  position, 
  isClassicModel,
  showLabels,
  labelPositioning
}) => (
  <>
    <div className="quadrant loyalists" style={{
      top: 0,
      right: 0,
      width: `${100 - position.x}%`,
      height: `${100 - position.y}%`,
      zIndex: 10
    }}>
    </div>

    <div className="quadrant mercenaries" style={{
      bottom: 0,
      right: 0,
      width: `${100 - position.x}%`,
      height: `${position.y}%`,
      zIndex: 10
    }}>
    </div>

    <div className="quadrant hostages" style={{
      top: 0,
      left: 0,
      width: `${position.x}%`,
      height: `${100 - position.y}%`,
      zIndex: 10
    }}>
    </div>

    <div className="quadrant defectors" style={{
      bottom: 0,
      left: 0,
      width: `${position.x}%`,
      height: `${position.y}%`,
      zIndex: 10
    }}>
    </div>
  </>
);

export default Quadrants;