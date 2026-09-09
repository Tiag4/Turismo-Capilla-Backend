import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
import { AttractionCategory } from '@prisma/client';

export class FilterAttractionsDto {
  @ApiPropertyOptional({
    enum: AttractionCategory,
    description: 'Filtrar por categoría turística',
  })
  @IsOptional()
  @IsEnum(AttractionCategory)
  category?: AttractionCategory;

  @ApiPropertyOptional({
    example: 'uritorco',
    description: 'Búsqueda por texto libre en el nombre o descripción',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    example: 'Alta',
    description: 'Filtrar por nivel de dificultad',
  })
  @IsOptional()
  @IsString()
  difficulty?: string;

  @ApiPropertyOptional({
    example: false,
    description: 'Filtrar según si requiere guía obligatorio o no',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  requiresGuide?: boolean;
}
