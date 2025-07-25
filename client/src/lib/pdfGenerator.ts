import jsPDF from 'jspdf';

// High-quality Korean text image generation
const createHighQualityKoreanImage = (text: string, fontSize: number = 10, fontWeight: string = 'normal'): string => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx || !text.trim()) return '';
  
  // Ultra-high DPI for crisp text
  const ratio = 4; // 4x resolution for maximum clarity
  const actualFontSize = fontSize * ratio;
  
  // Professional Korean font stack
  const fontFamily = "'Noto Sans KR', 'Apple SD Gothic Neo', 'Malgun Gothic', '맑은 고딕', 'Nanum Gothic', sans-serif";
  ctx.font = `${fontWeight} ${actualFontSize}px ${fontFamily}`;
  ctx.fillStyle = '#000000';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  
  // Measure text with proper spacing
  const metrics = ctx.measureText(text);
  const width = Math.ceil(metrics.width) + (8 * ratio);
  const height = (fontSize + 2) * ratio;
  
  // Set canvas size for ultra-high DPI
  canvas.width = width;
  canvas.height = height;
  canvas.style.width = `${width / ratio}px`;
  canvas.style.height = `${height / ratio}px`;
  
  // Scale context for ultra-high DPI
  ctx.scale(ratio, ratio);
  
  // Redraw with perfect settings
  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
  ctx.fillStyle = '#000000';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  
  // Maximum quality text rendering
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  
  // Perfect centering
  ctx.fillText(text, 4, height / (2 * ratio));
  
  return canvas.toDataURL('image/png', 1.0);
};

// Professional table drawing with high-quality Korean text
const drawTable = (doc: jsPDF, data: Array<Array<string>>, startX: number, startY: number, columnWidths: number[]) => {
  let currentY = startY;
  const rowHeight = 8;
  const cellPadding = 2;
  
  data.forEach((row, rowIndex) => {
    let currentX = startX;
    
    // Draw row background for headers
    if (rowIndex === 0) {
      doc.setFillColor(248, 249, 250);
      doc.rect(startX, currentY, columnWidths.reduce((a, b) => a + b, 0), rowHeight, 'F');
    }
    
    row.forEach((cell, colIndex) => {
      // Draw cell border
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.1);
      doc.rect(currentX, currentY, columnWidths[colIndex], rowHeight);
      
      // Add text content
      const hasKorean = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(cell);
      
      if (hasKorean && cell.trim()) {
        // Use high-quality image for Korean text
        const imgData = createHighQualityKoreanImage(
          cell, 
          rowIndex === 0 ? 6 : 5.5, 
          rowIndex === 0 ? 'bold' : 'normal'
        );
        if (imgData) {
          // Better width calculation for Korean text
          const baseWidth = rowIndex === 0 ? 2.5 : 2.2;
          const maxWidth = columnWidths[colIndex] - 4;
          const imgWidth = Math.min(cell.length * baseWidth, maxWidth);
          const imgHeight = rowIndex === 0 ? 4 : 3.5;
          doc.addImage(imgData, 'PNG', currentX + cellPadding, currentY + 2.2, imgWidth, imgHeight);
        }
      } else {
        // Use regular text for English/numbers
        doc.setFont('helvetica', rowIndex === 0 ? 'bold' : 'normal');
        doc.setFontSize(rowIndex === 0 ? 7 : 6.5);
        doc.setTextColor(0, 0, 0);
        doc.text(cell, currentX + cellPadding, currentY + rowHeight/2 + 1);
      }
      
      currentX += columnWidths[colIndex];
    });
    
    currentY += rowHeight;
  });
  
  return currentY;
};

export interface InspectionData {
  documentNumber?: string;
  visitCount?: string;
  inspectionDate?: string;
  inspector?: string;
  result?: string;
  facilityManager?: string;
  summary?: string;
  contractorName?: string;
  businessType?: string;
  address?: string;
  products?: Array<{name: string, count: number}>;
  fuel?: string;
  exhaustType?: string;
  electrical?: string;
  piping?: string;
  waterSupply?: string;
  control?: string;
  purpose?: string;
  deliveryType?: string;
  installationDate?: string;
  photos?: string[];
}

export function generateInspectionPDF(data: InspectionData): string {
  const doc = new jsPDF();

  // Professional centered Korean title with high-quality image
  const titleImg = createHighQualityKoreanImage('보일러 점검 보고서', 16, 'bold');
  if (titleImg) {
    const titleWidth = 80;
    const centerX = (210 - titleWidth) / 2;
    doc.addImage(titleImg, 'PNG', centerX, 20, titleWidth, 10);
  }

  // Date
  const currentDate = new Date().toLocaleDateString('ko-KR');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Date: ${currentDate}`, 20, 40);

  let yPosition = 55;

  // INSPECTION INFO Section
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('INSPECTION INFO', 20, yPosition);
  yPosition += 8;

  // Inspection Info Table using manual table drawing
  const inspectionTableData = [
    ['Doc No:', data.documentNumber || '', 'Visit:', data.visitCount || ''],
    ['Date:', data.inspectionDate || '', 'Inspector:', data.inspector || ''],
    ['Result:', data.result || '', 'Manager:', data.facilityManager || '']
  ];
  
  yPosition = drawTable(doc, inspectionTableData, 20, yPosition, [25, 45, 25, 75]);
  yPosition += 10;

  // Summary
  if (data.summary) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Summary:', 20, yPosition);
    yPosition += 7;
    
    const summaryImg = createHighQualityKoreanImage(data.summary, 5.5);
    if (summaryImg) {
      const summaryWidth = Math.min(data.summary.length * 2.2, 150);
      doc.addImage(summaryImg, 'PNG', 20, yPosition, summaryWidth, 3.5);
    }
    yPosition += 15;
  }

  // INSTALLATION INFO Section
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('INSTALLATION INFO', 20, yPosition);
  yPosition += 8;

  // Format products for display
  const productsDisplay = data.products && data.products.length > 0
    ? data.products.map(p => `${p.name}: ${p.count}대`).join(', ')
    : '미입력';
  
  const totalUnits = data.products?.reduce((total, product) => total + product.count, 0) || 0;

  // Installation Info Table using manual table drawing
  const installationTableData = [
    ['Contractor:', data.contractorName || '', 'Business:', data.businessType || 'N/A'],
    ['Address:', data.address || '', '', ''],
    ['Total Units:', totalUnits.toString(), 'Products:', productsDisplay],
    ['사용 연료:', data.fuel || '미입력', '연도 선택:', data.exhaustType || '미입력'],
    ['정격 전압:', data.electrical || '미입력', '배관 선택:', data.piping || '미입력'],
    ['수질 선택:', data.waterSupply || '미입력', '제어 방식:', data.control || '미입력'],
    ['설치 용도:', data.purpose || '미입력', '남품 형태:', data.deliveryType || '미입력'],
    ['Install Date:', data.installationDate || '미입력', '', '']
  ];
  
  yPosition = drawTable(doc, installationTableData, 20, yPosition, [25, 55, 25, 65]);
  yPosition += 10;

  // Photos section
  if (data.photos && data.photos.length > 0) {
    // Check if we need a new page
    if (yPosition > 220) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('SITE PHOTOS', 20, yPosition);
    yPosition += 10;
    
    let photoCount = 0;
    const photosPerRow = 2;
    const photoWidth = 80;
    const photoHeight = 60;
    const photoSpacing = 10;
    
    for (const photo of data.photos) {
      const row = Math.floor(photoCount / photosPerRow);
      const col = photoCount % photosPerRow;
      
      const x = 20 + col * (photoWidth + photoSpacing);
      const y = yPosition + row * (photoHeight + photoSpacing + 15);
      
      // Check if we need a new page
      if (y + photoHeight > 270) {
        doc.addPage();
        yPosition = 20;
        photoCount = 0;
        continue;
      }
      
      try {
        doc.addImage(photo, 'JPEG', x, y, photoWidth, photoHeight);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.text(`Photo ${photoCount + 1}`, x, y + photoHeight + 5);
      } catch (error) {
        console.warn('Failed to add photo to PDF:', error);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.text(`[Photo ${photoCount + 1} - Error loading]`, x, y + photoHeight/2);
      }
      
      photoCount++;
    }
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128);
    doc.text(
      `Page ${i} / ${pageCount}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }

  // Return PDF as data URL string
  return doc.output('datauristring');
}

export function downloadPDF(data: InspectionData, filename?: string): void {
  // Generate the PDF using the same function
  const pdfDataUri = generateInspectionPDF(data);
  
  // Create download link
  const link = document.createElement('a');
  link.href = pdfDataUri;
  link.download = filename || `inspection-${Date.now()}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
