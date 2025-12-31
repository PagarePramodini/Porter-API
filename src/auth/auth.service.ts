import { Injectable, BadRequestException, forwardRef, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Otp, OtpDocument } from './schemas/otp.schema';
import { Customer, CustomerDocument } from 'src/customers/schemas/customer.schema';
import { CustomersService } from 'src/customers/customers.service';
import { Driver, DriverDocument } from 'src/drivers/schemas/driver.schema';
import { DriversService } from 'src/drivers/drivers.service';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { Owner, OwnerDocument } from 'src/owner/schemas/owner.schema';
import { OwnerService } from 'src/owner/owner.service';
import { OtpSenderService } from './otp-sender.service';

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(Otp.name) private otpModel: Model<OtpDocument>,
        @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
        @InjectModel(Driver.name) private driverModel: Model<DriverDocument>,
        @InjectModel(Owner.name) private ownerModel:Model<OwnerDocument>,
        @Inject(forwardRef(() => CustomersService))
        private customersService: CustomersService,
        @Inject(forwardRef(() => DriversService))
        private driversService: DriversService,
        @Inject(forwardRef(() => OwnerService))
        private ownerService: OwnerService,
        private readonly jwtService: JwtService,
        private readonly otpSender: OtpSenderService,
    ) {}

    // Temporary storage before OTP
    async createTempData(mobile: string, userType: string, payload: any) {
        await this.otpModel.deleteMany({ mobile });

        if (!payload.password) payload.password = Math.random().toString(36).slice(-8);

        await this.otpModel.create({
            mobile,
            userType,
            otp: null,
            payload,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        });
    }

    // Generate OTP
    async createSession(mobile: string, p0: string, dto: any) {
        // get existing temp registration data
        const temp = await this.otpModel.findOne({ mobile });
        if (!temp || !temp.payload) {
            throw new BadRequestException("No registration request found for this mobile");
        }
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        // update the same temp record with OTP
        temp.otp = otp;
        temp.expiresAt = new Date(Date.now() + 5 * 60 * 1000);
        await temp.save();

        await this.otpSender.sendWhatsappOtp(mobile, otp);
        console.log("OTP:", otp);
        return { message: "OTP sent successfully", otp };
    }

    // Verify OTP 
    async verifyOtp(mobile: string, otp: string) {
        const session = await this.otpModel.findOne({ mobile, otp });

        if (!session) {
            throw new BadRequestException('Invalid OTP');
        }
        if (!session.payload) {
            throw new BadRequestException('No registration data found for this OTP');
        }
        if (session.expiresAt < new Date()) {
            throw new BadRequestException('OTP expired');
        }

        const data = session.payload;

        if (session.userType === 'customer') {
            const exists = await this.customerModel.findOne({ mobile: data.mobile });
            if (!exists) {
                await this.customersService.create(data);
            }

            await this.otpModel.deleteOne({ _id: session._id });

            return {
                message: 'OTP verified successfully',
                userType: 'customer',
                data,
            };
        }

        if (session.userType === 'driver') {
            const driver = await this.driverModel.findById(session.payload.driverId);

            if (!driver) {
                throw new BadRequestException("Driver not found");
            }

            driver.status = 'completed';
            await driver.save();

            await this.otpModel.deleteOne({ _id: session._id });

            return {
                message: "Driver registration completed",
                userType: 'driver',
                driverId: driver._id
            };
        }

    }

    async sendOtpForRegistration(mobile: string) {
        const temp = await this.otpModel.findOne({ mobile });
        if (!temp) {
            throw new BadRequestException(
                'No registration data found. Please complete /customer/register first.'
            );
        }
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        temp.otp = otp;
        temp.expiresAt = new Date(Date.now() + 5 * 60 * 1000);
        await temp.save();

        await this.otpSender.sendWhatsappOtp(mobile, otp);
        console.log('Generated OTP:', otp);
        return { message: 'OTP sent successfully', otp };
    }

    //Login 
    async login(mobile: string, password: string) {
        // 1️⃣ Try CUSTOMER
        const customer = await this.customerModel.findOne({ mobile });
        if (customer) {
            const match = await bcrypt.compare(password, customer.password);
            if (!match) throw new BadRequestException('Invalid password');

            return this.generateLoginResponse(customer._id.toString(), 'customer');
        }

        // 2️⃣ Try DRIVER
        const driver = await this.driverModel.findOne({ mobile });
        if (driver) {
            const match = await bcrypt.compare(password, driver.password);
            if (!match) throw new BadRequestException('Invalid password');

            return this.generateLoginResponse(driver._id.toString(), 'driver');
        }

        // 3️⃣ OWNER (future ready)
        const owner = await this.ownerModel.findOne({ mobile });
        if (owner) {
            const match = await bcrypt.compare(password, owner.password);
            if (!match) throw new BadRequestException('Invalid password');

            return this.generateLoginResponse(owner._id.toString(), 'owner');
        }

        throw new BadRequestException('Mobile number not registered');
    }

    private generateLoginResponse(userId: string, userType: string) {
        const token = this.jwtService.sign(
            { userId, userType },
            { expiresIn: '7d' }
        );

        return {
            message: 'Login successful',
            userType,
            userId,
            token,
        };
    }
}