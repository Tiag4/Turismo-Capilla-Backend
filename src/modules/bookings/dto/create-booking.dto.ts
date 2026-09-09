import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsDateString,
  IsNumber,
  Min,
  IsEmail,
  IsOptional,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBookingDto {
  @ApiProperty({
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    description: 'UUID del alojamiento a reservar',
  })
  @IsUUID()
  @IsNotEmpty()
  accommodationId!: string;

  @ApiProperty({
    example: '2026-10-10',
    description: 'Fecha de ingreso (Check-In) en formato AAAA-MM-DD',
  })
  @IsDateString()
  @IsNotEmpty()
  checkIn!: string;

  @ApiProperty({
    example: '2026-10-15',
    description: 'Fecha de egreso (Check-Out) en formato AAAA-MM-DD',
  })
  @IsDateString()
  @IsNotEmpty()
  checkOut!: string;

  @ApiProperty({
    example: 3,
    description: 'Cantidad de personas / huéspedes para la estadía',
  })
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  guestCount!: number;

  @ApiProperty({
    example: 'Lucía',
    description: 'Nombre y apellido del huésped titular',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  guestName!: string;

  @ApiProperty({
    example: 'lucia.turista@gmail.com',
    description: 'Correo electrónico de contacto para la confirmación de la reserva',
  })
  @IsEmail()
  @IsNotEmpty()
  guestEmail!: string;

  @ApiProperty({
    example: '+54 11 9876-5432',
    description: 'Teléfono o WhatsApp de contacto',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  guestPhone!: string;

  @ApiPropertyOptional({
    example: 'Rosario, Santa Fe',
    description: 'Ciudad o provincia de origen de los huéspedes',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  guestOrigin?: string;

  @ApiPropertyOptional({
    example: 'Viajamos con una mascota pequeña y estimamos llegar a las 16 hs.',
    description: 'Notas o pedidos especiales para el prestador',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
