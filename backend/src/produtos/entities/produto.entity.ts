import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { ItemPedido } from '../../pedidos/entities/item-pedido.entity';
@Entity('produtos')
export class Produto {
  @PrimaryGeneratedColumn() id: number;
  @Column({ length: 150 }) nome: string;
  @Column({ type: 'decimal', precision: 10, scale: 2 }) preco: number;
  @Column({ type: 'int', default: 0 }) estoque: number;
  @Column({ length: 80, nullable: true }) categoria: string | null;
  @OneToMany(() => ItemPedido, (i) => i.produto) itensPedido: ItemPedido[];
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}
