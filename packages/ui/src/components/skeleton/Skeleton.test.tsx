import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Skeleton } from './Skeleton';

describe('Skeleton Component', () => {
  it('renders with aria-hidden="true"', () => {
    const { container } = render(<Skeleton />);
    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true');
    expect(container.firstChild).toHaveClass('inq-skeleton', 'inq-skeleton--text');
  });

  it('applies circular and rectangular shape variants', () => {
    const { container: c1 } = render(<Skeleton variant="circular" width={48} height={48} />);
    expect(c1.firstChild).toHaveClass('inq-skeleton--circular');
    expect(c1.firstChild).toHaveStyle({ width: '48px', height: '48px' });

    const { container: c2 } = render(<Skeleton variant="rectangular" height={200} />);
    expect(c2.firstChild).toHaveClass('inq-skeleton--rectangular');
    expect(c2.firstChild).toHaveStyle({ height: '200px' });
  });

  it('applies animation classes', () => {
    const { container: c1 } = render(<Skeleton animation="pulse" />);
    expect(c1.firstChild).toHaveClass('inq-skeleton--pulse');

    const { container: c2 } = render(<Skeleton animation="wave" />);
    expect(c2.firstChild).toHaveClass('inq-skeleton--wave');
  });

  it('renders multiple lines when lines > 1 for text variant', () => {
    const { container } = render(<Skeleton variant="text" lines={4} />);
    expect(container.firstChild).toHaveClass('inq-skeleton-group');
    expect(container.querySelectorAll('.inq-skeleton')).toHaveLength(4);
    expect(container.querySelector('.inq-skeleton--last-line')).toHaveStyle({ width: '75%' });
  });
});

