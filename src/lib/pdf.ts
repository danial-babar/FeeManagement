import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

interface ReceiptData {
  receiptNumber: string;
  date: Date;
  studentName: string;
  rollNumber: string;
  className: string;
  amount: number;
  paymentMethod: string;
  transactionId?: string;
  institutionName: string;
  institutionAddress: string;
}

export const generateReceiptPDF = async (data: ReceiptData): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const fileName = `receipt-${data.receiptNumber}-${Date.now()}.pdf`;
      const filePath = path.join(process.cwd(), 'public', 'receipts', fileName);

      // Ensure the receipts directory exists
      const dirPath = path.join(process.cwd(), 'public', 'receipts');
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }

      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // Header
      doc.fontSize(20).text(data.institutionName, { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(data.institutionAddress, { align: 'center' });
      doc.moveDown(2);

      // Title
      doc.fontSize(16).text('FEE PAYMENT RECEIPT', { align: 'center' });
      doc.moveDown();

      // Receipt Details
      doc.fontSize(12);
      doc.text(`Receipt Number: ${data.receiptNumber}`);
      doc.text(`Date: ${data.date.toLocaleDateString()}`);
      doc.moveDown();

      // Student Details
      doc.text(`Student Name: ${data.studentName}`);
      doc.text(`Roll Number: ${data.rollNumber}`);
      doc.text(`Class: ${data.className}`);
      doc.moveDown();

      // Payment Details
      doc.text(`Amount: ${data.amount.toLocaleString()} PKR`);
      doc.text(`Payment Method: ${data.paymentMethod}`);
      if (data.transactionId) {
        doc.text(`Transaction ID: ${data.transactionId}`);
      }
      doc.moveDown(2);

      // Footer
      doc.fontSize(10).text('This is a computer-generated receipt. No signature required.', { align: 'center' });
      doc.moveDown();
      doc.text('Thank you for your payment!', { align: 'center' });

      doc.end();

      stream.on('finish', () => {
        resolve(`/receipts/${fileName}`);
      });

      stream.on('error', (err) => {
        reject(err);
      });
    } catch (error) {
      reject(error);
    }
  });
}; 