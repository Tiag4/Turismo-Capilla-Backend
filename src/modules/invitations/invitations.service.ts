import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateInvitationDto } from './dto/create-invitation.dto.js';

@Injectable()
export class InvitationsService {
  constructor(private prisma: PrismaService) {}

  async createInvitation(dto: CreateInvitationDto, adminId: string) {
    // Verificar si ya existe un usuario registrado con ese email
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existingUser) {
      throw new BadRequestException('Ya existe un usuario registrado con este correo electrónico');
    }

    // Generar token único con prefijo
    const token = `inv_${randomBytes(16).toString('hex')}`;
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 días de validez

    const invitation = await this.prisma.invitationToken.create({
      data: {
        token,
        email: dto.email.toLowerCase(),
        expiresAt,
        createdById: adminId,
      },
      select: {
        id: true,
        token: true,
        email: true,
        expiresAt: true,
        createdAt: true,
      },
    });

    return {
      message: 'Invitación generada exitosamente para el prestador',
      invitation,
    };
  }

  async validateToken(token: string) {
    const invitation = await this.prisma.invitationToken.findUnique({
      where: { token },
    });

    if (!invitation) {
      throw new NotFoundException('El token de invitación no existe');
    }

    if (invitation.usedAt) {
      throw new BadRequestException('El token de invitación ya fue utilizado previamente');
    }

    if (invitation.expiresAt < new Date()) {
      throw new BadRequestException('El token de invitación ha expirado');
    }

    return {
      valid: true,
      email: invitation.email,
      expiresAt: invitation.expiresAt,
    };
  }

  async listInvitations() {
    return this.prisma.invitationToken.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: {
          select: { id: true, name: true, lastName: true, email: true },
        },
      },
    });
  }
}
