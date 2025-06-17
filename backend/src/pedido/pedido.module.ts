import { Module } from '@nestjs/common';
import { PedidosController } from './pedido.controller';
import { PedidosService } from './pedido.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PedidosController],
  providers: [PedidosService],
  exports: [PedidosService],
})
export class PedidoModule {}