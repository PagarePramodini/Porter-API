import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { MasterService } from './master.service';
import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { CreatePricingDto } from './dto/create-pricing.dto';
import { UpdatePricingDto } from './dto/update-pricing.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { OwnerJwtGuard } from './owner-jwt.guard';

@ApiTags('Master')
@ApiBearerAuth()
@UseGuards(OwnerJwtGuard)
@Controller('master')
export class MasterController {
    constructor(private readonly masterService: MasterService) { }

    // ───────────── CITY ─────────────
    @Post('city')
    createCity(@Body() dto: CreateCityDto) {
        return this.masterService.createCity(dto);
    }

    @Get('city')
    getCities() {
        return this.masterService.getCities();
    }

    @Patch('city/:id')
    updateCity(@Param('id') id: string, @Body() dto: UpdateCityDto) {
        return this.masterService.updateCity(id, dto);
    }

    @Delete('city/:id')
    deleteCity(@Param('id') id: string) {
        return this.masterService.deleteCity(id);
    }

    // ───────────── VEHICLE ─────────────
    @Post('vehicle')
    createVehicle(@Body() dto: CreateVehicleDto) {
        return this.masterService.createVehicle(dto);
    }

    @Get('vehicle')
    getVehicles() {
        return this.masterService.getVehicles();
    }

    @Patch('vehicle/:id')
    updateVehicle(@Param('id') id: string, @Body() dto: UpdateVehicleDto) {
        return this.masterService.updateVehicle(id, dto);
    }

    @Delete('vehicle/:id')
    deleteVehicle(@Param('id') id: string) {
        return this.masterService.deleteVehicle(id);
    }

    // ───────────── PRICING ─────────────
    @Post('pricing')
    createPricing(@Body() dto: CreatePricingDto) {
        return this.masterService.createPricing(dto);
    }

    @Get('pricing')
    getPricing(@Query('vehicleType') vehicleType: string) {
        return this.masterService.getPricing(vehicleType);
    }

    @Patch('pricing/:id')
    updatePricing(@Param('id') id: string, @Body() dto: UpdatePricingDto) {
        return this.masterService.updatePricing(id, dto);
    }

    @Delete('pricing/:id')
    deletePricing(@Param('id') id: string) {
        return this.masterService.deletePricing(id);
    }
}
