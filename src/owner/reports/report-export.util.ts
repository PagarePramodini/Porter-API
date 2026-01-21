import PDFDocument from 'pdfkit';
import * as ExcelJS from 'exceljs';
import { PdfColumn } from './report-columns';

export class ReportExportUtil {

  // ================= PDF EXPORT =================
  static toPDF(data: any[], title: string, columns: PdfColumn[],): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ size: 'A4', margin: 40 });

        const buffers: Buffer[] = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', reject);

        // TITLE
        doc.font('Helvetica-Bold').fontSize(18).text(title, { align: 'center' });
        doc.moveDown(2);

        if (!data?.length) {
          doc.fontSize(12).text('No data available.', { align: 'center' });
          doc.end();
          return;
        }

        let y = doc.y;
        const rowHeight = 22;
        const startX = 40;

        // HEADER
        doc.font('Helvetica-Bold').fontSize(10);
        let x = startX;

        columns.forEach(col => {
          doc.rect(x, y, col.width, rowHeight).stroke();
          doc.text(col.label, x + 5, y + 6, {
            width: col.width - 10,
            align: 'center',
          });
          x += col.width;
        });

        y += rowHeight;
        doc.font('Helvetica');

        // ROWS
        data.forEach(row => {
          x = startX;

          columns.forEach(col => {
            const rawValue = row[col.key];

            const value =
              col.format
                ? col.format(rawValue)
                : rawValue === undefined || rawValue === null
                  ? '-'
                  : String(rawValue);

            doc.rect(x, y, col.width, rowHeight).stroke();
            doc.text(value, x + 5, y + 6, {
              width: col.width - 10,
              align: 'center',
            });

            x += col.width;
          });

          y += rowHeight;

          if (y > doc.page.height - 60) {
            doc.addPage();
            y = 50;
          }
        });

        doc.font('Helvetica-Bold').fontSize(10);
        let headerX = startX;

        columns.forEach(col => {
          doc.rect(headerX, y, col.width, rowHeight).stroke();
          doc.text(col.label, headerX + 5, y + 6, {
            width: col.width - 10,
            align: 'center',
          });
          headerX += col.width;
        });

        y += rowHeight;
        doc.font('Helvetica');

        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  }

  // ================= CSV =================
  static toCSV(data: any[]): Buffer {
    if (!data?.length) return Buffer.from('');

    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row =>
      Object.values(row).map(v => `"${v ?? ''}"`).join(',')
    );

    return Buffer.from([headers, ...rows].join('\n'));
  }

  // ================= EXCEL =================
  static async toExcel(data: any[], sheetName: string, columns: PdfColumn[],): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(sheetName);

    // Define columns from REPORT_COLUMNS
    sheet.columns = columns.map(col => ({
      header: col.label,
      key: col.key,
      width: Math.ceil(col.width / 7), // PDF px → Excel width
    }));

    // Add rows with formatting
    data.forEach(row => {
      const formattedRow: any = {};

      columns.forEach(col => {
        const raw = row[col.key];
        formattedRow[col.key] = col.format
          ? col.format(raw)
          : raw ?? '-';
      });

      sheet.addRow(formattedRow);
    });

    return Buffer.from(await workbook.xlsx.writeBuffer());
  }

}
