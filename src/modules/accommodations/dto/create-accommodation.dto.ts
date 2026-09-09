import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsNumber,
  Min,
  Max,
  MaxLength,
  IsArray,
  IsUrl,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AccommodationType } from '@prisma/client';

export class AccommodationImageInputDto {
  @ApiProperty({
    example: 'https://res.cloudinary.com/turismo-capilla/image/upload/v1/cabana-los-nogales.jpg',
    description: 'URL de la imagen del alojamiento',
  })
  @IsString()
  @IsUrl()
  @IsNotEmpty()
  url!: string;

  @ApiProperty({
    example: 'accommodations/cabana_01',
    description: 'Identificador público del archivo (ej. Cloudinary publicId)',
  })
  @IsString()
  @IsNotEmpty()
  publicId!: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Indica si es la imagen de portada principal',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isMain?: boolean;
}

export class CreateAccommodationDto {
  @ApiProperty({
    example: 'Cabañas Los Nogales',
    description: 'Nombre del establecimiento o cabaña',
    maxLength: 120,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string;

  @ApiProperty({
    example: 'Hermosa cabaña serrana con vista al Uritorco, parque arbolado, pileta y asador individual.',
    description: 'Descripción detallada de comodidades y servicios',
  })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({
    enum: AccommodationType,
    example: AccommodationType.CABIN,
    description: 'Tipo de alojamiento (CABIN, HOTEL, APARTMENT, HOSTEL, CAMPING)',
  })
  @IsEnum(AccommodationType)
  type!: AccommodationType;

  @ApiProperty({
    example: 'Av. Las Gemelas 450',
    description: 'Dirección física del alojamiento',
  })
  @IsString()
  @IsNotEmpty()
  address!: string;

  @ApiPropertyOptional({
    example: 'Capilla del Monte',
    description: 'Localidad',
    default: 'Capilla del Monte',
  })
  @IsOptional()
  @IsString()
  locality?: string;

  @ApiPropertyOptional({
    example: -30.8521,
    description: 'Latitud geográfica',
  })
  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  @Type(() => Number)
  latitude?: number;

  @ApiPropertyOptional({
    example: -64.5218,
    description: 'Longitud geográfica',
  })
  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  @Type(() => Number)
  longitude?: number;

  @ApiProperty({
    example: 45000.0,
    description: 'Tarifa por noche en pesos argentinos (ARS)',
  })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  pricePerNight!: number;

  @ApiProperty({
    example: 4,
    description: 'Capacidad máxima de huéspedes admitidos',
  })
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  maxGuests!: number;

  @ApiPropertyOptional({
    example: ['Pileta', 'Wi-Fi', 'Asador', 'Cochera cubierta', 'Aire acondicionado'],
    description: 'Lista de servicios y amenidades',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  amenities?: string[];

  @ApiPropertyOptional({
    type: [AccommodationImageInputDto],
    description: 'Galería inicial de fotos del alojamiento',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AccommodationImageInputDto)
  images?: AccommodationImageInputDto[];
}
