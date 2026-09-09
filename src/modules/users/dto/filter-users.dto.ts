import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Role } from '@prisma/client';

export class FilterUsersDto {
  @ApiPropertyOptional({
    enum: Role,
    description: 'Filtrar por rol de usuario (ADMIN, HOST, TOURIST)',
  })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @ApiPropertyOptional({
    example: 'gomez',
    description: 'Buscar por nombre, apellido o correo electrónico',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
