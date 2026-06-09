import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Cliente } from './entities/cliente.entity';
import { CreateClienteDto, UpdateClienteDto } from './dto/cliente.dto';

@Injectable()
export class ClientesService {
  constructor(@InjectRepository(Cliente) private readonly clienteRepository: Repository<Cliente>) {}

  async create(dto: CreateClienteDto): Promise<Cliente> {
    await this.garantirEmailNaoExiste(dto.email);
    return this.clienteRepository.save(this.clienteRepository.create({ ...dto, pais: dto.pais ?? 'Brasil' }));
  }

  async findAll(termoBusca?: string): Promise<Cliente[]> {
    if (!termoBusca) return this.clienteRepository.find({ order: { nome: 'ASC' } });
    return this.clienteRepository.find({
      where: [{ nome: ILike(`%${termoBusca}%`) }, { email: ILike(`%${termoBusca}%`) }, { cidade: ILike(`%${termoBusca}%`) }],
      order: { nome: 'ASC' },
    });
  }

  async findOne(clienteId: number): Promise<Cliente> {
    const cliente = await this.clienteRepository.findOne({ where: { id: clienteId }, relations: ['pedidos'] });
    if (!cliente) throw new NotFoundException(`Cliente #${clienteId} nao encontrado`);
    return cliente;
  }

  async update(clienteId: number, dto: UpdateClienteDto): Promise<Cliente> {
    const cliente = await this.findOne(clienteId);
    if (dto.email && dto.email !== cliente.email) await this.garantirEmailNaoExiste(dto.email);
    return this.clienteRepository.save(Object.assign(cliente, dto));
  }

  async remove(clienteId: number): Promise<void> {
    await this.clienteRepository.remove(await this.findOne(clienteId));
  }

  private async garantirEmailNaoExiste(email: string): Promise<void> {
    const existe = await this.clienteRepository.findOne({ where: { email } });
    if (existe) throw new ConflictException(`E-mail "${email}" ja esta em uso`);
  }
}
