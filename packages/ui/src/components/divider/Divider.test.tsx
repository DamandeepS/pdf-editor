import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Divider } from './Divider';

describe('Divider Component', () => {
  it('renders separator with default horizontal orientation', () => {
    render(<Divider />);
    const separator = screen.getByRole('separator');
    expect(separator).toBeInTheDocument();
    expect(separator).toHaveAttribute('aria-orientation', 'horizontal');
    expect(separator).toHaveClass('inq-divider--horizontal', 'inq-divider--subtle');
  });

  it('renders separator with vertical orientation', () => {
    render(<Divider orientation="vertical" />);
    const separator = screen.getByRole('separator');
    expect(separator).toHaveAttribute('aria-orientation', 'vertical');
    expect(separator).toHaveClass('inq-divider--vertical');
  });

  it('renders with label text', () => {
    render(<Divider label="OR CONTINUE WITH" labelPosition="center" />);
    const separator = screen.getByRole('separator');
    expect(separator).toHaveClass('inq-divider--with-label', 'inq-divider--label-center');
    expect(screen.getByText('OR CONTINUE WITH')).toBeInTheDocument();
  });

  it('applies variant classes correctly', () => {
    const { container: c1 } = render(<Divider variant="default" />);
    expect(c1.firstChild).toHaveClass('inq-divider--default');

    const { container: c2 } = render(<Divider variant="dashed" />);
    expect(c2.firstChild).toHaveClass('inq-divider--dashed');
  });
});

