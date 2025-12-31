import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { BookingStatus } from "src/customers/booking/dto/booking-status.dto";
import { Booking, BookingDocument } from "src/customers/booking/schemas/booking.schema";
import { Driver, DriverDocument } from "./schemas/driver.schema";

@Injectable()
export class DriverDispatchService {
    constructor(
        @InjectModel(Driver.name) private driverModel: Model<DriverDocument>,
        @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
    ) { }

    async dispatchBooking(bookingId: string) {
        const booking = await this.bookingModel.findById(bookingId);

        if (!booking) {
            throw new BadRequestException('Booking not found for dispatch');
        }

        const drivers = await this.driverModel.find({
            vehicleType: booking.vehicleType,
            isOnline: true,
            isAvailable: true,
            isOnTrip: false,
            _id: { $nin: booking.rejectedDrivers },
        });

        if (!drivers.length) {
            booking.status = BookingStatus.DRIVER_NOT_FOUND;
            await booking.save();
            return;
        }
    }
}
