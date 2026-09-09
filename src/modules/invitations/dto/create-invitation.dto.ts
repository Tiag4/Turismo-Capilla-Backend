import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateInvitationDto {
  @ApiProperty({
    example: 'cabanias.valle@gmail.com',
    description: 'Correo electrónico del prestador a invitar',
  })
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  @IsNotEmpty({ message: 'El correo electrónico es requerido' })
  email: string;
}
