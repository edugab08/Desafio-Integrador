import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Produto } from './entities/produto.entity';
import { ProdutosService } from './produtos.service';
import { Controller, Get, Post, Body, Param, Put, Delete, Query, HttpCode, HttpStatus, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { CreateProdutoDto, UpdateProdutoDto } from './dto/produto.dto';

@ApiTags('Produtos')
@Controller('produtos')
export class ProdutosController {
  constructor(private readonly svc: ProdutosService) {}
  @Post()   create(@Body() dto: CreateProdutoDto) { return this.svc.create(dto); }
  @Get()    @ApiQuery({ name: 'search', required: false }) findAll(@Query('search') s?: string) { return this.svc.findAll(s); }
  @Get('estoque-critico') estoque(@Query('limiar') l?: number) { return this.svc.listarEstoqueCritico(l ? Number(l) : 20); }
  @Get(':id') findOne(@Param('id', ParseIntPipe) id: number) { return this.svc.findOne(id); }
  @Put(':id') update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProdutoDto) { return this.svc.update(id, dto); }
  @Delete(':id') @HttpCode(HttpStatus.NO_CONTENT) remove(@Param('id', ParseIntPipe) id: number) { return this.svc.remove(id); }
}

@Module({ imports: [TypeOrmModule.forFeature([Produto])], controllers: [ProdutosController], providers: [ProdutosService], exports: [ProdutosService] })
export class ProdutosModule {}
