import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class AddAccommodationImageDto {
  @ApiProperty({
    example: 'https://res.cloudinary.com/turismo-capilla/image/upload/v1/cabana-interior.jpg',
    description: 'URL de la imagen alojada en CDN',
  })
  @IsString()
  @IsUrl()
  @IsNotEmpty()
  url!: string;

  @ApiProperty({
    example: 'accommodations/cabana_02',
    description: 'Identificador público del archivo (ej. Cloudinary publicId)',
  })
  @IsString()
  @IsNotEmpty()
  publicId!: string;

  @ApiPropertyOptional({
    example: false,
    description: 'Indica si se define como imagen principal/portada',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isMain?: boolean;
}
