import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { BookingStatus } from '@prisma/client';

export class FilterBookingsDto {
  @ApiPropertyOptional({
    enum: BookingStatus,
    description: 'Filtrar por estado de la reserva (PENDING, CONFIRMED, CANCELLED, COMPLETED)',
  })
  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;

  @ApiPropertyOptional({
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    description: 'Filtrar por alojamiento específico',
  })
  @IsOptional()
  @IsUUID()
  accommodationId?: string;

  @ApiPropertyOptional({
    example: 'CAP-2026',
    description: 'Buscar por código de reserva, nombre de huésped o email',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
