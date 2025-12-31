import { Controller, UseGuards, Get, Req, Param } from "@nestjs/common";
import { ApiBearerAuth } from "@nestjs/swagger";
import { CustomerGuard } from "../customer.guard";
import { TripsService } from "./trips.service";

@Controller('customer/trips')
@ApiBearerAuth()
@UseGuards(CustomerGuard)
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  @Get('history')
  getHistory(@Req() req) {
    return this.tripsService.getTripHistory(req.customerId);
  }

  @Get(':id')
  getTrip(@Req() req, @Param('id') id: string) {
    return this.tripsService.getTripDetails(req.customerId, id);
  }
}
