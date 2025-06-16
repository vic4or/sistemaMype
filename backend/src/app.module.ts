import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { CategoriasMaterialModule } from './categorias-material/categorias-material.module';
import { ColoresModule } from './colores/colores.module';
import { TallasModule } from './tallas/tallas.module';
import { UnidadesMedidaModule } from './unidades-medida/unidades-medida.module';
import { ClienteModule } from './cliente/cliente.module';
import { ProveedoresModule } from './proveedores/proveedores.module';
import { ProductosModule } from './producto/producto.module';

@Module({
  imports: [PrismaModule, CategoriasMaterialModule, ColoresModule, TallasModule, UnidadesMedidaModule, ClienteModule, ProveedoresModule, ProductosModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
