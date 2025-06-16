import { Module } from '@nestjs/common';
import { ColoresController } from './colores.controller';
import { ColoresService } from './colores.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ColoresController],
  providers: [ColoresService],
  exports: [ColoresService],
})
export class ColoresModule {}
