import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class DriverRegistrationGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) return false;

    const token = authHeader.split(' ')[1];

    try {
      const decoded = this.jwtService.verify(token);

      if (decoded.userType !== 'driver')
        return false;

      // Step 1 → token contains mobile
      if (decoded.mobile) {
        request.driverMobile = decoded.mobile;
      }

      // Step 2 & 3 → token contains driverId
      if (decoded.driverId) {
        request.driverId = decoded.driverId;
      }

      return true;
    } catch {
      return false;
    }
  }
}
