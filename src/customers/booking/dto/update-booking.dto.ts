import { PartialType } from '@nestjs/swagger';
import { RouteCheckDto } from './route-check.dto';

export class UpdateBookingDto extends PartialType(RouteCheckDto) {}
