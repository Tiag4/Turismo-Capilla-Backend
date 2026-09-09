import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { BookingStatus } from '@prisma/client';

export class UpdateBookingStatusDto {
  @ApiProperty({
    enum: BookingStatus,
    example: BookingStatus.CONFIRMED,
    description: 'Nuevo estado de la reserva (CONFIRMED, CANCELLED, COMPLETED)',
  })
  @IsEnum(BookingStatus)
  @IsNotEmpty()
  status!: BookingStatus;
}
