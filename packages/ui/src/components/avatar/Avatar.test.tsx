import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Avatar } from './Avatar';

describe('Avatar Component', () => {
  it('renders initials computed from user name with role="img"', () => {
    render(<Avatar name="Grace Hopper" />);
    const avatar = screen.getByRole('img', { name: 'Grace Hopper' });
    expect(avatar).toBeInTheDocument();
    expect(screen.getByText('GH')).toBeInTheDocument();
  });

  it('renders image when src is valid', () => {
    render(<Avatar src="https://example.com/avatar.jpg" alt="Jane Doe" />);
    const img = screen.getByRole('img', { name: 'Jane Doe' });
    expect(img).toBeInTheDocument();
  });

  it('falls back to initials when image loading errors', () => {
    render(<Avatar src="https://example.com/broken.jpg" name="Alan Turing" />);
    const imgElement = screen.getByAltText('Alan Turing');
    expect(imgElement).toBeInTheDocument();

    fireEvent.error(imgElement);

    expect(screen.getByText('AT')).toBeInTheDocument();
    expect(screen.queryByRole('img', { name: 'Alan Turing' })).toBeInTheDocument();
  });

  it('renders status dot with accessible status label', () => {
    render(<Avatar name="Bob" status="online" />);
    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-label', 'Status: online');
    expect(status).toHaveClass('inq-avatar-status--online');
  });

  it('applies shape and size classes correctly', () => {
    const { container: c1 } = render(<Avatar name="Test" shape="rounded" size="xl" />);
    expect(c1.firstChild).toHaveClass('inq-avatar--rounded', 'inq-avatar--xl');

    const { container: c2 } = render(<Avatar name="Test" shape="circle" size="xs" />);
    expect(c2.firstChild).toHaveClass('inq-avatar--circle', 'inq-avatar--xs');
  });
});

