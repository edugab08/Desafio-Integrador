import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pedido } from '../pedidos/entities/pedido.entity';
import { Cliente } from '../clientes/entities/cliente.entity';
import { Produto } from '../produtos/entities/produto.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Pedido)  private pedidoRepo:  Repository<Pedido>,
    @InjectRepository(Cliente) private clienteRepo: Repository<Cliente>,
    @InjectRepository(Produto) private produtoRepo: Repository<Produto>,
  ) {}

  async obterDadosDashboard() {
    const [totalClientes, totalProdutos, totalPedidos, receitaResult, vendasMensais, vendasEstado, categorias] =
      await Promise.all([
        this.clienteRepo.count(),
        this.produtoRepo.count(),
        this.pedidoRepo.count(),
        this.pedidoRepo
          .createQueryBuilder('p')
          .select('COALESCE(SUM(p.total),0)', 'total')
          .where("p.status = 'Concluido'")
          .getRawOne(),
        this.pedidoRepo
          .createQueryBuilder('p')
          .select([
            `TO_CHAR(p.data::date,'Mon') AS mes`,
            `TO_CHAR(p.data::date,'MM') AS mes_num`,
            'COUNT(p.id) AS pedidos',
            'COALESCE(SUM(p.total),0) AS receita',
          ])
          .groupBy('mes, mes_num')
          .orderBy('mes_num', 'ASC')
          .getRawMany(),
        this.pedidoRepo
          .createQueryBuilder('p')
          .innerJoin('p.cliente', 'c')
          .select(['c.estado AS estado', 'COUNT(p.id) AS v'])
          .where("p.status = 'Concluido'")
          .groupBy('c.estado')
          .orderBy('v', 'DESC')
          .limit(8)
          .getRawMany(),
        this.pedidoRepo
          .createQueryBuilder('p')
          .innerJoin('p.itens', 'i')
          .innerJoin('i.produto', 'pr')
          .select([
            "COALESCE(pr.categoria, 'Sem categoria') AS name",
            'COUNT(i.id) AS value',
          ])
          .where("p.status = 'Concluido'")
          .groupBy('pr.categoria')
          .orderBy('value', 'DESC')
          .getRawMany(),
      ]);

    return {
      kpis: {
        totalClientes,
        totalProdutos,
        totalPedidos,
        totalReceita: Number(receitaResult?.total ?? 0),
      },
      vendasMensais,
      vendasEstado,
      categorias,
    };
  }
}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly svc: DashboardService) {}

  @Get()
  @ApiOperation({ summary: 'Todos os dados do dashboard' })
  obterDados() {
    return this.svc.obterDadosDashboard();
  }
}

@Module({
  imports: [TypeOrmModule.forFeature([Pedido, Cliente, Produto])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}