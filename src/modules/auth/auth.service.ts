import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';
import bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service.js';
import { InvitationsService } from '../invitations/invitations.service.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterTouristDto } from './dto/register-tourist.dto.js';
import { RegisterHostDto } from './dto/register-host.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private invitationsService: InvitationsService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (!user) {
      throw new UnauthorizedException('Correo electrónico o contraseña incorrectos');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Correo electrónico o contraseña incorrectos');
    }

    return this.generateAuthResponse(user);
  }

  async registerTourist(dto: RegisterTouristDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existing) {
      throw new BadRequestException('El correo electrónico ya se encuentra registrado');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        password: hashedPassword,
        name: dto.name,
        lastName: dto.lastName,
        phone: dto.phone,
        role: Role.TOURIST,
      },
    });

    return this.generateAuthResponse(user);
  }

  async registerHost(dto: RegisterHostDto) {
    // 1. Validar el token de invitación
    const tokenInfo = await this.invitationsService.validateToken(dto.token);

    if (tokenInfo.email !== dto.email.toLowerCase()) {
      throw new BadRequestException(
        `El token de invitación fue emitido para ${tokenInfo.email}, no para ${dto.email}`,
      );
    }

    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existing) {
      throw new BadRequestException('El correo electrónico ya se encuentra registrado');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // 2. Transacción: marcar token como usado y crear el usuario HOST
    const user = await this.prisma.$transaction(async (tx) => {
      await tx.invitationToken.update({
        where: { token: dto.token },
        data: { usedAt: new Date() },
      });

      return tx.user.create({
        data: {
          email: dto.email.toLowerCase(),
          password: hashedPassword,
          name: dto.name,
          lastName: dto.lastName,
          phone: dto.phone,
          role: Role.HOST,
        },
      });
    });

    return this.generateAuthResponse(user);
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        lastName: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    return user;
  }

  private generateAuthResponse(user: {
    id: string;
    email: string;
    role: Role;
    name: string;
    lastName: string;
  }) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }
}
