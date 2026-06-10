import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Produto } from './entities/produto.entity';
import { CreateProdutoDto, UpdateProdutoDto } from './dto/produto.dto';

@Injectable()
export class ProdutosService {
  constructor(@InjectRepository(Produto) private readonly produtoRepository: Repository<Produto>) {}

  async create(dto: CreateProdutoDto): Promise<Produto> {
    return this.produtoRepository.save(this.produtoRepository.create(dto));
  }

  async findAll(termoBusca?: string): Promise<Produto[]> {
    if (!termoBusca) return this.produtoRepository.find({ order: { nome: 'ASC' } });
    return this.produtoRepository.find({
      where: [{ nome: ILike(`%${termoBusca}%`) }, { categoria: ILike(`%${termoBusca}%`) }],
      order: { nome: 'ASC' },
    });
  }

  async findOne(produtoId: number): Promise<Produto> {
    const produto = await this.produtoRepository.findOneBy({ id: produtoId });
    if (!produto) throw new NotFoundException(`Produto #${produtoId} nao encontrado`);
    return produto;
  }

  async update(produtoId: number, dto: UpdateProdutoDto): Promise<Produto> {
    return this.produtoRepository.save(Object.assign(await this.findOne(produtoId), dto));
  }

  async remove(produtoId: number): Promise<void> {
    await this.produtoRepository.remove(await this.findOne(produtoId));
  }

  async listarEstoqueCritico(limiar = 20): Promise<Produto[]> {
    return this.produtoRepository.createQueryBuilder('p').where('p.estoque < :limiar', { limiar }).orderBy('p.estoque','ASC').getMany();
  }
}
