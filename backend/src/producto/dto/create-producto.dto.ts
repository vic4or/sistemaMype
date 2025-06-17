import { IsOptional, IsString, MaxLength, IsUrl, IsNumber } from 'class-validator'

export class CreateProductoDto {
  @IsOptional()
  @IsString()
  @MaxLength(20)
  codigo?: string

  @IsOptional()
  @IsString()
  @MaxLength(40)
  nombre?: string

  @IsOptional()
  @IsString()
  @MaxLength(20)
  estacion?: string

  @IsOptional()
  @IsString()
  @MaxLength(20)
  linea?: string

  @IsOptional()
  @IsString()
  @MaxLength(255)
  @IsUrl()
  imagen?: string

  @IsOptional()
  @IsString()
  @MaxLength(50)
  categoria?: string

  @IsOptional()
  @IsNumber()
  precio?: number

  @IsOptional()
  @IsString()
  usuario_creacion?: string
}