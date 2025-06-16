import { IsOptional, IsString, IsEmail, IsBoolean } from 'class-validator'

export class CreateProveedorDto {
  @IsOptional()
  @IsString()
  razon_social?: string

  @IsOptional()
  @IsString()
  ruc?: string

  @IsOptional()
  @IsString()
  direccion?: string

  @IsOptional()
  @IsString()
  telefono?: string

  @IsOptional()
  @IsEmail()
  email?: string

  @IsOptional()
  @IsString()
  usuario_creacion?: string
}