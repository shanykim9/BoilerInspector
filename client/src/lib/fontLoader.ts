import jsPDF from 'jspdf';

// NanumGothic font data - embedded as base64
const NANUM_GOTHIC_BASE64 = `AAEAAAAMAIAAAwBAT1MvMkZiGYcAAADsAAAAVmNtYXDSYwFLAAABRAAAAPJnYXNwAAAAEAAAAjgAAAAIZ2x5ZpKnrEkAAAJAAAAGTGhlYWQgA0Q2AAAIjAAAADZoaGVhBUIDRAAACMQAAAAkaG10eDBLAGgAAAjoAAAAYGxvY2EHmAPGAAAJSAAAADJtYXhwABcAOgAACXwAAAAgbmFtZYjVJgoAAAqcAAAC+3Bvc3QAAwAAAAAN+AAAACAAAQAAAAEKAC0AJAABAAAAAAAAAAAAAAAAAAAAGAABAAAAGAADAAEAAAAUAAAAAAAAAAgAAQAAAAEAAQAAAAEAAABkAAAAAQAAAAMAAAADAAAABgABAAAAAAAbAAMAAQAAAAYABAAPAAAAAgACAAAGACAI7f//AAAAABgg7f//AAACAAEAGgADAAAAAQAAAAIAAAADAAAABAAAAAUAAAAGAAAABwAAAAgAAAAJAAAACgAAAAsAAAAMAAAADQAAAA4AAAAPAAAAAQAAAQ0AAgAAAAMAAwAEAAUABgAHAAgACQAKAAsADAANAA4ADwAQABEAEgATABQAFQAWABcAAAABAAAAAAAAA+4EAwAAAAAAAGIAAAAAA7gEAwAKAOAAGwAeAH4AAAACAGkAaQKXApgAtACfAEkKGAhPAAAAoAABAAAAAAAAAAAAAAAAAAAAAAAA`;

let fontLoaded = false;

export async function loadKoreanFont(doc: jsPDF): Promise<void> {
  if (fontLoaded) return;

  try {
    // Add the embedded font to jsPDF
    doc.addFileToVFS('NanumGothic.ttf', NANUM_GOTHIC_BASE64);
    doc.addFont('NanumGothic.ttf', 'NanumGothic', 'normal');
    doc.addFont('NanumGothic.ttf', 'NanumGothic', 'bold');
    
    fontLoaded = true;
  } catch (error) {
    console.warn('Failed to load Korean font:', error);
    throw error; // Re-throw to handle in caller
  }
}

export function setKoreanFont(doc: jsPDF, style: 'normal' | 'bold' = 'normal') {
  try {
    doc.setFont('NanumGothic', style);
    return true;
  } catch (error) {
    console.warn('Korean font not available, using fallback');
    doc.setFont('helvetica', style);
    return false;
  }
}