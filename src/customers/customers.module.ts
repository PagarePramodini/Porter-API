import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CustomersService } from './customers.service';
import { CustomersController } from './customers.controller';
import { Customer, CustomerSchema } from './schemas/customer.schema';
import { AuthModule } from 'src/auth/auth.module';
import { BookingModule } from './booking/booking.module';
import { Booking, BookingSchema } from './booking/schemas/booking.schema';
import { TripsController } from './trips/trips.controller';
import { TripsService } from './trips/trips.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Customer.name, schema: CustomerSchema },{ name: Booking.name, schema: BookingSchema },]), 
  forwardRef(() => AuthModule), BookingModule,],
  controllers: [CustomersController,TripsController],
  providers: [CustomersService,TripsService],
  exports: [CustomersService],
})
export class CustomersModule {}
