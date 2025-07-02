import { PartialType } from '@nestjs/mapped-types';
import { IsString, IsOptional, MaxLength } from 'class-validator';
import { CreateOrdenCompraDto } from './create-orden-compra.dto';

export class UpdateOrdenCompraDto extends PartialType(CreateOrdenCompraDto) {
  @IsString()
  @IsOptional()
  @MaxLength(50)
  usuario_modificacion?: string;
}