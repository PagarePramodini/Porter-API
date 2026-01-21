import { ReportType } from '../dto/report-type.dto';

export interface PdfColumn {
  key: string;
  label: string;
  width: number;
  format?: (value: any) => string;
}

export const REPORT_COLUMNS: Record<ReportType, PdfColumn[]> = {
  [ReportType.DRIVER_PERFORMANCE]: [
    { key: 'driverName', label: 'Driver Name', width: 130 },
    { key: 'Status', label: 'Active', width: 100 },
    { key: 'totalTrips', label: 'Trips', width: 60 },
    { key: 'cancelledTrips', label: 'Cancelled', width: 80 },
    { key: 'acceptanceRate', label: 'Acceptance %', width: 90 },
  ],

  [ReportType.TRIPS]: [
      {
        key: 'tripDate', label: 'Trip Date', width: 100, format: (value: any) =>
            value ? new Date(value).toLocaleDateString('en-IN') : '-',
      },
    { key: 'driverName', label: 'Driver', width: 120 },
    { key: 'city', label: 'City', width: 100 },
    { key: 'status', label: 'Status', width: 120 },
    { key: 'finalFare', label: 'Fare', width: 70 },
  ],

  [ReportType.EARNINGS]: [
    { key: 'driverName', label: 'Driver', width: 120 },
    { key: 'totalTrips', label: 'Trips', width: 60 },
    { key: 'totalFare', label: 'Total Fare', width: 90 },
    { key: 'platformCommission', label: 'Platform Commission', width: 120 },
    { key: 'driverEarning', label: 'Driver Earning', width: 90 },
  ],

  [ReportType.CANCELLATIONS]: [
    { key: 'driverName', label: 'Driver', width: 150 },
    { key: 'count', label: 'Cancelled Trips', width: 120 },
  ],

  [ReportType.PAYMENTS]: [
      {
          key: 'tripDate', label: 'Trip Date', width: 80, format: (value: any) =>
              value ? new Date(value).toLocaleDateString('en-IN') : '-',
      },
    { key: 'customerName', label: 'Customer', width: 90 },
    { key: 'driverName', label: 'Driver', width: 90 },
    { key: 'finalFare', label: 'Amount', width: 60 },
    { key: 'paymentMethod', label: 'Method', width: 60 },
    { key: 'paymentStatus', label: 'Status', width: 60 },
    { key: 'transactionId', label: 'Txn ID', width: 75 },
  ],
};
