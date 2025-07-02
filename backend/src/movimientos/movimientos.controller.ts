import { Body, Controller, Post, Get } from '@nestjs/common';
import { MovimientosService } from './movimientos.service';
import { RegistrarMovimientoManualDto } from './dto/registrar-manual.dto';
import { RegistrarEntradaOCDto } from './dto/registrar-oc.dto';

@Controller('movimientos')
export class MovimientosController {
  constructor(private readonly movimientosService: MovimientosService) {}

  @Get()
    listar() {
    return this.movimientosService.listarTodos();
    } 

  @Post('manual')
  registrarManual(@Body() dto: RegistrarMovimientoManualDto) {
    return this.movimientosService.registrarMovimientoManual(dto);
  }

  @Post('orden-compra')
  registrarDesdeOC(@Body() dto: RegistrarEntradaOCDto) {
    return this.movimientosService.registrarEntradaPorOC(dto);
  }
}