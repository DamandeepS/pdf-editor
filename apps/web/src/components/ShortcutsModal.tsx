import React from 'react';
import { Modal } from '@inq/ui/modal';
import { Button } from '@inq/ui/button';

export interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SHORTCUTS = [
  { label: 'Select Tool', key: 'V' },
  { label: 'Edit Text Tool', key: 'T' },
  { label: 'Whiteout / Redact Tool', key: 'W' },
  { label: 'Image Stamp Tool', key: 'I' },
  { label: 'Undo Modification', key: '⌘ + Z / Ctrl + Z' },
  { label: 'Redo Modification', key: '⌘ + ⇧ + Z / Ctrl + Y' },
  { label: 'Zoom In / Out', key: '+ / -' },
  { label: 'Reset Zoom (100%)', key: '0' },
  { label: 'Delete Selected Item', key: 'Delete / Backspace' },
  { label: 'Deselect / Close', key: 'Escape' },
];

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Keyboard Shortcuts & Controls"
      footer={
        <Button variant="primary" size="sm" onClick={onClose}>
          Got it
        </Button>
      }
    >
      <div className="shortcut-grid">
        {SHORTCUTS.map((s) => (
          <div key={s.label} className="shortcut-item">
            <span className="shortcut-label">{s.label}</span>
            <kbd className="shortcut-kbd">{s.key}</kbd>
          </div>
        ))}
      </div>
    </Modal>
  );
};
