import { initTRPC, TRPCError } from '@trpc/server';
import { z } from 'zod';
import { PdfEngine } from '@inq/pdf-engine';
import { SAMPLE_BILLS_META, getSamplePdfBytes } from '../samples/sampleBills';

const t = initTRPC.create();
export const router = t.router;
export const publicProcedure = t.procedure;

const pdfEngine = new PdfEngine();

export const appRouter = router({
  // Health & Diagnostics
  health: publicProcedure.query(() => ({
    status: 'ok',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  })),

  // Sample Bills Procedures
  samples: router({
    list: publicProcedure.query(() => {
      return SAMPLE_BILLS_META;
    }),

    get: publicProcedure
      .input(z.object({ sampleId: z.string() }))
      .query(async ({ input }) => {
        const bytes = await getSamplePdfBytes(input.sampleId);
        if (!bytes) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: `Sample bill '${input.sampleId}' not found`,
          });
        }
        const base64 = Buffer.from(bytes).toString('base64');
        const meta = SAMPLE_BILLS_META.find((s) => s.id === input.sampleId);
        return {
          id: input.sampleId,
          meta,
          base64,
          dataUrl: `data:application/pdf;base64,${base64}`,
          byteLength: bytes.length,
        };
      }),
  }),

  // PDF Export Procedure
  export: router({
    generate: publicProcedure
      .input(
        z.object({
          documentTitle: z.string().default('edited-bill'),
          sampleId: z.string().optional(),
          pdfBase64: z.string().optional(),
          delta: z.any(), // ModificationDelta
        })
      )
      .mutation(async ({ input }) => {
        let baseBytes: Uint8Array | null = null;

        if (input.sampleId) {
          baseBytes = await getSamplePdfBytes(input.sampleId);
        } else if (input.pdfBase64) {
          const rawBase64 = input.pdfBase64.includes(',')
            ? input.pdfBase64.split(',')[1]
            : input.pdfBase64;
          baseBytes = Uint8Array.from(Buffer.from(rawBase64, 'base64'));
        }

        if (!baseBytes) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'No PDF source provided. Specify either sampleId or pdfBase64.',
          });
        }

        try {
          const modifiedBytes = await pdfEngine.modifyPdf(baseBytes, input.delta);
          const modifiedBase64 = Buffer.from(modifiedBytes).toString('base64');
          const cleanTitle = (input.documentTitle || 'edited-document')
            .toLowerCase()
            .replace(/[^a-z0-9-_]/g, '-');

          return {
            success: true,
            downloadFilename: `${cleanTitle}.pdf`,
            pdfBase64: modifiedBase64,
            dataUrl: `data:application/pdf;base64,${modifiedBase64}`,
            byteLength: modifiedBytes.length,
          };
        } catch (err: any) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Failed to compile vector PDF: ${err.message || String(err)}`,
          });
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
