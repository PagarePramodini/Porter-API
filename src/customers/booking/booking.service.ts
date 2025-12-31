import { BadRequestException, Injectable } from '@nestjs/common';
import { GoogleMapsService } from 'src/common/google-maps.service';
import { RouteCheckDto } from './dto/route-check.dto';
import { BookingEstimateDto } from './dto/booking-estimate.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SelectVehicleDto } from './dto/select-vehicle.dto';
import { PaymentPreviewDto } from './dto/payment-preview.dto';
import Razorpay from 'razorpay';
import { ConfigService } from '@nestjs/config';
import { Booking } from './schemas/booking.schema';
import * as crypto from 'crypto';
import { PaymentVerifyDto } from './dto/payment-verify.dto';
import { Driver, DriverDocument } from 'src/drivers/schemas/driver.schema';
import { BookingStatus } from './dto/booking-status.dto';
import { PaymentStatus } from './dto/payment-status.dto';
import { DriverDispatchService } from 'src/drivers/driver-dispatch.service';
import { LiveTrackingGateway } from 'src/gateways/live-tracking.gateway';
import { Pricing, PricingDocument } from './schemas/pricing.schema';
import { City, CityDocument } from 'src/master/schemas/city.schema';

@Injectable()
export class BookingService {
  private razorpay: Razorpay;

  constructor(
    private readonly mapsService: GoogleMapsService,
    private readonly liveGateway: LiveTrackingGateway,
    @InjectModel('Booking')
    private readonly bookingModel: Model<Booking>, private readonly configService: ConfigService,
    @InjectModel(Driver.name) private driverModel: Model<DriverDocument>,
    @InjectModel(Pricing.name) private pricingModel: Model<PricingDocument>,
    @InjectModel(City.name) private CityModel: Model<CityDocument>,
    private readonly driverDispatchService: DriverDispatchService,
  ) {
    this.razorpay = new Razorpay({
      key_id: this.configService.get('RAZORPAY_KEY_ID'),
      key_secret: this.configService.get('RAZORPAY_KEY_SECRET'),
    });
  }

  // STEP 1: route check (NO DB)
  async routeCheck(dto: RouteCheckDto) {
    const { distanceKm, durationMin } =
      await this.mapsService.getDistanceAndDuration(
        dto.pickupLat,
        dto.pickupLng,
        dto.dropLat,
        dto.dropLng,
      );

    return {
      distanceKm,
      durationMin,
      tripType: distanceKm > 30 ? 'OUTSTATION' : 'IN_CITY',
    };
  }

  // STEP 2 — ESTIMATE (NO DB)
  async getEstimate(dto: BookingEstimateDto) {
    const { distanceKm, durationMin } =
      await this.mapsService.getDistanceAndDuration(
        dto.pickupLat,
        dto.pickupLng,
        dto.dropLat,
        dto.dropLng,
      );

    const city = await this.mapsService.getCityFromLatLng(
      dto.pickupLat,
      dto.pickupLng,
    );

    const pricingList = await this.pricingModel.find({
      city,
      isActive: true,
    });

    const vehicles = pricingList.map(p => ({
      vehicleType: p.vehicleType,
      tripFare: Math.round(p.baseFare + p.perKmRate * distanceKm),
      etaMin: durationMin,
    }));

    return {
      distanceKm,
      durationMin,
      tripType: distanceKm > 30 ? 'OUTSTATION' : 'IN_CITY',
      vehicles,
    };
  }

  // STEP 3 —Selected Vehicle (DB)
  async selectVehicle(customerId: string, dto: SelectVehicleDto) {
    const { distanceKm, durationMin } =
      await this.mapsService.getDistanceAndDuration(
        dto.pickupLat,
        dto.pickupLng,
        dto.dropLat,
        dto.dropLng,
      );

    const city = await this.mapsService.getCityFromLatLng(
      dto.pickupLat,
      dto.pickupLng,
    );

    const cityExists = await this.CityModel.findOne({
      city,
      isActive: true,
    });

    if (!cityExists) {
      throw new BadRequestException('Service not available in this city');
    }

    const pricing = await this.pricingModel.findOne({
      city,
      vehicleType: dto.vehicleType,
      isActive: true,
    });

    if (!pricing) {
      throw new BadRequestException('Pricing not configured');
    }

    const booking = await this.bookingModel.create({
      customerId,
      city,
      vehicleType: dto.vehicleType,
      distanceKm,
      durationMin,
      tripType: distanceKm > 30 ? 'OUTSTATION' : 'IN_CITY',
      baseFare: pricing.baseFare,
      pickupLocation: { lat: dto.pickupLat, lng: dto.pickupLng, },
      dropLocation: { lat: dto.dropLat, lng: dto.dropLng, },
      receiverName: dto.receiverName,
      receiverMobile: dto.receiverMobile,
      status: BookingStatus.VEHICLE_SELECTED,
    });

    return {
      message: 'Vehicle selected successfully',
      bookingId: booking._id,
      baseFare: booking.baseFare,
    };
  }

  //Step 4 - Payment Preview
  async getPaymentPreview(customerId: string, dto: PaymentPreviewDto) {
    const booking = await this.bookingModel.findOne({
      customerId,
      status: 'VEHICLE_SELECTED',
    }).sort({ createdAt: -1 });

    if (!booking) {
      throw new BadRequestException('No active booking found');
    }

    const loadingCharge =
      dto.loadingUnloading && dto.labourCount
        ? Math.min(dto.labourCount, 3) * 100
        : 0;

    booking.loadingCharge = loadingCharge;
    booking.discount = 0;
    booking.payableAmount = booking.baseFare + loadingCharge;
    booking.status = BookingStatus.PAYMENT_PREVIEW;

    await booking.save();

    return {
      tripFare: booking.baseFare,
      loadingCharge,
      discount: booking.discount,
      payableAmount: booking.payableAmount,
      paymentMethods: ['ONLINE', 'CASH'],
    };
  }

  //Step 5 - Inititate Razorpay Payment
  async initiatePayment(customerId: string) {
    const booking = await this.bookingModel.findOne({
      customerId,
      status: 'PAYMENT_PREVIEW',
    }).sort({ createdAt: -1 });

    if (!booking) {
      throw new BadRequestException('No booking ready for payment');
    }

    const order = await this.razorpay.orders.create({
      amount: booking.payableAmount * 100, // paise
      currency: 'INR',
      receipt: `booking_${booking._id}`,
      payment_capture: true,
    });

    booking.razorpayOrderId = order.id;
    booking.paymentStatus = PaymentStatus.PENDING;
    booking.status = BookingStatus.PAYMENT_INITIATED;
    booking.paymentMethod = 'ONLINE';

    await booking.save();

    return {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: this.configService.get('RAZORPAY_KEY_ID'),
    };
  }

  // Step 6 - Cash Payment
  async confirmCashBooking(customerId: string) {
    const booking = await this.bookingModel.findOne({
      customerId,
      status: 'PAYMENT_PREVIEW',
    }).sort({ createdAt: -1 });

    if (!booking) {
      throw new BadRequestException('No booking found for cash confirmation');
    }
    if (booking.paymentMethod === 'ONLINE') {
      throw new BadRequestException('Online payment already selected');
    }

    booking.paymentMethod = 'CASH';
    booking.paymentStatus = PaymentStatus.PENDING; // cash to be collected
    booking.status = BookingStatus.CONFIRMED;

    await booking.save();

    await this.driverDispatchService.dispatchBooking(booking._id.toString());

    return {
      message: 'Booking confirmed with cash payment',
      bookingId: booking._id,
    };
  }

  //Step - 7 Verify Payment
  async verifyPayment(customerId: string, dto: PaymentVerifyDto) {
    const booking = await this.bookingModel.findOne({
      customerId,
      razorpayOrderId: dto.razorpayOrderId,
    });

    if (!booking) {
      throw new BadRequestException('Booking not found');
    }
    if (booking.paymentMethod === 'CASH') {
      throw new BadRequestException('Cash booking cannot be verified online');
    }

    const secret = this.configService.get('RAZORPAY_KEY_SECRET');

    const generatedSignature = crypto
      .createHmac('sha256', secret)
      .update(dto.razorpayOrderId + '|' + dto.razorpayPaymentId)
      .digest('hex');

    if (generatedSignature !== dto.razorpaySignature) {
      booking.paymentStatus = PaymentStatus.FAILED;
      booking.status = BookingStatus.PAYMENT_FAILED;
      await booking.save();

      throw new BadRequestException('Payment verification failed');
    }

    booking.razorpayPaymentId = dto.razorpayPaymentId;
    booking.razorpaySignature = dto.razorpaySignature;
    booking.paymentStatus = PaymentStatus.SUCCESS;
    booking.status = BookingStatus.CONFIRMED;

    await booking.save();

    await this.driverDispatchService.dispatchBooking(booking._id.toString());

    return {
      message: 'Payment successful, booking confirmed',
      bookingId: booking._id,
    };
  }

  // Step 8 - Complete Booking
  async completeBooking(bookingId: string) {
    const booking = await this.bookingModel.findById(bookingId);

    if (!booking) throw new BadRequestException('Booking not found');

    booking.status = BookingStatus.COMPLETED;

    if (booking.paymentMethod === 'CASH') {
      booking.paymentStatus = PaymentStatus.SUCCESS;
    }

    await booking.save();

    this.liveGateway.stopTracking(bookingId);

    if (booking.driverId) {
      await this.driverModel.findByIdAndUpdate(
        booking.driverId,
        { isAvailable: true }
      );
    }

    return { message: 'Booking completed successfully' };
  }

  //Step 9 - Booking Cancel
  async cancelBooking(customerId: string, bookingId: string) {
    const booking = await this.bookingModel.findOne({
      _id: bookingId,
      customerId,
    });

    if (!booking) {
      throw new BadRequestException('Booking not found');
    }

    if (!this.canCancel(booking.status)) {
      throw new BadRequestException('Booking cannot be cancelled at this stage');
    }

    // Refund logic for ONLINE payments
    if (
      booking.paymentMethod === 'ONLINE' &&
      booking.paymentStatus === PaymentStatus.SUCCESS
    ) {
      await this.initiateRefund(booking);
      booking.paymentStatus = PaymentStatus.REFUND_INITIATED;
    }

    // Free driver if assigned
    if (booking.driverId) {
      await this.driverModel.findByIdAndUpdate(
        booking.driverId,
        { isAvailable: true }
      );
    }

    booking.status = BookingStatus.CANCELLED;

    await booking.save();

    return { message: 'Booking cancelled successfully' };
  }

  private canCancel(status: BookingStatus): boolean {
    return [
      BookingStatus.VEHICLE_SELECTED,
      BookingStatus.PAYMENT_PREVIEW,
      BookingStatus.PAYMENT_INITIATED,
      BookingStatus.CONFIRMED,
    ].includes(status);
  }

  // Step 10 - Online Refund Method
  async initiateRefund(booking: Booking) {
    if (!booking.razorpayPaymentId) {
      throw new BadRequestException('Payment ID missing for refund');
    }

    await this.razorpay.payments.refund(
      booking.razorpayPaymentId,
      {
        amount: booking.payableAmount * 100, // paise
        speed: 'normal', // or 'optimum'
      }
    );
    booking.paymentStatus = PaymentStatus.REFUND_INITIATED;
  }

  //Step - 11 Get Booking by ID
  async getBookingById(customerId: string, bookingId: string) {
    const booking = await this.bookingModel.findOne({
      _id: bookingId,
      customerId,
    });

    if (!booking) {
      throw new BadRequestException('Booking not found');
    }

    return booking;
  }

  //Step -12 Booking Status 
  async getBookingStatus(customerId: string, bookingId: string) {
    const booking = await this.bookingModel.findOne({
      _id: bookingId,
      customerId,
    });

    if (!booking) {
      throw new BadRequestException('Booking not found');
    }

    return {
      bookingId,
      status: booking.status,
      paymentStatus: booking.paymentStatus,
    };
  }

  //Step - 13 Driver Live Tracking
  async getDriverLocation(customerId: string, bookingId: string) {
    const booking = await this.bookingModel.findOne({
      _id: bookingId,
      customerId,
      status: BookingStatus.DRIVER_ASSIGNED,
    });

    if (!booking) {
      throw new BadRequestException('Driver not assigned yet');
    }

    return {
      driverId: booking.driverId,
      location: booking.lastDriverLocation || null,
    };
  }
}
