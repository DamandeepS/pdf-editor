export { appRouter, type AppRouter } from './trpc/router';
export { app } from './server';
export {
  SAMPLE_BILLS_META,
  getSamplePdfBytes,
  generateSaasInvoicePdf,
  generateUtilityBillPdf,
  generateRetailReceiptPdf,
} from './samples/sampleBills';
