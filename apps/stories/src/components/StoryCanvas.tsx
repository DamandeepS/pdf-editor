import React from 'react';
import { useWorkbench } from '../context/WorkbenchContext';
import type { ComponentStoryMeta, ViewportMode, CanvasBg } from '../types';

export interface StoryCanvasProps {
  story: ComponentStoryMeta;
}

const VIEWPORT_WIDTHS: Record<ViewportMode, string> = {
  desktop: '100%',
  laptop: '1024px',
  tablet: '768px',
  mobile: '375px',
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
          <span className="story-category-badge">{story.category}</span>
        </div>
        <p className="story-description">{story.description}</p>
      </div>

      {/* Canvas Toolbar (Viewport, Background & Variant switchers) */}
      <div className="canvas-toolbar">
        {/* Left: Viewport Resizer Toggles */}
        <div className="toolbar-button-group" role="group" aria-label="Viewport Size">
          <button
            type="button"
            className={`toolbar-btn ${viewport === 'desktop' ? 'active' : ''}`}
            onClick={() => setViewport('desktop')}
            title="Desktop (100%)"
          >
            🖥️ 100%
          </button>
          <button
            type="button"
            className={`toolbar-btn ${viewport === 'laptop' ? 'active' : ''}`}
            onClick={() => setViewport('laptop')}
            title="Laptop (1024px)"
          >
            💻 1024
          </button>
          <button
            type="button"
            className={`toolbar-btn ${viewport === 'tablet' ? 'active' : ''}`}
            onClick={() => setViewport('tablet')}
            title="Tablet (768px)"
          >
            📱 768
          </button>
          <button
            type="button"
            className={`toolbar-btn ${viewport === 'mobile' ? 'active' : ''}`}
            onClick={() => setViewport('mobile')}
            title="Mobile (375px)"
          >
            📲 375
          </button>
        </div>

        {/* Right: Canvas Background Switcher */}
        <div className="toolbar-button-group" role="group" aria-label="Canvas Background">
          <button
            type="button"
            className={`toolbar-btn ${canvasBg === 'canvas' ? 'active' : ''}`}
            onClick={() => setCanvasBg('canvas')}
            title="Theme Background"
          >
            Default
          </button>
          <button
            type="button"
            className={`toolbar-btn ${canvasBg === 'white' ? 'active' : ''}`}
            onClick={() => setCanvasBg('white')}
            title="Solid White"
          >
            White
          </button>
          <button
            type="button"
            className={`toolbar-btn ${canvasBg === 'dark' ? 'active' : ''}`}
            onClick={() => setCanvasBg('dark')}
            title="Gemini Dark"
          >
            Dark
          </button>
          <button
            type="button"
            className={`toolbar-btn ${canvasBg === 'grid' ? 'active' : ''}`}
            onClick={() => setCanvasBg('grid')}
            title="Checkerboard Grid"
          >
            Grid
          </button>
        </div>
      </div>

      {/* Preset Variant Pills */}
      {story.variants && story.variants.length > 0 && (
        <div className="variants-row">
          <span className="variants-label">Presets:</span>
          {story.variants.map((v) => (
            <button
              key={v.name}
              type="button"
              className="variant-pill"
              onClick={() => handleApplyVariant(v.props)}
            >
              {v.name}
            </button>
          ))}
          <button
            type="button"
            className="variant-pill reset"
            onClick={() => setCurrentProps(story.defaultProps)}
            title="Reset to default props"
          >
            ↺ Reset
          </button>
        </div>
      )}

      {/* Stage Frame (Responsive Sandbox) */}
      <div className={`canvas-stage bg-${canvasBg}`}>
        <div
          className="canvas-device-frame"
          style={{ width: VIEWPORT_WIDTHS[viewport] }}
        >
          <div className="component-render-stage">
            <Component {...currentProps} />
          </div>
        </div>
      </div>
    </div>
  );
};
