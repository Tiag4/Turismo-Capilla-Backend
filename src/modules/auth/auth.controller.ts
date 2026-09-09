import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterTouristDto } from './dto/register-tourist.dto.js';
import { RegisterHostDto } from './dto/register-host.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';

@ApiTags('Autenticación y Cuentas')
@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Iniciar sesión (Email y Contraseña) y obtener token JWT' })
  @ApiResponse({ status: 200, description: 'Sesión iniciada con éxito, retorna accessToken y datos de usuario' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('register-tourist')
  @ApiOperation({ summary: 'Registro público de turista' })
  @ApiResponse({ status: 201, description: 'Turista registrado exitosamente' })
  @ApiResponse({ status: 400, description: 'Email ya en uso o datos inválidos' })
  async registerTourist(@Body() dto: RegisterTouristDto) {
    return this.authService.registerTourist(dto);
  }

  @Post('register-host')
  @ApiOperation({ summary: 'Registro de Cabañero/Prestador restringido por Token de Invitación' })
  @ApiResponse({ status: 201, description: 'Prestador adherido registrado exitosamente' })
  @ApiResponse({ status: 400, description: 'Token de invitación inválido, expirado, ya usado o email no coincidente' })
  async registerHost(@Body() dto: RegisterHostDto) {
    return this.authService.registerHost(dto);
  }

  @Get('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Obtener datos del perfil del usuario actualmente autenticado' })
  @ApiResponse({ status: 200, description: 'Datos del perfil' })
  @ApiResponse({ status: 401, description: 'Token inválido o no provisto' })
  async getMe(@CurrentUser('id') userId: string) {
    return this.authService.getMe(userId);
  }
}
