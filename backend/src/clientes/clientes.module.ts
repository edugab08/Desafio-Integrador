import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cliente } from './entities/cliente.entity';
import { ClientesService } from './clientes.service';
import { Controller, Get, Post, Body, Param, Put, Delete, Query, HttpCode, HttpStatus, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { CreateClienteDto, UpdateClienteDto } from './dto/cliente.dto';

@ApiTags('Clientes')
@Controller('clientes')
export class ClientesController {
  constructor(private readonly svc: ClientesService) {}
  @Post()   create(@Body() dto: CreateClienteDto) { return this.svc.create(dto); }
  @Get()    @ApiQuery({ name: 'search', required: false }) findAll(@Query('search') search?: string) { return this.svc.findAll(search); }
  @Get(':id') findOne(@Param('id', ParseIntPipe) id: number) { return this.svc.findOne(id); }
  @Put(':id') update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateClienteDto) { return this.svc.update(id, dto); }
  @Delete(':id') @HttpCode(HttpStatus.NO_CONTENT) remove(@Param('id', ParseIntPipe) id: number) { return this.svc.remove(id); }
}

@Module({ imports: [TypeOrmModule.forFeature([Cliente])], controllers: [ClientesController], providers: [ClientesService], exports: [ClientesService] })
export class ClientesModule {}
