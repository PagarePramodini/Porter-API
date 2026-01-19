import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class OtpSenderService {
  private logger = new Logger(OtpSenderService.name);

  private readonly apiKey = process.env.CLOUD_WHATSAPP_API_KEY;
  private readonly baseUrl = process.env.CLOUD_WHATSAPP_BASE_URL;

  async sendWhatsappOtp(mobile: string, otp: string) {
    const message = `Your OTP is ${otp}\n\nValid for 5 minutes.\n\n— Team AnyGo`;

    if (!this.apiKey || !this.baseUrl) {
      // DEV fallback (same behavior as before)
      this.logger.warn(`[DEV WHATSAPP OTP] ${mobile}: ${otp}`);
      return;
    }

    try {
      await axios.get(this.baseUrl, {
        params: {
          apikey: this.apiKey,
          mobile: mobile,   // CloudWhatsApp wants plain number (no +91, no whatsapp:)
          msg: message,
        },
      });

      this.logger.log(`WhatsApp OTP sent to ${mobile}`);
    } catch (error) {
      this.logger.error(
        `Failed to send WhatsApp OTP to ${mobile}`,
        error?.response?.data || error.message,
      );
      throw error;
    }
  }
}
