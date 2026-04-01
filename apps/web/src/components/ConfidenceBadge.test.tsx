import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ConfidenceBadge, ConfidenceDot } from './ConfidenceBadge';
import type { ConfidenceScore } from '../types';

describe('ConfidenceBadge', () => {
  it('affiche le badge "VH" pour Very High', () => {
    render(<ConfidenceBadge score="Very High" />);
    expect(screen.getByText('VH')).toBeInTheDocument();
  });

  it('affiche le badge "H?" pour Hypothesis', () => {
    render(<ConfidenceBadge score="Hypothesis" />);
    expect(screen.getByText('H?')).toBeInTheDocument();
  });

  it('affiche la première lettre pour les autres scores', () => {
    render(<ConfidenceBadge score="High" />);
    expect(screen.getByText('H')).toBeInTheDocument();
    
    const { rerender } = render(<ConfidenceBadge score="Medium" />);
    expect(screen.getByText('M')).toBeInTheDocument();
    
    rerender(<ConfidenceBadge score="Low" />);
    expect(screen.getByText('L')).toBeInTheDocument();
  });

  it('applique les bonnes classes CSS selon le score', () => {
    const { container, rerender } = render(<ConfidenceBadge score="Very High" />);
    expect(container.firstChild).toHaveClass('bg-emerald-500/20', 'text-emerald-400');
    
    rerender(<ConfidenceBadge score="High" />);
    expect(container.firstChild).toHaveClass('bg-blue-500/20', 'text-blue-400');
    
    rerender(<ConfidenceBadge score="Medium" />);
    expect(container.firstChild).toHaveClass('bg-yellow-500/20', 'text-yellow-400');
    
    rerender(<ConfidenceBadge score="Low" />);
    expect(container.firstChild).toHaveClass('bg-orange-500/20', 'text-orange-400');
    
    rerender(<ConfidenceBadge score="Hypothesis" />);
    expect(container.firstChild).toHaveClass('bg-purple-500/20', 'text-purple-400');
  });

  it('affiche le titre complet au survol (sans source)', () => {
    const scores: ConfidenceScore[] = ['Very High', 'High', 'Medium', 'Low', 'Hypothesis'];
    
    scores.forEach(score => {
      const { container } = render(<ConfidenceBadge score={score} />);
      expect(container.firstChild).toHaveAttribute('title', score);
    });
  });

  it('affiche un tooltip avec source et date quand fournis', () => {
    render(
      <ConfidenceBadge
        score="Very High"
        sourceName="Our World in Data"
        verifiedDate="2026-03-31"
      />
    );
    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).toHaveTextContent('Very High');
    expect(tooltip).toHaveTextContent('Our World in Data');
    expect(tooltip).toHaveTextContent('2026-03-31');
  });

  it('affiche le tooltip avec seulement la source si pas de date', () => {
    render(<ConfidenceBadge score="High" sourceName="EIA International" />);
    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).toHaveTextContent('EIA International');
  });

  it("n'affiche pas de tooltip si source et date sont absents", () => {
    render(<ConfidenceBadge score="Medium" />);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });
});

describe('ConfidenceDot', () => {
  it('affiche un point coloré', () => {
    const { container } = render(<ConfidenceDot score="Very High" />);
    const dot = container.firstChild;
    
    expect(dot).toHaveClass('w-2', 'h-2', 'rounded-full');
  });

  it('applique la bonne couleur selon le score', () => {
    const { container, rerender } = render(<ConfidenceDot score="Very High" />);
    expect(container.firstChild).toHaveClass('bg-emerald-400');
    
    rerender(<ConfidenceDot score="High" />);
    expect(container.firstChild).toHaveClass('bg-blue-400');
    
    rerender(<ConfidenceDot score="Medium" />);
    expect(container.firstChild).toHaveClass('bg-yellow-400');
    
    rerender(<ConfidenceDot score="Low" />);
    expect(container.firstChild).toHaveClass('bg-orange-400');
    
    rerender(<ConfidenceDot score="Hypothesis" />);
    expect(container.firstChild).toHaveClass('bg-purple-400');
  });

  it('affiche le titre complet au survol', () => {
    const { container } = render(<ConfidenceDot score="Medium" />);
    expect(container.firstChild).toHaveAttribute('title', 'Medium');
  });
});
