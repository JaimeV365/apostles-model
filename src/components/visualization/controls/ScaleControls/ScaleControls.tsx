import React from 'react';
import { Scale } from '../../../../types/base';
import './ScaleControls.css';

interface ScaleControlsProps {
  scales: {
    satisfaction: Scale;
    loyalty: Scale;
  };
  onScaleChange?: (type: 'satisfaction' | 'loyalty', scale: Scale) => void;
}

export const ScaleControls: React.FC<ScaleControlsProps> = ({ 
  scales,
  onScaleChange 
}) => (
  <div className="scale-controls">
    <select 
      value={scales.satisfaction} 
      onChange={(e) => onScaleChange?.('satisfaction', e.target.value as Scale)}
    >
      <option value="1-5">Satisfaction: 1-5</option>
      <option value="1-7">Satisfaction: 1-7</option>
      <option value="1-10">Satisfaction: 1-10</option>
    </select>
    <select 
      value={scales.loyalty} 
      onChange={(e) => onScaleChange?.('loyalty', e.target.value as Scale)}
    >
      <option value="1-5">Loyalty: 1-5</option>
      <option value="1-7">Loyalty: 1-7</option>
      <option value="1-10">Loyalty: 1-10</option>
    </select>
  </div>
);

export default ScaleControls;