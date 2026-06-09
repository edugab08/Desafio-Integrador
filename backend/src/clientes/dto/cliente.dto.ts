import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, Length, MaxLength } from 'class-validator';
export class CreateClienteDto {
  @ApiProperty() @IsString() @IsNotEmpty({ message: 'Nome nao pode ser vazio' }) @MaxLength(150) nome: string;
  @ApiProperty() @IsEmail({}, { message: 'E-mail invalido' }) @IsNotEmpty() email: string;
  @ApiProperty() @IsString() @IsNotEmpty() @MaxLength(100) cidade: string;
  @ApiProperty() @IsString() @IsNotEmpty() @Length(2, 2) estado: string;
  @ApiPropertyOptional() @IsString() @IsOptional() @MaxLength(60) pais?: string;
}
export class UpdateClienteDto extends PartialType(CreateClienteDto) {}
