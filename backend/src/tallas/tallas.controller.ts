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
  import { TallasService } from './tallas.service';
  import { CreateTallaDto } from './dto/create-talla.dto';
  import { UpdateTallaDto } from './dto/update-talla.dto';
  
  @Controller('tallas')
  export class TallasController {
    constructor(private readonly tallasService: TallasService) {}
  
    @Post()
    create(@Body() createTallaDto: CreateTallaDto) {
      return this.tallasService.create(createTallaDto);
    }
  
    @Get()
    findAll() {
      return this.tallasService.findAll();
    }
  
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
      return this.tallasService.findOne(id);
    }
  
    @Patch(':id')
    update(
      @Param('id', ParseIntPipe) id: number,
      @Body() updateTallaDto: UpdateTallaDto,
    ) {
      return this.tallasService.update(id, updateTallaDto);
    }
  
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
      return this.tallasService.remove(id);
    }
  }