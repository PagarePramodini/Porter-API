import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SendOtpDto } from './dto/send-otp.dto';
import { LoginDto } from './dto/login.dto';

// multer config: place uploaded files into ./uploads/temp
const uploadOptions = {
  storage: diskStorage({
    destination: './uploads/temp',
    filename: (req, file, cb) => {
      const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, unique + extname(file.originalname));
    },
  }),
};

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // 2️⃣ Send OTP
  @Post('send-otp')
  async sendOtp(@Body() dto: SendOtpDto) {
    return this.authService.sendOtpForRegistration(dto.mobile);
  }

  // 3️⃣ Verify OTP
  @Post("verify-otp")
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto.mobile, dto.otp);
  }                  

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto.mobile, dto.password);
  }
}
