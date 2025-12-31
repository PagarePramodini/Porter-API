import { Injectable, BadRequestException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Booking } from "../booking/schemas/booking.schema";
import { BookingStatus } from "../booking/dto/booking-status.dto";

@Injectable()
export class TripsService {
  constructor(
    @InjectModel(Booking.name)
    private bookingModel: Model<Booking>,
  ) {}

  async getTripHistory(customerId: string) {
    const bookings = await this.bookingModel.find({
      customerId,
        status: {
            $in: [
                BookingStatus.CONFIRMED,
                BookingStatus.DRIVER_ASSIGNED,
                BookingStatus.COMPLETED,
                BookingStatus.CANCELLED,
            ],
        },
    }).sort({ createdAt: -1 });

    return bookings.map(b => ({
      tripId: b._id,
      driverName: b.driverName || null,
      pickupAddress: b.pickupAddress,
      dropAddress: b.dropAddress,
      durationMin: b.durationMin,
      distanceKm: b.distanceKm,
      fare: b.payableAmount,
      status: b.status,
      tripLabel: this.getTripLabel(b.status),
    }));
    
  }

  async getTripDetails(customerId: string, tripId: string) {
    const booking = await this.bookingModel.findOne({
      _id: tripId,
      customerId,
    });

    if (!booking) {
      throw new BadRequestException('Trip not found');
    }

    return booking;
  }

  private getTripLabel(status: BookingStatus): string {
  switch (status) {
    case BookingStatus.DRIVER_ASSIGNED:
    case BookingStatus.CONFIRMED:
      return 'On Going';

    case BookingStatus.COMPLETED:
      return 'Completed';

    case BookingStatus.CANCELLED:
      return 'Cancelled';

    default:
      return 'Pending';
  }
}

}
