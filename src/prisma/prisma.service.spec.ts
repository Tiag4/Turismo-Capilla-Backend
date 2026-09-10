import { Test, TestingModule } from '@nestjs/testing';
import { describe, it, expect } from 'vitest';
import { validate, version } from 'uuid';
import { PrismaService, uuidv7QueryHandlers } from './prisma.service.js';

describe('PrismaService & UUIDv7 Extension', () => {
  it('should compile within NestJS testing module', async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    const service = module.get<PrismaService>(PrismaService);
    expect(service).toBeDefined();
  });

  describe('uuidv7QueryHandlers', () => {
    it('should inject a valid UUIDv7 when id is not provided', async () => {
      const mockQuery = async (args: { data: Record<string, unknown> }) => args.data;

      const args = { data: { name: 'Test Entity' } };
      const result = await uuidv7QueryHandlers.create({ args, query: mockQuery });

      expect(result.id).toBeDefined();
      expect(typeof result.id).toBe('string');
      expect(validate(result.id as string)).toBe(true);
      expect(version(result.id as string)).toBe(7);
      expect(result.name).toBe('Test Entity');
    });

    it('should preserve existing id if explicitly provided', async () => {
      const explicitId = 'custom-fixed-id-123';
      const mockQuery = async (args: { data: Record<string, unknown> }) => args.data;

      const args = { data: { id: explicitId, name: 'Preset ID' } };
      const result = await uuidv7QueryHandlers.create({ args, query: mockQuery });

      expect(result.id).toBe(explicitId);
    });

    it('should inject UUIDv7 into array items in createMany when id is absent', async () => {
      const mockQuery = async (args: { data: Record<string, unknown>[] }) => args.data;

      const args = {
        data: [
          { name: 'Item 1' },
          { id: 'custom-id-2', name: 'Item 2' },
        ],
      };

      const result = await uuidv7QueryHandlers.createMany({ args, query: mockQuery });

      expect(validate(result[0].id as string)).toBe(true);
      expect(version(result[0].id as string)).toBe(7);
      expect(result[1].id).toBe('custom-id-2');
    });
  });
});
