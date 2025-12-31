import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class CustomerGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new ForbiddenException('No token provided');
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = this.jwtService.verify(token);

      if (decoded.userType !== 'customer') {
        throw new ForbiddenException('Not a Customer');
    }

      request.customerId = decoded.userId;
      return true;
    } catch (err) {
      throw new ForbiddenException('Invalid token');
    }
  }
}
