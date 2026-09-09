import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class AddAttractionImageDto {
  @ApiProperty({
    example: 'https://res.cloudinary.com/turismo-capilla/image/upload/v1/uritorco-cima.jpg',
    description: 'URL de la imagen alojada en CDN',
  })
  @IsString()
  @IsUrl()
  @IsNotEmpty()
  url!: string;

  @ApiProperty({
    example: 'attractions/uritorco_02',
    description: 'Identificador público del archivo (ej. Cloudinary publicId)',
  })
  @IsString()
  @IsNotEmpty()
  publicId!: string;
}
