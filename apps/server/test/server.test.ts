import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/server';

describe('Server API & Sample Bills Endpoints', () => {
  it('GET /api/health returns status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('GET /api/samples returns list of 3 built-in sample bills', async () => {
    const res = await request(app).get('/api/samples');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(3);

    const ids = res.body.map((s: any) => s.id);
    expect(ids).toContain('saas-invoice');
    expect(ids).toContain('electric-utility');
    expect(ids).toContain('retail-receipt');
  });

  it('GET /api/samples/:id/download streams valid PDF buffer', async () => {
    const res = await request(app).get('/api/samples/saas-invoice/download');
    expect(res.status).toBe(200);
    expect(res.header['content-type']).toBe('application/pdf');

    // PDF magic bytes %PDF-
    const header = res.body.slice(0, 5).toString('utf-8');
    expect(header).toBe('%PDF-');
  });

  it('tRPC samples.list returns sample bills metadata', async () => {
    const res = await request(app).get('/trpc/samples.list');
    expect(res.status).toBe(200);
    expect(res.body.result.data).toBeDefined();
    expect(res.body.result.data.length).toBe(3);
  });

  it('POST /api/export successfully exports modified vector PDF', async () => {
    const exportPayload = {
      sampleId: 'saas-invoice',
      documentTitle: 'updated-invoice',
      delta: {
        pages: {
          0: {
            pageIndex: 0,
            textEdits: [
              {
                id: 'edit-subtotal',
                pageIndex: 0,
                originalText: '$1,320.00',
                newText: '$5,000.00',
                originalBbox: { x: 490, y: 350, width: 60, height: 16 },
                currentBbox: { x: 490, y: 350, width: 60, height: 16 },
                style: {
                  fontFamily: 'Helvetica',
                  fontSize: 12,
                  colorHex: '#4285f4',
                  isBold: true,
                  isItalic: false,
                  letterSpacing: 0,
                  lineHeight: 1.2,
                  textAlign: 'left',
                  autoFit: true,
                },
              },
            ],
            whiteouts: [],
            newTexts: [],
            images: [],
          },
        },
      },
    };

    const res = await request(app).post('/api/export').send(exportPayload);
    expect(res.status).toBe(200);
    expect(res.header['content-type']).toBe('application/pdf');

    const header = res.body.slice(0, 5).toString('utf-8');
    expect(header).toBe('%PDF-');
  });
});
