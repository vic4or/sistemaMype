import { Module } from '@nestjs/common';
import { MovimientosService } from './movimientos.service';
import { MovimientosController } from './movimientos.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [MovimientosController],
  providers: [MovimientosService, PrismaService],
})
export class MovimientosModule {}