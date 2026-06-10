import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { Cliente } from '../../clientes/entities/cliente.entity';
import { ItemPedido } from './item-pedido.entity';
export enum StatusPedido { PENDENTE = 'Pendente', CONCLUIDO = 'Concluido', CANCELADO = 'Cancelado' }
@Entity('pedidos')
export class Pedido {
  @PrimaryGeneratedColumn() id: number;
  @ManyToOne(() => Cliente, (c) => c.pedidos, { onDelete: 'RESTRICT' }) @JoinColumn({ name: 'cliente_id' }) cliente: Cliente;
  @Column({ name: 'cliente_id' }) clienteId: number;
  @OneToMany(() => ItemPedido, (i) => i.pedido, { cascade: true, eager: true }) itens: ItemPedido[];
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 }) total: number;
  @Column({ type: 'enum', enum: StatusPedido, default: StatusPedido.PENDENTE }) status: StatusPedido;
  @Column({ type: 'date' }) data: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}
