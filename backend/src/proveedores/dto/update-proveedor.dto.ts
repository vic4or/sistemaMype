import { PartialType } from '@nestjs/mapped-types'
import { CreateProveedorDto } from './create-proveedor.dto'
import { IsString, IsOptional, MaxLength } from 'class-validator'

export class UpdateProveedorDto extends PartialType(CreateProveedorDto) {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  usuario_modificacion?: string
}