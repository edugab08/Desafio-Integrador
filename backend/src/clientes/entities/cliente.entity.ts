import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Pedido } from '../../pedidos/entities/pedido.entity';
@Entity('clientes')
export class Cliente {
  @PrimaryGeneratedColumn() id: number;
  @Column({ length: 150 }) nome: string;
  @Column({ length: 150, unique: true }) email: string;
  @Column({ length: 100 }) cidade: string;
  @Column({ length: 2 }) estado: string;
  @Column({ length: 60, default: 'Brasil' }) pais: string;
  @OneToMany(() => Pedido, (p) => p.cliente) pedidos: Pedido[];
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}
