import { Module } from '@nestjs/common';
import { AccommodationsController } from './accommodations.controller.js';
import { AccommodationsService } from './accommodations.service.js';
import { PrismaModule } from '../../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [AccommodationsController],
  providers: [AccommodationsService],
  exports: [AccommodationsService],
})
export class AccommodationsModule {}
