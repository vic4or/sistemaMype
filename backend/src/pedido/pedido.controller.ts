import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    ParseIntPipe,
  } from '@nestjs/common';
  import { PedidosService } from './pedido.service';
  import { CreatePedidoDto, CreatePedidoDetalleDto } from './dto/create-pedido.dto';
  import { UpdatePedidoDto } from './dto/update-pedido.dto';
  import { UpdateEstadoPedidoDto } from './dto/update-estado.dto';
  
  @Controller('pedidos')
  export class PedidosController {
    constructor(private readonly pedidosService: PedidosService) {}
  
    @Post()
    create(@Body() dto: CreatePedidoDto) {
      return this.pedidosService.create(dto);
    }
  
    @Get()
    findAll() {
      return this.pedidosService.findAll();
    }
  
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
      return this.pedidosService.findOne(id);
    }
  
    @Get(':id/detalle')
    findDetalle(@Param('id', ParseIntPipe) id: number) {
      return this.pedidosService.findDetalle(id);
    }
  
    @Post(':id/detalle')
    addDetalle(
      @Param('id', ParseIntPipe) id: number,
      @Body() dto: CreatePedidoDetalleDto,
    ) {
      return this.pedidosService.addDetalle(id, dto);
    }
  
    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePedidoDto) {
      return this.pedidosService.update(id, dto);
    }
  
    @Patch(':id/estado')
    updateEstado(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateEstadoPedidoDto) {
      return this.pedidosService.updateEstado(id, dto);
    }
  
    @Patch(':id/detalle/:detalleId')
    updateDetalle(
      @Param('id', ParseIntPipe) id: number,
      @Param('detalleId', ParseIntPipe) detalleId: number,
      @Body() dto: CreatePedidoDetalleDto,
    ) {
      return this.pedidosService.updateDetalle(id, detalleId, dto);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
      return this.pedidosService.remove(id);
    }
  
    @Delete(':id/detalle/:detalleId')
    removeDetalle(
      @Param('id', ParseIntPipe) id: number,
      @Param('detalleId', ParseIntPipe) detalleId: number,
    ) {
      return this.pedidosService.removeDetalle(id, detalleId);
    }


    @Get('cliente/:clienteId')
    getPedidosPorCliente(@Param('clienteId', ParseIntPipe) clienteId: number) {
      return this.pedidosService.getPedidosPorCliente(clienteId);
    }


  }
