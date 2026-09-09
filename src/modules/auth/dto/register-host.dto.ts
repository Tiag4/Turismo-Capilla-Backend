import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterHostDto {
  @ApiProperty({
    example: 'inv_8f4b1a2c3d4e5f6a',
    description: 'Token de invitación emitido por la Comisión de Turismo',
  })
  @IsString()
  @IsNotEmpty({ message: 'El token de invitación es obligatorio' })
  token: string;

  @ApiProperty({ example: 'cabanias.valle@gmail.com', description: 'Correo electrónico' })
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  @IsNotEmpty({ message: 'El correo electrónico es requerido' })
  email: string;

  @ApiProperty({ example: 'PasswordSegura123!', description: 'Contraseña de acceso', minLength: 6 })
  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  password: string;

  @ApiProperty({ example: 'Carlos', description: 'Nombre del prestador' })
  @IsString()
  @IsNotEmpty({ message: 'El nombre es requerido' })
  name: string;

  @ApiProperty({ example: 'Gómez', description: 'Apellido del prestador' })
  @IsString()
  @IsNotEmpty({ message: 'El apellido es requerido' })
  lastName: string;

  @ApiPropertyOptional({ example: '+543548123456', description: 'Teléfono de contacto' })
  @IsOptional()
  @IsString()
  phone?: string;
}
