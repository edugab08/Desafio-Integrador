import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsDateString, IsEnum, IsInt, IsNotEmpty, IsOptional, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
export class CreateItemPedidoDto {
  @ApiProperty() @IsInt() @Min(1) produtoId: number;
  @ApiProperty() @IsInt() @Min(1) quantidade: number;
}
export class CreatePedidoDto {
  @ApiProperty() @IsInt() @IsNotEmpty() clienteId: number;
  @ApiProperty({ type: [CreateItemPedidoDto] }) @IsArray() @ValidateNested({ each: true }) @Type(() => CreateItemPedidoDto) itens: CreateItemPedidoDto[];
  @ApiProperty() @IsDateString() data: string;
  @ApiPropertyOptional() @IsEnum(['Pendente','Concluido','Cancelado']) @IsOptional() status?: string;
}
export class UpdatePedidoStatusDto {
  @ApiProperty({ enum: ['Pendente','Concluido','Cancelado'] }) @IsEnum(['Pendente','Concluido','Cancelado']) status: string;
}
