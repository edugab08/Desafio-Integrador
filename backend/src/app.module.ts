import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientesModule }   from './clientes/clientes.module';
import { ProdutosModule }   from './produtos/produtos.module';
import { PedidosModule }    from './pedidos/pedidos.module';
import { RelatoriosModule } from './relatorios/relatorios.module';
import { DashboardModule }  from './dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (c: ConfigService) => ({
        type: 'postgres',
        host:        c.get('DB_HOST',     'localhost'),
        port:        c.get<number>('DB_PORT', 5432),
        username:    c.get('DB_USERNAME', 'postgres'),
        password:    c.get('DB_PASSWORD', 'postgres'),
        database:    c.get('DB_NAME',     'datasight'),
        entities:    [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: c.get('NODE_ENV') !== 'production',
        logging:     c.get('NODE_ENV') === 'development',
      }),
    }),
    ClientesModule, ProdutosModule, PedidosModule, RelatoriosModule, DashboardModule,
  ],
})
export class AppModule {}
