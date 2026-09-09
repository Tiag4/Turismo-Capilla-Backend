import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateAccommodationDto } from './create-accommodation.dto.js';

export class UpdateAccommodationDto extends PartialType(CreateAccommodationDto) {
  @ApiPropertyOptional({
    example: true,
    description: 'Estado de publicación (activo/inactivo)',
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
