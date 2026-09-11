import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Drawer } from './Drawer';

describe('Drawer Component', () => {
  it('does not render dialog when open is false', () => {
    render(
      <Drawer open={false} onClose={() => {}}>
        <div>Drawer Body</div>
      </Drawer>
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders dialog with accessible title and description when open', () => {
    render(
      <Drawer
        open={true}
        onClose={() => {}}
        title="Edit Settings"
        description="Configure document export"
      >
        <div>Drawer Body</div>
      </Drawer>
    );

    const dialog = screen.getByRole('dialog', { name: 'Edit Settings' });
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(screen.getByText('Configure document export')).toBeInTheDocument();
    expect(screen.getByText('Drawer Body')).toBeInTheDocument();
  });

  it('triggers onClose when close button is clicked', () => {
    const handleClose = vi.fn();
    render(
      <Drawer open={true} onClose={handleClose} title="Panel">
        <div>Content</div>
      </Drawer>
    );

    const closeBtn = screen.getByLabelText('Close drawer');
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('triggers onClose when backdrop is clicked', () => {
    const handleClose = vi.fn();
    const { container } = render(
      <Drawer open={true} onClose={handleClose}>
        <div>Content</div>
      </Drawer>
    );

    const backdrop = container.querySelector('.inq-drawer-backdrop');
    expect(backdrop).toBeInTheDocument();
    if (backdrop) {
      fireEvent.click(backdrop);
      expect(handleClose).toHaveBeenCalledTimes(1);
    }
  });

  it('triggers onClose when Escape key is pressed', () => {
    const handleClose = vi.fn();
    render(
      <Drawer open={true} onClose={handleClose}>
        <div>Content</div>
      </Drawer>
    );

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('renders footer and placement classes', () => {
    render(
      <Drawer
        open={true}
        onClose={() => {}}
        placement="left"
        size="lg"
        footer={<button type="button">Save</button>}
      >
        <div>Content</div>
      </Drawer>
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveClass('inq-drawer--left', 'inq-drawer--lg');
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });
});

