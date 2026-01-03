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

  // ================= DRIVER LIST (FIXED) =================
  async getAllDrivers() {
    const drivers = await this.driverModel
      .find()
      .lean();

    return {
      status: true,
      data: drivers.map(driver => ({
        id: driver._id,
        name: `${driver.firstName || ''} ${driver.lastName || ''}`.trim(),
        mobile: driver.mobile,
        status: driver.status,
        isAvailable: driver.isAvailable,
        isOnline: driver.isOnline,
      })),
    };
  }

  //3. Driver FULL DETAILS
   async getDriverDetails(driverId: string) {
    const driver = await this.driverModel.findById(driverId).lean();
    if (!driver) throw new NotFoundException('Driver not found');

    const trips = await this.bookingModel.find({ driverId });

    return {
      driver,
      totalTrips: trips.length,
      completedTrips: trips.filter(t => t.status === 'COMPLETED').length,
      trips,
    };
  }

  // 4. Trips
    async getAllTrips() {
    const bookings = await this.bookingModel
      .find({ driverId: { $ne: null } })
      .populate('driverId', 'firstName lastName mobile')
      .populate('customerId', 'firstName lastName mobile')
      .sort({ createdAt: -1 });

    return bookings.map(b => ({
      bookingId: b._id,
      driver: b.driverId,
      customer: b.customerId,
      pickup: b.pickupLocation,
      drop: b.dropLocation,
      fare: b.finalFare,
      status: b.status,
    }));
  }

   // 5. APPROVE WITHDRAWAL
  async approveWithdrawal(driverId: string) {
    const withdraw = await this.withdrawModel.findOne({
      driverId,
      status: WithdrawalStatus.REQUESTED,
    });

    if (!withdraw) throw new BadRequestException('No withdrawal request');

    withdraw.status = WithdrawalStatus.APPROVED;
    await withdraw.save();

    return { message: 'Withdrawal approved successfully' };
  }

  //6. REJECT WITHDRAWAL 
  async rejectWithdrawal(driverId: string) {
    const withdraw = await this.withdrawModel.findOne({
      driverId,
      status: WithdrawalStatus.REQUESTED,
    });

    if (!withdraw) throw new BadRequestException('No withdrawal request');

    withdraw.status = WithdrawalStatus.REJECTED;
    await withdraw.save();

    return { message: 'Withdrawal rejected successfully' };
  }
}