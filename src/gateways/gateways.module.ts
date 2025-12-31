import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { LiveTrackingGateway } from './live-tracking.gateway';
import { MongooseModule } from '@nestjs/mongoose';
import { Booking, BookingSchema } from 'src/customers/booking/schemas/booking.schema';

@Module({
  imports: [JwtModule.register({}), MongooseModule.forFeature([{ name: Booking.name, schema: BookingSchema },
    ]),],
  providers: [LiveTrackingGateway],
  exports: [LiveTrackingGateway],
})
export class GatewaysModule {}
