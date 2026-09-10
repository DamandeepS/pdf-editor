import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Badge } from './Badge';

describe('Badge Component', () => {
  it('renders children correctly with base class', () => {
    render(<Badge>Test Content</Badge>);
    const element = screen.getByText('Test Content');
    expect(element).toBeInTheDocument();
    expect(element).toHaveClass('inq-badge');
  });

  it('merges custom className when provided', () => {
    render(<Badge className="custom-test-class">Content</Badge>);
    expect(screen.getByText('Content')).toHaveClass('custom-test-class');
  });
});
