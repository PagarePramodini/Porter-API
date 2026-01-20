import PDFDocument from 'pdfkit';
import * as ExcelJS from 'exceljs';

export class ReportExportUtil {

  // ================= PDF EXPORT =================
  static toPDF(data: any[], title: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margin: 40,
        });

        const buffers: Buffer[] = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', reject);

        // ===== TITLE =====
        doc
          .font('Helvetica-Bold')
          .fontSize(18)
          .text(title, { align: 'center' });

        doc.moveDown(2);

        // ===== NO DATA =====
        if (!data || data.length === 0) {
          doc
            .font('Helvetica')
            .fontSize(12)
            .text('No data available.', { align: 'center' });
          doc.end();
          return;
        }

        // ===== DEFINE COLUMNS (IMPORTANT FIX) =====
        const columns = [
          { key: 'driverName', label: 'Driver Name', width: 130 },
          { key: 'status', label: 'Active', width: 60 },
          { key: 'totalTrips', label: 'Trips', width: 60 },
          { key: 'cancelledTrips', label: 'Cancelled', width: 80 },
          { key: 'acceptanceRate', label: 'Acceptance %', width: 90 },
        ];

        let y = doc.y;
        const rowHeight = 22;
        const startX = 40;

        // ===== HEADER =====
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

        // ===== ROWS =====
        data.forEach(row => {
          x = startX;

          columns.forEach(col => {
            const value =
              row[col.key] === undefined || row[col.key] === null
                ? '-'
                : String(row[col.key]);

            doc.rect(x, y, col.width, rowHeight).stroke();
            doc.text(value, x + 5, y + 6, {
              width: col.width - 10,
              align: 'center',
            });

            x += col.width;
          });

          y += rowHeight;

          // ===== PAGE BREAK =====
          if (y > doc.page.height - 60) {
            doc.addPage();
            y = 50;
          }
        });

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
  static async toExcel(data: any[], sheetName: string): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(sheetName);

    if (data?.length) {
      sheet.columns = Object.keys(data[0]).map(key => ({
        header: key.toUpperCase(),
        key,
        width: 25,
      }));
      data.forEach(row => sheet.addRow(row));
    }

    return Buffer.from(await workbook.xlsx.writeBuffer());
  }
}
