import { Injectable, BadRequestException } from '@nestjs/common';
import { ExportType } from '../dto/export-type.dto';
import { ReportExportUtil } from './report-export.util';

@Injectable()
export class ReportExportService {
  async export(
    type: ExportType,
    data: any[],
    title: string,
  ): Promise<Buffer> {

    switch (type) {
      case ExportType.PDF:
        return ReportExportUtil.toPDF(data, title);

      case ExportType.CSV:
        return ReportExportUtil.toCSV(data);

      case ExportType.EXCEL:
        return ReportExportUtil.toExcel(data, title);

      default:
        throw new BadRequestException('Invalid export type');
    }
  }
}
