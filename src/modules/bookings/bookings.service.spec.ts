import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BookingStatus, Role } from '@prisma/client';
import { BookingsService } from './bookings.service.js';
import { PrismaService } from '../../prisma/prisma.service.js';

describe('BookingsService', () => {
  let service: BookingsService;
  let prisma: {
    $transaction: ReturnType<typeof vi.fn>;
    booking: {
      findMany: ReturnType<typeof vi.fn>;
      findUnique: ReturnType<typeof vi.fn>;
      findFirst: ReturnType<typeof vi.fn>;
      create: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
    };
  };

  const mockAccommodation = {
    id: 'acc-1',
    name: 'Cabañas Los Nogales',
    pricePerNight: 40000,
    maxGuests: 4,
    isActive: true,
    hostId: 'host-1',
  };

  const mockBooking = {
    id: 'book-1',
    bookingCode: 'CAP-2026-1234',
    accommodationId: 'acc-1',
    checkIn: new Date('2026-10-10'),
    checkOut: new Date('2026-10-15'),
    totalNights: 5,
    guestCount: 2,
    pricePerNight: 40000,
    totalAmount: 200000,
    status: BookingStatus.PENDING,
    guestName: 'Lucía Fernández',
    guestEmail: 'lucia@test.com',
    guestPhone: '+541198765432',
    touristId: 'tourist-1',
    accommodation: {
      id: 'acc-1',
      name: 'Cabañas Los Nogales',
      hostId: 'host-1',
      host: {
        id: 'host-1',
        name: 'Carlos',
        lastName: 'Gómez',
        email: 'carlos@test.com',
        phone: '+543548123456',
      },
    },
  };

  beforeEach(async () => {
    prisma = {
      $transaction: vi.fn(),
      booking: {
        findMany: vi.fn().mockResolvedValue([mockBooking]),
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        create: vi.fn().mockResolvedValue(mockBooking),
        update: vi.fn().mockResolvedValue(mockBooking),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingsService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<BookingsService>(BookingsService);
  });

  describe('create', () => {
    it('should throw BadRequestException if checkOut is before or equal to checkIn', async () => {
      const dto = {
        accommodationId: 'acc-1',
        checkIn: '2026-10-15',
        checkOut: '2026-10-10',
        guestCount: 2,
        guestName: 'Lucía',
        guestEmail: 'lucia@test.com',
        guestPhone: '+541198765432',
      };

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException if an overlapping booking exists (anti-overbooking)', async () => {
      const dto = {
        accommodationId: 'acc-1',
        checkIn: '2026-10-10',
        checkOut: '2026-10-15',
        guestCount: 2,
        guestName: 'Lucía',
        guestEmail: 'lucia@test.com',
        guestPhone: '+541198765432',
      };

      prisma.$transaction.mockImplementation(async (callback: any) => {
        const tx = {
          accommodation: {
            findUnique: vi.fn().mockResolvedValue(mockAccommodation),
          },
          booking: {
            findFirst: vi.fn().mockResolvedValue(mockBooking), // Collision exists!
          },
        };
        return callback(tx);
      });

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
    });

    it('should create booking when dates are available', async () => {
      const dto = {
        accommodationId: 'acc-1',
        checkIn: '2026-10-10',
        checkOut: '2026-10-15',
        guestCount: 2,
        guestName: 'Lucía',
        guestEmail: 'lucia@test.com',
        guestPhone: '+541198765432',
      };

      prisma.$transaction.mockImplementation(async (callback: any) => {
        const tx = {
          accommodation: {
            findUnique: vi.fn().mockResolvedValue(mockAccommodation),
          },
          booking: {
            findFirst: vi.fn().mockResolvedValue(null), // No collision
            findUnique: vi.fn().mockResolvedValue(null), // Code unique
            create: vi.fn().mockResolvedValue(mockBooking),
          },
        };
        return callback(tx);
      });

      const result = await service.create(dto, 'tourist-1');
      expect(result).toEqual(mockBooking);
    });

    it('should throw BadRequestException if guestCount exceeds maxGuests', async () => {
      const dto = {
        accommodationId: 'acc-1',
        checkIn: '2026-10-10',
        checkOut: '2026-10-15',
        guestCount: 10, // Exceeds 4
        guestName: 'Lucía',
        guestEmail: 'lucia@test.com',
        guestPhone: '+541198765432',
      };

      prisma.$transaction.mockImplementation(async (callback: any) => {
        const tx = {
          accommodation: {
            findUnique: vi.fn().mockResolvedValue(mockAccommodation),
          },
        };
        return callback(tx);
      });

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findById', () => {
    it('should return booking when user is host owner', async () => {
      prisma.booking.findUnique.mockResolvedValue(mockBooking);

      const result = await service.findById('book-1', 'host-1', Role.HOST);
      expect(result).toEqual(mockBooking);
    });

    it('should forbid non-owner host from viewing booking', async () => {
      prisma.booking.findUnique.mockResolvedValue(mockBooking);

      await expect(
        service.findById('book-1', 'intruder-host', Role.HOST),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('updateStatus', () => {
    it('should update status when user is host owner', async () => {
      prisma.booking.findUnique.mockResolvedValue(mockBooking);
      prisma.booking.update.mockResolvedValue({
        ...mockBooking,
        status: BookingStatus.CONFIRMED,
      });

      const result = await service.updateStatus('book-1', BookingStatus.CONFIRMED, 'host-1', Role.HOST);
      expect(result.status).toBe(BookingStatus.CONFIRMED);
    });

    it('should throw BadRequestException if booking is already CANCELLED', async () => {
      prisma.booking.findUnique.mockResolvedValue({
        ...mockBooking,
        status: BookingStatus.CANCELLED,
      });

      await expect(
        service.updateStatus('book-1', BookingStatus.CONFIRMED, 'host-1', Role.HOST),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('lookupByCode', () => {
    it('should return booking when code and email match', async () => {
      prisma.booking.findFirst.mockResolvedValue(mockBooking);

      const result = await service.lookupByCode('CAP-2026-1234', 'lucia@test.com');
      expect(result).toEqual(mockBooking);
    });

    it('should throw NotFoundException when not matching', async () => {
      prisma.booking.findFirst.mockResolvedValue(null);

      await expect(
        service.lookupByCode('INVALID', 'test@test.com'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
