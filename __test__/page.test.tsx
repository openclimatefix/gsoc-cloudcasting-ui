import React from 'react';
import { render, screen } from '@testing-library/react';
import HomePage from '../app/page';

// Mock mapbox-gl since it's not compatible with Jest
jest.mock('mapbox-gl', () => ({
  Map: jest.fn(() => ({
    remove: jest.fn(),
  })),
  accessToken: '',
}));

// Mock the components and utilities
jest.mock('@/components/navbar', () => {
  return function MockHeader() {
    return <div data-testid="mock-header">Header</div>;
  };
});

jest.mock('@/utils/withAuth', () => ({
  withAuth: (Component: React.ComponentType) => Component,
}));

describe('HomePage', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
  });

  it('renders the Header component', () => {
    render(<HomePage />);
    expect(screen.getByTestId('mock-header')).toBeInTheDocument();
  });

  it('renders the map container with correct styles', () => {
    render(<HomePage />);
    const mapContainer = document.getElementById('map');
    expect(mapContainer).toBeInTheDocument();
    expect(mapContainer).toHaveStyle({ width: '100%', height: 'calc(100vh - 64px)' });
  });

  it('initializes mapbox with correct settings', () => {
    render(<HomePage />);

    // Check if mapbox-gl was initialized
    expect(require('mapbox-gl').Map).toHaveBeenCalledWith({
      container: expect.anything(),
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [-2.5, 54.5],
      zoom: 6,
    });
  });
});
