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
import { AttractionsService } from './attractions.service.js';
import { CreateAttractionDto } from './dto/create-attraction.dto.js';
import { UpdateAttractionDto } from './dto/update-attraction.dto.js';
import { FilterAttractionsDto } from './dto/filter-attractions.dto.js';
import { AddAttractionImageDto } from './dto/add-attraction-image.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';

@ApiTags('Atractivos y Paseos Turísticos')
@Controller('api/v1/attractions')
export class AttractionsController {
  constructor(private readonly attractionsService: AttractionsService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar atractivos y paseos turísticos con filtros opcionales (Público)',
    description: 'Permite a los turistas consultar paseos categorizados, con filtro por dificultad, texto o requisito de guía.',
  })
  @ApiResponse({ status: 200, description: 'Lista de atractivos obtenida correctamente' })
  async findAll(@Query() filters: FilterAttractionsDto) {
    return this.attractionsService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Consultar la ficha técnica completa de un atractivo turístico (Público)',
    description: 'Retorna detalles de dificultad, duración estimada, cómo llegar, tarifas y galería de imágenes.',
  })
  @ApiParam({ name: 'id', description: 'UUID del atractivo turístico' })
  @ApiResponse({ status: 200, description: 'Detalle del atractivo encontrado' })
  @ApiResponse({ status: 404, description: 'Atractivo turístico no encontrado' })
  async findById(@Param('id') id: string) {
    return this.attractionsService.findById(id);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Crear un nuevo paseo o atractivo turístico (Solo Comisión / Admin)',
    description: 'Permite a la Comisión de Turismo publicar nuevos atractivos en el portal oficial.',
  })
  @ApiResponse({ status: 201, description: 'Atractivo creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 401, description: 'No autenticado (falta token Bearer)' })
  @ApiResponse({ status: 403, description: 'Requiere rol ADMIN (Comisión de Turismo)' })
  async create(@Body() dto: CreateAttractionDto) {
    return this.attractionsService.create(dto);
  }

  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Actualizar datos de un atractivo turístico (Solo Comisión / Admin)',
  })
  @ApiParam({ name: 'id', description: 'UUID del atractivo a modificar' })
  @ApiResponse({ status: 200, description: 'Atractivo actualizado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Requiere rol ADMIN' })
  @ApiResponse({ status: 404, description: 'Atractivo no encontrado' })
  async update(@Param('id') id: string, @Body() dto: UpdateAttractionDto) {
    return this.attractionsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Eliminar un atractivo turístico (Solo Comisión / Admin)',
  })
  @ApiParam({ name: 'id', description: 'UUID del atractivo a eliminar' })
  @ApiResponse({ status: 200, description: 'Atractivo eliminado exitosamente' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Requiere rol ADMIN' })
  @ApiResponse({ status: 404, description: 'Atractivo no encontrado' })
  async delete(@Param('id') id: string) {
    return this.attractionsService.delete(id);
  }

  @Post(':id/images')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Vincular una imagen a la galería de un atractivo (Solo Comisión / Admin)',
  })
  @ApiParam({ name: 'id', description: 'UUID del atractivo' })
  @ApiResponse({ status: 201, description: 'Imagen vinculada exitosamente' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Requiere rol ADMIN' })
  @ApiResponse({ status: 404, description: 'Atractivo no encontrado' })
  async addImage(
    @Param('id') id: string,
    @Body() dto: AddAttractionImageDto,
  ) {
    return this.attractionsService.addImage(id, dto);
  }

  @Delete(':id/images/:imageId')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Eliminar una imagen de la galería de un atractivo (Solo Comisión / Admin)',
  })
  @ApiParam({ name: 'id', description: 'UUID del atractivo' })
  @ApiParam({ name: 'imageId', description: 'UUID de la imagen a remover' })
  @ApiResponse({ status: 200, description: 'Imagen eliminada exitosamente' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Requiere rol ADMIN' })
  @ApiResponse({ status: 404, description: 'Atractivo o imagen no encontrada' })
  async deleteImage(
    @Param('id') id: string,
    @Param('imageId') imageId: string,
  ) {
    return this.attractionsService.deleteImage(id, imageId);
  }
}
