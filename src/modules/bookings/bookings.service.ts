import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { Prisma, Role, BookingStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateBookingDto } from './dto/create-booking.dto.js';
import { FilterBookingsDto } from './dto/filter-bookings.dto.js';

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateBookingDto, touristId?: string) {
    const checkInDate = new Date(dto.checkIn);
    const checkOutDate = new Date(dto.checkOut);

    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      throw new BadRequestException('Formato de fecha inválido. Utilice formato AAAA-MM-DD');
    }

    if (checkInDate >= checkOutDate) {
      throw new BadRequestException('La fecha de check-out debe ser posterior a la fecha de check-in');
    }

    const totalNights = Math.round(
      (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (totalNights < 1) {
      throw new BadRequestException('La estadía mínima es de 1 noche');
    }

    // Atomic transaction to ensure zero race conditions / overbooking
    return this.prisma.$transaction(async (tx) => {
      const accommodation = await tx.accommodation.findUnique({
        where: { id: dto.accommodationId },
      });

      if (!accommodation) {
        throw new NotFoundException(`Alojamiento con ID "${dto.accommodationId}" no encontrado`);
      }

      if (!accommodation.isActive) {
        throw new BadRequestException('El alojamiento no se encuentra activo para reservas');
      }

      if (dto.guestCount > accommodation.maxGuests) {
        throw new BadRequestException(
          `La cantidad de huéspedes (${dto.guestCount}) supera la capacidad máxima del alojamiento (${accommodation.maxGuests})`,
        );
      }

      // Check for overlapping bookings
      // Collision formula: existing.checkIn < requested.checkOut AND existing.checkOut > requested.checkIn
      const overlappingBooking = await tx.booking.findFirst({
        where: {
          accommodationId: dto.accommodationId,
          status: { in: [BookingStatus.CONFIRMED, BookingStatus.PENDING] },
          checkIn: { lt: checkOutDate },
          checkOut: { gt: checkInDate },
        },
      });

      if (overlappingBooking) {
        throw new ConflictException('El alojamiento no tiene disponibilidad para las fechas seleccionadas.');
      }

      const totalAmount = new Prisma.Decimal(accommodation.pricePerNight).mul(totalNights);

      const bookingCode = await this.generateUniqueBookingCode(tx);

      return tx.booking.create({
        data: {
          bookingCode,
          accommodationId: dto.accommodationId,
          checkIn: checkInDate,
          checkOut: checkOutDate,
          totalNights,
          guestCount: dto.guestCount,
          pricePerNight: accommodation.pricePerNight,
          totalAmount,
          status: BookingStatus.PENDING,
          guestName: dto.guestName,
          guestEmail: dto.guestEmail.toLowerCase().trim(),
          guestPhone: dto.guestPhone,
          guestOrigin: dto.guestOrigin,
          notes: dto.notes,
          touristId: touristId ?? null,
        },
        include: {
          accommodation: {
            select: {
              id: true,
              name: true,
              type: true,
              address: true,
              locality: true,
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
          },
        },
      });
    });
  }

  async findByHost(hostId: string, filters: FilterBookingsDto) {
    const { status, accommodationId, search } = filters;

    const where: Prisma.BookingWhereInput = {
      accommodation: {
        hostId,
      },
    };

    if (status) {
      where.status = status;
    }

    if (accommodationId) {
      where.accommodationId = accommodationId;
    }

    if (search) {
      where.OR = [
        { bookingCode: { contains: search, mode: 'insensitive' } },
        { guestName: { contains: search, mode: 'insensitive' } },
        { guestEmail: { contains: search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.booking.findMany({
      where,
      include: {
        accommodation: {
          select: {
            id: true,
            name: true,
            type: true,
            address: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByTourist(touristId: string) {
    return this.prisma.booking.findMany({
      where: { touristId },
      include: {
        accommodation: {
          select: {
            id: true,
            name: true,
            type: true,
            address: true,
            locality: true,
            host: {
              select: {
                name: true,
                lastName: true,
                phone: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string, userId?: string, userRole?: Role, userEmail?: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        accommodation: {
          select: {
            id: true,
            name: true,
            type: true,
            address: true,
            locality: true,
            hostId: true,
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
        },
      },
    });

    if (!booking) {
      throw new NotFoundException(`Reserva con ID "${id}" no encontrada`);
    }

    if (userId && userRole) {
      this.checkAccessPermission(booking, userId, userRole, userEmail);
    }

    return booking;
  }

  async lookupByCode(bookingCode: string, email: string) {
    const booking = await this.prisma.booking.findFirst({
      where: {
        bookingCode: {
          equals: bookingCode.trim().toUpperCase(),
          mode: 'insensitive',
        },
        guestEmail: {
          equals: email.trim().toLowerCase(),
          mode: 'insensitive',
        },
      },
      include: {
        accommodation: {
          select: {
            id: true,
            name: true,
            type: true,
            address: true,
            locality: true,
            host: {
              select: {
                name: true,
                lastName: true,
                phone: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException('No se encontró ninguna reserva para el código y correo provistos');
    }

    return booking;
  }

  async updateStatus(id: string, newStatus: BookingStatus, userId: string, userRole: Role) {
    const booking = await this.findById(id);

    if (userRole !== Role.ADMIN && booking.accommodation.hostId !== userId) {
      throw new ForbiddenException('No tiene permisos para modificar el estado de esta reserva');
    }

    if (booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestException('No es posible modificar el estado de una reserva que ya ha sido cancelada');
    }

    if (booking.status === BookingStatus.COMPLETED && newStatus !== BookingStatus.COMPLETED) {
      throw new BadRequestException('No es posible reabrir o cancelar una reserva completada');
    }

    return this.prisma.booking.update({
      where: { id },
      data: { status: newStatus },
      include: {
        accommodation: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  private checkAccessPermission(
    booking: { accommodation: { hostId: string }; touristId: string | null; guestEmail: string },
    userId: string,
    userRole: Role,
    userEmail?: string,
  ) {
    if (userRole === Role.ADMIN) {
      return;
    }

    if (userRole === Role.HOST && booking.accommodation.hostId === userId) {
      return;
    }

    if (booking.touristId === userId) {
      return;
    }

    if (userEmail && booking.guestEmail.toLowerCase() === userEmail.toLowerCase()) {
      return;
    }

    throw new ForbiddenException('No tiene permisos para acceder al detalle de esta reserva');
  }

  private async generateUniqueBookingCode(tx: Prisma.TransactionClient): Promise<string> {
    const year = new Date().getFullYear();
    let code = '';
    let exists = true;

    while (exists) {
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      code = `CAP-${year}-${randomSuffix}`;

      const existing = await tx.booking.findUnique({
        where: { bookingCode: code },
      });

      if (!existing) {
        exists = false;
      }
    }

    return code;
  }
}
