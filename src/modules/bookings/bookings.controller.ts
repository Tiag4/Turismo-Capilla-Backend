import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { BookingsService } from './bookings.service.js';
import { CreateBookingDto } from './dto/create-booking.dto.js';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto.js';
import { FilterBookingsDto } from './dto/filter-bookings.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { OptionalJwtAuthGuard } from '../../common/guards/optional-jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';

@ApiTags('Reservas y Motor de Disponibilidad')
@Controller('api/v1/bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({
    summary: 'Solicitar una nueva reserva (Público / Turista)',
    description: 'Valida atómicamente la disponibilidad de fechas para prevenir overbooking. Si el usuario está autenticado, vincula la reserva a su cuenta.',
  })
  @ApiResponse({ status: 201, description: 'Reserva creada exitosamente en estado PENDING' })
  @ApiResponse({ status: 400, description: 'Fechas o capacidad inválidas' })
  @ApiResponse({ status: 404, description: 'Alojamiento no encontrado o inactivo' })
  @ApiResponse({ status: 409, description: 'Conflicto de fechas: Alojamiento ya reservado para ese período' })
  async create(
    @Body() dto: CreateBookingDto,
    @CurrentUser('id') touristId?: string,
  ) {
    return this.bookingsService.create(dto, touristId);
  }

  @Get('my-bookings')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.HOST, Role.ADMIN)
  @ApiOperation({
    summary: 'Listar reservas recibidas para los alojamientos del prestador (HOST / ADMIN)',
    description: 'Permite al prestador auditar reservas pendientes, confirmadas o canceladas.',
  })
  @ApiResponse({ status: 200, description: 'Lista de reservas recibidas' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Requiere rol HOST o ADMIN' })
  async findByHost(
    @CurrentUser('id') hostId: string,
    @Query() filters: FilterBookingsDto,
  ) {
    return this.bookingsService.findByHost(hostId, filters);
  }

  @Get('tourist-bookings')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TOURIST, Role.ADMIN)
  @ApiOperation({
    summary: 'Listar reservas efectuadas por el turista autenticado (TOURIST)',
  })
  @ApiResponse({ status: 200, description: 'Lista de reservas del turista' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  async findByTourist(@CurrentUser('id') touristId: string) {
    return this.bookingsService.findByTourist(touristId);
  }

  @Get('lookup')
  @ApiOperation({
    summary: 'Consultar estado de reserva por código y correo (Público)',
    description: 'Permite a cualquier huésped verificar el estado de su reserva utilizando su código único y su email.',
  })
  @ApiQuery({ name: 'code', example: 'CAP-2026-4821', description: 'Código único de reserva' })
  @ApiQuery({ name: 'email', example: 'lucia.turista@gmail.com', description: 'Correo del huésped titular' })
  @ApiResponse({ status: 200, description: 'Detalle de la reserva' })
  @ApiResponse({ status: 404, description: 'Reserva no encontrada' })
  async lookupByCode(
    @Query('code') code: string,
    @Query('email') email: string,
  ) {
    return this.bookingsService.lookupByCode(code, email);
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Consultar detalle de una reserva por ID (Titular / Dueño / ADMIN)',
  })
  @ApiParam({ name: 'id', description: 'UUID de la reserva' })
  @ApiResponse({ status: 200, description: 'Detalle de la reserva' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No tiene permisos para ver esta reserva' })
  @ApiResponse({ status: 404, description: 'Reserva no encontrada' })
  async findById(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; role: Role; email: string },
  ) {
    return this.bookingsService.findById(id, user.id, user.role, user.email);
  }

  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.HOST, Role.ADMIN)
  @ApiOperation({
    summary: 'Confirmar, cancelar o completar una reserva (Dueño HOST / ADMIN)',
    description: 'El prestador dueño del establecimiento aprueba o rechaza la solicitud de reserva.',
  })
  @ApiParam({ name: 'id', description: 'UUID de la reserva' })
  @ApiResponse({ status: 200, description: 'Estado actualizado correctamente' })
  @ApiResponse({ status: 400, description: 'Transición de estado inválida' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No tiene permisos sobre este establecimiento' })
  @ApiResponse({ status: 404, description: 'Reserva no encontrada' })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateBookingStatusDto,
    @CurrentUser() user: { id: string; role: Role },
  ) {
    return this.bookingsService.updateStatus(id, dto.status, user.id, user.role);
  }
}
