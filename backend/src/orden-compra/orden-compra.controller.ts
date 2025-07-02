import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { OrdenCompraService } from './orden-compra.service';
import { CreateOrdenCompraDto, CreateOrdenCompraDetalleDto } from './dto/create-orden-compra.dto';
import { UpdateOrdenCompraDto } from './dto/update-orden-compra.dto';
import { UpdateEstadoOrdenCompraDto } from './dto/update-estado-orden-compra.dto';

@Controller('ordenes-compra')
export class OrdenCompraController {
  constructor(private readonly ordenCompraService: OrdenCompraService) {}

  @Post()
  create(@Body() dto: CreateOrdenCompraDto) {
    return this.ordenCompraService.create(dto);
  }

  @Get()
  findAll() {
    return this.ordenCompraService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ordenCompraService.findOne(id);
  }

  @Get(':id/detalle')
  findDetalle(@Param('id', ParseIntPipe) id: number) {
    return this.ordenCompraService.findDetalle(id);
  }

  @Post(':id/detalle')
  addDetalle(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateOrdenCompraDetalleDto,
  ) {
    return this.ordenCompraService.addDetalle(id, dto);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateOrdenCompraDto) {
    return this.ordenCompraService.update(id, dto);
  }

  @Patch(':id/estado')
  updateEstado(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateEstadoOrdenCompraDto) {
    return this.ordenCompraService.updateEstado(id, dto);
  }

  @Patch(':id/detalle/:detalleId')
  updateDetalle(
    @Param('id', ParseIntPipe) id: number,
    @Param('detalleId', ParseIntPipe) detalleId: number,
    @Body() dto: CreateOrdenCompraDetalleDto,
  ) {
    return this.ordenCompraService.updateDetalle(id, detalleId, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.ordenCompraService.remove(id);
  }

  @Delete(':id/detalle/:detalleId')
  removeDetalle(
    @Param('id', ParseIntPipe) id: number,
    @Param('detalleId', ParseIntPipe) detalleId: number,
  ) {
    return this.ordenCompraService.removeDetalle(id, detalleId);
  }
}