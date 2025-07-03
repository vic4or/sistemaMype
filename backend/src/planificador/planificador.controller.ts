import { Controller, Post, Body, Get, Param, Patch } from '@nestjs/common';
import { PlanificadorService } from './planificador.service';
import { EjecutarPlanDto } from './dto/ejecutar-plan.dto';
import { AprobarSugerenciasDto } from './dto/aprobar-sugerencias.dto';
import { ParseIntPipe } from '@nestjs/common';

@Controller('planificador')
export class PlanificadorController {
  constructor(private readonly planificadorService: PlanificadorService) {}

  @Post('ejecutar')
  async ejecutarPlanificacion(@Body() dto: EjecutarPlanDto) {
    return this.planificadorService.ejecutarPlanificacion(dto);
  }

  @Get('sugerencias/:corridaId')
  async obtenerSugerencias(@Param('corridaId', ParseIntPipe) corridaId: number) {
    return this.planificadorService.obtenerSugerencias(corridaId);
  }

  @Patch('aprobar/:corridaId')
  async aprobarSugerencias(
    @Param('corridaId',ParseIntPipe) corridaId: number,
    @Body() dto: AprobarSugerenciasDto,
  ) {
    return this.planificadorService.aprobarYGenerarOrdenes(corridaId, dto);
  }

  @Get('corridas')
  async listarCorridasConSugerencias() {
    return await this.planificadorService.listarCorridasConSugerencias();
  }
}