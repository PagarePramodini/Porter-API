import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards, Put, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CreateOwnerDto } from './dto/create-owner.dto';
import { OwnerService } from './owner.service';
import { OwnerJwtGuard } from 'src/master/owner-jwt.guard';
import { UpdateProfileDto } from './dto/profile-update.dto';

@ApiTags('Admin')
@Controller('owner')
export class OwnerController {
  constructor(private readonly ownerService: OwnerService) { }

  @Post('register')
  async register(@Body() createOwnerDto: CreateOwnerDto) {
    const owner = await this.ownerService.create(createOwnerDto);
    return {
      statusCode: 201,
      message: 'Owner registered successfully',
      data: owner,
    };
  }

  @Get('mobile/:mobile')
  async getOwnerByMobile(@Param('mobile') mobile: string) {
    const owner = await this.ownerService.findByMobile(mobile);
    return {
      statusCode: 200,
      message: 'Owner details fetched successfully',
      data: owner,
    };
  }

  // All Drivers 
  @ApiBearerAuth()
  @UseGuards(OwnerJwtGuard)
  @Get('drivers')
  getDrivers() {
    return this.ownerService.getAllDrivers();
  }

  // Driver full details
  @ApiBearerAuth()
  @UseGuards(OwnerJwtGuard)
  @Get('drivers/:id')
  getDriverById(@Param('id') driverId: string) {
    return this.ownerService.getDriverDetails(driverId);
  }

  // Document Approve   
  @ApiBearerAuth()
  @UseGuards(OwnerJwtGuard)
  @Patch('drivers/:driverId/documents/approve')
  approveDriverDocuments(@Param('driverId') driverId: string) {
    return this.ownerService.approveDriverDocuments(driverId);
  }

  // Document Reject
  @ApiBearerAuth()
  @UseGuards(OwnerJwtGuard)
  @Patch('drivers/:driverId/documents/reject')
  rejectDriverDocuments(
    @Param('driverId') driverId: string,
    @Body('reason') reason?: string,
  ) {
    return this.ownerService.rejectDriverDocuments(driverId, reason);
  }

  // Customer Booking
  @ApiBearerAuth()
  @UseGuards(OwnerJwtGuard)
  @Get('bookings')
  getAllBookings() {
    return this.ownerService.getAllBookings();
  }

  // Trip Management (Driver-wise)
  @ApiBearerAuth()
  @UseGuards(OwnerJwtGuard)
  @Get('trips/management')
  getTripManagement() {
    return this.ownerService.getTripManagement();
  }

  // All Withdrawal Request 
  @ApiBearerAuth()
  @UseGuards(OwnerJwtGuard)
  @Get('/all-requests')
  getAllWithdrawals() {
    return this.ownerService.getAllWithdrawals();
  }

  // Approve withdrawal
  @ApiBearerAuth()
  @UseGuards(OwnerJwtGuard)
  @Patch(':id/approve')
  approveWithdrawal(@Param('id') withdrawalId: string) {
    return this.ownerService.approveWithdrawal(withdrawalId);
  }

  // Reject withdrawal
  @ApiBearerAuth()
  @UseGuards(OwnerJwtGuard)
  @Patch(':id/reject')
  rejectWithdrawal(@Param('id') withdrawalId: string) {
    return this.ownerService.rejectWithdrawal(withdrawalId);
  }

  // All Customers 
  @ApiBearerAuth()
  @UseGuards(OwnerJwtGuard)
  @Get('all-customers')
  getCustomers() {
    return this.ownerService.getAllCustomers();
  }

  // Admin Dashboard
  @ApiBearerAuth()
  @UseGuards(OwnerJwtGuard)
  @Get('dashboard')
  async getAdminDashboard() {
    return {
      message: 'Admin dashboard data fetched successfully',
      data: await this.ownerService.getAdminDashboard(),
    };
  }

  // Admin/Owner Proflie 
  @ApiBearerAuth()
  @UseGuards(OwnerJwtGuard)
  @Get('profile')
  getProfile(@Req() req) {
    return this.ownerService.getProfile(req.owner.userId);
  }

  // Admin/Owner Update Proflie 
  @ApiBearerAuth()
  @UseGuards(OwnerJwtGuard)
  @Put('profile/update')
  updateProfile(@Req() req, @Body() dto: UpdateProfileDto) {
    return this.ownerService.updateProfile(req.owner.userId, dto);
  }
  
  // Driver Payment Summary 
  @ApiBearerAuth()
  @UseGuards(OwnerJwtGuard)
  @Get('payments/drivers')
  @ApiQuery({ name: 'month', required: false })
  @ApiQuery({ name: 'year', required: false })
  getDriverPayments(
    @Query('month') month?: number,
    @Query('year') year?: number, 
  ) {
    return this.ownerService.getDriverPaymentSummary(
      month ? Number(month) : undefined,
      year ? Number(year) : undefined,
    );
  }

  // Driver Performance Report
  @ApiBearerAuth()
  @UseGuards(OwnerJwtGuard)
  @Get('reports/driver-performance')
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  @ApiQuery({ name: 'driverId', required: false })
  getDriverPerformance( @Query('from') from?: string, @Query('to') to?: string,
    @Query('driverId') driverId?: string,) {
    return this.ownerService.getDriverPerformanceReport({
      from,
      to,
      driverId,
    });
  }

  // Trip Report
  @ApiBearerAuth()
  @UseGuards(OwnerJwtGuard)
  @Get('reports/trips')
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  @ApiQuery({ name: 'driverId', required: false })
  getTripReport(@Query('from') from?: string, @Query('to') to?: string,
    @Query('driverId') driverId?: string,) {
    return this.ownerService.getTripReport({
      from,
      to,
      driverId,
    });
  }

  // Cancellation Report
  @ApiBearerAuth()
  @UseGuards(OwnerJwtGuard)
  @Get('reports/cancellations')
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  @ApiQuery({ name: 'driverId', required: false })
  getCancellationReport(@Query('from') from?: string, @Query('to') to?: string,
    @Query('driverId') driverId?: string,) {
    return this.ownerService.getCancellationReport({
      from,
      to,
      driverId,
    });
  }

  // Earning Report
  @ApiBearerAuth()
  @UseGuards(OwnerJwtGuard)
  @Get('reports/earnings')
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  @ApiQuery({ name: 'driverId', required: false })
  getEarningsReport( @Query('from') from?: string, @Query('to') to?: string, 
  @Query('driverId') driverId?: string, ) {
    return this.ownerService.getDriverPaymentSummary(
      undefined,
      undefined,
      from ? new Date(from) : undefined,
      to ? new Date(to) : undefined,
      driverId
    );
  }

}