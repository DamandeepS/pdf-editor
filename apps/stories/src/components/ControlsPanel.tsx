import React from 'react';
import { useWorkbench } from '../context/WorkbenchContext';
import type { ComponentStoryMeta } from '../types';
import { Select } from '@inq/ui/select';
import { Switch } from '@inq/ui/switch';
import { TextInput } from '@inq/ui/text-input';
import { Slider } from '@inq/ui/slider';
import { ColorPickerPill } from '@inq/ui/color-picker-pill';
import { Badge } from '@inq/ui/badge';

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
                <Badge className="type-badge-inq">
                  <code>{def.type}</code>
                </Badge>
              </div>

              {/* Control Input */}
              <div className="col-control">
                {/* SELECT */}
                {def.type === 'select' && (
                  <div className="control-input-wrapper">
                    <Select
                      size="sm"
                      value={String(currentValue ?? '')}
                      onChange={(e) => setPropValue(propKey, e.target.value)}
                      options={def.options?.map((opt) => ({
                        value: String(opt),
                        label: String(opt),
                      }))}
                    />
                  </div>
                )}

                {/* BOOLEAN */}
                {def.type === 'boolean' && (
                  <div className="control-switch-wrapper">
                    <Switch
                      size="sm"
                      checked={Boolean(currentValue)}
                      onChange={(checked) => setPropValue(propKey, checked)}
                      label={currentValue ? 'true' : 'false'}
                    />
                  </div>
                )}

                {/* TEXT */}
                {def.type === 'text' && (
                  <div className="control-input-wrapper">
                    <TextInput
                      size="sm"
                      value={String(currentValue ?? '')}
                      onChange={(e) => setPropValue(propKey, e.target.value)}
                      placeholder={`Enter ${def.label || propKey}`}
                    />
                  </div>
                )}

                {/* COLOR */}
                {def.type === 'color' && (
                  <div className="color-control-wrapper">
                    <ColorPickerPill
                      color={String(currentValue ?? '#4285f4')}
                      onChange={(color) => setPropValue(propKey, color)}
                      title={`Pick color for ${def.label || propKey}`}
                    />
                    <span className="color-value-label">{String(currentValue)}</span>
                  </div>
                )}

                {/* NUMBER */}
                {def.type === 'number' && (
                  <div className="number-control-wrapper">
                    <Slider
                      min={def.min ?? 0}
                      max={def.max ?? 100}
                      step={def.step ?? 1}
                      value={Number(currentValue) || 0}
                      onChange={(val) => setPropValue(propKey, val)}
                    />
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

