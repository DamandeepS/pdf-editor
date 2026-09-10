import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Spinner } from './Spinner';

describe('Spinner Component', () => {
  it('renders with role="progressbar" and aria-busy="true"', () => {
    render(<Spinner />);
    const spinner = screen.getByRole('progressbar');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveAttribute('aria-busy', 'true');
    expect(spinner).toHaveAttribute('aria-label', 'Loading');
  });

  it('renders custom label and associates with aria-label', () => {
    render(<Spinner label="Exporting PDF..." />);
    const spinner = screen.getByRole('progressbar', { name: /exporting pdf/i });
    expect(spinner).toBeInTheDocument();
    expect(screen.getByText('Exporting PDF...')).toBeInTheDocument();
  });

  it('applies variant classes correctly', () => {
    const { container: c1 } = render(<Spinner variant="brand" />);
    expect(c1.firstChild).toHaveClass('inq-spinner--brand');

    const { container: c2 } = render(<Spinner variant="white" />);
    expect(c2.firstChild).toHaveClass('inq-spinner--white');
  });

  it('applies size classes correctly', () => {
    const { container: c1 } = render(<Spinner size="sm" />);
    expect(c1.firstChild).toHaveClass('inq-spinner--sm');

    const { container: c2 } = render(<Spinner size="lg" />);
    expect(c2.firstChild).toHaveClass('inq-spinner--lg');
  });
});

