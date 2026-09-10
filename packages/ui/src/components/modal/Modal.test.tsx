import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Modal } from './Modal';

describe('Modal Component Accessibility & Interaction', () => {
  it('renders accessible dialog with role="dialog" and aria-modal="true"', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Edit Properties">
        <p>Modal Content</p>
      </Modal>
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(screen.getByText('Edit Properties')).toBeInTheDocument();
    expect(screen.getByText('Modal Content')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    render(
      <Modal isOpen={false} onClose={() => {}} title="Hidden Modal">
        <p>Secret Content</p>
      </Modal>
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('triggers onClose when Escape key is pressed (Keyboard Accessibility)', () => {
    const handleClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={handleClose} title="Escape Test">
        <p>Press Esc</p>
      </Modal>
    );

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('triggers onClose when backdrop overlay is clicked', () => {
    const handleClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={handleClose} title="Backdrop Test">
        <p>Click outside</p>
      </Modal>
    );

    const overlay = screen.getByRole('dialog').parentElement!;
    fireEvent.click(overlay);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
