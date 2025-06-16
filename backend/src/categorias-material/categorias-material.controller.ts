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
import { CategoriasMaterialService } from './categorias-material.service';
import { CreateCategoriaMaterialDto } from './dto/create-categoria-material.dto';
import { UpdateCategoriaMaterialDto } from './dto/update-categoria-material.dto';
  
@Controller('categorias-material')
    export class CategoriasMaterialController {
    constructor(private readonly categoriasMaterialService: CategoriasMaterialService) {}
  
    @Post()
    create(@Body() createCategoriaMaterialDto: CreateCategoriaMaterialDto) {
      return this.categoriasMaterialService.create(createCategoriaMaterialDto);
    }
  
    @Get()
    findAll() {
      return this.categoriasMaterialService.findAll();
    }
  
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
      return this.categoriasMaterialService.findOne(id);
    }
  
    @Patch(':id')
    update(
      @Param('id', ParseIntPipe) id: number,
      @Body() updateCategoriaMaterialDto: UpdateCategoriaMaterialDto,
    ) {
      return this.categoriasMaterialService.update(id, updateCategoriaMaterialDto);
    }
  
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
      return this.categoriasMaterialService.remove(id);
    }
  }