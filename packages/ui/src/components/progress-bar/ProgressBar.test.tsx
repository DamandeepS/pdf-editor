import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ProgressBar } from './ProgressBar';

describe('ProgressBar Component', () => {
  it('renders determinate progress bar with aria values', () => {
    render(<ProgressBar value={40} min={0} max={100} label="Upload Progress" showValue />);
    const progressbar = screen.getByRole('progressbar', { name: /upload progress/i });
    expect(progressbar).toBeInTheDocument();
    expect(progressbar).toHaveAttribute('aria-valuenow', '40');
    expect(progressbar).toHaveAttribute('aria-valuemin', '0');
    expect(progressbar).toHaveAttribute('aria-valuemax', '100');
    expect(screen.getByText('40%')).toBeInTheDocument();
  });

  it('renders indeterminate progress bar without aria-valuenow', () => {
    render(<ProgressBar indeterminate label="Loading resources" />);
    const progressbar = screen.getByRole('progressbar', { name: /loading resources/i });
    expect(progressbar).toBeInTheDocument();
    expect(progressbar).not.toHaveAttribute('aria-valuenow');
    expect(progressbar.closest('.inq-progress-wrapper')).toHaveClass('is-indeterminate');
  });

  it('clamps value within min and max boundaries', () => {
    render(<ProgressBar value={150} min={0} max={100} showValue />);
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuenow', '100');
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('applies variant and size classes correctly', () => {
    const { container: c1 } = render(<ProgressBar value={70} variant="success" size="lg" />);
    expect(c1.firstChild).toHaveClass('inq-progress--success', 'inq-progress--lg');

    const { container: c2 } = render(<ProgressBar value={20} variant="brand" size="xs" />);
    expect(c2.firstChild).toHaveClass('inq-progress--brand', 'inq-progress--xs');
  });
});

