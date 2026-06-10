import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pedido } from './entities/pedido.entity';
import { ItemPedido } from './entities/item-pedido.entity';
import { Produto } from '../produtos/entities/produto.entity';
import { Cliente } from '../clientes/entities/cliente.entity';
import { PedidosService } from './pedidos.service';
import { Controller, Get, Post, Body, Param, Patch, Delete, Query, HttpCode, HttpStatus, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiQuery } from '@nestjs/swagger';
import { CreatePedidoDto, UpdatePedidoStatusDto } from './dto/pedido.dto';

@ApiTags('Pedidos')
@Controller('pedidos')
export class PedidosController {
  constructor(private readonly svc: PedidosService) {}
  @Post()   create(@Body() dto: CreatePedidoDto) { return this.svc.create(dto); }
  @Get()    @ApiQuery({ name:'clienteId', required:false }) findAll(@Query('clienteId') cid?: number) { return this.svc.findAll(cid ? Number(cid) : undefined); }
  @Get(':id') findOne(@Param('id', ParseIntPipe) id: number) { return this.svc.findOne(id); }
  @Patch(':id/status') updateStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePedidoStatusDto) { return this.svc.updateStatus(id, dto); }
  @Delete(':id') @HttpCode(HttpStatus.NO_CONTENT) remove(@Param('id', ParseIntPipe) id: number) { return this.svc.remove(id); }
}

@Module({ imports: [TypeOrmModule.forFeature([Pedido,ItemPedido,Produto,Cliente])], controllers: [PedidosController], providers: [PedidosService], exports: [PedidosService] })
export class PedidosModule {}
