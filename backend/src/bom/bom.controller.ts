import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { BomService } from './bom.service';
import { CrearBOMComunDto, CrearBOMVariacionDto } from './dto/create-bom.dto';

@Controller('bom')
export class BomController {
  constructor(private readonly bomService: BomService) {}

  @Post('comunes')
  guardarBase(@Body() dto: CrearBOMComunDto) {
    return this.bomService.guardarMaterialesBase(dto);
  }

  @Post('variaciones')
  guardarVariaciones(@Body() dto: CrearBOMVariacionDto) {
    return this.bomService.guardarVariaciones(dto);
  }

  @Get('comunes/:productoId')
  listarBase(@Param('productoId') productoId: string) {
    return this.bomService.obtenerBasePorProducto(+productoId);
  }

  @Get('variaciones/:productoId')
  listarVariaciones(@Param('productoId') productoId: string) {
    return this.bomService.obtenerVariacionesPorProducto(+productoId);
  }
}