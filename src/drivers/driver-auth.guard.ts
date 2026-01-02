import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Model } from "mongoose";

@Injectable()
export class DriverAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService ) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Missing token');
    } 

    const token = authHeader.split(' ')[1];

    try {
      const decoded = this.jwtService.verify(token);

      if (decoded.userType !== 'driver') {
        throw new UnauthorizedException('Not a driver token');
      }
      
      req.driverId = decoded.userId;

      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
