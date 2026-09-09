import { PartialType } from '@nestjs/swagger';
import { CreateAttractionDto } from './create-attraction.dto.js';

export class UpdateAttractionDto extends PartialType(CreateAttractionDto) {}
