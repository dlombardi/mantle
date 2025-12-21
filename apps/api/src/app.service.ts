import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getRoot(): { message: string; version: string } {
    return {
      message: 'Mantle API - Reasoning Substrate',
      version: '0.1.0',
    };
  }
}
