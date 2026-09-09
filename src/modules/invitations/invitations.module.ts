import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { InvitationsService } from './invitations.service.js';
import { InvitationsController } from './invitations.controller.js';

@Module({
  imports: [PassportModule],
  controllers: [InvitationsController],
  providers: [InvitationsService],
  exports: [InvitationsService],
})
export class InvitationsModule {}
