import { PartialType } from '@nestjs/mapped-types';
import { IsString, IsOptional, MaxLength } from 'class-validator';
import { CreateUnidadMedidaDto } from './create-unidad-medida.dto';

export class UpdateUnidadMedidaDto extends PartialType(CreateUnidadMedidaDto) {
  @IsString()
  @IsOptional()
  @MaxLength(50)
  usuario_modificacion?: string;
}