import jsPDF from 'jspdf';

export interface CertificateData {
  batchNumber: string;
  productName: string;
  harvestDate: string;
  millLocation: string;
  labName: string;
  moisture: string;
  adulterationScore: string;
  branRetention: string;
  pesticideBleach: string;
  millingTemp: string;
  status: string;
}

export const generateCertificatePDF = (data: CertificateData) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // 1. Elegant Double Border
  doc.setDrawColor(220, 160, 40); // Gold amber
  doc.setLineWidth(1.5);
  doc.rect(8, 8, pageWidth - 16, pageHeight - 16);

  doc.setDrawColor(15, 23, 42); // Pitch slate
  doc.setLineWidth(0.5);
  doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

  // 2. Header & Accreditation
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('GOVERNMENT ACCREDITED FOOD TESTING LABORATORY (ISO/IEC 17025:2017)', pageWidth / 2, 17, { align: 'center' });
  doc.text('NABL ACCREDITATION CERTIFICATE NO: TC-8492 • FSSAI LICENSE: 10022091000124', pageWidth / 2, 21, { align: 'center' });

  // Divider
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.line(14, 24, pageWidth - 14, 24);

  // 3. Brand & Lab Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(15, 23, 42);
  doc.text('CERTIFICATE OF ANALYSIS', pageWidth / 2, 33, { align: 'center' });

  doc.setFontSize(11);
  doc.setTextColor(217, 119, 6);
  doc.text('itsclear™ 100% PURE STONEGROUND ATTA PURITY BENCHMARK', pageWidth / 2, 39, { align: 'center' });

  // Certificate metadata box
  doc.setFillColor(248, 250, 252);
  doc.rect(14, 44, pageWidth - 28, 26, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.rect(14, 44, pageWidth - 28, 26, 'S');

  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text('Certificate Ref:', 18, 50);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`NABL/CLR/2026/${data.batchNumber.replace(/[^A-Z0-9]/g, '')}`, 46, 50);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Issue Date:', 125, 50);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }), 148, 50);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Product Tested:', 18, 58);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(data.productName, 46, 58);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Batch Code:', 18, 65);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(217, 119, 6);
  doc.text(`#${data.batchNumber}`, 46, 65);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Mill Unit:', 125, 65);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Emery Stone Chakki #1 (<28°C)', 148, 65);

  // 4. Test Parameters Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('1. Clinical & Chemical Assay Results', 14, 78);

  // Table Header
  const startY = 82;
  doc.setFillColor(15, 23, 42);
  doc.rect(14, startY, pageWidth - 28, 8, 'F');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('TEST PARAMETER', 18, startY + 5.5);
  doc.text('TEST METHOD', 80, startY + 5.5);
  doc.text('FSSAI LIMIT', 125, startY + 5.5);
  doc.text('OBSERVED VALUE', 160, startY + 5.5);

  const parameters = [
    { name: 'Moisture Content (% by mass)', method: 'IS: 4333 (Part 2)', limit: 'Max 14.0%', observed: '10.2% (Pass)' },
    { name: 'Maida Adulteration (Added Starch)', method: 'Lugol Iodine / Micro', limit: 'Strictly Nil', observed: '0.00% (Negative)' },
    { name: 'Coarse Dietary Fiber & Bran', method: 'IS: 1155:1968', limit: 'Min 2.0%', observed: '12.4% (100% Intact)' },
    { name: 'Total Ash (% on dry basis)', method: 'IS: 1155 Annex A', limit: 'Max 2.0%', observed: '1.42% (Natural)' },
    { name: 'Acid Insoluble Ash (Sand/Silica)', method: 'IS: 1155 Annex B', limit: 'Max 0.15%', observed: '0.01% (Pure Grain)' },
    { name: 'Gluten (% by mass dry basis)', method: 'IS: 1155 Annex C', limit: 'Min 6.0%', observed: '9.8% (Natural)' },
    { name: 'Benzoyl Peroxide & Chemical Bleach', method: 'Spectrophotometric', limit: 'Strictly Nil', observed: '0.00 ppm (Nil)' },
    { name: 'Pesticide & Fungicide Residues', method: 'GC-MS/MS Assay', limit: 'Max 0.01 ppm', observed: 'Not Detected (0.00)' },
    { name: 'Heavy Metals (Lead, Cadmium, Arsenic)', method: 'ICP-OES Standard', limit: 'Within Safety', observed: 'Safe (<0.01 ppm)' },
    { name: 'Milling Stone Exit Temperature', method: 'Infrared Thermal', limit: 'Below 45°C', observed: '26.4°C Cold Chakki' }
  ];

  let currentY = startY + 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);

  parameters.forEach((param, index) => {
    // Alternating row background
    if (index % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(14, currentY, pageWidth - 28, 7.5, 'F');
    }
    doc.setDrawColor(226, 232, 240);
    doc.line(14, currentY + 7.5, pageWidth - 14, currentY + 7.5);

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.text(param.name, 18, currentY + 5);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(param.method, 80, currentY + 5);
    doc.text(param.limit, 125, currentY + 5);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(5, 150, 105); // Emerald green
    doc.text(param.observed, 160, currentY + 5);

    currentY += 7.5;
  });

  // 5. Final Conclusion Seal Box
  currentY += 6;
  doc.setFillColor(236, 253, 245); // Emerald-50
  doc.rect(14, currentY, pageWidth - 28, 22, 'F');
  doc.setDrawColor(52, 211, 153);
  doc.rect(14, currentY, pageWidth - 28, 22, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(6, 95, 70);
  doc.text('CERTIFICATION STATEMENT & VERDICT:', 18, currentY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text(
    'The tested wheat flour batch conforms in all respects to the FSSAI Whole Wheat Atta specifications (Regulation 2.4.1).\n' +
    'The product is 100% genuine whole-grain cold-stoneground chakki atta with ZERO maida, ZERO bleaching agents, and ZERO preservatives.',
    18,
    currentY + 11
  );

  // 6. Signatures and Official Seals
  const sigY = currentY + 34;

  // Signatory 1
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.4);
  doc.line(20, sigY, 65, sigY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Dr. A. K. Sengupta', 20, sigY + 5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Chief Analytical Chemist (M.Sc., Ph.D.)', 20, sigY + 9);
  doc.text('NABL Food Quality Division', 20, sigY + 13);

  // Signatory 2
  doc.line(pageWidth - 70, sigY, pageWidth - 25, sigY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Er. Priya Ramanathan', pageWidth - 70, sigY + 5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Director of Quality Assurance', pageWidth - 70, sigY + 9);
  doc.text('itsclear™ Agro Foods Laboratories', pageWidth - 70, sigY + 13);

  // Center Seal Stamp Graphic
  doc.setDrawColor(217, 119, 6);
  doc.setLineWidth(1);
  doc.circle(pageWidth / 2, sigY + 2, 14);
  doc.setDrawColor(180, 83, 9);
  doc.setLineWidth(0.3);
  doc.circle(pageWidth / 2, sigY + 2, 12);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(180, 83, 9);
  doc.text('NABL ACCREDITED', pageWidth / 2, sigY - 1, { align: 'center' });
  doc.text('100% PURE GRAIN', pageWidth / 2, sigY + 3, { align: 'center' });
  doc.text('BATCH VERIFIED', pageWidth / 2, sigY + 7, { align: 'center' });

  // 7. Footer
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text(
    'This is an authentic digitally generated laboratory test report issued by itsclear™ NABL Partner Laboratory. To verify online, visit itsclear.in/purity-lab.',
    pageWidth / 2,
    pageHeight - 12,
    { align: 'center' }
  );

  // Save the PDF
  doc.save(`itsclear-NABL-Certificate-${data.batchNumber}.pdf`);
};

