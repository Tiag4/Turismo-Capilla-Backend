import { Module } from '@nestjs/common';
import { AttractionsController } from './attractions.controller.js';
import { AttractionsService } from './attractions.service.js';
import { PrismaModule } from '../../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [AttractionsController],
  providers: [AttractionsService],
  exports: [AttractionsService],
})
export class AttractionsModule {}
