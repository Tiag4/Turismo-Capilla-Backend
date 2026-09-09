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
  ValidateNested,
  IsArray,
  IsUrl,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AttractionCategory } from '@prisma/client';

export class AttractionImageDto {
  @ApiProperty({
    example: 'https://res.cloudinary.com/turismo-capilla/image/upload/v1/uritorco.jpg',
    description: 'URL de la fotografía en almacenamiento en la nube',
  })
  @IsString()
  @IsUrl()
  @IsNotEmpty()
  url!: string;

  @ApiProperty({
    example: 'attractions/uritorco_01',
    description: 'Identificador público del archivo (ej. Cloudinary publicId)',
  })
  @IsString()
  @IsNotEmpty()
  publicId!: string;
}

export class CreateAttractionDto {
  @ApiProperty({
    example: 'Cerro Uritorco',
    description: 'Nombre del atractivo o paseo turístico',
    maxLength: 120,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string;

  @ApiProperty({
    example: 'El pico más alto de las Sierras Chicas con 1979 msnm. Famoso por sus senderos, leyendas y vistas panorámicas.',
    description: 'Descripción detallada del atractivo',
  })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({
    enum: AttractionCategory,
    example: AttractionCategory.HILL,
    description: 'Categoría turística del paseo (HILL, RIVER_BEACH, CULTURAL, NIGHT, NATURE_TRAIL)',
  })
  @IsEnum(AttractionCategory)
  category!: AttractionCategory;

  @ApiPropertyOptional({
    example: 'Alta',
    description: 'Nivel de dificultad física (Baja, Media, Alta)',
  })
  @IsOptional()
  @IsString()
  difficulty?: string;

  @ApiPropertyOptional({
    example: '6 a 8 horas',
    description: 'Tiempo estimado requerido para realizar el paseo o ascenso',
  })
  @IsOptional()
  @IsString()
  estimatedDuration?: string;

  @ApiPropertyOptional({
    example: 'Acceso por la base del cerro, a 3 km del centro de Capilla del Monte cruzando el río Calabalumba.',
    description: 'Instrucciones sobre cómo llegar',
  })
  @IsOptional()
  @IsString()
  howToGet?: string;

  @ApiPropertyOptional({
    example: false,
    description: 'Indica si se requiere contratación obligatoria de guía habilitado',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  requiresGuide?: boolean;

  @ApiPropertyOptional({
    example: 15000.0,
    description: 'Tarifa de ingreso o derecho de ascenso en ARS (si aplica)',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  admissionFee?: number;

  @ApiPropertyOptional({
    example: -30.8492,
    description: 'Latitud geográfica para geolocalización',
  })
  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  @Type(() => Number)
  latitude?: number;

  @ApiPropertyOptional({
    example: -64.4789,
    description: 'Longitud geográfica para geolocalización',
  })
  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  @Type(() => Number)
  longitude?: number;

  @ApiPropertyOptional({
    type: [AttractionImageDto],
    description: 'Galería inicial de imágenes del atractivo',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttractionImageDto)
  images?: AttractionImageDto[];
}
