import { Controller, Post, Body, UseInterceptors, UploadedFiles, UseGuards, Req, Get, Param, Patch, Query, } from '@nestjs/common';
import { ApiTags, ApiConsumes, ApiBody, ApiBearerAuth, ApiParam, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DriversService } from './drivers.service';
import { DriverPersonalDto } from './dto/driver-personal.dto';
import { DriverVehicleDto } from './dto/driver-vehicle.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { documentUploadConfig } from 'src/config/multer.config';
import { DriverRegistrationGuard } from './driver-registration.guard';
import { DriverAuthGuard } from './driver-auth.guard';
import { UpdateDriverStatusDto } from './dto/update-driver-status.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { domainToASCII } from 'url';
import { DriverBankDetailsDto } from './dto/driver-bank-details.dto';
import { RequestWithdrawDto } from './dto/request-withdraw.dto';
import { UpdateDriverProfileDto } from './dto/update-driver-profile.dto';
import { StartTripDto } from './dto/start-trip.dto';
import { CompleteTripDto } from './dto/complete-trip.dto';

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
    return this.driversService.initDigiLocker(req.driverId);
  }

  @Post('documents/digilocker/callback')
  @ApiOperation({
    summary: 'DigiLocker callback',
    description: 'Called by DigiLocker servers after driver consent',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        state: {
          type: 'string',
          example: 'driverObjectId',
        },
        code: {
          type: 'string',
          example: 'digilocker_auth_code',
        },
      },
      required: ['state', 'code'],
    },
  })
  uploadViaDigiLocker(
    @Body('state') driverId: string,
    @Body('code') code: string,
  ) {
    return this.driversService.uploadDocumentsViaDigiLocker(
      driverId,
      code,
    );
  }

  @ApiBearerAuth()
  @UseGuards(DriverAuthGuard)
  @Post('location')
  @ApiOperation({ summary: 'Update driver live location' })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        message: 'Location updated',
      },
    },
  })
  updateLocation(@Req() req, @Body() dto: UpdateLocationDto) {
    return this.driversService.updateLocation(req.driverId, dto);
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
  @ApiOperation({ summary: 'Driver accepts booking' })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        message: 'Booking accepted successfully',
        bookingId: '665f0c12a9d8e5f123456789',
        driverToPickupDistanceKm: 2.4,
        pickupCharge: 30,
      },
    },
  })
  @ApiResponse({
    status: 400,
    schema: {
      example: {
        statusCode: 400,
        message: 'Booking not available',
      },
    },
  })
  acceptBooking(@Req() req, @Param('bookingId') bookingId: string) {
    return this.driversService.acceptBooking(req.driverId, bookingId);
  }

  @ApiBearerAuth()
  @UseGuards(DriverAuthGuard)
  @Post('trips/start')
  @ApiOperation({ summary: 'Driver starts trip' })
  @ApiResponse({
    status: 200,
    description: 'Trip started successfully',
    schema: {
      example: {
        message: 'Trip started',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid trip',
  })
  async startTrip(@Req() req, @Body() dto: StartTripDto,) {
    return this.driversService.startTrip(req.driverId, dto.bookingId,);
  }

  @ApiBearerAuth()
  @UseGuards(DriverAuthGuard)
  @Post('trips/complete')
  @ApiOperation({ summary: 'Driver completes trip' })
  @ApiResponse({
    status: 200,
    description: 'Trip completed successfully',
    schema: {
      example: {
        message: 'Trip completed successfully',
        fare: {
          finalFare: 340,
          pickupCharge: 20,
          distanceFare: 280,
          driverEarning: 272,
          platformCommission: 68,
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid trip or pricing not found',
  })
  async completeTrip(@Req() req, @Body() dto: CompleteTripDto,) {
    return this.driversService.completeTrip(req.driverId, dto.bookingId,);
  }

  @ApiBearerAuth()
  @UseGuards(DriverAuthGuard)
  @Post(':bookingId/reject')
  @ApiOperation({ summary: 'Driver rejects booking' })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        message: 'Booking rejected',
      },
    },
  })
  rejectBooking(@Req() req, @Param('bookingId') bookingId: string) {
    return this.driversService.rejectBooking(req.driverId, bookingId);
  }

  @ApiBearerAuth()
  @UseGuards(DriverAuthGuard)
  @Get('Driver-earnings')
  @ApiOperation({ summary: 'Get total driver earnings' })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        totalEarnings: 12540,
        completedTrips: 87,
        pendingAmount: 840,
      },
    },
  })
  async getEarnings(@Req() req) {
    const driverId = req.driverId;
    return this.driversService.getDriverEarnings(driverId);
  }

  @ApiBearerAuth()
  @UseGuards(DriverAuthGuard)
  @Get('wallet-summary')
  @ApiOperation({ summary: 'Get total driver earnings' })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        totalEarnings: 12540,
        completedTrips: 87,
        pendingAmount: 840,
      },
    },
  })
  async walletSummary(@Req() req) {
    return this.driversService.getWalletSummary(req.driverId);
  }

  @ApiBearerAuth()
  @UseGuards(DriverAuthGuard)
  @Post('bank-details')
  @ApiOperation({ summary: 'Add driver bank details' })
  @ApiResponse({
    status: 201,
    schema: {
      example: {
        message: 'Bank details added successfully',
      },
    },
  })
  async addBankDetails(@Req() req, @Body() dto: DriverBankDetailsDto,) {
    return this.driversService.addBankDetails(req.driverId, dto);
  }

  @ApiBearerAuth()
  @UseGuards(DriverAuthGuard)
  @Post('Request-withdraw')
  @ApiOperation({ summary: 'Request wallet withdrawal' })
  @ApiResponse({
    status: 201,
    schema: {
      example: {
        message: 'Withdrawal request submitted',
        amount: 2000,
        status: 'PENDING',
      },
    },
  })
  @ApiResponse({
    status: 400,
    schema: {
      example: {
        statusCode: 400,
        message: 'Insufficient wallet balance',
      },
    },
  })
  async requestWithdrawal(@Req() req, @Body() dto: RequestWithdrawDto,) {
    return this.driversService.requestWithdrawal(req.driverId, dto.amount);
  }

  @ApiBearerAuth()
  @UseGuards(DriverAuthGuard)
  @Get('withdrawals-history')
  @ApiOperation({ summary: 'Get driver withdrawal history' })
  @ApiResponse({
    status: 200,
    schema: {
      example: [
        {
          amount: 2000,
          status: 'APPROVED',
          requestedAt: '2025-12-20T10:00:00.000Z',
          processedAt: '2025-12-21T09:30:00.000Z',
        },
        {
          amount: 1500,
          status: 'PENDING',
          requestedAt: '2026-01-01T08:15:00.000Z',
        },
      ],
    },
  })
  async getWithdrawalHistory(@Req() req) {
    return this.driversService.getWithdrawalHistory(req.driverId);
  }

  @ApiBearerAuth()
  @UseGuards(DriverAuthGuard)
  @Get('driver-dashboard')
  @ApiOperation({ summary: 'Get driver dashboard data' })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        todayEarnings: 820,
        activeTrip: null,
        totalTrips: 87,
        walletBalance: 3400,
      },
    },
  })
  async getDashboard(@Req() req) {
    return this.driversService.getDriverDashboard(req.driverId);
  }

  @ApiBearerAuth()
  @UseGuards(DriverAuthGuard)
  @Get('trips/history')
  @ApiOperation({ summary: 'Get driver trip history (paginated)' })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        total: 87,
        page: 1,
        limit: 10,
        trips: [
          {
            bookingId: '665f0c12a9d8e5f123456789',
            fare: 260,
            distanceKm: 14.8,
            completedAt: '2025-12-30T18:45:00.000Z',
          },
        ],
      },
    },
  })
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
  @ApiOperation({ summary: 'Get driver profile' })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        firstName: 'Ramesh',
        lastName: 'Kumar',
        mobile: '9XXXXXXXXX',
        vehicleType: 'Bike',
        isAvailable: true,
      },
    },
  })
  getProfile(@Req() req) {
    return this.driversService.getDriverProfile(req.driverId);
  }

  @ApiBearerAuth()
  @UseGuards(DriverAuthGuard)
  @Patch('profile/update')
  @ApiOperation({ summary: 'Update driver profile' })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        message: 'Profile updated successfully',
      },
    },
  })
  updateProfile(@Req() req, @Body() dto: UpdateDriverProfileDto) {
    return this.driversService.updateDriverProfile(req.driverId, dto);
  }

  @ApiBearerAuth()
  @UseGuards(DriverAuthGuard)
  @Post('profile/logout')
  @ApiOperation({ summary: 'Logout driver from all sessions' })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        message: 'Logged out successfully',
      },
    },
  })
  logout(@Req() req) {
    return this.driversService.logoutDriver(req.driverId);
  }
}

