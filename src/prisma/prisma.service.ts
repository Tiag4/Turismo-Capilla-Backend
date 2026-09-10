import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';
import { v7 as uuidv7 } from 'uuid';

export const uuidv7QueryHandlers = {
  async create({
    args,
    query,
  }: {
    args: { data?: Record<string, unknown> };
    query: (args: any) => Promise<any>;
  }) {
    if (args?.data && typeof args.data === 'object' && !('id' in args.data && args.data.id)) {
      args.data.id = uuidv7();
    }
    return query(args);
  },

  async createMany({
    args,
    query,
  }: {
    args: { data?: Record<string, unknown>[] | Record<string, unknown> };
    query: (args: any) => Promise<any>;
  }) {
    if (Array.isArray(args?.data)) {
      for (const item of args.data) {
        if (item && typeof item === 'object' && !('id' in item && item.id)) {
          item.id = uuidv7();
        }
      }
    } else if (args?.data && typeof args.data === 'object' && !('id' in args.data && args.data.id)) {
      args.data.id = uuidv7();
    }
    return query(args);
  },
};

export const uuidv7Extension = Prisma.defineExtension({
  name: 'uuidv7-generator',
  query: {
    $allModels: {
      create: uuidv7QueryHandlers.create,
      createMany: uuidv7QueryHandlers.createMany,
    },
  },
});

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super();
    return this.$extends(uuidv7Extension) as unknown as PrismaService;
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
