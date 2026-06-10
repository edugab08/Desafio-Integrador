import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pedido, StatusPedido } from './entities/pedido.entity';
import { ItemPedido } from './entities/item-pedido.entity';
import { Produto } from '../produtos/entities/produto.entity';
import { Cliente } from '../clientes/entities/cliente.entity';
import { CreatePedidoDto, UpdatePedidoStatusDto } from './dto/pedido.dto';

@Injectable()
export class PedidosService {
  constructor(
    @InjectRepository(Pedido)    private pedidoRepo: Repository<Pedido>,
    @InjectRepository(ItemPedido) private itemRepo: Repository<ItemPedido>,
    @InjectRepository(Produto)   private produtoRepo: Repository<Produto>,
    @InjectRepository(Cliente)   private clienteRepo: Repository<Cliente>,
  ) {}

  async create(dto: CreatePedidoDto): Promise<Pedido> {
    const cliente = await this.clienteRepo.findOneBy({ id: dto.clienteId });
    if (!cliente) throw new NotFoundException(`Cliente #${dto.clienteId} nao encontrado`);
    if (!dto.itens?.length) throw new BadRequestException('Pedido deve ter ao menos um item');
    const itens: ItemPedido[] = [];
    let total = 0;
    for (const itemDto of dto.itens) {
      const produto = await this.produtoRepo.findOneBy({ id: itemDto.produtoId });
      if (!produto) throw new NotFoundException(`Produto #${itemDto.produtoId} nao encontrado`);
      if (produto.estoque < itemDto.quantidade) throw new BadRequestException(`Estoque insuficiente para "${produto.nome}"`);
      produto.estoque -= itemDto.quantidade;
      await this.produtoRepo.save(produto);
      itens.push(this.itemRepo.create({ produtoId: produto.id, quantidade: itemDto.quantidade, precoUnitario: produto.preco }));
      total += Number(produto.preco) * itemDto.quantidade;
    }
    return this.pedidoRepo.save(this.pedidoRepo.create({ clienteId: dto.clienteId, data: dto.data, status: (dto.status as StatusPedido) ?? StatusPedido.PENDENTE, itens, total }));
  }

  async findAll(clienteId?: number): Promise<Pedido[]> {
    const qb = this.pedidoRepo.createQueryBuilder('p').leftJoinAndSelect('p.cliente','c').leftJoinAndSelect('p.itens','i').leftJoinAndSelect('i.produto','pr').orderBy('p.data','DESC');
    if (clienteId) qb.where('p.clienteId = :clienteId', { clienteId });
    return qb.getMany();
  }

  async findOne(id: number): Promise<Pedido> {
    const pedido = await this.pedidoRepo.findOne({ where: { id }, relations: ['cliente','itens','itens.produto'] });
    if (!pedido) throw new NotFoundException(`Pedido #${id} nao encontrado`);
    return pedido;
  }

  async updateStatus(id: number, dto: UpdatePedidoStatusDto): Promise<Pedido> {
    const pedido = await this.findOne(id);
    pedido.status = dto.status as StatusPedido;
    return this.pedidoRepo.save(pedido);
  }

  async remove(id: number): Promise<void> {
    await this.pedidoRepo.remove(await this.findOne(id));
  }
}
