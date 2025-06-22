import { Module } from '@nestjs/common';
import { TizadoController } from './tizado.controller';
import { TizadoService } from './tizado.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TizadoController],
  providers: [TizadoService],
  exports: [TizadoService],
})
export class TizadoModule {}
