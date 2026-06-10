import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Pedido } from './pedido.entity';
import { Produto } from '../../produtos/entities/produto.entity';
@Entity('itens_pedido')
export class ItemPedido {
  @PrimaryGeneratedColumn() id: number;
  @ManyToOne(() => Pedido, (p) => p.itens, { onDelete: 'CASCADE' }) @JoinColumn({ name: 'pedido_id' }) pedido: Pedido;
  @ManyToOne(() => Produto, (p) => p.itensPedido, { eager: true }) @JoinColumn({ name: 'produto_id' }) produto: Produto;
  @Column({ name: 'produto_id' }) produtoId: number;
  @Column({ type: 'int' }) quantidade: number;
  @Column({ name: 'preco_unitario', type: 'decimal', precision: 10, scale: 2 }) precoUnitario: number;
}
