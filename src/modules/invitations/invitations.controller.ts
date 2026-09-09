import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { InvitationsService } from './invitations.service.js';
import { CreateInvitationDto } from './dto/create-invitation.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';

@ApiTags('Invitaciones (Comisión de Turismo)')
@Controller('api/v1/invitations')
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Generar token de invitación para un nuevo prestador adherido (Solo Admin)' })
  @ApiResponse({ status: 201, description: 'Invitación creada exitosamente' })
  @ApiResponse({ status: 400, description: 'Usuario ya existente o datos inválidos' })
  @ApiResponse({ status: 403, description: 'Requiere rol de Administrador (Comisión de Turismo)' })
  async createInvitation(
    @Body() dto: CreateInvitationDto,
    @CurrentUser('id') adminId: string,
  ) {
    return this.invitationsService.createInvitation(dto, adminId);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Listar todas las invitaciones emitidas y su estado (Solo Admin)' })
  async listInvitations() {
    return this.invitationsService.listInvitations();
  }

  @Get('validate/:token')
  @ApiOperation({ summary: 'Validar si un token de invitación es legítimo y está activo (Público)' })
  @ApiResponse({ status: 200, description: 'Token válido' })
  @ApiResponse({ status: 400, description: 'Token expirado o ya utilizado' })
  @ApiResponse({ status: 404, description: 'Token inexistente' })
  async validateToken(@Param('token') token: string) {
    return this.invitationsService.validateToken(token);
  }
}
