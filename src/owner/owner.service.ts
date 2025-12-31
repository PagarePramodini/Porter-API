import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { CreateOwnerDto } from './dto/create-owner.dto';
import { Owner, OwnerDocument } from './schemas/owner.schema';
import { Booking, BookingDocument } from 'src/customers/booking/schemas/booking.schema';
import { Wallet, WalletDocument } from 'src/drivers/schemas/driver-wallet.schema';
import { Driver, DriverDocument } from 'src/drivers/schemas/driver.schema';
import { Withdraw, WithdrawDocument } from 'src/drivers/schemas/withdraw.schema';
import { WithdrawalStatus } from 'src/drivers/schemas/driver.schema';

@Injectable()
export class OwnerService {
  constructor(
    @InjectModel(Owner.name) private ownerModel: Model<OwnerDocument>,
    @InjectModel(Driver.name) private driverModel: Model<DriverDocument>,
    @InjectModel(Wallet.name) private walletModel: Model<WalletDocument>,
    @InjectModel(Withdraw.name) private withdrawModel: Model<WithdrawDocument>,
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,) { }

  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }
 
  // 1. Owner Registration
  async create(createOwnerDto: CreateOwnerDto): Promise<Partial<Owner>> {
    const { email, password, ...rest } = createOwnerDto;
    // explicit email uniqueness check before creation
    const exists = await this.ownerModel.findOne({ email }).lean();
    if (exists) {
      throw new ConflictException('Email is already registered');
    }

    const hashed = await this.hashPassword(password);
    const created = new this.ownerModel({ ...rest, email, password: hashed });

    try {
      const saved = await created.save();
      // remove password before returning
      const { password: _, ...safe } = saved.toObject();
      return safe;
    } catch (err: any) {
      // handle Mongo duplicate key (race conditions)
      if (err?.code === 11000) {
        throw new ConflictException('Email already exists');
      }
      // fallback
      console.error('create owner error', err);
      throw new InternalServerErrorException('Failed to create owner');
    }
  }

  async findByMobile(mobile: string): Promise<Partial<Owner>> {
    const owner = await this.ownerModel.findOne({ mobile }).lean();

    if (!owner) {
      throw new NotFoundException('Owner not found');
    }

    const { password, ...safe } = owner;
    return safe;
  }

  // optional: get by email (for login)
  findByEmail(email: string) {
    return this.ownerModel.findOne({ email }).lean();
  }

  // 2. Get All Drivers (with wallet + withdrawal info)
  async getAllDrivers() {
    return this.driverModel.find().select(
      'name mobile walletBalance withdrawal isAvailable',
    );
  }

  //3. Driver FULL DETAILS
  async getDriverDetails(driverId: string) {
    const driver = await this.driverModel.findById(driverId);
    if (!driver) throw new BadRequestException('Driver not found');

    const trips = await this.bookingModel.find({ driverId });

    const totalEarnings = trips
      .filter(t => t.status === 'COMPLETED')
      .reduce((sum, t) => sum + t.payableAmount, 0);

    return {
      driver,
      totalTrips: trips.length,
      completedTrips: trips.filter(t => t.status === 'COMPLETED').length,
      totalEarnings,
      trips,
    };
  }

  // 4. Trips
   async getAllTrips() {
    const bookings = await this.bookingModel
      .find({ driverId: { $ne: null } })
      .populate('driverId', 'name mobile')
      .populate('customerId', 'name mobile')
      .sort({ createdAt: -1 });

    return bookings.map(b => ({
      bookingId: b._id,
      driver: b.driverId,
      customer: b.customerId,
      pickup: b.pickupLocation,
      drop: b.dropLocation,
      distanceKm: b.distanceKm,
      durationMin: b.durationMin,
      fare: b.payableAmount,
      paymentMethod: b.paymentMethod,
      status: b.status,
    }));
  }

  // 5. Approve withdrawals
  async approveWithdrawal(driverId: string) {
    const driver = await this.driverModel.findById(driverId);

    if (!driver || driver.withdrawal.status !== 'REQUESTED') {
      throw new BadRequestException('No withdrawal request');
    }

    driver.walletBalance -= driver.withdrawal.amount;
    driver.withdrawal.status =  WithdrawalStatus.APPROVED;
    driver.withdrawal.processedAt = new Date();

    await driver.save();

    return { message: 'Withdrawal approved successfully' };
  }

  // 6. Reject withdrawal
  async rejectWithdrawal(driverId: string) {
    const driver = await this.driverModel.findById(driverId);

    if (!driver || driver.withdrawal.status !== 'REQUESTED') {
      throw new BadRequestException('No withdrawal request');
    }

    driver.withdrawal.status =  WithdrawalStatus.REJECTED;
    driver.withdrawal.processedAt = new Date();

    await driver.save();

    return { message: 'Withdrawal rejected' };
  }
}
