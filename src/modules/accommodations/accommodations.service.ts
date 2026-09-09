import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma, Role, BookingStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateAccommodationDto } from './dto/create-accommodation.dto.js';
import { UpdateAccommodationDto } from './dto/update-accommodation.dto.js';
import { FilterAccommodationsDto } from './dto/filter-accommodations.dto.js';
import { AddAccommodationImageDto } from './dto/add-accommodation-image.dto.js';

@Injectable()
export class AccommodationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters: FilterAccommodationsDto) {
    const {
      type,
      guests,
      minPrice,
      maxPrice,
      checkIn,
      checkOut,
      search,
      amenity,
    } = filters;

    const where: Prisma.AccommodationWhereInput = {
      isActive: true,
    };

    if (type) {
      where.type = type;
    }

    if (guests) {
      where.maxGuests = {
        gte: guests,
      };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.pricePerNight = {};
      if (minPrice !== undefined) {
        where.pricePerNight.gte = new Prisma.Decimal(minPrice);
      }
      if (maxPrice !== undefined) {
        where.pricePerNight.lte = new Prisma.Decimal(maxPrice);
      }
    }

    if (amenity) {
      where.amenities = {
        has: amenity,
      };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Availability validation by dates (Anti-Overbooking query)
    if (checkIn || checkOut) {
      if (!checkIn || !checkOut) {
        throw new BadRequestException('Debe proporcionar ambas fechas: checkIn y checkOut para filtrar por disponibilidad');
      }

      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);

      if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
        throw new BadRequestException('Formato de fecha inválido. Utilice formato AAAA-MM-DD');
      }

      if (checkInDate >= checkOutDate) {
        throw new BadRequestException('La fecha de check-out debe ser posterior a la fecha de check-in');
      }

      // Exclude accommodations that have overlapping bookings
      // Collision condition: existing.checkIn < requested.checkOut AND existing.checkOut > requested.checkIn
      where.bookings = {
        none: {
          status: { in: [BookingStatus.CONFIRMED, BookingStatus.PENDING] },
          checkIn: { lt: checkOutDate },
          checkOut: { gt: checkInDate },
        },
      };
    }

    return this.prisma.accommodation.findMany({
      where,
      include: {
        images: {
          orderBy: { isMain: 'desc' },
        },
        host: {
          select: {
            id: true,
            name: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: { pricePerNight: 'asc' },
    });
  }

  async findById(id: string) {
    const accommodation = await this.prisma.accommodation.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: { isMain: 'desc' },
        },
        host: {
          select: {
            id: true,
            name: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!accommodation) {
      throw new NotFoundException(`Alojamiento con ID "${id}" no encontrado`);
    }

    return accommodation;
  }

  async findByHost(hostId: string) {
    return this.prisma.accommodation.findMany({
      where: { hostId },
      include: {
        images: {
          orderBy: { isMain: 'desc' },
        },
        _count: {
          select: { bookings: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(dto: CreateAccommodationDto, hostId: string) {
    const { images, pricePerNight, ...rest } = dto;

    return this.prisma.accommodation.create({
      data: {
        ...rest,
        hostId,
        pricePerNight: new Prisma.Decimal(pricePerNight),
        images: images && images.length > 0
          ? {
              create: images.map((img, index) => ({
                url: img.url,
                publicId: img.publicId,
                isMain: img.isMain ?? index === 0,
              })),
            }
          : undefined,
      },
      include: {
        images: true,
      },
    });
  }

  async update(
    id: string,
    dto: UpdateAccommodationDto,
    userId: string,
    userRole: Role,
  ) {
    const accommodation = await this.findById(id);

    this.checkOwnership(accommodation.hostId, userId, userRole);

    const { images, pricePerNight, ...rest } = dto;

    const data: Prisma.AccommodationUpdateInput = {
      ...rest,
    };

    if (pricePerNight !== undefined) {
      data.pricePerNight = new Prisma.Decimal(pricePerNight);
    }

    if (images && images.length > 0) {
      data.images = {
        deleteMany: {},
        create: images.map((img, index) => ({
          url: img.url,
          publicId: img.publicId,
          isMain: img.isMain ?? index === 0,
        })),
      };
    }

    return this.prisma.accommodation.update({
      where: { id },
      data,
      include: {
        images: true,
      },
    });
  }

  async delete(id: string, userId: string, userRole: Role) {
    const accommodation = await this.findById(id);

    this.checkOwnership(accommodation.hostId, userId, userRole);

    await this.prisma.accommodation.delete({
      where: { id },
    });

    return { message: `Alojamiento con ID "${id}" eliminado exitosamente` };
  }

  async addImage(
    accommodationId: string,
    dto: AddAccommodationImageDto,
    userId: string,
    userRole: Role,
  ) {
    const accommodation = await this.findById(accommodationId);

    this.checkOwnership(accommodation.hostId, userId, userRole);

    if (dto.isMain) {
      await this.prisma.accommodationImage.updateMany({
        where: { accommodationId },
        data: { isMain: false },
      });
    }

    return this.prisma.accommodationImage.create({
      data: {
        accommodationId,
        url: dto.url,
        publicId: dto.publicId,
        isMain: dto.isMain ?? false,
      },
    });
  }

  async deleteImage(
    accommodationId: string,
    imageId: string,
    userId: string,
    userRole: Role,
  ) {
    const accommodation = await this.findById(accommodationId);

    this.checkOwnership(accommodation.hostId, userId, userRole);

    const image = await this.prisma.accommodationImage.findFirst({
      where: {
        id: imageId,
        accommodationId,
      },
    });

    if (!image) {
      throw new NotFoundException(`Imagen con ID "${imageId}" no encontrada para este alojamiento`);
    }

    await this.prisma.accommodationImage.delete({
      where: { id: imageId },
    });

    return { message: `Imagen con ID "${imageId}" eliminada exitosamente` };
  }

  private checkOwnership(ownerId: string, userId: string, role: Role) {
    if (role === Role.ADMIN) {
      return;
    }

    if (ownerId !== userId) {
      throw new ForbiddenException('No tiene permisos para administrar este alojamiento');
    }
  }
}
