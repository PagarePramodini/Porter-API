import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MasterController } from './master.controller';
import { MasterService } from './master.service';
import { City, CitySchema } from './schemas/city.schema';
import { Vehicle, VehicleSchema } from './schemas/vehicle.schema';
import { Pricing, PricingSchema } from 'src/customers/booking/schemas/pricing.schema';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: City.name, schema: CitySchema },
      { name: Vehicle.name, schema: VehicleSchema },
      { name: Pricing.name, schema: PricingSchema },
    ]),AuthModule,
  ],
  controllers: [MasterController],
  providers: [MasterService],
  exports: [MasterService],
})
export class MasterModule {}
