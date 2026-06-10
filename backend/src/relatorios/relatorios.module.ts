import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pedido } from '../pedidos/entities/pedido.entity';
import { Cliente } from '../clientes/entities/cliente.entity';
import { Produto } from '../produtos/entities/produto.entity';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class RelatoriosService {
  constructor(
    @InjectRepository(Pedido)   private pedidoRepo:  Repository<Pedido>,
    @InjectRepository(Cliente)  private clienteRepo: Repository<Cliente>,
    @InjectRepository(Produto)  private produtoRepo: Repository<Produto>,
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {}

  async relatorioVendas() {
    const porMes = await this.pedidoRepo.createQueryBuilder('p')
      .select([`TO_CHAR(p.data::date,'Mon') AS mes`,`TO_CHAR(p.data::date,'MM') AS mes_num`,'COUNT(p.id) AS total_pedidos','COALESCE(SUM(p.total),0) AS receita'])
      .groupBy('mes,mes_num').orderBy('mes_num','ASC').getRawMany();
    const totalReceita = porMes.reduce((s,m)=>s+Number(m.receita||0),0);
    const totalPedidos = porMes.reduce((s,m)=>s+Number(m.total_pedidos||0),0);
    return { tipo:'gerencial', nome:'Analise de Vendas', geradoEm: new Date().toISOString(),
      resumo: { totalReceita, totalPedidos, ticketMedio: totalPedidos>0 ? totalReceita/totalPedidos : 0 },
      detalhesMensais: porMes };
  }

  async relatorioProdutosClientes() {
    const topProdutos = await this.pedidoRepo.createQueryBuilder('p').innerJoin('p.itens','i').innerJoin('i.produto','pr')
      .select(['pr.id AS produto_id','pr.nome AS nome','pr.categoria AS categoria','SUM(i.quantidade) AS total_vendido','SUM(i.quantidade * i.preco_unitario) AS receita'])
      .where("p.status = 'Concluido'").groupBy('pr.id,pr.nome,pr.categoria').orderBy('receita','DESC').limit(10).getRawMany();
    const topClientes = await this.pedidoRepo.createQueryBuilder('p').innerJoin('p.cliente','c')
      .select(['c.id AS cliente_id','c.nome AS nome','c.estado AS estado','COUNT(p.id) AS total_pedidos','SUM(p.total) AS receita','AVG(p.total) AS ticket_medio','MAX(p.data) AS ultima_compra'])
      .where("p.status = 'Concluido'").groupBy('c.id,c.nome,c.estado').orderBy('receita','DESC').limit(10).getRawMany();
    const estoqueCritico = await this.produtoRepo.createQueryBuilder('p').where('p.estoque < 20').orderBy('p.estoque','ASC').getMany();
    return { tipo:'gerencial', nome:'Produtos e Clientes', geradoEm: new Date().toISOString(), topProdutos, topClientes, estoqueCritico };
  }

  async relatorioChurn() {
    const dadosClientes = await this.clienteRepo.createQueryBuilder('c').leftJoin('c.pedidos','p')
      .select(['c.id AS cliente_id','c.nome AS nome','COUNT(p.id) AS total_pedidos','COALESCE(SUM(p.total),0) AS total_receita','COALESCE(AVG(p.total),0) AS ticket_medio','MAX(p.data) AS ultima_compra',`COALESCE(SUM(CASE WHEN p.status='Cancelado' THEN 1 ELSE 0 END),0) AS cancelamentos`])
      .groupBy('c.id,c.nome').getRawMany();
    try {
      const mlUrl = this.config.get('ML_SERVICE_URL','http://localhost:8000');
      const { data } = await firstValueFrom(this.http.post(`${mlUrl}/predict/churn`, { clientes: dadosClientes }));
      return { tipo:'estrategico', nome:'Churn e Retencao', geradoEm: new Date().toISOString(), modelo: data.modelo, metricas: data.metricas, clientes: data.predicoes };
    } catch {
      return { tipo:'estrategico', nome:'Churn e Retencao', geradoEm: new Date().toISOString(), aviso:'ML Service indisponivel', clientes: dadosClientes };
    }
  }

  async relatorioScoring() {
    const dadosClientes = await this.clienteRepo.createQueryBuilder('c').leftJoin('c.pedidos','p')
      .select(['c.id AS cliente_id','c.nome AS nome','COUNT(p.id) AS total_pedidos','COALESCE(SUM(p.total),0) AS total_receita','COALESCE(AVG(p.total),0) AS ticket_medio','MAX(p.data) AS ultima_compra'])
      .groupBy('c.id,c.nome').getRawMany();
    try {
      const mlUrl = this.config.get('ML_SERVICE_URL','http://localhost:8000');
      const { data } = await firstValueFrom(this.http.post(`${mlUrl}/predict/scoring`, { clientes: dadosClientes }));
      return { tipo:'estrategico', nome:'Scoring de Propensao', geradoEm: new Date().toISOString(), modelo: data.modelo, clientes: data.predicoes };
    } catch {
      return { tipo:'estrategico', nome:'Scoring de Propensao', geradoEm: new Date().toISOString(), aviso:'ML Service indisponivel', clientes: dadosClientes };
    }
  }
}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Relatorios')
@Controller('relatorios')
export class RelatoriosController {
  constructor(private readonly svc: RelatoriosService) {}
  @Get('vendas')            @ApiOperation({ summary: '[Gerencial 1] Analise de vendas' })         vendas()           { return this.svc.relatorioVendas(); }
  @Get('produtos-clientes') @ApiOperation({ summary: '[Gerencial 2] Ranking de produtos/clientes'}) produtosClientes() { return this.svc.relatorioProdutosClientes(); }
  @Get('churn')             @ApiOperation({ summary: '[Estrategico 1] Analise de churn' })         churn()            { return this.svc.relatorioChurn(); }
  @Get('scoring')           @ApiOperation({ summary: '[Estrategico 2] Scoring de propensao' })     scoring()          { return this.svc.relatorioScoring(); }
}

@Module({ imports: [TypeOrmModule.forFeature([Pedido,Cliente,Produto]), HttpModule], controllers: [RelatoriosController], providers: [RelatoriosService] })
export class RelatoriosModule {}
