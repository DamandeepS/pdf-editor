/**
 * Geometric bounding box representation
 * Coordinates in PDF points (72 points = 1 inch)
 */
export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Extracted text item from the underlying PDF page
 */
export interface PdfTextSpan {
  id: string;
  pageIndex: number;
  text: string;
  bbox: BoundingBox;
  fontName: string;
  fontSize: number;
  colorHex: string;
  transformMatrix?: number[];
  dir?: string;
}

/**
 * Metadata for a single page in the PDF document
 */
export interface PdfPageMeta {
  pageIndex: number;
  width: number;
  height: number;
  rotation: number;
}

/**
 * Text formatting and typography options
 */
export interface TextStyleOptions {
  fontFamily: string;
  fontSize: number;
  colorHex: string;
  isBold: boolean;
  isItalic: boolean;
  letterSpacing: number; // in points
  lineHeight: number;
  textAlign: 'left' | 'center' | 'right';
  autoFit: boolean; // Auto-scale font size to fit original bounding box if text overflows
}

/**
 * User edit applied to an existing detected text span
 */
export interface TextBlockEdit {
  id: string;
  pageIndex: number;
  originalText: string;
  newText: string;
  originalBbox: BoundingBox;
  currentBbox: BoundingBox;
  style: TextStyleOptions;
  backgroundColorHex?: string; // Background color for redaction/whiteout (matches container background)
  baselineY?: number;          // Exact PDF baseline Y coordinate for sub-pixel text alignment
  detectedFontName?: string;   // Original detected PDF font identifier or family
  customBoxAdjusted?: boolean;
}

/**
 * Vector Whiteout / Redaction rectangle to cover unwanted sections
 */
export interface WhiteoutBlock {
  id: string;
  pageIndex: number;
  bbox: BoundingBox;
  fillColorHex: string; // Defaults to #ffffff or matched background
}

/**
 * Inserted image stamp (logos, signatures, stamps, seals)
 */
export interface ImageStamp {
  id: string;
  pageIndex: number;
  bbox: BoundingBox;
  dataUrl: string; // Base64 encoded data URI (PNG/JPEG)
  mimeType: 'image/png' | 'image/jpeg';
  opacity?: number; // 0 to 1
  name?: string;
}

/**
 * Newly created text block placed on the page
 */
export interface NewTextBlock {
  id: string;
  pageIndex: number;
  text: string;
  bbox: BoundingBox;
  style: TextStyleOptions;
}

/**
 * Complete set of modifications for a specific page
 */
export interface PageModifications {
  pageIndex: number;
  textEdits: TextBlockEdit[];
  whiteouts: WhiteoutBlock[];
  images: ImageStamp[];
  newTexts: NewTextBlock[];
}

/**
 * Delta of all modifications across the entire PDF document
 */
export interface ModificationDelta {
  documentId?: string;
  documentTitle?: string;
  pages: Record<number, PageModifications>;
}

export type DocumentDelta = ModificationDelta;

/**
 * Sample bill gallery metadata
 */
export interface SampleBillMeta {
  id: string;
  title: string;
  category: 'invoice' | 'utility' | 'receipt';
  description: string;
  filename: string;
  badgeColor?: string;
}

/**
 * Available font option in the editor
 */
export interface FontOption {
  id: string;
  name: string;
  family: string;
  isStandardPdfFont: boolean;
  standardName?: string; // e.g. Helvetica, TimesRoman, Courier
  url?: string;
  isCustomUploaded?: boolean;
}

/**
 * Theme mode for Google-inspired UI
 */
export type ThemeMode = 'light' | 'dark';

/**
 * Active tool mode in the editor
 */
export type EditorTool = 'select' | 'text' | 'whiteout' | 'image';

/**
 * Payload sent to backend `/api/export`
 */
export interface ExportRequestPayload {
  documentTitle: string;
  pdfBase64?: string; // If custom uploaded PDF
  sampleId?: string;   // If using a built-in sample bill
  delta: ModificationDelta;
}

/**
 * Response from backend `/api/export`
 */
export interface ExportResponsePayload {
  success: boolean;
  pdfBase64?: string;
  downloadFilename: string;
  byteLength: number;
  error?: string;
}

/**
 * Root state for active document session
 */
export interface DocumentSession {
  id: string;
  title: string;
  pageCount: number;
  pagesMeta: PdfPageMeta[];
  pdfDataUrl: string;
  sampleId?: string;
  modifications: ModificationDelta;
}
