import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { RegisterTouristDto } from './register-tourist.dto.js';

export class RegisterHostDto extends RegisterTouristDto {
  @ApiProperty({
    example: 'inv_8f4b1a2c3d4e5f6a',
    description: 'Token de invitación emitido por la Comisión de Turismo',
  })
  @IsString()
  @IsNotEmpty({ message: 'El token de invitación es obligatorio' })
  token!: string;
}
