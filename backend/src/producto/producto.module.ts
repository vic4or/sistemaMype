import { Module } from '@nestjs/common'
import { ProductosService } from './producto.service'
import { ProductosController } from './producto.controller'
import { PrismaModule } from '../prisma/prisma.module'

@Module({
  imports: [PrismaModule],
  controllers: [ProductosController],
  providers: [ProductosService],
  exports: [ProductosService],
})
export class ProductosModule {}