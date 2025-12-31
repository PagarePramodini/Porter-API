import { Controller, Post, Body, UseGuards, Req, Get, Param } from '@nestjs/common';
import { BookingService } from './booking.service';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { CustomerGuard } from '../customer.guard';
import { RouteCheckDto } from './dto/route-check.dto';
import { SelectVehicleDto } from './dto/select-vehicle.dto';
import { PaymentPreviewDto } from './dto/payment-preview.dto';
import { PaymentVerifyDto } from './dto/payment-verify.dto';
import { BookingEstimateDto } from './dto/booking-estimate.dto';

@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) { }

  @ApiBearerAuth()
  @UseGuards(CustomerGuard)
  @Post('route-check')
  routeCheck(@Body() dto: RouteCheckDto) {
    return this.bookingService.routeCheck(dto);
  }

  @ApiBearerAuth()
  @UseGuards(CustomerGuard)
  @Post('estimate')
  getEstimate(@Body() dto: BookingEstimateDto) {
    return this.bookingService.getEstimate(dto);
  }

  @ApiBearerAuth()
  @UseGuards(CustomerGuard)
  @Post('select-Vehicle')
  selectVehicle(@Req() req, @Body() dto: SelectVehicleDto) {
    return this.bookingService.selectVehicle(req.customerId, dto,);
  }

  @UseGuards(CustomerGuard)
  @ApiBearerAuth()
  @Post('payment/preview')
  getPaymentPreview(@Req() req, @Body() dto: PaymentPreviewDto) {
    return this.bookingService.getPaymentPreview(req.customerId, dto);
  }

  @ApiBearerAuth()
  @UseGuards(CustomerGuard)
  @Post('payment/initiate')
  @ApiResponse({ status: 200, description: 'Razorpay order created', })
  initiatePayment(@Req() req) {
    return this.bookingService.initiatePayment(req.customerId);
  }

  @ApiBearerAuth()
  @UseGuards(CustomerGuard)
  @Post('payment/cash')
  confirmCash(@Req() req) {
    return this.bookingService.confirmCashBooking(req.customerId);
  }

  @ApiBearerAuth()
  @UseGuards(CustomerGuard)
  @Post('payment/verify')
  verifyPayment(@Req() req, @Body() dto: PaymentVerifyDto) {
    return this.bookingService.verifyPayment(req.customerId, dto);
  }

  @ApiBearerAuth()
  @UseGuards(CustomerGuard)
  @Get(':id')
  getBooking(@Req() req, @Param('id') id: string) {
    return this.bookingService.getBookingById(req.customerId, id);
  }

  @ApiBearerAuth()
  @UseGuards(CustomerGuard)
  @Get(':id/status')
  getBookingStatus(@Req() req, @Param('id') id: string) {
    return this.bookingService.getBookingStatus(req.customerId, id);
  }

  @ApiBearerAuth()
  @UseGuards(CustomerGuard)
  @Get(':id/driver-location')
  getDriverLocation(@Req() req, @Param('id') id: string) {
    return this.bookingService.getDriverLocation(req.customerId, id);
  }

  @ApiBearerAuth()
  @UseGuards(CustomerGuard)
  @Post('cancel')
  cancelBooking(@Req() req, @Body('bookingId') bookingId: string) {
    return this.bookingService.cancelBooking(req.customerId, bookingId);
  }
}
