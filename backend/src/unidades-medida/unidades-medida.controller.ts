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
  import { UnidadesMedidaService } from './unidades-medida.service';
  import { CreateUnidadMedidaDto } from './dto/create-unidad-medida.dto';
  import { UpdateUnidadMedidaDto } from './dto/update-unidad-medida.dto';
  
  @Controller('unidades-medida')
  export class UnidadesMedidaController {
    constructor(private readonly unidadesMedidaService: UnidadesMedidaService) {}
  
    @Post()
    create(@Body() createUnidadMedidaDto: CreateUnidadMedidaDto) {
      return this.unidadesMedidaService.create(createUnidadMedidaDto);
    }
  
    @Get()
    findAll() {
      return this.unidadesMedidaService.findAll();
    }
  
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
      return this.unidadesMedidaService.findOne(id);
    }
  
    @Patch(':id')
    update(
      @Param('id', ParseIntPipe) id: number,
      @Body() updateUnidadMedidaDto: UpdateUnidadMedidaDto,
    ) {
      return this.unidadesMedidaService.update(id, updateUnidadMedidaDto);
    }
  
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
      return this.unidadesMedidaService.remove(id);
    }
  }