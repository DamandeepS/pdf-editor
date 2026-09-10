import React from 'react';
import { useWorkbench } from '../context/WorkbenchContext';
import type { ComponentStoryMeta, ControlDef } from '../types';

export interface ControlsPanelProps {
  story: ComponentStoryMeta;
}

export const ControlsPanel: React.FC<ControlsPanelProps> = ({ story }) => {
  const { currentProps, setPropValue } = useWorkbench();

  const controlEntries = Object.entries(story.controls);

  if (controlEntries.length === 0) {
    return (
      <div className="panel-empty-state">
        No configurable properties for this component.
      </div>
    );
  }

  return (
    <div className="controls-panel" role="region" aria-label="Component Properties & Knobs">
      <div className="controls-table">
        <div className="controls-header-row">
          <div className="col-prop">PROPERTY</div>
          <div className="col-type">TYPE</div>
          <div className="col-control">VALUE & CONTROL</div>
        </div>

        {controlEntries.map(([propKey, def]) => {
          const currentValue = currentProps[propKey] !== undefined ? currentProps[propKey] : def.defaultValue;

          return (
            <div key={propKey} className="control-row">
              {/* Prop Name */}
              <div className="col-prop">
                <span className="prop-name">{propKey}</span>
                {def.label && <span className="prop-label">{def.label}</span>}
              </div>

              {/* Type Badge */}
              <div className="col-type">
                <span className="type-badge">{def.type}</span>
              </div>

              {/* Control Input */}
              <div className="col-control">
                {/* SELECT */}
                {def.type === 'select' && (
                  <select
                    className="workbench-select"
                    value={currentValue ?? ''}
                    onChange={(e) => setPropValue(propKey, e.target.value)}
                  >
                    {def.options?.map((opt) => (
                      <option key={String(opt)} value={String(opt)}>
                        {String(opt)}
                      </option>
                    ))}
                  </select>
                )}

                {/* BOOLEAN */}
                {def.type === 'boolean' && (
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={Boolean(currentValue)}
                      onChange={(e) => setPropValue(propKey, e.target.checked)}
                    />
                    <span className="toggle-slider" />
                    <span className="toggle-status-text">
                      {currentValue ? 'true' : 'false'}
                    </span>
                  </label>
                )}

                {/* TEXT */}
                {def.type === 'text' && (
                  <input
                    type="text"
                    className="workbench-text-input"
                    value={String(currentValue ?? '')}
                    onChange={(e) => setPropValue(propKey, e.target.value)}
                  />
                )}

                {/* COLOR */}
                {def.type === 'color' && (
                  <div className="color-control-wrapper">
                    <input
                      type="color"
                      className="color-input"
                      value={String(currentValue ?? '#4285f4')}
                      onChange={(e) => setPropValue(propKey, e.target.value)}
                    />
                    <span className="color-value-label">{String(currentValue)}</span>
                  </div>
                )}

                {/* NUMBER */}
                {def.type === 'number' && (
                  <div className="number-control-wrapper">
                    <input
                      type="range"
                      className="range-input"
                      min={def.min ?? 0}
                      max={def.max ?? 100}
                      step={def.step ?? 1}
                      value={Number(currentValue) || 0}
                      onChange={(e) => setPropValue(propKey, Number(e.target.value))}
                    />
                    <span className="number-value-label">{currentValue}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
