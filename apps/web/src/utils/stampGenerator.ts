/**
 * Utility to generate authentic vector/raster business stamp badges (PAID, APPROVED, VOID, etc.)
 * Rendered to standard PNG Data URLs for lossless vector PDF embedding via pdf-lib.
 */

export interface StampPreset {
  id: string;
  label: string;
  subtext?: string;
  colorHex: string;
}

export const STAMP_PRESETS: StampPreset[] = [
  {
    id: 'paid',
    label: 'PAID',
    subtext: new Date().toISOString().split('T')[0],
    colorHex: '#137333', // Emerald green
  },
  {
    id: 'approved',
    label: 'APPROVED',
    subtext: 'VERIFIED & AUDITED',
    colorHex: '#1a73e8', // Google Blue
  },
  {
    id: 'void',
    label: 'VOID',
    subtext: 'CANCELLED',
    colorHex: '#d93025', // Coral Red
  },
  {
    id: 'confidential',
    label: 'CONFIDENTIAL',
    subtext: 'INTERNAL USE ONLY',
    colorHex: '#b06000', // Amber
  },
];

/**
 * Creates a high-resolution PNG data URL for a business stamp using HTML5 Canvas.
 */
export function createStampDataUrl(
  label: string,
  colorHex: string,
  subtext?: string
): Promise<string> {
  return new Promise((resolve) => {
    const width = 320;
    const height = 130;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      resolve('');
      return;
    }

    ctx.clearRect(0, 0, width, height);

    // Save and rotate slightly for natural stamp tilt (-8 degrees)
    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.rotate((-8 * Math.PI) / 180);
    ctx.translate(-width / 2, -height / 2);

    const pad = 12;
    const r = 10;
    const x = pad;
    const y = pad;
    const w = width - pad * 2;
    const h = height - pad * 2;

    // Outer Thick Border
    ctx.strokeStyle = colorHex;
    ctx.lineWidth = 5;
    ctx.lineJoin = 'round';
    ctx.strokeRect(x, y, w, h);

    // Inner Thin Border
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x + 5, y + 5, w - 10, h - 10);

    // Main Stamp Text
    ctx.fillStyle = colorHex;
    ctx.font = '900 36px "Google Sans", "Arial Black", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.letterSpacing = '3px';

    const textY = subtext ? height / 2 - 10 : height / 2;
    ctx.fillText(label.toUpperCase(), width / 2, textY);

    // Subtext (Date or status)
    if (subtext) {
      ctx.font = '700 13px "Roboto Mono", "Courier New", monospace';
      ctx.letterSpacing = '1.5px';
      ctx.fillText(subtext.toUpperCase(), width / 2, height / 2 + 24);
    }

    ctx.restore();

    resolve(canvas.toDataURL('image/png'));
  });
}
