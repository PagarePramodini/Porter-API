import { Controller, Post, Body, UseInterceptors, UploadedFiles, UseGuards, Req, Get, Param, Patch, Query, } from '@nestjs/common';
import { ApiTags, ApiConsumes, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { DriversService } from './drivers.service';
import { DriverPersonalDto } from './dto/driver-personal.dto';
import { DriverVehicleDto } from './dto/driver-vehicle.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { documentUploadConfig } from 'src/config/multer.config';
import { DriverRegistrationGuard } from './driver-registration.guard';
import { DriverAuthGuard } from './driver-auth.guard';
import { UpdateDriverStatusDto } from './dto/update-driver-status.dto';
import { UpdateLocationDto } from './dto/update-location.dto';

@ApiTags('drivers')
@Controller('driver')
export class DriversController {
  constructor(private readonly driversService: DriversService) { }

  // STEP 1: Personal details (mobile only)
  @Post('register/personal')
  async personal(@Req() req, @Body() dto: DriverPersonalDto) {
    console.log(dto);
    return this.driversService.registerPersonal(dto.mobile, dto);
  }

  // STEP 2: Vehicle details (driverId mandatory)
  @ApiBearerAuth()
  @UseGuards(DriverRegistrationGuard)
  @Post('register/vehicle')
  async registerVehicle(@Req() req, @Body() dto: DriverVehicleDto) {
    return this.driversService.registerVehicle(req.driverId, dto);
  }

  // STEP 3: Documents upload (driverId mandatory)
  @ApiBearerAuth()
  @UseGuards(DriverRegistrationGuard)
  @Post('register/documents')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    required: true,
    schema: {
      type: 'object',
      properties: {
        aadhaar: { type: 'string', format: 'binary' },
        panCard: { type: 'string', format: 'binary' },
        licenseFront: { type: 'string', format: 'binary' },
        licenseBack: { type: 'string', format: 'binary' },
      }
    }
  })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'aadhaar', maxCount: 1 },
        { name: 'panCard', maxCount: 1 },
        { name: 'licenseFront', maxCount: 1 },
        { name: 'licenseBack', maxCount: 1 }
      ],
      documentUploadConfig
    )
  )
  async uploadDocuments(@Req() req, @UploadedFiles() files) {
    return this.driversService.uploadDocuments(req.driverId, files);
  }

  @ApiBearerAuth()
  @UseGuards(DriverAuthGuard)
  @Get('documents/digilocker/init')
  initDigiLocker(@Req() req) {
    return this.driversService.initDigiLocker(req.user.driverId);
  }

  @ApiBearerAuth()
  @UseGuards(DriverAuthGuard)
  @Post('documents/digilocker/callback')
  uploadViaDigiLocker(
    @Req() req,
    @Body('code') code: string,
  ) {
    return this.driversService.uploadDocumentsViaDigiLocker(
      req.user.driverId,
      code,
    );
  }

  @ApiBearerAuth()
  @UseGuards(DriverAuthGuard)
  @Patch('driver-status')
  updateStatus(
    @Req() req,
    @Body() dto: UpdateDriverStatusDto,
  ) {
    return this.driversService.updateOnlineStatus(req.driverId, dto);
  }

  @ApiBearerAuth()
  @UseGuards(DriverAuthGuard)
  @Get('booking-requests')
  getBookingRequests(@Req() req) {
    return this.driversService.getPendingRequests(req.driverId);
  }

  @ApiBearerAuth()
  @UseGuards(DriverAuthGuard)
  @Post(':bookingId/accept')
  acceptBooking(@Req() req, @Param('bookingId') bookingId: string) {
    return this.driversService.acceptBooking(req.driverId, bookingId);
  }

  @ApiBearerAuth()
  @UseGuards(DriverAuthGuard)
  @Post('trips/start')
  startTrip(@Req() req, @Body('bookingId') bookingId: string,) {
    return this.driversService.startTrip(req.driverId, bookingId);
  }

  @ApiBearerAuth()
  @UseGuards(DriverAuthGuard)
  @Post('trips/complete')
  completeTrip(@Req() req, @Body('bookingId') bookingId: string,) {
    return this.driversService.completeTrip(req.driverId, bookingId);
  }

  @ApiBearerAuth()
  @UseGuards(DriverAuthGuard)
  @Post('location') updateLocation(@Req() req, @Body() dto: UpdateLocationDto) {
    return this.driversService.updateLocation(req.driverId, dto);
  }

  @ApiBearerAuth()
  @UseGuards(DriverAuthGuard)
  @Post(':bookingId/reject')
  rejectBooking(@Req() req, @Param('bookingId') bookingId: string) {
    return this.driversService.rejectBooking(req.driverId, bookingId);
  }

  @ApiBearerAuth()
  @UseGuards(DriverAuthGuard)
  @Get('Driver-earnings')
  async getEarnings(@Req() req) {
    const driverId = req.driverId;
    return this.driversService.getDriverEarnings(driverId);
  }

  @ApiBearerAuth()
  @UseGuards(DriverAuthGuard)
  @Get('wallet-summary')
  async walletSummary(@Req() req) {
    return this.driversService.getWalletSummary(req.driverId);
  }

  @ApiBearerAuth()
  @UseGuards(DriverAuthGuard)
  @Post('bank-details')
  async addBankDetails(@Req() req, @Body() body: {
    bankName: string,
    bankAccountNumber: string,
    ifscCode: string,
    aadharLinked: boolean
  }) {
    return this.driversService.addBankDetails(req.driverId, body);
  }

  @ApiBearerAuth()
  @UseGuards(DriverAuthGuard)
  @Post('Request-withdraw')
  async requestWithdrawal(@Req() req, @Body('amount') amount: number) {
    return this.driversService.requestWithdrawal(req.driverId, amount);
  }

  @ApiBearerAuth()
  @UseGuards(DriverAuthGuard)
  @Get('withdrawals-history')
  async getWithdrawalHistory(@Req() req) {
    return this.driversService.getWithdrawalHistory(req.driverId);
  }

  @ApiBearerAuth()
  @UseGuards(DriverAuthGuard)
  @Get('driver-dashboard')
  async getDashboard(@Req() req) {
    return this.driversService.getDriverDashboard(req.driverId);
  }

  @ApiBearerAuth()
  @UseGuards(DriverAuthGuard)
  @Get('trips/history')
  getTripHistory(@Req() req, @Query('page') page = '1', @Query('limit') limit = '10',) {
    return this.driversService.getTripHistory(
      req.driverId,
      Number(page),
      Number(limit),
    );
  }

  @ApiBearerAuth()
  @UseGuards(DriverAuthGuard)
  @Get('profile')
  getProfile(@Req() req) {
    return this.driversService.getDriverProfile(req.driverId);
  }

  @ApiBearerAuth()
  @UseGuards(DriverAuthGuard)
  @Patch('profile/update')
  updateProfile(@Req() req, @Body() body: {
    firstName?: string;
    lastName?: string;
  },) {
    return this.driversService.updateDriverProfile(req.driverId, body);
  }

  @ApiBearerAuth()
  @UseGuards(DriverAuthGuard)
  @Post('profile/logout')
  logout(@Req() req) {
    return this.driversService.logoutDriver(req.driverId);
  }
}

