import React, { useState } from 'react';
import { useWorkbench } from '../context/WorkbenchContext';
import { CheckIcon } from '@inq/icons';
import type { ComponentStoryMeta } from '../types';

export interface CodeInspectorProps {
  story: ComponentStoryMeta;
}

export const CodeInspector: React.FC<CodeInspectorProps> = ({ story }) => {
  const { currentProps } = useWorkbench();
  const [copied, setCopied] = useState(false);

  // Generate JSX Code Snippet
  const generateJsxCode = (): string => {
    const propStrings: string[] = [];
    let childrenContent: string | null = null;

    for (const [key, value] of Object.entries(currentProps)) {
      if (value === undefined) continue;

      if (key === 'children') {
        if (typeof value === 'string') {
          childrenContent = value;
        }
        continue;
      }

      if (typeof value === 'boolean') {
        if (value) {
          propStrings.push(key);
        }
      } else if (typeof value === 'string') {
        propStrings.push(`${key}="${value}"`);
      } else if (typeof value === 'number') {
        propStrings.push(`${key}={${value}}`);
      } else if (typeof value === 'function') {
        propStrings.push(`${key}={() => {}}`);
      } else {
        propStrings.push(`${key}={${JSON.stringify(value)}}`);
      }
    }

    const importStatement = `import { ${story.name} } from '@inq/ui/${story.id}';\n\n`;

    let jsx = `<${story.name}`;
    if (propStrings.length > 0) {
      if (propStrings.length <= 2) {
        jsx += ` ${propStrings.join(' ')}`;
      } else {
        jsx += `\n  ${propStrings.join('\n  ')}\n`;
      }
    }

    if (childrenContent) {
      if (propStrings.length <= 2) {
        jsx += `>${childrenContent}</${story.name}>`;
      } else {
        jsx += `>\n  ${childrenContent}\n</${story.name}>`;
      }
    } else {
      jsx += propStrings.length > 2 ? `/>` : ` />`;
    }

    return importStatement + jsx;
  };

  const code = generateJsxCode();

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="code-inspector-container">
      <div className="code-inspector-header">
        <span className="code-language-tag">TSX / JSX</span>
        <button
          type="button"
          className={`copy-code-btn ${copied ? 'copied' : ''}`}
          onClick={handleCopy}
        >
          {copied ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <CheckIcon size={13} />
              <span>Copied to Clipboard</span>
            </span>
          ) : (
            <span>Copy JSX</span>
          )}
        </button>
      </div>
      <pre className="code-block">
        <code>{code}</code>
      </pre>
    </div>
  );
};
