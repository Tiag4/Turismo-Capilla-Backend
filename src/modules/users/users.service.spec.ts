import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Role } from '@prisma/client';
import { UsersService } from './users.service.js';
import { PrismaService } from '../../prisma/prisma.service.js';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: {
    user: {
      findMany: ReturnType<typeof vi.fn>;
      findUnique: ReturnType<typeof vi.fn>;
    };
  };

  const mockUser = {
    id: 'user-1',
    name: 'Carlos',
    lastName: 'Gómez',
    email: 'carlos@test.com',
    phone: '+543548123456',
    role: Role.HOST,
    createdAt: new Date(),
    updatedAt: new Date(),
    _count: {
      accommodations: 2,
      bookings: 5,
    },
  };

  beforeEach(async () => {
    prisma = {
      user: {
        findMany: vi.fn().mockResolvedValue([mockUser]),
        findUnique: vi.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  describe('findAll', () => {
    it('should return list of sanitized users', async () => {
      const result = await service.findAll({});
      expect(result).toEqual([mockUser]);
      expect(prisma.user.findMany).toHaveBeenCalled();
    });

    it('should filter by role if provided', async () => {
      await service.findAll({ role: Role.HOST });
      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ role: Role.HOST }),
        }),
      );
    });
  });

  describe('findById', () => {
    it('should return user when found', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findById('user-1');
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException when user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.findById('non-existent')).rejects.toThrow(NotFoundException);
    });
  });
});
