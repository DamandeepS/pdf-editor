import express from 'express';
import cors from 'cors';
import * as trpcExpress from '@trpc/server/adapters/express';
import { appRouter } from './trpc/router';
import { SAMPLE_BILLS_META, getSamplePdfBytes } from './samples/sampleBills';
import { PdfEngine } from '@inq/pdf-engine';

export const app = express();
const pdfEngine = new PdfEngine();

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 1. Mount tRPC API handler
app.use(
  '/trpc',
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext: () => ({}),
  })
);

// 2. REST Compatibility Endpoints
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.get('/api/samples', (req, res) => {
  res.json(SAMPLE_BILLS_META);
});

app.get('/api/samples/:id/download', async (req, res): Promise<void> => {
  const bytes = await getSamplePdfBytes(req.params.id);
  if (!bytes) {
    res.status(404).json({ error: 'Sample bill not found' });
    return;
  }

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="${req.params.id}.pdf"`);
  res.send(Buffer.from(bytes));
});

app.post('/api/export', async (req, res): Promise<void> => {
  try {
    const { sampleId, pdfBase64, delta, documentTitle = 'edited-document' } = req.body;
    let baseBytes: Uint8Array | null = null;

    if (sampleId) {
      baseBytes = await getSamplePdfBytes(sampleId);
    } else if (pdfBase64) {
      const raw = pdfBase64.includes(',') ? pdfBase64.split(',')[1] : pdfBase64;
      baseBytes = Uint8Array.from(Buffer.from(raw, 'base64'));
    }

    if (!baseBytes) {
      res.status(400).json({ error: 'Missing PDF input (sampleId or pdfBase64)' });
      return;
    }

    const modifiedBytes = await pdfEngine.modifyPdf(baseBytes, delta || { pages: {} });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${documentTitle}.pdf"`);
    res.send(Buffer.from(modifiedBytes));
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Export failed' });
  }
});

const PORT = process.env.PORT || 4000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 @inq/server running on http://localhost:${PORT}`);
    console.log(`   - tRPC Endpoint:  http://localhost:${PORT}/trpc`);
    console.log(`   - REST Samples:   http://localhost:${PORT}/api/samples`);
  });
}
