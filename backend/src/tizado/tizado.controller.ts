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
import { TizadoService } from './tizado.service';
import { CreateTizadoDto } from './dto/create-tizado.dto';
import { UpdateTizadoDto } from './dto/update-tizado.dto';
import { CreateTizadoTallaDto } from './dto/create-tizado-talla.dto';
import { UpdateTizadoTallaDto } from './dto/update-tizado-talla.dto';

@Controller('tizados')
export class TizadoController {
  constructor(private readonly tizadoService: TizadoService) {}

  // CRUD para Definiciones de Tizado (Cabecera)
  @Post()
  create(@Body() createTizadoDto: CreateTizadoDto) {
    return this.tizadoService.create(createTizadoDto);
  }

  @Get()
  findAll() {
    return this.tizadoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tizadoService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTizadoDto: UpdateTizadoDto,
  ) {
    return this.tizadoService.update(id, updateTizadoDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.tizadoService.remove(id);
  }

  // CRUD para Tallas del Tizado (Detalle)
  @Post(':id/tallas')
  createTalla(
    @Param('id', ParseIntPipe) definicionTizadoId: number,
    @Body() createTizadoTallaDto: CreateTizadoTallaDto,
  ) {
    return this.tizadoService.createTalla(definicionTizadoId, createTizadoTallaDto);
  }

  @Get(':id/tallas')
  findTallas(@Param('id', ParseIntPipe) definicionTizadoId: number) {
    return this.tizadoService.findTallas(definicionTizadoId);
  }

  @Get(':id/tallas/:tallaId')
  findOneTalla(
    @Param('id', ParseIntPipe) definicionTizadoId: number,
    @Param('tallaId', ParseIntPipe) tallaId: number,
  ) {
    return this.tizadoService.findOneTalla(definicionTizadoId, tallaId);
  }

  @Patch(':id/tallas/:tallaId')
  updateTalla(
    @Param('id', ParseIntPipe) definicionTizadoId: number,
    @Param('tallaId', ParseIntPipe) tallaId: number,
    @Body() updateTizadoTallaDto: UpdateTizadoTallaDto,
  ) {
    return this.tizadoService.updateTalla(definicionTizadoId, tallaId, updateTizadoTallaDto);
  }

  @Delete(':id/tallas/:tallaId')
  removeTalla(
    @Param('id', ParseIntPipe) definicionTizadoId: number,
    @Param('tallaId', ParseIntPipe) tallaId: number,
  ) {
    return this.tizadoService.removeTalla(definicionTizadoId, tallaId);
  }
}