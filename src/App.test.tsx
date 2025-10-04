import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

test('renders Apostles Model Builder title', () => {
  render(<App />);
  const titleElement = screen.getByText(/Apostles Model Builder/i);
  expect(titleElement).toBeInTheDocument();
});