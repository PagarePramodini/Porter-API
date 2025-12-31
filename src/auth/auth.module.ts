import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Otp, OtpSchema } from './schemas/otp.schema';
import { OtpSenderService } from './otp-sender.service';
import { CustomersModule } from 'src/customers/customers.module';
import { Customer, CustomerSchema } from 'src/customers/schemas/customer.schema';
import { Driver, DriverSchema } from 'src/drivers/schemas/driver.schema';
import { DriversModule } from 'src/drivers/drivers.module';
import { JwtModule } from '@nestjs/jwt';
import { OwnerModule } from 'src/owner/owner.module';
import { Owner, OwnerSchema } from 'src/owner/schemas/owner.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Otp.name, schema: OtpSchema },
  { name: Customer.name, schema: CustomerSchema },
  { name: Driver.name, schema: DriverSchema },{ name: Owner.name, schema: OwnerSchema },]),
  forwardRef(() => CustomersModule), forwardRef(() => DriversModule),forwardRef(() => OwnerModule),
      JwtModule.register({
      secret: 'driver-registration-secret', 
      signOptions: { expiresIn: '7d' },
    }),],
  controllers: [AuthController],
  providers: [AuthService, OtpSenderService],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
