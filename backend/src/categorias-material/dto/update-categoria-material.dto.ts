import { PartialType } from '@nestjs/mapped-types';
import { IsString, IsOptional, MaxLength } from 'class-validator';
import { CreateCategoriaMaterialDto } from './create-categoria-material.dto';

export class UpdateCategoriaMaterialDto extends PartialType(CreateCategoriaMaterialDto) {
  @IsString()
  @IsOptional()
  @MaxLength(50)
  usuario_modificacion?: string;
}