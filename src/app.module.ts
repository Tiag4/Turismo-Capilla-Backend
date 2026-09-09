import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { InvitationsModule } from './modules/invitations/invitations.module.js';
import { AttractionsModule } from './modules/attractions/attractions.module.js';
import { AccommodationsModule } from './modules/accommodations/accommodations.module.js';
import { BookingsModule } from './modules/bookings/bookings.module.js';
import { HealthModule } from './modules/health/health.module.js';
import { UsersModule } from './modules/users/users.module.js';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    InvitationsModule,
    AttractionsModule,
    AccommodationsModule,
    BookingsModule,
    HealthModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
