import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

test('renders Segmentor title', () => {
  render(<App />);
  const titleElement = screen.getByText(/Segmentor/i);
  expect(titleElement).toBeInTheDocument();
});