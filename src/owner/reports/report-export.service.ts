import { Injectable, BadRequestException } from '@nestjs/common';
import { ExportType } from '../dto/export-type.dto';
import { ReportExportUtil } from './report-export.util';
import { REPORT_COLUMNS } from './report-columns';
import { ReportType } from '../dto/report-type.dto';

@Injectable()
export class ReportExportService {
  async export(
    report: ReportType,
    type: ExportType,
    data: any[],
    title: string,
  ): Promise<Buffer> {

    switch (type) {
      case ExportType.PDF:
        return ReportExportUtil.toPDF(data, title, REPORT_COLUMNS[report],);

      case ExportType.CSV:
        return ReportExportUtil.toCSV(data);

      case ExportType.EXCEL:
        return ReportExportUtil.toExcel(data, title, REPORT_COLUMNS[report],);

      default:
        throw new BadRequestException('Invalid export type');
    }
  }
}
