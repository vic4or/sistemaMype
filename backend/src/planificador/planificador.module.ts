import { Module } from '@nestjs/common';
import { PlanificadorService } from './planificador.service';
import { PlanificadorController } from './planificador.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [PlanificadorController],
  providers: [PlanificadorService, PrismaService],
})
export class PlanificadorModule {}
