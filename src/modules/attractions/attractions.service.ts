import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateAttractionDto } from './dto/create-attraction.dto.js';
import { UpdateAttractionDto } from './dto/update-attraction.dto.js';
import { FilterAttractionsDto } from './dto/filter-attractions.dto.js';
import { AddAttractionImageDto } from './dto/add-attraction-image.dto.js';

@Injectable()
export class AttractionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters: FilterAttractionsDto) {
    const { category, search, difficulty, requiresGuide } = filters;

    const where: Prisma.AttractionWhereInput = {};

    if (category) {
      where.category = category;
    }

    if (difficulty) {
      where.difficulty = {
        contains: difficulty,
        mode: 'insensitive',
      };
    }

    if (typeof requiresGuide === 'boolean') {
      where.requiresGuide = requiresGuide;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.attraction.findMany({
      where,
      include: {
        images: true,
      },
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });
  }

  async findById(id: string) {
    const attraction = await this.prisma.attraction.findUnique({
      where: { id },
      include: {
        images: true,
      },
    });

    if (!attraction) {
      throw new NotFoundException(`Atractivo turístico con ID "${id}" no encontrado`);
    }

    return attraction;
  }

  async create(dto: CreateAttractionDto) {
    const { images, admissionFee, ...rest } = dto;

    return this.prisma.attraction.create({
      data: {
        ...rest,
        admissionFee: admissionFee !== undefined ? new Prisma.Decimal(admissionFee) : null,
        images: images && images.length > 0
          ? {
              create: images.map((img) => ({
                url: img.url,
                publicId: img.publicId,
              })),
            }
          : undefined,
      },
      include: {
        images: true,
      },
    });
  }

  async update(id: string, dto: UpdateAttractionDto) {
    await this.findById(id);

    const { images, admissionFee, ...rest } = dto;

    const data: Prisma.AttractionUpdateInput = {
      ...rest,
    };

    if (admissionFee !== undefined) {
      data.admissionFee = admissionFee !== null ? new Prisma.Decimal(admissionFee) : null;
    }

    if (images && images.length > 0) {
      data.images = {
        deleteMany: {},
        create: images.map((img) => ({
          url: img.url,
          publicId: img.publicId,
        })),
      };
    }

    return this.prisma.attraction.update({
      where: { id },
      data,
      include: {
        images: true,
      },
    });
  }

  async delete(id: string) {
    await this.findById(id);

    await this.prisma.attraction.delete({
      where: { id },
    });

    return { message: `Atractivo con ID "${id}" eliminado exitosamente` };
  }

  async addImage(attractionId: string, dto: AddAttractionImageDto) {
    await this.findById(attractionId);

    return this.prisma.attractionImage.create({
      data: {
        attractionId,
        url: dto.url,
        publicId: dto.publicId,
      },
    });
  }

  async deleteImage(attractionId: string, imageId: string) {
    await this.findById(attractionId);

    const image = await this.prisma.attractionImage.findFirst({
      where: {
        id: imageId,
        attractionId,
      },
    });

    if (!image) {
      throw new NotFoundException(`Imagen con ID "${imageId}" no encontrada para este atractivo`);
    }

    await this.prisma.attractionImage.delete({
      where: { id: imageId },
    });

    return { message: `Imagen con ID "${imageId}" eliminada exitosamente` };
  }
}
