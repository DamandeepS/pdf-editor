import React from 'react';
import { useWorkbench } from '../context/WorkbenchContext';
import type { ComponentStoryMeta, ViewportMode, CanvasBg } from '../types';
import { SegmentedControl } from '@inq/ui/segmented-control';
import { Badge } from '@inq/ui/badge';
import { Button } from '@inq/ui/button';

export interface StoryCanvasProps {
  story: ComponentStoryMeta;
}

interface DeviceProfile {
  id: ViewportMode;
  name: string;
  width: string;
  minHeight: string;
  resolutionText: string;
  subtitle: string;
}

const DEVICE_PROFILES: Record<ViewportMode, DeviceProfile> = {
  desktop: {
    id: 'desktop',
    name: 'Desktop Canvas',
    width: '100%',
    minHeight: '320px',
    resolutionText: '100% Fluid Width',
    subtitle: 'Responsive',
  },
  laptop: {
    id: 'laptop',
    name: 'MacBook Pro 14',
    width: '1024px',
    minHeight: '400px',
    resolutionText: '1024 × 640 px',
    subtitle: 'Laptop Mode',
  },
  tablet: {
    id: 'tablet',
    name: 'iPad Air',
    width: '768px',
    minHeight: '440px',
    resolutionText: '768 × 1024 px',
    subtitle: 'Tablet Mode',
  },
  mobile: {
    id: 'mobile',
    name: 'iPhone 15 Pro',
    width: '375px',
    minHeight: '520px',
    resolutionText: '375 × 667 px',
    subtitle: 'Mobile Mode',
  },
};

export const StoryCanvas: React.FC<StoryCanvasProps> = ({ story }) => {
  const {
    currentProps,
    setCurrentProps,
    viewport,
    setViewport,
    canvasBg,
    setCanvasBg,
  } = useWorkbench();

  const Component = story.component;

  const handleApplyVariant = (variantProps: Partial<any>) => {
    setCurrentProps((prev) => ({
      ...story.defaultProps,
      ...variantProps,
    }));
  };

  return (
    <div className="story-canvas-wrapper">
      {/* Component Title & Description Header */}
      <div className="story-header">
        <div className="story-title-row">
          <h1 className="story-title">{story.name}</h1>
          <Badge className="story-category-badge">{story.category}</Badge>
        </div>
        <p className="story-description">{story.description}</p>
      </div>

      {/* Canvas Toolbar (Viewport, Background & Variant switchers) */}
      <div className="canvas-toolbar">
        {/* Left: Viewport Resizer Toggles (Desktop only) */}
        <div className="viewport-switcher-wrap">
          <SegmentedControl
            size="sm"
            value={viewport}
            onChange={(val) => setViewport(val as ViewportMode)}
            options={[
              { value: 'desktop', label: 'Desktop (100%)' },
              { value: 'laptop', label: 'Laptop (1024)' },
              { value: 'tablet', label: 'Tablet (768)' },
              { value: 'mobile', label: 'Mobile (375)' },
            ]}
            aria-label="Viewport Size"
          />
        </div>

        {/* Mobile Viewport Indicator: Shows true mobile canvas */}
        <div className="mobile-viewport-badge" aria-label="Active Viewport">
          <span className="dot-pulse-green" aria-hidden="true" />
          <span>Mobile Canvas</span>
        </div>

        {/* Right: Canvas Background Switcher */}
        <div className="canvas-bg-switcher-wrap">
          <SegmentedControl
            size="sm"
            value={canvasBg}
            onChange={(val) => setCanvasBg(val as CanvasBg)}
            options={[
              { value: 'canvas', label: 'Default' },
              { value: 'white', label: 'White' },
              { value: 'dark', label: 'Dark' },
              { value: 'grid', label: 'Grid' },
            ]}
            aria-label="Canvas Background"
          />
        </div>
      </div>

      {/* Preset Variant Pills */}
      {story.variants && story.variants.length > 0 && (
        <div className="variants-row">
          <span className="variants-label">Presets:</span>
          {story.variants.map((v) => (
            <Button
              key={v.name}
              size="sm"
              variant="secondary"
              className="variant-pill-btn"
              onClick={() => handleApplyVariant(v.props)}
            >
              {v.name}
            </Button>
          ))}
          <Button
            size="sm"
            variant="ghost"
            className="variant-pill-btn reset"
            onClick={() => setCurrentProps(story.defaultProps)}
            title="Reset props to default"
          >
            Reset Defaults
          </Button>
        </div>
      )}

      {/* Stage Frame (Responsive Sandbox) */}
      <div className={`canvas-stage bg-${canvasBg}`}>
        <div
          className={`canvas-device-frame mode-${viewport}`}
          style={{
            width: DEVICE_PROFILES[viewport].width,
          }}
        >
          {/* Device Chrome Header */}
          {viewport === 'desktop' && (
            <div className="device-header desktop-header">
              <div className="device-header-left">
                <div className="device-header-dots" aria-hidden="true">
                  <span className="dot dot-close" />
                  <span className="dot dot-min" />
                  <span className="dot dot-max" />
                </div>
                <span className="device-model-name">{DEVICE_PROFILES.desktop.name}</span>
              </div>
              <div className="device-header-center">
                <span className="device-res-badge">{DEVICE_PROFILES.desktop.resolutionText}</span>
              </div>
              <div className="device-header-right">
                <span className="device-status-indicator">{DEVICE_PROFILES.desktop.subtitle}</span>
              </div>
            </div>
          )}

          {viewport === 'laptop' && (
            <div className="device-header laptop-header">
              <div className="device-header-left">
                <div className="device-header-dots" aria-hidden="true">
                  <span className="dot dot-close" />
                  <span className="dot dot-min" />
                  <span className="dot dot-max" />
                </div>
                <span className="device-model-name">{DEVICE_PROFILES.laptop.name}</span>
              </div>
              <div className="device-header-center">
                <span className="device-res-badge">{DEVICE_PROFILES.laptop.resolutionText}</span>
              </div>
              <div className="device-header-right">
                <span className="device-status-indicator">{DEVICE_PROFILES.laptop.subtitle}</span>
              </div>
            </div>
          )}

          {viewport === 'tablet' && (
            <div className="device-header tablet-header">
              <div className="device-header-left">
                <div className="tablet-camera-dot" aria-hidden="true" />
                <span className="device-model-name">{DEVICE_PROFILES.tablet.name}</span>
              </div>
              <div className="device-header-center">
                <span className="device-res-badge">{DEVICE_PROFILES.tablet.resolutionText}</span>
              </div>
              <div className="device-header-right">
                <span className="device-status-indicator">{DEVICE_PROFILES.tablet.subtitle}</span>
              </div>
            </div>
          )}

          {viewport === 'mobile' && (
            <div className="mobile-chrome-header">
              <div className="mobile-status-bar" aria-hidden="true">
                <span className="mobile-time">9:41</span>
                <div className="mobile-island">
                  <span className="island-lens" />
                </div>
                <div className="mobile-status-icons">
                  <span className="mobile-signal-bars">
                    <span className="bar" />
                    <span className="bar" />
                    <span className="bar" />
                    <span className="bar" />
                  </span>
                  <span className="mobile-wifi">
                    <svg width="12" height="10" viewBox="0 0 12 10" fill="currentColor">
                      <path d="M6 8.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5zm0-3.5a4.7 4.7 0 0 1 3.5 1.5.6.6 0 1 1-.9.8A3.5 3.5 0 0 0 6 6.2a3.5 3.5 0 0 0-2.6 1.1.6.6 0 1 1-.9-.8A4.7 4.7 0 0 1 6 5zm0-3.5a8.2 8.2 0 0 1 6 2.6.6.6 0 1 1-.9.8A7 7 0 0 0 6 2.7a7 7 0 0 0-5.1 2.2.6.6 0 1 1-.9-.8A8.2 8.2 0 0 1 6 1.5z"/>
                    </svg>
                  </span>
                  <span className="mobile-battery">
                    <span className="battery-level" />
                  </span>
                </div>
              </div>
              <div className="mobile-info-bar">
                <span className="device-model-name">{DEVICE_PROFILES.mobile.name}</span>
                <span className="device-res-badge">{DEVICE_PROFILES.mobile.resolutionText}</span>
              </div>
            </div>
          )}

          {/* Component Render Canvas Screen */}
          <div className={`canvas-device-screen bg-${canvasBg}`}>
            <div className="component-render-stage">
              <Component {...currentProps} />
            </div>
          </div>

          {viewport === 'mobile' && (
            <div className="mobile-home-bar-area" aria-hidden="true">
              <div className="mobile-home-indicator" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
