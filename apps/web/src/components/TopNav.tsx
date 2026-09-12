import React, { useRef } from 'react';
import type { SampleBillMeta, EditorTool } from '@inq/types';
import {
  SelectIcon,
  TextEditIcon,
  WhiteoutIcon,
  ImageIcon,
  UndoIcon,
  RedoIcon,
  ZoomInIcon,
  ZoomOutIcon,
  DownloadIcon,
  UploadIcon,
  SunIcon,
  MoonIcon,
  LayersIcon,
} from '@inq/icons';
import { Button } from '@inq/ui/button';
import { IconButton } from '@inq/ui/icon-button';
import { ToolPill } from '@inq/ui/tool-pill';

export interface TopNavProps {
  title: string;
  onTitleChange: (val: string) => void;
  sampleBills: SampleBillMeta[];
  currentSampleId: string;
  onSelectSample: (id: string) => void;
  onUploadFile: (file: File) => void;
  activeTool: EditorTool;
  onSelectTool: (tool: EditorTool) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  scale: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onExport: () => void;
  isExporting: boolean;
  onOpenShortcuts: () => void;
  isRailCollapsed?: boolean;
  onToggleRail?: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  title,
  onTitleChange,
  sampleBills,
  currentSampleId,
  onSelectSample,
  onUploadFile,
  activeTool,
  onSelectTool,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  scale,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  theme,
  onToggleTheme,
  onExport,
  isExporting,
  onOpenShortcuts,
  isRailCollapsed,
  onToggleRail,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadFile(file);
      e.target.value = '';
    }
  };

  return (
    <header className="top-nav" role="banner">
      {/* Hidden file upload input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {/* Left: Brand + Title + Sample Selector + Mobile Rail Toggle */}
      <div className="nav-left">
        {onToggleRail && (
          <IconButton
            tooltip={isRailCollapsed ? 'Show Page Thumbnails' : 'Hide Page Thumbnails'}
            size="sm"
            onClick={onToggleRail}
            className="mobile-rail-toggle-btn"
          >
            <LayersIcon size={18} />
          </IconButton>
        )}

        <div className="brand-wrapper" onClick={onOpenShortcuts} title="Inq PDF Editor - Click for Shortcuts">
          <div className="brand-dots">
            <span className="brand-dot" />
            <span className="brand-dot" />
            <span className="brand-dot" />
            <span className="brand-dot" />
          </div>
          <h1 className="brand-title">Inq PDF Editor</h1>
        </div>

        <input
          type="text"
          className="doc-title-input"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          title="Click to rename document"
          placeholder="Document Title"
        />

        {/* Sample Document Dropdown */}
        <div className="sample-select-wrapper" title="Load sample bill or document template">
          <span className="sample-select-prefix">Template:</span>
          <select
            className="sample-select"
            value={currentSampleId}
            onChange={(e) => onSelectSample(e.target.value)}
            title="Switch Sample Template"
          >
            <option value="" disabled>Load Template...</option>
            {sampleBills.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
        </div>

        <IconButton
          tooltip="Upload Custom PDF"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
        >
          <UploadIcon size={18} />
        </IconButton>
      </div>

      {/* Center: Interactive Editing Tools */}
      <div className="nav-center">
        <div className="tool-group" role="toolbar" aria-label="Editor Tools">
          <ToolPill
            icon={<SelectIcon size={16} />}
            label="Select (V)"
            active={activeTool === 'select'}
            onClick={() => onSelectTool('select')}
          />
          <ToolPill
            icon={<TextEditIcon size={16} />}
            label="Edit Text (T)"
            active={activeTool === 'text'}
            onClick={() => onSelectTool('text')}
          />
          <ToolPill
            icon={<WhiteoutIcon size={16} />}
            label="Whiteout (W)"
            active={activeTool === 'whiteout'}
            onClick={() => onSelectTool('whiteout')}
          />
          <ToolPill
            icon={<ImageIcon size={16} />}
            label="Stamp (I)"
            active={activeTool === 'image'}
            onClick={() => onSelectTool('image')}
          />
        </div>

        <div className="divider-vertical" />

        {/* Undo / Redo */}
        <div className="tool-group">
          <IconButton
            tooltip="Undo (⌘Z)"
            size="sm"
            disabled={!canUndo}
            onClick={onUndo}
          >
            <UndoIcon size={16} />
          </IconButton>
          <IconButton
            tooltip="Redo (⌘⇧Z)"
            size="sm"
            disabled={!canRedo}
            onClick={onRedo}
          >
            <RedoIcon size={16} />
          </IconButton>
        </div>

        <div className="divider-vertical" />

        {/* Zoom Controls */}
        <div className="tool-group">
          <IconButton
            tooltip="Zoom Out (-)"
            size="sm"
            onClick={onZoomOut}
          >
            <ZoomOutIcon size={16} />
          </IconButton>
          <button
            type="button"
            className="sample-select"
            style={{ border: 'none', background: 'transparent', padding: '0 8px', fontSize: '12px' }}
            onClick={onResetZoom}
            title="Reset Zoom to 100%"
          >
            {Math.round(scale * 100)}%
          </button>
          <IconButton
            tooltip="Zoom In (+)"
            size="sm"
            onClick={onZoomIn}
          >
            <ZoomInIcon size={16} />
          </IconButton>
        </div>
      </div>

      {/* Right: Theme Toggle & Export CTA */}
      <div className="nav-right">
        <IconButton
          tooltip={`Switch to ${theme === 'dark' ? 'Light (Google Labs)' : 'Dark (Gemini)'} Mode`}
          size="md"
          onClick={onToggleTheme}
        >
          {theme === 'dark' ? <SunIcon size={18} /> : <MoonIcon size={18} />}
        </IconButton>

        <Button
          variant="primary"
          size="md"
          onClick={onExport}
          disabled={isExporting}
          icon={<DownloadIcon size={18} />}
        >
          {isExporting ? (
            'Exporting...'
          ) : (
            <>
              <span className="export-label-desktop">Export Vector PDF</span>
              <span className="export-label-mobile">Export</span>
            </>
          )}
        </Button>
      </div>
    </header>
  );
};
