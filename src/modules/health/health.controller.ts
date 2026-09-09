import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PrismaService } from '../../prisma/prisma.service.js';

@ApiTags('Monitoreo del Sistema')
@Controller('api/v1/health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({
    summary: 'Comprobar el estado y disponibilidad del servicio y base de datos (Healthcheck)',
    description: 'Verifica la conectividad activa con PostgreSQL y el tiempo de actividad del proceso.',
  })
  @ApiResponse({
    status: 200,
    description: 'Servicio operativo y saludable',
    schema: {
      example: {
        status: 'ok',
        uptime: 120.45,
        timestamp: '2026-09-05T00:45:00.000Z',
        database: 'connected',
      },
    },
  })
  async check() {
    let dbStatus = 'disconnected';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      dbStatus = 'connected';
    } catch {
      dbStatus = 'error';
    }

    return {
      status: dbStatus === 'connected' ? 'ok' : 'degraded',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      database: dbStatus,
    };
  }
}
