// src/types/pdf.d.ts
declare module 'pdfjs-dist' {
  interface TextItem {
    str: string;
    dir: string;
    transform: number[];
    width: number;
    height: number;
    fontName: string;
  }
}