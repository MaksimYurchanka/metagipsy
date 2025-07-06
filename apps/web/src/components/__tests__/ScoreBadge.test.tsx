import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from '@jest/globals';
import ScoreBadge from '../common/ScoreBadge';

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>
  }
}));

// Mock stores
jest.mock('../../stores/settingsStore', () => ({
  useDisplaySettings: () => ({
    showChessNotation: true,
    animationsEnabled: true
  })
}));

describe('ScoreBadge', () => {
  it('renders score correctly', () => {
    render(<ScoreBadge score={85} />);
    
    expect(screen.getByText('85')).toBeInTheDocument();
  });

  it('displays correct chess notation for brilliant score', () => {
    render(<ScoreBadge score={85} showNotation={true} />);
    
    expect(screen.getByText('!!')).toBeInTheDocument();
  });

  it('displays correct chess notation for excellent score', () => {
    render(<ScoreBadge score={75} showNotation={true} />);
    
    expect(screen.getByText('!')).toBeInTheDocument();
  });

  it('displays correct chess notation for good score', () => {
    render(<ScoreBadge score={65} showNotation={true} />);
    
    expect(screen.getByText('+')).toBeInTheDocument();
  });

  it('displays correct chess notation for average score', () => {
    render(<ScoreBadge score={45} showNotation={true} />);
    
    expect(screen.getByText('=')).toBeInTheDocument();
  });

  it('displays correct chess notation for mistake', () => {
    render(<ScoreBadge score={25} showNotation={true} />);
    
    expect(screen.getByText('?')).toBeInTheDocument();
  });

  it('displays correct chess notation for blunder', () => {
    render(<ScoreBadge score={15} showNotation={true} />);
    
    expect(screen.getByText('??')).toBeInTheDocument();
  });

  it('applies correct size classes', () => {
    const { rerender } = render(<ScoreBadge score={75} size="sm" />);
    expect(screen.getByText('75').parentElement).toHaveClass('h-6');

    rerender(<ScoreBadge score={75} size="md" />);
    expect(screen.getByText('75').parentElement).toHaveClass('h-8');

    rerender(<ScoreBadge score={75} size="lg" />);
    expect(screen.getByText('75').parentElement).toHaveClass('h-10');
  });

  it('hides notation when showNotation is false', () => {
    render(<ScoreBadge score={85} showNotation={false} />);
    
    expect(screen.getByText('85')).toBeInTheDocument();
    expect(screen.queryByText('!!')).not.toBeInTheDocument();
  });

  it('applies dimension-specific colors', () => {
    const { rerender } = render(<ScoreBadge score={75} dimension="strategic" />);
    expect(screen.getByText('75').parentElement).toHaveClass('bg-purple-500');

    rerender(<ScoreBadge score={75} dimension="tactical" />);
    expect(screen.getByText('75').parentElement).toHaveClass('bg-blue-500');

    rerender(<ScoreBadge score={75} dimension="cognitive" />);
    expect(screen.getByText('75').parentElement).toHaveClass('bg-green-500');

    rerender(<ScoreBadge score={75} dimension="innovation" />);
    expect(screen.getByText('75').parentElement).toHaveClass('bg-yellow-500');
  });

  it('includes tooltip with score details', () => {
    render(<ScoreBadge score={75} />);
    
    const badge = screen.getByText('75').parentElement;
    expect(badge).toHaveAttribute('title', 'Excellent: 75/100');
  });
});

