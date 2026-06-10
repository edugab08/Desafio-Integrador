import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';
export class CreateProdutoDto {
  @ApiProperty() @IsString() @IsNotEmpty() @MaxLength(150) nome: string;
  @ApiProperty() @IsNumber() @Min(0.01, { message: 'Preco deve ser maior que zero' }) preco: number;
  @ApiProperty() @IsNumber() @Min(0, { message: 'Estoque nao pode ser negativo' }) estoque: number;
  @ApiPropertyOptional() @IsString() @IsOptional() @MaxLength(80) categoria?: string;
}
export class UpdateProdutoDto extends PartialType(CreateProdutoDto) {}
