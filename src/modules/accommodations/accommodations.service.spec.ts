import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AccommodationType, Role } from '@prisma/client';
import { AccommodationsService } from './accommodations.service.js';
import { PrismaService } from '../../prisma/prisma.service.js';

describe('AccommodationsService', () => {
  let service: AccommodationsService;
  let prisma: {
    accommodation: {
      findMany: ReturnType<typeof vi.fn>;
      findUnique: ReturnType<typeof vi.fn>;
      create: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
      delete: ReturnType<typeof vi.fn>;
    };
    accommodationImage: {
      findFirst: ReturnType<typeof vi.fn>;
      create: ReturnType<typeof vi.fn>;
      delete: ReturnType<typeof vi.fn>;
      updateMany: ReturnType<typeof vi.fn>;
    };
  };

  const mockAccommodation = {
    id: 'acc-1',
    name: 'Cabañas Los Nogales',
    description: 'Hermosa cabaña con pileta y asador.',
    type: AccommodationType.CABIN,
    address: 'Av. Las Gemelas 450',
    locality: 'Capilla del Monte',
    latitude: -30.8521,
    longitude: -64.5218,
    pricePerNight: 45000,
    maxGuests: 4,
    amenities: ['Pileta', 'Wi-Fi'],
    isActive: true,
    hostId: 'host-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    images: [],
    host: {
      id: 'host-1',
      name: 'Carlos',
      lastName: 'Gómez',
      email: 'carlos@test.com',
      phone: '+543548123456',
    },
  };

  beforeEach(async () => {
    prisma = {
      accommodation: {
        findMany: vi.fn().mockResolvedValue([mockAccommodation]),
        findUnique: vi.fn(),
        create: vi.fn().mockResolvedValue(mockAccommodation),
        update: vi.fn().mockResolvedValue(mockAccommodation),
        delete: vi.fn().mockResolvedValue(mockAccommodation),
      },
      accommodationImage: {
        findFirst: vi.fn(),
        create: vi.fn(),
        delete: vi.fn(),
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccommodationsService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<AccommodationsService>(AccommodationsService);
  });

  describe('findAll', () => {
    it('should return accommodations list', async () => {
      const result = await service.findAll({});
      expect(result).toEqual([mockAccommodation]);
      expect(prisma.accommodation.findMany).toHaveBeenCalled();
    });

    it('should throw BadRequestException if only one date is provided', async () => {
      await expect(service.findAll({ checkIn: '2026-10-01' })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if checkOut is before or equal to checkIn', async () => {
      await expect(
        service.findAll({ checkIn: '2026-10-10', checkOut: '2026-10-05' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should filter with date anti-overbooking logic when valid dates are provided', async () => {
      await service.findAll({ checkIn: '2026-10-10', checkOut: '2026-10-15' });
      expect(prisma.accommodation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            bookings: {
              none: expect.objectContaining({
                checkIn: { lt: new Date('2026-10-15') },
                checkOut: { gt: new Date('2026-10-10') },
              }),
            },
          }),
        }),
      );
    });
  });

  describe('findById', () => {
    it('should return accommodation if found', async () => {
      prisma.accommodation.findUnique.mockResolvedValue(mockAccommodation);

      const result = await service.findById('acc-1');
      expect(result).toEqual(mockAccommodation);
    });

    it('should throw NotFoundException if accommodation not found', async () => {
      prisma.accommodation.findUnique.mockResolvedValue(null);

      await expect(service.findById('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create accommodation associated with hostId', async () => {
      const dto = {
        name: 'Cabañas Los Nogales',
        description: 'Hermosa cabaña.',
        type: AccommodationType.CABIN,
        address: 'Av. Las Gemelas 450',
        pricePerNight: 45000,
        maxGuests: 4,
      };

      const result = await service.create(dto, 'host-1');
      expect(result).toEqual(mockAccommodation);
      expect(prisma.accommodation.create).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should allow host owner to update accommodation', async () => {
      prisma.accommodation.findUnique.mockResolvedValue(mockAccommodation);

      const result = await service.update('acc-1', { name: 'Nuevo Nombre' }, 'host-1', Role.HOST);
      expect(result).toEqual(mockAccommodation);
      expect(prisma.accommodation.update).toHaveBeenCalled();
    });

    it('should forbid other hosts from updating someone elses accommodation', async () => {
      prisma.accommodation.findUnique.mockResolvedValue(mockAccommodation);

      await expect(
        service.update('acc-1', { name: 'Nuevo Nombre' }, 'another-host', Role.HOST),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow ADMIN to update any accommodation', async () => {
      prisma.accommodation.findUnique.mockResolvedValue(mockAccommodation);

      const result = await service.update('acc-1', { name: 'Admin Edit' }, 'admin-id', Role.ADMIN);
      expect(result).toEqual(mockAccommodation);
    });
  });

  describe('delete', () => {
    it('should allow owner host to delete accommodation', async () => {
      prisma.accommodation.findUnique.mockResolvedValue(mockAccommodation);

      const result = await service.delete('acc-1', 'host-1', Role.HOST);
      expect(result).toEqual({ message: 'Alojamiento con ID "acc-1" eliminado exitosamente' });
      expect(prisma.accommodation.delete).toHaveBeenCalledWith({ where: { id: 'acc-1' } });
    });

    it('should forbid non-owner host from deleting accommodation', async () => {
      prisma.accommodation.findUnique.mockResolvedValue(mockAccommodation);

      await expect(
        service.delete('acc-1', 'intruder-host', Role.HOST),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
