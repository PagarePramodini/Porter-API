import { PartialType } from '@nestjs/swagger';
import { DriverPersonalDto } from './driver-personal.dto';

export class UpdateDriverDto extends PartialType(DriverPersonalDto) {}
