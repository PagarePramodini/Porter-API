import { Controller, Post, Body, UseGuards, Req, Get, Param } from '@nestjs/common';
import { BookingService } from './booking.service';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { CustomerGuard } from '../customer.guard';
import { RouteCheckDto } from './dto/route-check.dto';
import { SelectVehicleDto } from './dto/select-vehicle.dto';
import { BookingEstimateDto } from './dto/booking-estimate.dto';

@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) { }

  @ApiBearerAuth()
  @UseGuards(CustomerGuard)
  @Post('route-check')
  @ApiOperation({ summary: 'Check route distance and duration' })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        distanceKm: 12.5,
        durationMin: 35,
      },
    },
  })
  routeCheck(@Body() dto: RouteCheckDto) {
    return this.bookingService.routeCheck(dto);
  }

  @ApiBearerAuth()
  @UseGuards(CustomerGuard)
  @Post('estimate')
  @ApiOperation({ summary: 'Get fare estimate before booking' })
  @ApiResponse({
    status: 201,
    schema: {
      example: {
        distanceKm: 31.059,
        durationMin: 53,
        vehicles: [
          {
            vehicleType: 'Bike',
            estimatedFare: 170,
            etaMin: 53,
          },
          {
            vehicleType: 'MiniTruck',
            estimatedFare: 420,
            etaMin: 53,
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 400,
    schema: {
      example: {
        statusCode: 400,
        message: 'Pricing not available',
      },
    },
  })
  getEstimate(@Body() dto: BookingEstimateDto) {
    return this.bookingService.getEstimate(dto);
  }

  @ApiBearerAuth()
  @UseGuards(CustomerGuard)
  @Post('create')
  @ApiOperation({ summary: 'Create booking after vehicle selection' })
  @ApiResponse({
    status: 201,
    description: 'Booking created successfully',
    schema: {
      example: {
        message: 'Booking created',
        bookingId: '665f0c12a9d8e5f123456789',
        estimatedFare: 180,
        distanceKm: 12.5,
        durationMin: 35,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid route or vehicle',
    schema: {
      example: {
        statusCode: 400,
        message: 'Invalid pickup/drop location',
      },
    },
  })
  create(@Req() req, @Body() dto: SelectVehicleDto) {
    return this.bookingService.createBooking(req.customerId, dto,);
  }

  @ApiBearerAuth()
  @UseGuards(CustomerGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Get booking details by booking ID' })
  @ApiParam({
    name: 'id',
    example: '665f0c12a9d8e5f123456789',
    description: 'Booking ID',
  })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        _id: '665f0c12a9d8e5f123456789',
        status: 'TRIP_STARTED',
        vehicleType: 'Bike',
        pickupLocation: {
          lat: 19.076,
          lng: 72.8777,
        },
        dropLocation: {
          lat: 19.2183,
          lng: 72.9781,
        },
        fareEstimate: 260,
        pickupCharge: 40,
        driver: {
          name: 'Ramesh Kumar',
          mobile: '9XXXXXXXXX',
          vehicleNumber: 'MH12AB1234',
        },
        createdAt: '2026-01-01T09:15:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 404,
    schema: {
      example: {
        statusCode: 404,
        message: 'Booking not found',
      },
    },
  })
  getBooking(@Req() req, @Param('id') id: string) {
    return this.bookingService.getBookingById(req.customerId, id);
  }

  @ApiBearerAuth()
  @UseGuards(CustomerGuard)
  @Get(':id/status')
  @ApiOperation({ summary: 'Get current booking status' })
  @ApiParam({
    name: 'id',
    example: '665f0c12a9d8e5f123456789',
  })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        bookingId: '665f0c12a9d8e5f123456789',
        status: 'DRIVER_ARRIVING',
        driverAssigned: true,
      },
    },
  })
  @ApiResponse({
    status: 404,
    schema: {
      example: {
        statusCode: 404,
        message: 'Booking not found',
      },
    },
  })
  getBookingStatus(@Req() req, @Param('id') id: string) {
    return this.bookingService.getBookingStatus(req.customerId, id);
  }

  @ApiBearerAuth()
  @UseGuards(CustomerGuard)
  @Get(':id/driver-location')
  @ApiOperation({ summary: 'Get live driver location for booking' })
  @ApiParam({
    name: 'id',
    example: '665f0c12a9d8e5f123456789',
  })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        bookingId: '665f0c12a9d8e5f123456789',
        driverLocation: {
          lat: 19.082,
          lng: 72.881,
          heading: 120,
          updatedAt: '2026-01-01T10:25:30.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    schema: {
      example: {
        statusCode: 400,
        message: 'Driver not assigned yet',
      },
    },
  })
  getDriverLocation(@Req() req, @Param('id') id: string) {
    return this.bookingService.getDriverLocation(req.customerId, id);
  }

  @ApiBearerAuth()
  @UseGuards(CustomerGuard)
  @Post('cancel')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        bookingId: {
          type: 'string',
          example: '665f0c12a9d8e5f123456789',
        },
      },
      required: ['bookingId'],
    },
  })
  cancelBooking(@Req() req, @Body('bookingId') bookingId: string) {
    return this.bookingService.cancelBooking(req.customerId, bookingId);
  }
}
