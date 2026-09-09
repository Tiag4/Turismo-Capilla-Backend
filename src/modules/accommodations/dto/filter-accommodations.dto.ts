import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsNumber,
  IsDateString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AccommodationType } from '@prisma/client';

export class FilterAccommodationsDto {
  @ApiPropertyOptional({
    enum: AccommodationType,
    description: 'Filtrar por tipo de alojamiento (CABIN, HOTEL, APARTMENT, HOSTEL, CAMPING)',
  })
  @IsOptional()
  @IsEnum(AccommodationType)
  type?: AccommodationType;

  @ApiPropertyOptional({
    example: 2,
    description: 'Cantidad mínima de huéspedes que debe admitir el alojamiento',
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  guests?: number;

  @ApiPropertyOptional({
    example: 20000,
    description: 'Precio mínimo por noche en ARS',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  minPrice?: number;

  @ApiPropertyOptional({
    example: 80000,
    description: 'Precio máximo por noche en ARS',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  maxPrice?: number;

  @ApiPropertyOptional({
    example: '2026-10-10',
    description: 'Fecha deseada de ingreso (Check-In) en formato AAAA-MM-DD',
  })
  @IsOptional()
  @IsDateString()
  checkIn?: string;

  @ApiPropertyOptional({
    example: '2026-10-15',
    description: 'Fecha deseada de egreso (Check-Out) en formato AAAA-MM-DD',
  })
  @IsOptional()
  @IsDateString()
  checkOut?: string;

  @ApiPropertyOptional({
    example: 'nogales',
    description: 'Búsqueda por texto libre en el nombre o descripción',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    example: 'Pileta',
    description: 'Filtrar por amenidad requerida (ej. Pileta, Wi-Fi, Asador)',
  })
  @IsOptional()
  @IsString()
  amenity?: string;
}
