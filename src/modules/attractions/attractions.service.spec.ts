import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AttractionCategory } from '@prisma/client';
import { AttractionsService } from './attractions.service.js';
import { PrismaService } from '../../prisma/prisma.service.js';

describe('AttractionsService', () => {
  let service: AttractionsService;
  let prisma: {
    attraction: {
      findMany: ReturnType<typeof vi.fn>;
      findUnique: ReturnType<typeof vi.fn>;
      create: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
      delete: ReturnType<typeof vi.fn>;
    };
    attractionImage: {
      findFirst: ReturnType<typeof vi.fn>;
      create: ReturnType<typeof vi.fn>;
      delete: ReturnType<typeof vi.fn>;
    };
  };

  const mockAttraction = {
    id: 'attr-1',
    name: 'Cerro Uritorco',
    description: 'El pico más alto de las Sierras Chicas.',
    category: AttractionCategory.HILL,
    difficulty: 'Alta',
    estimatedDuration: '7 horas',
    howToGet: 'Acceso por la base',
    requiresGuide: false,
    admissionFee: 15000,
    latitude: -30.8492,
    longitude: -64.4789,
    createdAt: new Date(),
    updatedAt: new Date(),
    images: [],
  };

  beforeEach(async () => {
    prisma = {
      attraction: {
        findMany: vi.fn().mockResolvedValue([mockAttraction]),
        findUnique: vi.fn(),
        create: vi.fn().mockResolvedValue(mockAttraction),
        update: vi.fn().mockResolvedValue(mockAttraction),
        delete: vi.fn().mockResolvedValue(mockAttraction),
      },
      attractionImage: {
        findFirst: vi.fn(),
        create: vi.fn(),
        delete: vi.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttractionsService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<AttractionsService>(AttractionsService);
  });

  describe('findAll', () => {
    it('should return an array of attractions', async () => {
      const result = await service.findAll({});
      expect(result).toEqual([mockAttraction]);
      expect(prisma.attraction.findMany).toHaveBeenCalled();
    });

    it('should apply category filter if provided', async () => {
      await service.findAll({ category: AttractionCategory.HILL });
      expect(prisma.attraction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ category: AttractionCategory.HILL }),
        }),
      );
    });
  });

  describe('findById', () => {
    it('should return an attraction if found', async () => {
      prisma.attraction.findUnique.mockResolvedValue(mockAttraction);

      const result = await service.findById('attr-1');
      expect(result).toEqual(mockAttraction);
    });

    it('should throw NotFoundException if attraction is not found', async () => {
      prisma.attraction.findUnique.mockResolvedValue(null);

      await expect(service.findById('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create an attraction and return it', async () => {
      const dto = {
        name: 'Cerro Uritorco',
        description: 'El pico más alto de las Sierras Chicas.',
        category: AttractionCategory.HILL,
        admissionFee: 15000,
      };

      const result = await service.create(dto);
      expect(result).toEqual(mockAttraction);
      expect(prisma.attraction.create).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete attraction when exists', async () => {
      prisma.attraction.findUnique.mockResolvedValue(mockAttraction);

      const result = await service.delete('attr-1');
      expect(result).toEqual({ message: 'Atractivo con ID "attr-1" eliminado exitosamente' });
      expect(prisma.attraction.delete).toHaveBeenCalledWith({ where: { id: 'attr-1' } });
    });
  });
});
