import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from '@googlemaps/google-maps-services-js';
import { AddressType } from '@googlemaps/google-maps-services-js';

@Injectable()
export class GoogleMapsService {
  private readonly client: Client;
  private readonly apiKey: string;

  constructor(private readonly configService: ConfigService) {
    const key = this.configService.get<string>('GOOGLE_MAPS_API_KEY');

    if (!key) {
      throw new Error('GOOGLE_MAPS_API_KEY is missing in .env');
    }

    this.apiKey = key; // <-- TS now knows it's a string
    this.client = new Client({});
  }

  async getDistanceAndDuration(
    pickupLat: number,
    pickupLng: number,
    dropLat: number,
    dropLng: number,
  ) {
    const response = await this.client.distancematrix({
      params: {
        origins: [{ lat: pickupLat, lng: pickupLng }],
        destinations: [{ lat: dropLat, lng: dropLng }],
        key: this.apiKey,
      },
    });

    const element = response.data.rows[0].elements[0];

    if (element.status !== 'OK') {
      throw new BadRequestException('Route not found');
    }

    return {
      distanceKm: element.distance.value / 1000,
      durationMin: Math.ceil(element.duration.value / 60),
    };
  }

  isOutstation(distanceKm: number): boolean {
    return distanceKm > 30;
  }

  //Geo reverse code
  async getCityFromLatLng(lat: number, lng: number): Promise<string> {
    const response = await this.client.reverseGeocode({
      params: {
        latlng: { lat, lng },
        key: this.apiKey,
      },
    });

    const results = response.data.results;

    if (!results.length) {
      throw new BadRequestException('Unable to detect city');
    }

    // 1️. City (best case)
    for (const result of results) {
      const city = result.address_components.find(comp =>
        comp.types.includes(AddressType.locality),
      );
      if (city) return city.long_name;
    }

    // 2️. District (very common in India)
    for (const result of results) {
      const district = result.address_components.find(comp =>
        comp.types.includes(AddressType.administrative_area_level_2),
      );
      if (district) return district.long_name;
    }

    // 3️. State (extreme fallback)
    for (const result of results) {
      const state = result.address_components.find(comp =>
        comp.types.includes(AddressType.administrative_area_level_1),
      );
      if (state) return state.long_name;
    }

    throw new BadRequestException('City not found from coordinates');
  }

  haversineDistance(lat1, lng1, lat2, lng2): number {
    const R = 6371;
    const dLat = this.deg2rad(lat2 - lat1);
    const dLng = this.deg2rad(lng2 - lng1);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(this.deg2rad(lat1)) *
      Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLng / 2) ** 2;

    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  }

  deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

}
