import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    ParseIntPipe,
  } from '@nestjs/common'
  import { ProductosService } from './producto.service'
  import { CreateProductoDto } from './dto/create-producto.dto'
  import { UpdateProductoDto } from './dto/update-producto.dto'
  import { CreateCombinacionDto } from './dto/create-combinacion.dto'
  import { UpdateCombinacionDto } from './dto/update-combinacion.dto'
  
  @Controller('productos')
export class ProductosController {
  constructor(private readonly productosService: ProductosService) {}

  @Post()
  create(@Body() dto: CreateProductoDto) {
    return this.productosService.create(dto);
  }

  @Get()
  findAll() {
    return this.productosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productosService.findOne(id);
  }

  @Get(':id/combinaciones')
  findCombinaciones(@Param('id', ParseIntPipe) id: number) {
    return this.productosService.findCombinaciones(id);
  }

  @Post('combinaciones')
  createCombinacion(@Body() dto: CreateCombinacionDto) {
    return this.productosService.createCombinacion(dto);
  }

  @Post(':id/variantes')
  createVariantes(@Param('id', ParseIntPipe) id: number, @Body('variantes') variantes: CreateCombinacionDto[]) {
    return this.productosService.createVariantes(id, variantes);
  }

  @Patch('combinaciones/:id')
  updateCombinacion(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCombinacionDto) {
    return this.productosService.updateCombinacion(id, dto);
  }

  @Delete('combinaciones/:id')
  removeCombinacion(@Param('id', ParseIntPipe) id: number) {
    return this.productosService.removeCombinacion(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProductoDto) {
    return this.productosService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productosService.remove(id);
  }
}