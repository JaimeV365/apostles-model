import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import QuadrantChart from '../QuadrantChart';
import { DataPoint, ScaleFormat } from '../../../../types/base';

describe('QuadrantChart', () => {
  const mockData: DataPoint[] = [
    { id: '1', name: 'Test1', satisfaction: 4, loyalty: 4, group: 'test' }
  ];

  const defaultProps = {
    data: mockData,
    satisfactionScale: '1-5' as ScaleFormat,
    loyaltyScale: '1-5' as ScaleFormat,
    isClassicModel: true,
    showNearApostles: true,
    showLabels: true,
    showGrid: true,
    hideWatermark: false,
    showAdvancedFeatures: false,
    activeEffects: new Set<string>(),
    frequencyFilterEnabled: false,
    frequencyThreshold: 1,
    isAdjustableMidpoint: false,
    onIsClassicModelChange: jest.fn(),
    onShowNearApostlesChange: jest.fn(),
    onShowLabelsChange: jest.fn(),
    onShowGridChange: jest.fn(),
    onFrequencyFilterEnabledChange: jest.fn(),
    onFrequencyThresholdChange: jest.fn(),
    onIsAdjustableMidpointChange: jest.fn()
  };

  it('renders all components when data is present', () => {
    const { container } = render(<QuadrantChart {...defaultProps} />);
    expect(container.querySelector('.quadrant-chart')).toBeTruthy();
    expect(container.querySelector('.data-point')).toBeTruthy();
    expect(container.querySelector('.grid-lines')).toBeTruthy();
  });

  it('shows tooltip on point click', () => {
    const { container } = render(<QuadrantChart {...defaultProps} />);
    const point = container.querySelector('.data-point');
    point && fireEvent.click(point);
    expect(container.querySelector('.data-point-tooltip')).toBeTruthy();
  });

  it('adjusts midpoint when enabled', () => {
    const { container } = render(
      <QuadrantChart 
        {...defaultProps}
        isAdjustableMidpoint={true}
      />
    );
    expect(container.querySelector('.midpoint')).toBeTruthy();
  });

  it('handles zone resizing', () => {
    const { container } = render(
      <QuadrantChart 
        {...defaultProps}
        isAdjustableMidpoint={true}
      />
    );
    const handles = container.querySelectorAll('.resize-handle');
    expect(handles.length).toBe(2); // Apostles and Terrorists zones
  });
});