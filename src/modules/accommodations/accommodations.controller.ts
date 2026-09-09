import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { AccommodationsService } from './accommodations.service.js';
import { CreateAccommodationDto } from './dto/create-accommodation.dto.js';
import { UpdateAccommodationDto } from './dto/update-accommodation.dto.js';
import { FilterAccommodationsDto } from './dto/filter-accommodations.dto.js';
import { AddAccommodationImageDto } from './dto/add-accommodation-image.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';

@ApiTags('Alojamientos y Hospedajes')
@Controller('api/v1/accommodations')
export class AccommodationsController {
  constructor(private readonly accommodationsService: AccommodationsService) {}

  @Get()
  @ApiOperation({
    summary: 'Catálogo público de alojamientos con filtros (Público)',
    description: 'Permite buscar alojamientos por fechas (anti-overbooking), cantidad de huéspedes, tipo, amenidades y rango de precio.',
  })
  @ApiResponse({ status: 200, description: 'Catálogo de alojamientos disponibles' })
  @ApiResponse({ status: 400, description: 'Parámetros de búsqueda o fechas inválidas' })
  async findAll(@Query() filters: FilterAccommodationsDto) {
    return this.accommodationsService.findAll(filters);
  }

  @Get('my-accommodations')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.HOST, Role.ADMIN)
  @ApiOperation({
    summary: 'Listar los alojamientos del prestador autenticado (HOST / ADMIN)',
    description: 'Devuelve todos los establecimientos pertenecientes al usuario logueado con métricas y fotos.',
  })
  @ApiResponse({ status: 200, description: 'Lista de alojamientos propios del prestador' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Requiere rol HOST o ADMIN' })
  async findMyAccommodations(@CurrentUser('id') hostId: string) {
    return this.accommodationsService.findByHost(hostId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Ficha técnica y detalle completo de un alojamiento (Público)',
    description: 'Retorna fotos en alta calidad, precio por noche, servicios, ubicación y contacto del prestador.',
  })
  @ApiParam({ name: 'id', description: 'UUID del alojamiento' })
  @ApiResponse({ status: 200, description: 'Detalle del alojamiento' })
  @ApiResponse({ status: 404, description: 'Alojamiento no encontrado' })
  async findById(@Param('id') id: string) {
    return this.accommodationsService.findById(id);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.HOST, Role.ADMIN)
  @ApiOperation({
    summary: 'Publicar un nuevo alojamiento (HOST / ADMIN)',
    description: 'Permite al prestador adherido registrar una nueva cabaña, hotel o departamento con sus amenidades y tarifas.',
  })
  @ApiResponse({ status: 201, description: 'Alojamiento registrado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Requiere rol HOST o ADMIN' })
  async create(
    @Body() dto: CreateAccommodationDto,
    @CurrentUser('id') hostId: string,
  ) {
    return this.accommodationsService.create(dto, hostId);
  }

  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.HOST, Role.ADMIN)
  @ApiOperation({
    summary: 'Modificar datos de un alojamiento (Dueño HOST / ADMIN)',
  })
  @ApiParam({ name: 'id', description: 'UUID del alojamiento a editar' })
  @ApiResponse({ status: 200, description: 'Alojamiento actualizado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No tiene permisos para modificar este alojamiento ajeno' })
  @ApiResponse({ status: 404, description: 'Alojamiento no encontrado' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateAccommodationDto,
    @CurrentUser() user: { id: string; role: Role },
  ) {
    return this.accommodationsService.update(id, dto, user.id, user.role);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.HOST, Role.ADMIN)
  @ApiOperation({
    summary: 'Eliminar un alojamiento (Dueño HOST / ADMIN)',
  })
  @ApiParam({ name: 'id', description: 'UUID del alojamiento a eliminar' })
  @ApiResponse({ status: 200, description: 'Alojamiento eliminado exitosamente' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No tiene permisos para eliminar este alojamiento ajeno' })
  @ApiResponse({ status: 404, description: 'Alojamiento no encontrado' })
  async delete(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; role: Role },
  ) {
    return this.accommodationsService.delete(id, user.id, user.role);
  }

  @Post(':id/images')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.HOST, Role.ADMIN)
  @ApiOperation({
    summary: 'Agregar una fotografía a la galería del alojamiento (Dueño HOST / ADMIN)',
  })
  @ApiParam({ name: 'id', description: 'UUID del alojamiento' })
  @ApiResponse({ status: 201, description: 'Imagen añadida exitosamente' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No tiene permisos sobre este alojamiento' })
  @ApiResponse({ status: 404, description: 'Alojamiento no encontrado' })
  async addImage(
    @Param('id') id: string,
    @Body() dto: AddAccommodationImageDto,
    @CurrentUser() user: { id: string; role: Role },
  ) {
    return this.accommodationsService.addImage(id, dto, user.id, user.role);
  }

  @Delete(':id/images/:imageId')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.HOST, Role.ADMIN)
  @ApiOperation({
    summary: 'Eliminar una fotografía de la galería del alojamiento (Dueño HOST / ADMIN)',
  })
  @ApiParam({ name: 'id', description: 'UUID del alojamiento' })
  @ApiParam({ name: 'imageId', description: 'UUID de la imagen' })
  @ApiResponse({ status: 200, description: 'Imagen eliminada exitosamente' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No tiene permisos sobre este alojamiento' })
  @ApiResponse({ status: 404, description: 'Alojamiento o imagen no encontrada' })
  async deleteImage(
    @Param('id') id: string,
    @Param('imageId') imageId: string,
    @CurrentUser() user: { id: string; role: Role },
  ) {
    return this.accommodationsService.deleteImage(id, imageId, user.id, user.role);
  }
}
