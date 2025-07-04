declare module 'pdfjs-dist/legacy/build/pdf.worker.js' {
  const workerSrc: string;
  export default workerSrc;
}

declare module 'pdfjs-dist/legacy/build/pdf.js' {
  import * as pdfjs from 'pdfjs-dist';
  export = pdfjs;

  export const GlobalWorkerOptions: {
    workerSrc: string;
  };

  export function getDocument(
    src: unknown
  ): {
    promise: Promise<unknown>;
  };
}
