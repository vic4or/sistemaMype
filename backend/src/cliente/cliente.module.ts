import { Module } from '@nestjs/common';
import { ClientesService } from './cliente.service';
import { ClientesController } from './cliente.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ClientesController],
  providers: [ClientesService],
  exports: [ClientesService]
})
export class ClienteModule {}
