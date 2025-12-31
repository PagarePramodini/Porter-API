export class TripHistoryResponseDto {
  tripId: string;
  driverName: string | null;
  pickupAddress: string;
  dropAddress: string;
  durationMin: number;
  distanceKm: number;
  fare: number;
  status: string;
}
