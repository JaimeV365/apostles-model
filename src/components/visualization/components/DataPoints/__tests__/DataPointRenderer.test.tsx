import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import DataPointRenderer from '../DataPointRenderer';
import { DataPoint, ScaleFormat } from '../../../../../types/base';

describe('DataPointRenderer', () => {
  const mockData: DataPoint[] = [
    { id: '1', name: 'Test1', satisfaction: 4, loyalty: 4, group: 'test' },
    { id: '2', name: 'Test2', satisfaction: 3, loyalty: 3, group: 'test', excluded: true }
  ];

  const mockDimensions = {
    cellWidth: 25,
    cellHeight: 25,
    totalCols: 5,
    totalRows: 5,
    midpointCol: 2,
    midpointRow: 2,
    hasNearApostles: true
  };

  const defaultProps = {
    data: mockData,
    satisfactionScale: '1-5' as ScaleFormat,
    loyaltyScale: '1-5' as ScaleFormat,
    dimensions: mockDimensions,
    frequencyFilterEnabled: false,
    frequencyThreshold: 1,
    onPointSelect: jest.fn(),
    selectedPointId: undefined
  };

  it('renders points correctly', () => {
    const { container } = render(<DataPointRenderer {...defaultProps} />);
    const points = container.querySelectorAll('.data-point');
    expect(points).toHaveLength(1); // Only non-excluded points
  });

  it('applies correct styling based on frequency', () => {
    const { container } = render(<DataPointRenderer {...defaultProps} />);
    const point = container.querySelector('.data-point');
    expect(point).toHaveStyle({
      width: '8px', // MIN_SIZE
      height: '8px'
    });
  });

  it('filters points based on frequency threshold', () => {
    const { container } = render(
      <DataPointRenderer 
        {...defaultProps} 
        frequencyFilterEnabled={true}
        frequencyThreshold={2}
      />
    );
    const points = container.querySelectorAll('.data-point');
    expect(points).toHaveLength(0);
  });

  it('handles point selection', () => {
    const onPointSelect = jest.fn();
    const { container } = render(
      <DataPointRenderer 
        {...defaultProps}
        onPointSelect={onPointSelect}
      />
    );
    
    const point = container.querySelector('.data-point');
    fireEvent.click(point!);
    expect(onPointSelect).toHaveBeenCalled();
  });
});