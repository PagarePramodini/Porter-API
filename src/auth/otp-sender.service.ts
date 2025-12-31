import { Injectable, Logger } from '@nestjs/common';
import { Twilio } from 'twilio';

@Injectable()
export class OtpSenderService {
  private logger = new Logger(OtpSenderService.name);
  private client: Twilio | null = null;
  private from: string | null = null;

  constructor() {
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    const from = process.env.TWILIO_WHATSAPP_FROM;

    if (sid && token && from) {
      this.client = new Twilio(sid, token);
      this.from = from;
    }
  }

  async sendWhatsappOtp(mobile: string, otp: string) {
    const to = mobile.startsWith('+')
      ? `whatsapp:${mobile}`
      : `whatsapp:+91${mobile}`;

    const message = `🔐 Your OTP is *${otp}*\n\nValid for 5 minutes.\n\n— Team AnyGo`;

    if (this.client && this.from) {
      await this.client.messages.create({
        from: this.from,
        to,
        body: message,
      });

      this.logger.log(`WhatsApp OTP sent to ${to}`);
    } else {
      // DEV fallback
      this.logger.log(`[DEV WHATSAPP OTP] ${mobile}: ${otp}`);
    }
  }
}
