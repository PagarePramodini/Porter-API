import { Injectable } from '@nestjs/common';

@Injectable()
export class DigiLockerService {

  /**
   * STEP 1: Generate DigiLocker consent URL
   * (Mock for now, real later)
   */
  getAuthUrl(driverId: string) {
    return {
      url: `https://digilocker.gov.in/oauth2/authorize?state=${driverId}`,
      mode: 'MOCK',
    };
  }

  /**
   * STEP 2: Fetch documents after consent
   * (Mocked documents)
   */
  async fetchDocuments(_: string) {
    return {
      aadhaar: 'digilocker/aadhaar.pdf',
      panCard: 'digilocker/pan.pdf',
      licenseFront: 'digilocker/license-front.pdf',
      licenseBack: 'digilocker/license-back.pdf',
      referenceId: `DIGI_${Date.now()}`,
    };
  }
}
