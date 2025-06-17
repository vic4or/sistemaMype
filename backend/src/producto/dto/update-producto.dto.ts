import { PartialType } from '@nestjs/mapped-types'
import { IsOptional, IsString, MaxLength } from 'class-validator'
import { CreateProductoDto } from './create-producto.dto'

export class UpdateProductoDto extends PartialType(CreateProductoDto) {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  usuario_modificacion?: string
}